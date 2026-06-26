/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `AssetCategories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `AssetTypes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AssetCategories_name_key" ON "AssetCategories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AssetTypes_name_key" ON "AssetTypes"("name");
