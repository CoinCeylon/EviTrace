import { randomUUID } from 'node:crypto';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';

describe('Duplicate transfer submission', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;

  const transferId = `TR-${randomUUID()}`;
  const evidenceId = 'EV-001';

  beforeAll(async () => {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl || new URL(databaseUrl).pathname !== '/gad_e2e') {
      throw new Error('Set DATABASE_URL to the gad_e2e test database.');
    }

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
    prisma = app.get(PrismaService);
  });

  it('stores one transfer when Police B submits the same request twice', async () => {
    const payload = { transferId, evidenceId };

    for (let attempt = 0; attempt < 2; attempt++) {
      const response = await app.inject({
        method: 'POST',
        url: '/integration/v1/transfers',
        payload,
      });

      expect([200, 201]).toContain(response.statusCode);
      expect(response.json()).toMatchObject({
        transferId,
        evidenceId,
        status: 'AWAITING_ACCEPTANCE',
      });
    }

    const count = await prisma.incomingTransfer.count({
      where: { transferId },
    });
    expect(count).toBe(1);
  });

  it('returns 409 and preserves the original evidence when a transfer ID is reused with different evidence', async () => {
    const conflictTransferId = `TR-${randomUUID()}`;
    const url = '/integration/v1/transfers';

    try {
      const original = await app.inject({
        method: 'POST',
        url,
        payload: { transferId: conflictTransferId, evidenceId: 'EV-001' },
      });
      expect([200, 201]).toContain(original.statusCode);

      const conflict = await app.inject({
        method: 'POST',
        url,
        payload: { transferId: conflictTransferId, evidenceId: 'EV-999' },
      });
      expect(conflict.statusCode).toBe(409);

      const rows = await prisma.incomingTransfer.findMany({
        where: { transferId: conflictTransferId },
        select: { evidenceId: true },
      });
      expect(rows).toEqual([{ evidenceId: 'EV-001' }]);
    } finally {
      await prisma.incomingTransfer.deleteMany({
        where: { transferId: conflictTransferId },
      });
    }
  });

  afterAll(async () => {
    try {
      if (prisma) {
        await prisma.incomingTransfer.deleteMany({ where: { transferId } });
      }
    } finally {
      await app?.close();
    }
  });
});