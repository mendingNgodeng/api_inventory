/*
  Warnings:

  - You are about to drop the column `id_asset` on the `AssetBorrowed` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "AssetBorrowed" DROP CONSTRAINT "AssetBorrowed_id_asset_fkey";

-- AlterTable
ALTER TABLE "AssetBorrowed" DROP COLUMN "id_asset";
