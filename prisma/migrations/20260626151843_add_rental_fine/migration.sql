-- AlterTable
ALTER TABLE "AssetRental" ADD COLUMN     "fine_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "late_days" INTEGER NOT NULL DEFAULT 0;
