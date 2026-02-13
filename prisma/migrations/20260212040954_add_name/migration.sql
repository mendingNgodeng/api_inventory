/*
  Warnings:

  - Added the required column `asset_code` to the `Asset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `asset_name` to the `Asset` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "asset_code" TEXT NOT NULL,
ADD COLUMN     "asset_name" TEXT NOT NULL,
ADD COLUMN     "is_rentable" BOOLEAN NOT NULL DEFAULT false;
