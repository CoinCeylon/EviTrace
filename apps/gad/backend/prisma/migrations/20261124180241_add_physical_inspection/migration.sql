-- CreateTable
CREATE TABLE "PhysicalInspection" (
    "transferId" TEXT NOT NULL,
    "packageCondition" TEXT NOT NULL,
    "sealNumber" TEXT,
    "discrepancy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhysicalInspection_pkey" PRIMARY KEY ("transferId")
);

-- AddForeignKey
ALTER TABLE "PhysicalInspection" ADD CONSTRAINT "PhysicalInspection_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "IncomingTransfer"("transferId") ON DELETE RESTRICT ON UPDATE CASCADE;
