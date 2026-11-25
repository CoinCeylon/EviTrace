-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('AWAITING_ACCEPTANCE', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "IncomingTransfer" (
    "transferId" TEXT NOT NULL,
    "evidenceId" TEXT NOT NULL,
    "status" "TransferStatus" NOT NULL DEFAULT 'AWAITING_ACCEPTANCE',

    CONSTRAINT "IncomingTransfer_pkey" PRIMARY KEY ("transferId")
);
