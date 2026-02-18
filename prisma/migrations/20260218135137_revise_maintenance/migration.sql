/*
  Warnings:

  - You are about to drop the column `id_asset` on the `AssetMaintenance` table. All the data in the column will be lost.
  - Added the required column `quantity` to the `AssetMaintenance` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AssetMaintenance" DROP CONSTRAINT "AssetMaintenance_id_asset_fkey";

-- AlterTable
ALTER TABLE "AssetMaintenance" DROP COLUMN "id_asset",
ADD COLUMN     "quantity" INTEGER NOT NULL,
ALTER COLUMN "cost" DROP NOT NULL;
