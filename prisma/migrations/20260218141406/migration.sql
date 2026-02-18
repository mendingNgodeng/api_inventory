/*
  Warnings:

  - The values [DIPINJAM,DISEWA,DIPAKAI] on the enum `AssetStockStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AssetStockStatus_new" AS ENUM ('TERSEDIA', 'TIDAK_TERSEDIA', 'MAINTENANCE');
ALTER TABLE "AssetStock" ALTER COLUMN "status" TYPE "AssetStockStatus_new" USING ("status"::text::"AssetStockStatus_new");
ALTER TYPE "AssetStockStatus" RENAME TO "AssetStockStatus_old";
ALTER TYPE "AssetStockStatus_new" RENAME TO "AssetStockStatus";
DROP TYPE "public"."AssetStockStatus_old";
COMMIT;
