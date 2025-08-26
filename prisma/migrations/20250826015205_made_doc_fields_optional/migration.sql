-- AlterTable
ALTER TABLE "public"."Vendor" ALTER COLUMN "documentType" DROP NOT NULL,
ALTER COLUMN "documentNumber" DROP NOT NULL,
ALTER COLUMN "documentFile" DROP NOT NULL;
