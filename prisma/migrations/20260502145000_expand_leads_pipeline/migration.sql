-- CreateEnum
CREATE TYPE "LeadType" AS ENUM ('CANDIDATE', 'PARTNER', 'CLIENT');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('MANUAL', 'PUBLIC_FORM');

-- AlterTable
ALTER TABLE "TalentLead"
ADD COLUMN "leadType" "LeadType" NOT NULL DEFAULT 'CANDIDATE',
ADD COLUMN "source" "LeadSource" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN "organization" TEXT;

-- AlterTable
ALTER TABLE "TalentLead"
ALTER COLUMN "postId" DROP NOT NULL;
