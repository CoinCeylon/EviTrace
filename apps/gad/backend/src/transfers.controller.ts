import { Put } from '@nestjs/common';
import { verifyAttachment } from './verify-attachment';
import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller()
export class TransfersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('api/v1/transfers/incoming')
  async getIncomingTransfers() {
    return await this.prisma.incomingTransfer.findMany({
      where: { status: 'AWAITING_ACCEPTANCE' },
      select: { transferId: true, evidenceId: true, status: true },
      orderBy: { transferId: 'asc' },
    });
  }

  @Get('api/v1/transfers/incoming/:transferId')
  async getIncomingTransfer(@Param('transferId') transferId: string) {
    const transfer = await this.prisma.incomingTransfer.findFirst({
      where: { transferId, status: 'AWAITING_ACCEPTANCE' },
      select: {
        transferId: true,
        evidenceId: true,
        status: true,
        senderSignatureStatus: true,
        cardanoRecordStatus: true,
        attachedFilesStatus: true,
        custodyHistoryStatus: true,
        inspection: { select: { transferId: true } },
      },
    });

    if (!transfer) {
      throw new NotFoundException('Transfer not found in the incoming inbox.');
    }

    const { inspection, ...details } = transfer;
    const checks = [
      { name: 'Sender signature', status: details.senderSignatureStatus },
      { name: 'Cardano record', status: details.cardanoRecordStatus },
      { name: 'Attached files', status: details.attachedFilesStatus },
      { name: 'Custody history', status: details.custodyHistoryStatus },
    ];

    const acceptanceBlockers = checks
      .filter((check) => check.status !== 'PASSED')
      .map((check) => `${check.name}: ${check.status}`);

    if (!inspection) {
      acceptanceBlockers.push('Physical inspection: not recorded');
    }

    return { ...details, acceptanceBlockers };
  }

  @Put('integration/v1/transfers/:transferId/attachments/:attachmentId')
  async receiveAttachment(
    @Param('transferId') transferId: string,
    @Param('attachmentId') attachmentId: string,
    @Body() body: unknown,
  ) {
    if (!body || typeof body !== 'object' || Array.isArray(body) ||
        Object.keys(body).length !== 1 || !('contentBase64' in body) ||
        typeof body.contentBase64 !== 'string') {
      throw new BadRequestException('Send contentBase64 as a string.');
    }

    const bytes = Buffer.from(body.contentBase64, 'base64');
    if (bytes.toString('base64') !== body.contentBase64) {
      throw new BadRequestException('Invalid Base64 file content.');
    }

    return this.prisma.$transaction(async (tx) => {
      const [transfer] = await tx.$queryRaw<{ status: string }[]>`
        SELECT "status" FROM "IncomingTransfer"
        WHERE "transferId" = ${transferId} FOR UPDATE
      `;
      if (!transfer) throw new NotFoundException('Transfer not found.');
      if (transfer.status !== 'AWAITING_ACCEPTANCE') {
        throw new ConflictException('This transfer is already decided.');
      }

      const where = { transferId_attachmentId: { transferId, attachmentId } };
      const file = await tx.expectedAttachment.findUnique({ where });
      if (!file) throw new NotFoundException('Attachment was not registered for this transfer.');

      const result = verifyAttachment(bytes, file.registeredSha256);
      if (file.status !== 'PENDING' && file.status !== result) {
        throw new ConflictException('This receipt conflicts with the recorded verification result.');
      }
      await tx.expectedAttachment.update({ where, data: { status: result } });

      const files = await tx.expectedAttachment.findMany({
        where: { transferId }, select: { status: true },
      });

      let overall: 'PENDING' | 'PASSED' | 'FAILED' = 'PENDING';
      if (files.some((item) => item.status === 'FAILED')) {
        overall = 'FAILED';
      } else if (files.every((item) => item.status === 'PASSED')) {
        overall = 'PASSED';
      }

      await tx.incomingTransfer.update({
        where: { transferId }, data: { attachedFilesStatus: overall },
      });
      return { transferId, attachmentId, status: result, attachedFilesStatus: overall };
    });
  }

  @Post('integration/v1/transfers')
  @HttpCode(200)
  async receiveTransfer(@Body() body: unknown) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new BadRequestException('Send a JSON object.');
    }
    const fields = body as Record<string, unknown>;
    const allowed = ['transferId', 'evidenceId', 'attachments'];
    if (Object.keys(fields).some((key) => !allowed.includes(key))) {
      throw new BadRequestException('Unknown transfer field.');
    }

    const { transferId, evidenceId } = fields;
    if (typeof transferId !== 'string' || !transferId.trim() ||
        typeof evidenceId !== 'string' || !evidenceId.trim()) {
      throw new BadRequestException('Both IDs must be non-empty strings.');
    }

    const entries: unknown = fields.attachments === undefined ? [] : fields.attachments;
    if (!Array.isArray(entries)) {
      throw new BadRequestException('attachments must be an array.');
    }

    const expected = new Map<string, string>();
    for (const entry of entries as unknown[]) {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
        throw new BadRequestException('Invalid attachment entry.');
      }
      const item = entry as Record<string, unknown>;
      if (Object.keys(item).some((key) => !['attachmentId', 'registeredSha256'].includes(key)) ||
          typeof item.attachmentId !== 'string' || !item.attachmentId.trim() ||
          typeof item.registeredSha256 !== 'string' ||
          item.registeredSha256.length !== 64 || !/^[a-f0-9]+$/i.test(item.registeredSha256)) {
        throw new BadRequestException('Each attachment needs an ID and a 64-digit hexadecimal SHA-256.');
      }
      const id = item.attachmentId.trim();
      if (expected.has(id)) {
        throw new BadRequestException('Duplicate attachment ID.');
      }
      expected.set(id, item.registeredSha256.toLowerCase());
    }

    const id = transferId.trim();
    return this.prisma.$transaction(async (tx) => {
      const inserted = await tx.incomingTransfer.createMany({
        data: [{ transferId: id, evidenceId: evidenceId.trim() }],
        skipDuplicates: true,
      });

      if (inserted.count === 1 && expected.size > 0) {
        await tx.expectedAttachment.createMany({
          data: Array.from(expected, ([attachmentId, registeredSha256]) => ({
            transferId: id, attachmentId, registeredSha256,
          })),
        });
      }

      const stored = await tx.incomingTransfer.findUniqueOrThrow({
        where: { transferId: id },
        select: {
          transferId: true, evidenceId: true, status: true,
          expectedAttachments: { select: { attachmentId: true, registeredSha256: true } },
        },
      });

      const { expectedAttachments, ...reply } = stored;
      if (reply.evidenceId !== evidenceId.trim() ||
          expectedAttachments.length !== expected.size ||
          expectedAttachments.some((file) =>
            expected.get(file.attachmentId) !== file.registeredSha256)) {
        throw new ConflictException('This transfer ID already has different submission details.');
      }
      return reply;
    });
  }
}
