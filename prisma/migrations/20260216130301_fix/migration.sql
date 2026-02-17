/*
  Warnings:

  - Added the required column `id_asset_stock` to the `AssetRental` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AssetRental" ADD COLUMN     "id_asset_stock" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "AssetRental" ADD CONSTRAINT "AssetRental_id_asset_stock_fkey" FOREIGN KEY ("id_asset_stock") REFERENCES "AssetStock"("id_asset_stock") ON DELETE RESTRICT ON UPDATE CASCADE;
