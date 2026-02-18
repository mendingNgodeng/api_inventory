/*
  Warnings:

  - The values [MAINTENANCE] on the enum `AssetCondition` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AssetCondition_new" AS ENUM ('BAIK', 'RUSAK');
ALTER TABLE "AssetStock" ALTER COLUMN "condition" TYPE "AssetCondition_new" USING ("condition"::text::"AssetCondition_new");
ALTER TYPE "AssetCondition" RENAME TO "AssetCondition_old";
ALTER TYPE "AssetCondition_new" RENAME TO "AssetCondition";
DROP TYPE "public"."AssetCondition_old";
COMMIT;

-- AlterEnum
ALTER TYPE "AssetStockStatus" ADD VALUE 'MAINTENANCE';
