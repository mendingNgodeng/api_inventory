/*
  Warnings:

  - You are about to drop the `AssetUnit` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `id_asset_stock` to the `AssetBorrowed` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `AssetBorrowed` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `AssetBorrowed` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `id_asset_stock` to the `AssetMaintenance` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `AssetRental` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "AssetCondition" AS ENUM ('BAIK', 'RUSAK', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "AssetStockStatus" AS ENUM ('TERSEDIA', 'TIDAK_TERSEDIA', 'DIPINJAM', 'DISEWA');

-- CreateEnum
CREATE TYPE "BorrowStatus" AS ENUM ('DIPINJAM', 'DIKEMBALIKAN', 'TERLAMBAT');

-- CreateEnum
CREATE TYPE "RentalStatus" AS ENUM ('AKTIF', 'SELESAI', 'DIBATALKAN');

-- DropForeignKey
ALTER TABLE "AssetUnit" DROP CONSTRAINT "AssetUnit_id_assets_fkey";

-- DropForeignKey
ALTER TABLE "AssetUnit" DROP CONSTRAINT "AssetUnit_id_location_fkey";

-- AlterTable
ALTER TABLE "AssetBorrowed" ADD COLUMN     "id_asset_stock" INTEGER NOT NULL,
ADD COLUMN     "quantity" INTEGER NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "BorrowStatus" NOT NULL;

-- AlterTable
ALTER TABLE "AssetMaintenance" ADD COLUMN     "id_asset_stock" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "AssetRental" DROP COLUMN "status",
ADD COLUMN     "status" "RentalStatus" NOT NULL;

-- DropTable
DROP TABLE "AssetUnit";

-- CreateTable
CREATE TABLE "AssetStock" (
    "id_asset_stock" SERIAL NOT NULL,
    "id_asset" INTEGER NOT NULL,
    "id_location" INTEGER NOT NULL,
    "condition" "AssetCondition" NOT NULL,
    "status" "AssetStockStatus" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetStock_pkey" PRIMARY KEY ("id_asset_stock")
);

-- CreateIndex
CREATE UNIQUE INDEX "AssetStock_id_asset_id_location_condition_status_key" ON "AssetStock"("id_asset", "id_location", "condition", "status");

-- AddForeignKey
ALTER TABLE "AssetStock" ADD CONSTRAINT "AssetStock_id_asset_fkey" FOREIGN KEY ("id_asset") REFERENCES "Asset"("id_assets") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetStock" ADD CONSTRAINT "AssetStock_id_location_fkey" FOREIGN KEY ("id_location") REFERENCES "Location"("id_location") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetBorrowed" ADD CONSTRAINT "AssetBorrowed_id_asset_stock_fkey" FOREIGN KEY ("id_asset_stock") REFERENCES "AssetStock"("id_asset_stock") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetMaintenance" ADD CONSTRAINT "AssetMaintenance_id_asset_stock_fkey" FOREIGN KEY ("id_asset_stock") REFERENCES "AssetStock"("id_asset_stock") ON DELETE RESTRICT ON UPDATE CASCADE;
