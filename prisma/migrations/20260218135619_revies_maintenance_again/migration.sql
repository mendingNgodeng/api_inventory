/*
  Warnings:

  - You are about to drop the column `maintenance_date` on the `AssetMaintenance` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AssetMaintenance" DROP COLUMN "maintenance_date",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
