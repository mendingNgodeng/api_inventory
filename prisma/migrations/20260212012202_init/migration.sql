-- DropForeignKey
ALTER TABLE "AssetLogs" DROP CONSTRAINT "AssetLogs_id_asset_fkey";

-- AlterTable
ALTER TABLE "AssetLogs" ALTER COLUMN "id_asset" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "AssetLogs" ADD CONSTRAINT "AssetLogs_id_asset_fkey" FOREIGN KEY ("id_asset") REFERENCES "Asset"("id_assets") ON DELETE SET NULL ON UPDATE CASCADE;
