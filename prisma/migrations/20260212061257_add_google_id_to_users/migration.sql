/*
  Warnings:

  - A unique constraint covering the columns `[googleId]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[googleId]` on the table `Vendor` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Customer" ADD COLUMN     "googleId" TEXT;

-- AlterTable
ALTER TABLE "public"."Vendor" ADD COLUMN     "googleId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Customer_googleId_key" ON "public"."Customer"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_googleId_key" ON "public"."Vendor"("googleId");
