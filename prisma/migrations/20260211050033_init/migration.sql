-- CreateTable
CREATE TABLE "Admin" (
    "id_admin" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
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
    "purchase_price" DOUBLE PRECISION NOT NULL,
    "rental_price" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id_assets")
);

-- CreateTable
CREATE TABLE "AssetUnit" (
    "asset_unit" SERIAL NOT NULL,
    "id_assets" INTEGER NOT NULL,
    "id_location" INTEGER NOT NULL,
    "serial_numbers" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssetUnit_pkey" PRIMARY KEY ("asset_unit")
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
    "id_asset" INTEGER NOT NULL,
    "id_user" INTEGER NOT NULL,
    "borrowed_date" TIMESTAMP(3) NOT NULL,
    "returned_date" TIMESTAMP(3),
    "status" TEXT NOT NULL,

    CONSTRAINT "AssetBorrowed_pkey" PRIMARY KEY ("id_asset_borrowed")
);

-- CreateTable
CREATE TABLE "RentalCustomer" (
    "id_rental_customer" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RentalCustomer_pkey" PRIMARY KEY ("id_rental_customer")
);

-- CreateTable
CREATE TABLE "AssetRental" (
    "id_asset_rental" SERIAL NOT NULL,
    "id_assets" INTEGER NOT NULL,
    "id_rental_customer" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "rental_start" TIMESTAMP(3) NOT NULL,
    "rental_end" TIMESTAMP(3) NOT NULL,
    "total_price" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "AssetRental_pkey" PRIMARY KEY ("id_asset_rental")
);

-- CreateTable
CREATE TABLE "AssetLogs" (
    "id_asset_logs" SERIAL NOT NULL,
    "id_admin" INTEGER NOT NULL,
    "id_asset" INTEGER NOT NULL,
    "id_user" INTEGER,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssetLogs_pkey" PRIMARY KEY ("id_asset_logs")
);

-- CreateTable
CREATE TABLE "AssetMaintenance" (
    "id_asset_logs" SERIAL NOT NULL,
    "id_asset" INTEGER NOT NULL,
    "maintenance_date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "cost" DOUBLE PRECISION NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetMaintenance_pkey" PRIMARY KEY ("id_asset_logs")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "AssetUnit_serial_numbers_key" ON "AssetUnit"("serial_numbers");

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_id_asset_categories_fkey" FOREIGN KEY ("id_asset_categories") REFERENCES "AssetCategories"("id_asset_categories") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_id_asset_types_fkey" FOREIGN KEY ("id_asset_types") REFERENCES "AssetTypes"("id_asset_types") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetUnit" ADD CONSTRAINT "AssetUnit_id_assets_fkey" FOREIGN KEY ("id_assets") REFERENCES "Asset"("id_assets") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetUnit" ADD CONSTRAINT "AssetUnit_id_location_fkey" FOREIGN KEY ("id_location") REFERENCES "Location"("id_location") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetBorrowed" ADD CONSTRAINT "AssetBorrowed_id_asset_fkey" FOREIGN KEY ("id_asset") REFERENCES "Asset"("id_assets") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetBorrowed" ADD CONSTRAINT "AssetBorrowed_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetRental" ADD CONSTRAINT "AssetRental_id_assets_fkey" FOREIGN KEY ("id_assets") REFERENCES "Asset"("id_assets") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetRental" ADD CONSTRAINT "AssetRental_id_rental_customer_fkey" FOREIGN KEY ("id_rental_customer") REFERENCES "RentalCustomer"("id_rental_customer") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetLogs" ADD CONSTRAINT "AssetLogs_id_admin_fkey" FOREIGN KEY ("id_admin") REFERENCES "Admin"("id_admin") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetLogs" ADD CONSTRAINT "AssetLogs_id_asset_fkey" FOREIGN KEY ("id_asset") REFERENCES "Asset"("id_assets") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetLogs" ADD CONSTRAINT "AssetLogs_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id_user") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetMaintenance" ADD CONSTRAINT "AssetMaintenance_id_asset_fkey" FOREIGN KEY ("id_asset") REFERENCES "Asset"("id_assets") ON DELETE RESTRICT ON UPDATE CASCADE;
