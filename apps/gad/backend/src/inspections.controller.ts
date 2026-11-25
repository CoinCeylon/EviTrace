import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Put,
} from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller('api/v1/transfers/:transferId/inspection')
export class InspectionsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getInspection(@Param('transferId') transferId: string) {
    const inspection = await this.prisma.physicalInspection.findUnique({
      where: { transferId },
    });

    if (!inspection) {
      throw new NotFoundException('No inspection recorded for this transfer.');
    }

    return inspection;
  }

  @Put()
  async saveInspection(
    @Param('transferId') transferId: string,
    @Body() body: unknown,
  ) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new BadRequestException('Send an inspection as a JSON object.');
    }

    const fields = body as Record<string, unknown>;
    const allowed = ['packageCondition', 'sealNumber', 'discrepancy'];
    if (Object.keys(fields).some((key) => !allowed.includes(key))) {
      throw new BadRequestException('Unknown inspection field.');
    }

    const { packageCondition, sealNumber, discrepancy } = fields;
    if (typeof packageCondition !== 'string' || !packageCondition.trim()) {
      throw new BadRequestException('Package condition is required.');
    }
    if (sealNumber != null && typeof sealNumber !== 'string') {
      throw new BadRequestException('Seal number must be text.');
    }
    if (discrepancy != null && typeof discrepancy !== 'string') {
      throw new BadRequestException('Discrepancy must be text.');
    }

    const observations = {
      packageCondition: packageCondition.trim(),
      sealNumber: sealNumber?.trim() || null,
      discrepancy: discrepancy?.trim() || null,
    };

    return this.prisma.$transaction(async (tx) => {
      const [transfer] = await tx.$queryRaw<{ status: string }[]>`
        SELECT "status" FROM "IncomingTransfer"
        WHERE "transferId" = ${transferId}
        FOR UPDATE
      `;

      if (!transfer) {
        throw new NotFoundException('Transfer not found.');
      }
      if (transfer.status !== 'AWAITING_ACCEPTANCE') {
        throw new ConflictException('Only pending transfers can be inspected.');
      }

      return tx.physicalInspection.upsert({
        where: { transferId },
        create: { transferId, ...observations },
        update: observations,
      });
    });
  }
}
