-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('ON_PROGRESS', 'DONE');

-- AlterTable
ALTER TABLE "AssetMaintenance" ADD COLUMN     "status" "MaintenanceStatus" NOT NULL DEFAULT 'ON_PROGRESS';
