import { prisma } from '../utils/prisma';
import { BorrowStatus } from '@prisma/client';

export class AssetBorrowService {
static async getAll() {
  return prisma.assetBorrowed.findMany({
    include: {
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
          }
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
  // pinjam bwang
 static async createBorrow(
  input: {
    id_user?: number;
    id_asset_stock: number;
    quantity: number;
  },
  status_value: BorrowStatus
) {

  if (input.quantity <= 0) {
    throw new Error("Quantity harus lebih dari 0");
  }

  // 🔥 Validasi berdasarkan status
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

    if (stock.quantity < input.quantity) {
      throw new Error("Stock tidak mencukupi");
    }

    await tx.assetStock.update({
      where: { id_asset_stock: input.id_asset_stock },
      data: {
        quantity: { decrement: input.quantity }
      }
    });

    return tx.assetBorrowed.create({
      data: {
        id_user: input.id_user ?? null,
        id_asset_stock: input.id_asset_stock,
        quantity: input.quantity,
        status: status_value
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

    if (!borrow) {
      throw new Error("Data tidak ditemukan");
    }

    if (borrow.status !== "DIPINJAM" && borrow.status !== "DIPAKAI") {
      throw new Error("Asset sudah dikembalikan");
    }

    await tx.assetStock.update({
      where: { id_asset_stock: borrow.id_asset_stock },
      data: {
        quantity: {
          increment: borrow.quantity
        }
      }
    });

    return tx.assetBorrowed.update({
      where: { id_asset_borrowed: id },
      data: {
        status: "DIKEMBALIKAN"
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

  // static async delete(id: number) {
  //   return prisma.assetBorrowed.delete({
  //     where: { id_asset_borrowed: id }
  //   });
  // }
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
