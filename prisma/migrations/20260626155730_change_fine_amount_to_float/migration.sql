/*
  Warnings:

  - You are about to alter the column `fine_amount` on the `AssetRental` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "AssetRental" ALTER COLUMN "fine_amount" SET DATA TYPE DOUBLE PRECISION;
