-- CreateEnum
CREATE TYPE "adminRole" AS ENUM ('ADMIN');

-- CreateEnum
CREATE TYPE "AssetCondition" AS ENUM ('BAIK', 'RUSAK');

-- CreateEnum
CREATE TYPE "AssetStockStatus" AS ENUM ('TERSEDIA', 'TIDAK_TERSEDIA', 'MAINTENANCE', 'DIPINJAM', 'DIPAKAI', 'DISEWA');

-- CreateEnum
CREATE TYPE "BorrowStatus" AS ENUM ('DIPAKAI', 'DIPINJAM', 'DIKEMBALIKAN', 'TERLAMBAT');

-- CreateEnum
CREATE TYPE "RentalStatus" AS ENUM ('PENDING', 'AKTIF', 'SELESAI', 'DIBATALKAN');

-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('ON_PROGRESS', 'DONE');

-- CreateTable
CREATE TABLE "Admin" (
    "id_admin" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "adminRole" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id_admin")
);

-- CreateTable
CREATE TABLE "User" (
    "id_user" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "jabatan" TEXT,
    "no_hp" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "AssetCategories" (
    "id_asset_categories" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "AssetCategories_pkey" PRIMARY KEY ("id_asset_categories")
);

-- CreateTable
CREATE TABLE "AssetTypes" (
    "id_asset_types" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "AssetTypes_pkey" PRIMARY KEY ("id_asset_types")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id_assets" SERIAL NOT NULL,
    "id_asset_categories" INTEGER NOT NULL,
    "id_asset_types" INTEGER NOT NULL,
    "asset_code" TEXT NOT NULL,
    "asset_name" TEXT NOT NULL,
    "purchase_price" DOUBLE PRECISION,
    "is_rentable" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id_assets")
);

-- CreateTable
CREATE TABLE "AssetStock" (
    "id_asset_stock" SERIAL NOT NULL,
    "id_asset" INTEGER NOT NULL,
    "id_location" INTEGER NOT NULL,
    "condition" "AssetCondition" NOT NULL,
    "status" "AssetStockStatus" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetStock_pkey" PRIMARY KEY ("id_asset_stock")
);

-- CreateTable
CREATE TABLE "Location" (
    "id_location" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id_location")
);

-- CreateTable
CREATE TABLE "AssetBorrowed" (
    "id_asset_borrowed" SERIAL NOT NULL,
    "id_asset_stock" INTEGER NOT NULL,
    "id_user" INTEGER,
    "quantity" INTEGER NOT NULL,
    "borrowed_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returned_date" TIMESTAMP(3) NOT NULL,
    "status" "BorrowStatus" NOT NULL,

    CONSTRAINT "AssetBorrowed_pkey" PRIMARY KEY ("id_asset_borrowed")
);

-- CreateTable
CREATE TABLE "RentalCustomer" (
    "id_rental_customer" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "picuteKtp" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentalCustomer_pkey" PRIMARY KEY ("id_rental_customer")
);

-- CreateTable
CREATE TABLE "AssetRental" (
    "id_asset_rental" SERIAL NOT NULL,
    "id_rental_customer" INTEGER NOT NULL,
    "id_asset_stock" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "rental_start" TIMESTAMP(3) NOT NULL,
    "rental_end" TIMESTAMP(3) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "status" "RentalStatus" NOT NULL,

    CONSTRAINT "AssetRental_pkey" PRIMARY KEY ("id_asset_rental")
);

-- CreateTable
CREATE TABLE "AssetLogs" (
    "id_asset_logs" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssetLogs_pkey" PRIMARY KEY ("id_asset_logs")
);

-- CreateTable
CREATE TABLE "AssetMaintenance" (
    "id_asset_maintenance" SERIAL NOT NULL,
    "id_asset_stock" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "cost" DOUBLE PRECISION,
    "quantity" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" "MaintenanceStatus" NOT NULL DEFAULT 'ON_PROGRESS',

    CONSTRAINT "AssetMaintenance_pkey" PRIMARY KEY ("id_asset_maintenance")
);

-- CreateTable
CREATE TABLE "BlacklistedToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "expiredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlacklistedToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_asset_code_key" ON "Asset"("asset_code");

-- CreateIndex
CREATE UNIQUE INDEX "AssetStock_id_asset_id_location_condition_status_key" ON "AssetStock"("id_asset", "id_location", "condition", "status");

-- CreateIndex
CREATE UNIQUE INDEX "BlacklistedToken_token_key" ON "BlacklistedToken"("token");

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_id_asset_categories_fkey" FOREIGN KEY ("id_asset_categories") REFERENCES "AssetCategories"("id_asset_categories") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_id_asset_types_fkey" FOREIGN KEY ("id_asset_types") REFERENCES "AssetTypes"("id_asset_types") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetStock" ADD CONSTRAINT "AssetStock_id_asset_fkey" FOREIGN KEY ("id_asset") REFERENCES "Asset"("id_assets") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetStock" ADD CONSTRAINT "AssetStock_id_location_fkey" FOREIGN KEY ("id_location") REFERENCES "Location"("id_location") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetBorrowed" ADD CONSTRAINT "AssetBorrowed_id_asset_stock_fkey" FOREIGN KEY ("id_asset_stock") REFERENCES "AssetStock"("id_asset_stock") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetBorrowed" ADD CONSTRAINT "AssetBorrowed_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id_user") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetRental" ADD CONSTRAINT "AssetRental_id_asset_stock_fkey" FOREIGN KEY ("id_asset_stock") REFERENCES "AssetStock"("id_asset_stock") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetRental" ADD CONSTRAINT "AssetRental_id_rental_customer_fkey" FOREIGN KEY ("id_rental_customer") REFERENCES "RentalCustomer"("id_rental_customer") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetMaintenance" ADD CONSTRAINT "AssetMaintenance_id_asset_stock_fkey" FOREIGN KEY ("id_asset_stock") REFERENCES "AssetStock"("id_asset_stock") ON DELETE RESTRICT ON UPDATE CASCADE;
