/*
  Warnings:

  - Added the required column `fuelType` to the `Equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `insuranceValidity` to the `Equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `purchaseYear` to the `Equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `registeredState` to the `Equipment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Equipment" ADD COLUMN     "fuelType" TEXT NOT NULL,
ADD COLUMN     "insuranceValidity" TEXT NOT NULL,
ADD COLUMN     "purchaseYear" TEXT NOT NULL,
ADD COLUMN     "registeredState" TEXT NOT NULL;
