-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'PASSED', 'FAILED');

-- AlterTable
ALTER TABLE "IncomingTransfer" ADD COLUMN     "attachedFilesStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "cardanoRecordStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "custodyHistoryStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "senderSignatureStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING';
