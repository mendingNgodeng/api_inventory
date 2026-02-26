import { prisma } from "../utils/prisma";
import { RentalStatus } from "@prisma/client";

export class assetRentalService {
  static async getAll() {
    return prisma.assetRental.findMany({
      include: {
        assetStock: {
          include: {
            asset: { select: { asset_code: true, asset_name: true } },
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
      const stock = await tx.assetStock.findUnique({
        where: { id_asset_stock: input.id_asset_stock },
        include: {
          asset: { select: { is_rentable: true } },
        },
      });

      if (!stock) throw new Error("Stock tidak ditemukan");

      // wajib BAIK + TERSEDIA
      if (stock.condition !== "BAIK" || stock.status !== "TERSEDIA") {
        throw new Error("Stock tidak valid untuk rental");
      }

      // cek is_rentable dari Asset
      if (!stock.asset?.is_rentable) {
        throw new Error("Asset ini tidak bisa di-rental");
      }

      if (stock.quantity < input.quantity) {
        throw new Error("Stock tidak mencukupi");
      }

      // 1) kurangi stock TERSEDIA
      const remainingQty = stock.quantity - input.quantity;
      const newStatus = remainingQty > 0 ? "TERSEDIA" : "TIDAK_TERSEDIA";

      await tx.assetStock.update({
        where: { id_asset_stock: stock.id_asset_stock },
        data: { quantity: remainingQty, status: newStatus },
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

      if (rentedStock) {
        await tx.assetStock.update({
          where: { id_asset_stock: rentedStock.id_asset_stock },
          data: { quantity: rentedStock.quantity + input.quantity },
        });
      } else {
        await tx.assetStock.create({
          data: {
            id_asset: stock.id_asset,
            id_location: stock.id_location,
            condition: "BAIK",
            status: "DISEWA",
            quantity: input.quantity,
          },
        });
      }

      // 3) create record rental
      return tx.assetRental.create({
        data: {
          id_rental_customer: input.id_rental_customer,
          id_asset_stock: stock.id_asset_stock, // refer ke source stock TERSEDIA
          quantity: input.quantity,
          rental_start: input.rental_start,
          rental_end: input.rental_end,
          price: input.price,
          status: input.status ?? "AKTIF",
        },
      });
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
    static async finishRental(id: number, input?: { image_after_rental?: string }) {
    return prisma.$transaction(async (tx) => {
      const rental = await tx.assetRental.findUnique({
        where: { id_asset_rental: id },
      });
      
      if (!rental) throw new Error("Data rental tidak ditemukan");
      if (rental.status === "SELESAI") throw new Error("Rental sudah selesai");
      if (rental.status === "DIBATALKAN") throw new Error("Rental sudah dibatalkan");
      
  
      // stock asal (row TERSEDIA/TIDAK_TERSEDIA)
      const goodStock = await tx.assetStock.findUnique({
        where: { id_asset_stock: rental.id_asset_stock },
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

      // 1) kurangi / delete DISEWA
      const remainingRentedQty = rentedStock.quantity - rental.quantity;

      if (remainingRentedQty > 0) {
        await tx.assetStock.update({
          where: { id_asset_stock: rentedStock.id_asset_stock },
          data: { quantity: remainingRentedQty },
        });
      } else {
        await tx.assetStock.delete({
          where: { id_asset_stock: rentedStock.id_asset_stock },
        });
      }

      // 2) balikin ke BAIK + TERSEDIA (source stock)
      await tx.assetStock.update({
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
        },
      });

        // clean up
      await this.clearKtpIfNoActiveRentals(tx, rental.id_rental_customer);
      return updated;
    });

    
  }

  // jika status selesai atau dibatalkan
  static async delete(id:number){
 return prisma.$transaction(async (tx) => {
      const rental = await tx.assetRental.findUnique({
        where: { id_asset_rental: id },
      });

      if (!rental) throw new Error("Data rental tidak ditemukan");
      if (rental.status === "AKTIF") throw new Error("Rental Data Masih digunakan!");
      
      tx.assetRental.delete({where: {id_asset_rental:id}})
    })
  }

 static async deleteAllNonActive() {
  return prisma.$transaction(async (tx) => {
    const res = await tx.assetRental.deleteMany({
      where: {
        status: { not: "AKTIF" },
      },
    });

    return {
      deleted: res.count,
    };
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

      const goodStock = await tx.assetStock.findUnique({
        where: { id_asset_stock: rental.id_asset_stock },
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

      const remainingRentedQty = rentedStock.quantity - rental.quantity;

      if (remainingRentedQty > 0) {
        await tx.assetStock.update({
          where: { id_asset_stock: rentedStock.id_asset_stock },
          data: { quantity: remainingRentedQty },
        });
      } else {
        await tx.assetStock.delete({
          where: { id_asset_stock: rentedStock.id_asset_stock },
        });
      }

      await tx.assetStock.update({
        where: { id_asset_stock: goodStock.id_asset_stock },
        data: {
          quantity: goodStock.quantity + rental.quantity,
          status: "TERSEDIA",
        },
      });

     const updated= await tx.assetRental.update({
        where: { id_asset_rental: id },
        data: { status: "DIBATALKAN" },
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