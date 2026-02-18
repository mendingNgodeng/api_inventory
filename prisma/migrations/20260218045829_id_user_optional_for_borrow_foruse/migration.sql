-- DropForeignKey
ALTER TABLE "AssetBorrowed" DROP CONSTRAINT "AssetBorrowed_id_user_fkey";

-- AlterTable
ALTER TABLE "AssetBorrowed" ALTER COLUMN "id_user" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "AssetBorrowed" ADD CONSTRAINT "AssetBorrowed_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id_user") ON DELETE SET NULL ON UPDATE CASCADE;
