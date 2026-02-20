/*
  Warnings:

  - You are about to drop the column `id_assets` on the `AssetRental` table. All the data in the column will be lost.
  - You are about to drop the column `fotoKtp` on the `RentalCustomer` table. All the data in the column will be lost.
  - Added the required column `fotoKtp` to the `AssetRental` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AssetRental" DROP CONSTRAINT "AssetRental_id_assets_fkey";

-- AlterTable
ALTER TABLE "AssetRental" DROP COLUMN "id_assets",
ADD COLUMN     "fotoKtp" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "RentalCustomer" DROP COLUMN "fotoKtp";
