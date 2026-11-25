-- CreateTable
CREATE TABLE "ExpectedAttachment" (
    "transferId" TEXT NOT NULL,
    "attachmentId" TEXT NOT NULL,
    "registeredSha256" VARCHAR(64) NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "ExpectedAttachment_pkey" PRIMARY KEY ("transferId","attachmentId")
);

-- AddForeignKey
ALTER TABLE "ExpectedAttachment" ADD CONSTRAINT "ExpectedAttachment_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "IncomingTransfer"("transferId") ON DELETE RESTRICT ON UPDATE CASCADE;
