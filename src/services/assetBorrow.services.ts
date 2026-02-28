import { prisma } from '../utils/prisma';
import { BorrowStatus,AssetStockStatus } from '@prisma/client';

export class AssetBorrowService {
static async getAll() {
  return prisma.assetBorrowed.findMany({
    orderBy:{borrowed_date:'desc'},
    include: {
        user:{
            select:{
              name:true,
              jabatan:true,
              no_hp:true
            }
          },
      assetStock: {
        include: {
          asset:{
            select:{
              asset_code: true,
              asset_name: true
            }
          },
          location: {
            select: {
              name: true
            }
          },
        
        }
      }
    }
  });
}

  static async getById(id: number) {
    return prisma.assetBorrowed.findUnique({
      where: { id_asset_borrowed:id }
    });
  }

  static async create(input: {
  
    id_user: number;
    id_asset_stock: number;
    quantity:number;
    status:BorrowStatus
  }) {
    return prisma.assetBorrowed.create({
      data: input
    });
  }


  static async createBorrow(
    input: {
      id_user?: number;
      id_asset_stock: number;
      quantity: number;
    },
    status_value: BorrowStatus, // "DIPINJAM" | "DIPAKAI"
    status_stock: AssetStockStatus
  ) {
    if (input.quantity <= 0) {
      throw new Error("Quantity harus lebih dari 0");
    }

    // Validasi berdasarkan status
    if (status_value === "DIPINJAM" && !input.id_user) {
      throw new Error("Peminjaman harus memiliki user");
    }

    if (status_value === "DIPAKAI" && input.id_user) {
      throw new Error("Asset dipakai kantor tidak boleh memiliki user");
    }

    return prisma.$transaction(async (tx) => {
      const stock = await tx.assetStock.findUnique({
        where: { id_asset_stock: input.id_asset_stock }
      });

      if (!stock) {
        throw new Error("Stock tidak ditemukan");
      }

      // Samakan pola dengan maintenance: hanya boleh ambil dari BAIK + TERSEDIA
      // (kalau aturanmu beda, ubah bagian ini)
      if (stock.condition !== "BAIK" || stock.status !== "TERSEDIA") {
        throw new Error("Stock tidak valid untuk dipinjam/dipakai");
      }

      if (stock.quantity < input.quantity) {
        throw new Error("Stock tidak mencukupi");
      }

      // 1) Kurangi stok asal
      const remainingQty = stock.quantity - input.quantity;
      const newStatusAsal = remainingQty > 0 ? "TERSEDIA" : "TIDAK_TERSEDIA";

      await tx.assetStock.update({
        where: { id_asset_stock: stock.id_asset_stock },
        data: {
          quantity: remainingQty,
          status: newStatusAsal
        }
      });

      // 2) Tambah / merge ke stok bucket (BAIK + DIPINJAM / DIPAKAI) pada asset & location yang sama
      const bucketStock = await tx.assetStock.findFirst({
        where: {
          id_asset: stock.id_asset,
          id_location: stock.id_location,
          condition: "BAIK",
          status: status_stock
        }
      });

      if (bucketStock) {
        await tx.assetStock.update({
          where: { id_asset_stock: bucketStock.id_asset_stock },
          data: { quantity: bucketStock.quantity + input.quantity }
        });
      } else {
        await tx.assetStock.create({
          data: {
            id_asset: stock.id_asset,
            id_location: stock.id_location,
            condition: "BAIK",
            status: status_stock,
            quantity: input.quantity
          }
        });
      }

      // 3) Buat record borrow
      return tx.assetBorrowed.create({
        data: {
          id_user: input.id_user ?? null,
          id_asset_stock: stock.id_asset_stock, // refer ke stok asal
          quantity: input.quantity,
          status: status_value
          
        },
        include:{
          user:true
        }
      });
    });
  }


// Pengembaian
static async returnAsset(id: number) {
  return prisma.$transaction(async (tx) => {
    const borrow = await tx.assetBorrowed.findUnique({
      where: { id_asset_borrowed: id }
    });

    if (!borrow) throw new Error("Data tidak ditemukan");

    if (borrow.status === "DIKEMBALIKAN") {
      throw new Error("Asset sudah dikembalikan");
    }

    // Hanya boleh return kalau statusnya masih DIPINJAM / DIPAKAI)
    if (borrow.status !== "DIPINJAM" && borrow.status !== "DIPAKAI" && borrow.status !== "TERLAMBAT") {
      throw new Error("Status peminjaman tidak valid untuk pengembalian");
    }

    // stock asal (yang berkurang saat createBorrow)
    const originStock = await tx.assetStock.findUnique({
      where: { id_asset_stock: borrow.id_asset_stock }
    });

    if (!originStock) throw new Error("Stock asal tidak ditemukan");

    // tentukan status bucket stock apa yang harus dikurangi
    const bucketStatus: AssetStockStatus =
      borrow.status === "DIPAKAI" ? "DIPAKAI" : "DIPINJAM"; // TERLAMBAT dianggap masih DIPINJAM

    // cari bucket stock: BAIK + (DIPINJAM/DIPAKAI) di asset & location yang sama
    const bucketStock = await tx.assetStock.findFirst({
      where: {
        id_asset: originStock.id_asset,
        id_location: originStock.id_location,
        condition: "BAIK",
        status: bucketStatus
      }
    });

    if (!bucketStock) {
      throw new Error("Stock bucket peminjaman/pemakaian tidak ditemukan");
    }

    if (bucketStock.quantity < borrow.quantity) {
      throw new Error("Quantity pada stock bucket tidak valid");
    }

    // 1) Kurangi bucket stock
    const remainingBucketQty = bucketStock.quantity - borrow.quantity;

    if (remainingBucketQty > 0) {
      await tx.assetStock.update({
        where: { id_asset_stock: bucketStock.id_asset_stock },
        data: { quantity: remainingBucketQty }
      });
    } else {
      // boleh delete atau set 0 (samakan dengan pola maintenance kamu)
      await tx.assetStock.delete({
        where: { id_asset_stock: bucketStock.id_asset_stock }
      });
    }

    // 2) Tambah kembali ke stock asal
    const newOriginQty = originStock.quantity + borrow.quantity;

    await tx.assetStock.update({
      where: { id_asset_stock: originStock.id_asset_stock },
      data: {
        quantity: newOriginQty,
        status: "TERSEDIA"
      }
    });

    // 3) Update record borrow jadi DIKEMBALIKAN
    return tx.assetBorrowed.update({
      where: { id_asset_borrowed: id },
      data: {
        status: "DIKEMBALIKAN",
        returned_date: new Date()
      }
    });
  });
}


  static async update(id: number, input: {
  
    id_user: number;
    id_asset_stock: number;
    quantity:number;
    status: BorrowStatus;
  }) {
    return prisma.assetBorrowed.update({
      where: { id_asset_borrowed: id },
      data: {
       ...input
      }
    });
  }

  static async delete(id: number) {
  const borrow = await prisma.assetBorrowed.findUnique({
    where: { id_asset_borrowed: id }
  });

  if (!borrow) {
    throw new Error("Data tidak ditemukan");
  }

  if (borrow.status === "DIPINJAM" || borrow.status === "DIPAKAI") {
    throw new Error("Tidak bisa menghapus data yang masih dipinjam/dipakai");
  }

  return prisma.assetBorrowed.delete({
    where: { id_asset_borrowed: id }
  });
}

}
