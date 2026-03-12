import { prisma } from "../utils/prisma";
import { RentalStatus } from "@prisma/client";
import {createAssetLog,buildLogDescription} from '../utils/asset-logs'

export class assetRentalService {
  static async getAll() {
    return prisma.assetRental.findMany({
      include: {
        assetStock: {
          include: {
            asset: { select: { asset_code: true, asset_name: true,rental_price:true } },
            location: { select: { name: true } },
          },
        },
        customer: {
          select: {
            id_rental_customer: true,
            name: true,
            phone: true,
            pictureKtp: true,
          },
        },
      },
      orderBy: { id_asset_rental: "desc" },
    });
  }

  static async getById(id: number) {
    return prisma.assetRental.findUnique({
      where: { id_asset_rental: id },
      include: {
        assetStock: {
          include: {
            asset: { select: { asset_code: true, asset_name: true}, },
            location: { select: { name: true } },
          },
        },
        customer: {
          select: {
            id_rental_customer: true,
            name: true,
            phone: true,
            pictureKtp: true,
          },
        },
      },
    });
  }

  static async createRental(input: {
  id_rental_customer: number;
  id_asset_stock: number;
  quantity: number;
  rental_start: Date;
  rental_end: Date;
  price: number;
  status?: RentalStatus; // default AKTIF
}) {
  if (input.quantity <= 0) throw new Error("Quantity harus lebih dari 0");

  return prisma.$transaction(async (tx) => {
    // include asset + location untuk log (name/code + is_rentable)
    const stock = await tx.assetStock.findUnique({
      where: { id_asset_stock: input.id_asset_stock },
      include: {
        asset: { select: { asset_name: true, asset_code: true, is_rentable: true,rental_price:true } },
        location: { select: { name: true } },
      },
    });

    if (!stock) throw new Error("Stock tidak ditemukan");

    if (stock.condition !== "BAIK" || stock.status !== "TERSEDIA") {
      throw new Error("Stock tidak valid untuk rental");
    }

    if (!stock.asset?.is_rentable) {
      throw new Error("Asset ini tidak bisa di-rental");
    }

    if (stock.quantity < input.quantity) {
      throw new Error("Stock tidak mencukupi");
    }
    if (Number(stock.asset.rental_price) <= 0) {
      throw new Error("harga Rental Masih 0");
    }

    // ambil customer untuk log (opsional tapi enak)
    const customer = await tx.rentalCustomer.findUnique({
      where: { id_rental_customer: input.id_rental_customer },
      select: { id_rental_customer: true, name: true, phone: true },
    });

    const beforeOriginQty = stock.quantity;
    const remainingQty = stock.quantity - input.quantity;

    // 1) kurangi stock TERSEDIA
    const updatedOrigin = await tx.assetStock.update({
      where: { id_asset_stock: stock.id_asset_stock },
      data: { quantity: remainingQty },
    });

    // 2) tambah / update BAIK + DISEWA
    const rentedStock = await tx.assetStock.findFirst({
      where: {
        id_asset: stock.id_asset,
        id_location: stock.id_location,
        condition: "BAIK",
        status: "DISEWA",
      },

    });

    const beforeRentedQty = rentedStock?.quantity ?? 0;
    let afterRentedQty = beforeRentedQty;
    let rentedBucketId: number | null = null;

    if (rentedStock) {
      const updBucket = await tx.assetStock.update({
        where: { id_asset_stock: rentedStock.id_asset_stock },
        data: { quantity: rentedStock.quantity + input.quantity },
      });
      rentedBucketId = updBucket.id_asset_stock;
      afterRentedQty = updBucket.quantity;
    } else {
      const createdBucket = await tx.assetStock.create({
        data: {
          id_asset: stock.id_asset,
          id_location: stock.id_location,
          condition: "BAIK",
          status: "DISEWA",
          quantity: input.quantity,
        },
      });
      rentedBucketId = createdBucket.id_asset_stock;
      afterRentedQty = createdBucket.quantity;
    }
const ms = new Date(input.rental_end).getTime() - new Date(input.rental_start).getTime();
const days = ms / (1000 * 60 * 60 * 24); //rubah ke hari
    // const times = Number(input.rental_end) - Number(input.rental_start); //bruh
    const rental_harga = Number(stock.asset.rental_price) * days
    const total= rental_harga * Number(input.quantity)
    if(total <= 0 || !Number.isFinite(total)){
      throw new Error("type data harga tidak valid");
    }
    // 3) create record rental
    const rental = await tx.assetRental.create({
      data: {
        id_rental_customer: input.id_rental_customer,
        id_asset_stock: stock.id_asset_stock, // source stock TERSEDIA
        quantity: input.quantity,
        rental_start: input.rental_start,
        rental_end: input.rental_end,
        // price: input.price,
        price: total,
        status: input.status ?? "AKTIF",
      },
    });

    // LOG: RENTAL_CREATE
    await createAssetLog(tx, {
      action: "RENTAL_CREATE",
      description: buildLogDescription({
        title: "Rental dibuat",
        detail: `Asset "${stock.asset.asset_name} (${stock.asset.asset_code})" disewa oleh "${customer?.name ?? "-"}" qty ${input.quantity} (${rental.status})`,
        meta: {
          id_asset_rental: rental.id_asset_rental,
          id_rental_customer: input.id_rental_customer,
          customer: customer
            ? { id_rental_customer: customer.id_rental_customer, name: customer.name, phone: customer.phone ?? null }
            : null,

          id_asset_stock_origin: stock.id_asset_stock,
          id_asset_stock_rented_bucket: rentedBucketId,

          asset_name: stock.asset.asset_name,
          asset_code: stock.asset.asset_code,
          location_name: stock.location?.name ?? null,

          rental_period: {
            start: rental.rental_start,
            end: rental.rental_end,
          },

          price: rental.price,
          status: rental.status,

          moved_qty: input.quantity,
          origin_qty: { from: beforeOriginQty, to: updatedOrigin.quantity },
          rented_bucket_qty: { from: beforeRentedQty, to: afterRentedQty },
        },
      }),
    });

    return rental;
  });
}
  static async updateRental(
    id: number,
    input: Partial<{
      quantity: number;
      rental_start: Date;
      rental_end: Date;
      price: number;
      status: RentalStatus;
    }>
  ) {
    return prisma.assetRental.update({
      where: { id_asset_rental: id },
      data: { ...input },
    });
  }

  // Selesai rental: set status SELESAI + balikin stock
static async finishRental(
  id: number,
  input?: { image_after_rental?: string }
) {
  return prisma.$transaction(async (tx) => {
    const rental = await tx.assetRental.findUnique({
      where: { id_asset_rental: id },
    });

    if (!rental) throw new Error("Data rental tidak ditemukan");
    if (rental.status === "SELESAI") throw new Error("Rental sudah selesai");
    if (rental.status === "DIBATALKAN") throw new Error("Rental sudah dibatalkan");

    // ambil customer untuk log (optional tapi enak)
    const customer = await tx.rentalCustomer.findUnique({
      where: { id_rental_customer: rental.id_rental_customer },
      select: { id_rental_customer: true, name: true, phone: true },
    });

    // stock asal (source stock TERSEDIA)
    // include asset+location buat log
    const goodStock = await tx.assetStock.findUnique({
      where: { id_asset_stock: rental.id_asset_stock },
      include: {
        asset: { select: { asset_name: true, asset_code: true } },
        location: { select: { name: true } },
      },
    });

    if (!goodStock) throw new Error("Stock asal tidak ditemukan");
    if (goodStock.condition !== "BAIK") throw new Error("Stock asal tidak valid");

    // cari row DISEWA
    const rentedStock = await tx.assetStock.findFirst({
      where: {
        id_asset: goodStock.id_asset,
        id_location: goodStock.id_location,
        condition: "BAIK",
        status: "DISEWA",
      },
    });

    if (!rentedStock) throw new Error("Stock DISEWA tidak ditemukan");
    if (rentedStock.quantity < rental.quantity) throw new Error("Quantity DISEWA tidak valid");

    // simpan qty before untuk log
    const beforeRentedQty = rentedStock.quantity;
    const beforeGoodQty = goodStock.quantity;

    // 1) kurangi / delete DISEWA
    const remainingRentedQty = rentedStock.quantity - rental.quantity;

    let rentedDeleted = false;
    let afterRentedQty = remainingRentedQty;

    if (remainingRentedQty > 0) {
      await tx.assetStock.update({
        where: { id_asset_stock: rentedStock.id_asset_stock },
        data: { quantity: remainingRentedQty },
      });
    } else {
      await tx.assetStock.delete({
        where: { id_asset_stock: rentedStock.id_asset_stock },
      });
      rentedDeleted = true;
      afterRentedQty = 0;
    }

    // 2) balikin ke BAIK + TERSEDIA (source stock)
    const updatedGoodStock = await tx.assetStock.update({
      where: { id_asset_stock: goodStock.id_asset_stock },
      data: {
        quantity: goodStock.quantity + rental.quantity,
        status: "TERSEDIA",
      },
    });

    // 3) update rental
    const updated = await tx.assetRental.update({
      where: { id_asset_rental: id },
      data: {
        status: "SELESAI",
        image_after_rental: input?.image_after_rental ?? null,
        // returned_date: new Date(), // (opsional) kalau kamu mau isi returned_date di rental
      },
    });

    // LOG: RENTAL_FINISH
    await createAssetLog(tx, {
      action: "RENTAL_FINISH",
      description: buildLogDescription({
        title: "Rental selesai",
        detail: `Rental "${goodStock.asset.asset_name} (${goodStock.asset.asset_code})" oleh "${customer?.name ?? "-"}" selesai. Qty ${rental.quantity} dikembalikan ke stok tersedia`,
        meta: {
          id_asset_rental: updated.id_asset_rental,
          id_rental_customer: rental.id_rental_customer,
          customer: customer
            ? {
                id_rental_customer: customer.id_rental_customer,
                name: customer.name,
                phone: customer.phone ?? null,
              }
            : null,

          id_asset_stock_origin: goodStock.id_asset_stock,
          id_asset_stock_rented_bucket: rentedStock.id_asset_stock,

          asset_name: goodStock.asset.asset_name,
          asset_code: goodStock.asset.asset_code,
          location_name: goodStock.location?.name ?? null,

          rental_period: {
            start: rental.rental_start,
            end: rental.rental_end,
          },

          price: rental.price,
          status: { from: rental.status, to: updated.status },
          returned_qty: rental.quantity,

          origin_qty: { from: beforeGoodQty, to: updatedGoodStock.quantity },
          rented_bucket_qty: {
            from: beforeRentedQty,
            to: afterRentedQty,
            deleted_row: rentedDeleted,
          },
          // eating too much space for database
          // image_after_rental: updated.image_after_rental ?? null,
        },
      }),
    });

    // clean up
    await this.clearKtpIfNoActiveRentals(tx, rental.id_rental_customer);

    return updated;
  });
}

// Batalkan rental: set status DIBATALKAN + balikin stock
static async cancelRental(id: number) {
  return prisma.$transaction(async (tx) => {
    const rental = await tx.assetRental.findUnique({
      where: { id_asset_rental: id },
    });

    if (!rental) throw new Error("Data rental tidak ditemukan");
    if (rental.status === "SELESAI") throw new Error("Rental sudah selesai");
    if (rental.status === "DIBATALKAN") throw new Error("Rental sudah dibatalkan");

    // ambil customer untuk log (optional)
    const customer = await tx.rentalCustomer.findUnique({
      where: { id_rental_customer: rental.id_rental_customer },
      select: { id_rental_customer: true, name: true, phone: true },
    });

    // include asset+location untuk log
    const goodStock = await tx.assetStock.findUnique({
      where: { id_asset_stock: rental.id_asset_stock },
      include: {
        asset: { select: { asset_name: true, asset_code: true } },
        location: { select: { name: true } },
      },
    });

    if (!goodStock) throw new Error("Stock asal tidak ditemukan");
    if (goodStock.condition !== "BAIK") throw new Error("Stock asal tidak valid");

    const rentedStock = await tx.assetStock.findFirst({
      where: {
        id_asset: goodStock.id_asset,
        id_location: goodStock.id_location,
        condition: "BAIK",
        status: "DISEWA",
      },
    });

    if (!rentedStock) throw new Error("Stock DISEWA tidak ditemukan");
    if (rentedStock.quantity < rental.quantity) throw new Error("Quantity DISEWA tidak valid");

    // simpan qty before untuk log
    const beforeRentedQty = rentedStock.quantity;
    const beforeGoodQty = goodStock.quantity;

    const remainingRentedQty = rentedStock.quantity - rental.quantity;

    let rentedDeleted = false;
    let afterRentedQty = remainingRentedQty;

    if (remainingRentedQty > 0) {
      await tx.assetStock.update({
        where: { id_asset_stock: rentedStock.id_asset_stock },
        data: { quantity: remainingRentedQty },
      });
    } else {
      await tx.assetStock.delete({
        where: { id_asset_stock: rentedStock.id_asset_stock },
      });
      rentedDeleted = true;
      afterRentedQty = 0;
    }

    const updatedGoodStock = await tx.assetStock.update({
      where: { id_asset_stock: goodStock.id_asset_stock },
      data: {
        quantity: goodStock.quantity + rental.quantity,
        status: "TERSEDIA",
      },
    });

    const updated = await tx.assetRental.update({
      where: { id_asset_rental: id },
      data: { status: "DIBATALKAN" },
    });

    // LOG: RENTAL_CANCEL
    await createAssetLog(tx, {
      action: "RENTAL_CANCEL",
      description: buildLogDescription({
        title: "Rental dibatalkan",
        detail: `Rental "${goodStock.asset.asset_name} (${goodStock.asset.asset_code})" oleh "${customer?.name ?? "-"}" dibatalkan. Qty ${rental.quantity} dikembalikan ke stok tersedia`,
        meta: {
          id_asset_rental: updated.id_asset_rental,
          id_rental_customer: rental.id_rental_customer,
          customer: customer
            ? {
                id_rental_customer: customer.id_rental_customer,
                name: customer.name,
                phone: customer.phone ?? null,
              }
            : null,

          id_asset_stock_origin: goodStock.id_asset_stock,
          id_asset_stock_rented_bucket: rentedStock.id_asset_stock,

          asset_name: goodStock.asset.asset_name,
          asset_code: goodStock.asset.asset_code,
          location_name: goodStock.location?.name ?? null,

          rental_period: {
            start: rental.rental_start,
            end: rental.rental_end,
          },

          price: rental.price,
          status: { from: rental.status, to: updated.status },
          rollback_qty: rental.quantity,

          origin_qty: { from: beforeGoodQty, to: updatedGoodStock.quantity },
          rented_bucket_qty: {
            from: beforeRentedQty,
            to: afterRentedQty,
            deleted_row: rentedDeleted,
          },
        },
      }),
    });

    // clean up KTP
    await this.clearKtpIfNoActiveRentals(tx, rental.id_rental_customer);

    return updated;
  });
}

  // helper hapus KTP saat sudah selesai rental
  static async clearKtpIfNoActiveRentals(tx: any, id_rental_customer: number) {
  const activeCount = await tx.assetRental.count({
    where: {
      id_rental_customer,
      status: "AKTIF",
    },
  });

  if (activeCount > 0) return { cleared: false };

  // hanya hapus data KTP
  await tx.rentalCustomer.update({
    where: { id_rental_customer },
    data: {
      pictureKtp: "", // atau "" 
    },
  });

  return { cleared: true };
}
}