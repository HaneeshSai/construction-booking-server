/*
  Warnings:

  - You are about to drop the column `name` on the `Equipment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Equipment" DROP COLUMN "name",
ADD COLUMN     "nameOfManufacturer" TEXT;
