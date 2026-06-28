-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "BorrowStatus" ADD VALUE 'MENUNGGU_ADMIN';
ALTER TYPE "BorrowStatus" ADD VALUE 'MENUNGGU_BOS';
ALTER TYPE "BorrowStatus" ADD VALUE 'DITOLAK';

-- AlterEnum
ALTER TYPE "userRole" ADD VALUE 'BOS';

-- AlterTable
ALTER TABLE "AssetBorrowed" ADD COLUMN     "admin_approved_at" TIMESTAMP(3),
ADD COLUMN     "admin_approved_by_id" INTEGER,
ADD COLUMN     "approval_note" TEXT,
ADD COLUMN     "boss_approved_at" TIMESTAMP(3),
ADD COLUMN     "boss_approved_by_id" INTEGER,
ADD COLUMN     "rejected_at" TIMESTAMP(3),
ADD COLUMN     "rejected_by_id" INTEGER,
ADD COLUMN     "requested_by_id" INTEGER;
