/*
  Warnings:

  - Made the column `returned_date` on table `AssetBorrowed` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "AssetBorrowed" ALTER COLUMN "returned_date" SET NOT NULL;
