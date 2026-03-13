-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('BELUM_BAYAR', 'DP', 'LUNAS');

-- AlterTable
ALTER TABLE "AssetRental" ADD COLUMN     "dp_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "payment_status" "PaymentStatus" NOT NULL DEFAULT 'BELUM_BAYAR',
ADD COLUMN     "remaining_amount" DOUBLE PRECISION NOT NULL DEFAULT 0;
