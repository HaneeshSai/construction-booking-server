-- AlterTable
ALTER TABLE "public"."Equipment" ALTER COLUMN "invoiceFile" DROP NOT NULL,
ALTER COLUMN "frontImageFile" DROP NOT NULL,
ALTER COLUMN "sideImageFile" DROP NOT NULL,
ALTER COLUMN "engineImageFile" DROP NOT NULL,
ALTER COLUMN "controlPanelFile" DROP NOT NULL,
ALTER COLUMN "insuranceFile" DROP NOT NULL;
