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
      select: { transferId: true, evidenceId: true, status: true },
    });

    if (!transfer) {
      throw new NotFoundException('Transfer not found in the incoming inbox.');
    }

    return transfer;
  }

  @Post('integration/v1/transfers')
  @HttpCode(200)
  async receiveTransfer(@Body() body: unknown) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new BadRequestException('Send a JSON object.');
    }

    const fields = Object.keys(body);
    if (fields.length !== 2 || !('transferId' in body) || !('evidenceId' in body)) {
      throw new BadRequestException('Send exactly transferId and evidenceId.');
    }

    const { transferId, evidenceId } = body;
    if (
      typeof transferId !== 'string' || !transferId.trim() ||
      typeof evidenceId !== 'string' || !evidenceId.trim()
    ) {
      throw new BadRequestException('Both IDs must be non-empty strings.');
    }

    const submission = {
      transferId: transferId.trim(),
      evidenceId: evidenceId.trim(),
    };

    await this.prisma.incomingTransfer.createMany({
      data: [submission],
      skipDuplicates: true,
    });

    const stored = await this.prisma.incomingTransfer.findUniqueOrThrow({
      where: { transferId: submission.transferId },
      select: { transferId: true, evidenceId: true, status: true },
    });

    if (stored.evidenceId !== submission.evidenceId) {
      throw new ConflictException('This transfer ID belongs to different evidence.');
    }

    return stored;
  }
}
