/*
  Warnings:

  - You are about to drop the column `rental_price` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `id_admin` on the `AssetLogs` table. All the data in the column will be lost.
  - You are about to drop the column `id_asset` on the `AssetLogs` table. All the data in the column will be lost.
  - You are about to drop the column `id_user` on the `AssetLogs` table. All the data in the column will be lost.
  - The primary key for the `AssetMaintenance` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id_asset_logs` on the `AssetMaintenance` table. All the data in the column will be lost.
  - You are about to drop the column `total_price` on the `AssetRental` table. All the data in the column will be lost.
  - Added the required column `price` to the `AssetRental` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fotoKtp` to the `RentalCustomer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "BorrowStatus" ADD VALUE 'DIPAKAI';

-- DropForeignKey
ALTER TABLE "AssetLogs" DROP CONSTRAINT "AssetLogs_id_admin_fkey";

-- DropForeignKey
ALTER TABLE "AssetLogs" DROP CONSTRAINT "AssetLogs_id_asset_fkey";

-- DropForeignKey
ALTER TABLE "AssetLogs" DROP CONSTRAINT "AssetLogs_id_user_fkey";

-- AlterTable
ALTER TABLE "Asset" DROP COLUMN "rental_price",
ALTER COLUMN "purchase_price" DROP NOT NULL;

-- AlterTable
ALTER TABLE "AssetLogs" DROP COLUMN "id_admin",
DROP COLUMN "id_asset",
DROP COLUMN "id_user";

-- AlterTable
ALTER TABLE "AssetMaintenance" DROP CONSTRAINT "AssetMaintenance_pkey",
DROP COLUMN "id_asset_logs",
ADD COLUMN     "id_asset_maintenance" SERIAL NOT NULL,
ADD CONSTRAINT "AssetMaintenance_pkey" PRIMARY KEY ("id_asset_maintenance");

-- AlterTable
ALTER TABLE "AssetRental" DROP COLUMN "total_price",
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "RentalCustomer" ADD COLUMN     "fotoKtp" TEXT NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL;
