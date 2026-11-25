jest.mock('./prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { Test } from '@nestjs/testing';
import { PrismaService } from './prisma.service';
import { TransfersController } from './transfers.controller';

describe('Incoming transfer acceptance blockers', () => {
  it('shows a failed attachment check when the inspection is already recorded', async () => {
    const transfer = {
      transferId: 'TR-002',
      evidenceId: 'EV-001',
      status: 'AWAITING_ACCEPTANCE',
      senderSignatureStatus: 'PASSED',
      cardanoRecordStatus: 'PASSED',
      attachedFilesStatus: 'FAILED',
      custodyHistoryStatus: 'PASSED',
      inspection: { transferId: 'TR-002' },
    };

    const module = await Test.createTestingModule({
      controllers: [TransfersController],
      providers: [{
        provide: PrismaService,
        useValue: {
          incomingTransfer: { findFirst: jest.fn().mockResolvedValue(transfer) },
        },
      }],
    }).compile();

    const controller = module.get(TransfersController);
    const detail = await controller.getIncomingTransfer('TR-002');

    expect(detail.status).toBe('AWAITING_ACCEPTANCE');
    expect(detail.acceptanceBlockers).toEqual(['Attached files: FAILED']);
  });
});
