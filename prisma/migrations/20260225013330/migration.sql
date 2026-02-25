/*
  Warnings:

  - The values [PENDING] on the enum `RentalStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RentalStatus_new" AS ENUM ('AKTIF', 'SELESAI', 'DIBATALKAN');
ALTER TABLE "AssetRental" ALTER COLUMN "status" TYPE "RentalStatus_new" USING ("status"::text::"RentalStatus_new");
ALTER TYPE "RentalStatus" RENAME TO "RentalStatus_old";
ALTER TYPE "RentalStatus_new" RENAME TO "RentalStatus";
DROP TYPE "public"."RentalStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "RentalCustomer" ALTER COLUMN "pictureKtp" DROP NOT NULL;
