-- AlterEnum
ALTER TYPE "BorrowStatus" ADD VALUE 'DIBATALKAN';

-- AlterTable
ALTER TABLE "AssetBorrowed" ADD COLUMN     "cancel_note" TEXT,
ADD COLUMN     "canceled_at" TIMESTAMP(3),
ADD COLUMN     "canceled_by_id" INTEGER;
