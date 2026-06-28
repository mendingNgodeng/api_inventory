-- AlterTable
ALTER TABLE "AssetBorrowed" ADD COLUMN     "due_date" TIMESTAMP(3),
ADD COLUMN     "late_days" INTEGER NOT NULL DEFAULT 0;
