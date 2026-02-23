/*
  Warnings:

  - A unique constraint covering the columns `[id_asset,id_location,condition]` on the table `AssetStock` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "AssetStock_id_asset_id_location_key";

-- CreateIndex
CREATE UNIQUE INDEX "AssetStock_id_asset_id_location_condition_key" ON "AssetStock"("id_asset", "id_location", "condition");
