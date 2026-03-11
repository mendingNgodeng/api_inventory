import { prisma } from '../utils/prisma';
import { BorrowStatus,AssetStockStatus } from '@prisma/client';
import {createAssetLog,buildLogDescription} from '../utils/asset-logs'

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

static async getAllById(id:number) {
  return prisma.assetBorrowed.findMany({
    orderBy:{borrowed_date:'desc'},
    where:{id_user:id},
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
  id_user:number,
  input: {
    id_user?: number;
    id_asset_stock: number;
    quantity: number;
  },
  status_value: BorrowStatus, // "DIPINJAM" | "DIPAKAI"
  status_stock: AssetStockStatus // "DIPINJAM" | "DIPAKAI"
) {
  if (input.quantity <= 0) throw new Error("Quantity harus lebih dari 0");

  if (status_value === "DIPINJAM" && !input.id_user) {
    throw new Error("Peminjaman harus memiliki user");
  }

  if (status_value === "DIPAKAI" && input.id_user) {
    throw new Error("Asset dipakai kantor tidak boleh memiliki user");
  }

  

  return prisma.$transaction(async (tx) => {
    const stock = await tx.assetStock.findUnique({
      where: { id_asset_stock: input.id_asset_stock },
      include: { asset: true, location: true },
    });

    if (!stock) throw new Error("Stock tidak ditemukan");

    if (stock.condition !== "BAIK" || stock.status !== "TERSEDIA") {
      throw new Error("Stock tidak valid untuk dipinjam/dipakai");
    }

    if (stock.quantity < input.quantity) {
      throw new Error("Stock tidak mencukupi");
    }

    const beforeOriginQty = stock.quantity;
    const remainingQty = stock.quantity - input.quantity;

    // 1) Kurangi stok asal
    const updatedOrigin = await tx.assetStock.update({
      where: { id_asset_stock: stock.id_asset_stock },
      data: { quantity: remainingQty },
      include: { asset: true, location: true },
    });

    // 2) Tambah / merge bucket BAIK + (DIPINJAM/DIPAKAI)
    const bucketStock = await tx.assetStock.findFirst({
      where: {
        id_asset: stock.id_asset,
        id_location: stock.id_location,
        condition: "BAIK",
        status: status_stock,
      },
    });

    let bucketId: number | null = null;
    const beforeBucketQty = bucketStock?.quantity ?? 0;
    let afterBucketQty = beforeBucketQty;

    if (bucketStock) {
      const updBucket = await tx.assetStock.update({
        where: { id_asset_stock: bucketStock.id_asset_stock },
        data: { quantity: bucketStock.quantity + input.quantity },
      });
      bucketId = updBucket.id_asset_stock;
      afterBucketQty = updBucket.quantity;
    } else {
      const createdBucket = await tx.assetStock.create({
        data: {
          id_asset: stock.id_asset,
          id_location: stock.id_location,
          condition: "BAIK",
          status: status_stock,
          quantity: input.quantity,
        },
      });
      bucketId = createdBucket.id_asset_stock;
      afterBucketQty = createdBucket.quantity;
    }

    // 3) Buat record borrow
    const borrow = await tx.assetBorrowed.create({
      data: {
        id_user: input.id_user ?? null,
        id_asset_stock: stock.id_asset_stock,
        quantity: input.quantity,
        status: status_value,
      },
      include: { user: true },
    });

    // action log tergantung status_value
    const action =
      status_value === "DIPINJAM" ? "BORROW_CREATE" : "USED_CREATE";

    // title juga bisa beda biar kebaca enak di history
    const title =
      status_value === "DIPINJAM" ? "Peminjaman dibuat" : "Pemakaian dibuat";

    await createAssetLog(tx, {
      action,
      description: buildLogDescription({
        title,
        detail:
          status_value === "DIPINJAM"
            ? `Asset "${stock.asset.asset_name} (${stock.asset.asset_code})" dipinjam oleh "${borrow.user?.name ?? "-"}" qty ${input.quantity}`
            : `Asset "${stock.asset.asset_name} (${stock.asset.asset_code})" dipakai kantor qty ${input.quantity}`,
        meta: {
          id_asset_borrowed: borrow.id_asset_borrowed,
          id_asset_stock_origin: stock.id_asset_stock,
          id_asset_stock_bucket: bucketId,
          status_value,
          status_stock,
          asset_name: stock.asset.asset_name,
          asset_code: stock.asset.asset_code,
          location_name: stock.location.name,
          user:
            status_value === "DIPINJAM" && borrow.user
              ? { id_user: borrow.user.id_user, name: borrow.user.name }
              : null, // pemakaian kantor => null
          moved_qty: input.quantity,
          origin_qty: { from: beforeOriginQty, to: updatedOrigin.quantity },
          bucket_qty: { from: beforeBucketQty, to: afterBucketQty },
        },
      }),
    });

    return borrow;
  });
}

// Pengembalian
static async returnAsset(id: number) {
  return prisma.$transaction(async (tx) => {
    const borrow = await tx.assetBorrowed.findUnique({
      where: { id_asset_borrowed: id },
      include: { user: true },
    });

    if (!borrow) throw new Error("Data tidak ditemukan");
    if (borrow.status === "DIKEMBALIKAN") throw new Error("Asset sudah dikembalikan");

    if (
      borrow.status !== "DIPINJAM" &&
      borrow.status !== "DIPAKAI" &&
      borrow.status !== "TERLAMBAT"
    ) {
      throw new Error("Status peminjaman tidak valid untuk pengembalian");
    }

    // simpan status awal untuk log action
    const prevBorrowStatus = borrow.status;

    const originStock = await tx.assetStock.findUnique({
      where: { id_asset_stock: borrow.id_asset_stock },
      include: { asset: true, location: true },
    });

    if (!originStock) throw new Error("Stock asal tidak ditemukan");

    const bucketStatus: AssetStockStatus =
      prevBorrowStatus === "DIPAKAI" ? "DIPAKAI" : "DIPINJAM"; // TERLAMBAT dianggap DIPINJAM

    const bucketStock = await tx.assetStock.findFirst({
      where: {
        id_asset: originStock.id_asset,
        id_location: originStock.id_location,
        condition: "BAIK",
        status: bucketStatus,
      },
    });

    if (!bucketStock) {
      throw new Error("Stock bucket peminjaman/pemakaian tidak ditemukan");
    }

    if (bucketStock.quantity < borrow.quantity) {
      throw new Error("Quantity pada stock bucket tidak valid");
    }

    const beforeBucketQty = bucketStock.quantity;
    const beforeOriginQty = originStock.quantity;

    // 1) Kurangi bucket stock
    const remainingBucketQty = bucketStock.quantity - borrow.quantity;

    let bucketDeleted = false;
    let bucketAfterQty = remainingBucketQty;

    if (remainingBucketQty > 0) {
      await tx.assetStock.update({
        where: { id_asset_stock: bucketStock.id_asset_stock },
        data: { quantity: remainingBucketQty },
      });
    } else {
      await tx.assetStock.delete({
        where: { id_asset_stock: bucketStock.id_asset_stock },
      });
      bucketDeleted = true;
      bucketAfterQty = 0;
    }

    // 2) Tambah kembali ke origin
    const newOriginQty = originStock.quantity + borrow.quantity;

    const updatedOrigin = await tx.assetStock.update({
      where: { id_asset_stock: originStock.id_asset_stock },
      data: { quantity: newOriginQty, status: "TERSEDIA" },
      include: { asset: true, location: true },
    });

    // 3) Update borrow record
    const updatedBorrow = await tx.assetBorrowed.update({
      where: { id_asset_borrowed: id },
      data: { status: "DIKEMBALIKAN", returned_date: new Date() },
      include: { user: true },
    });

    // action log tergantung status awal
    const action =
      prevBorrowStatus === "DIPAKAI" ? "USED_RETURN" : "BORROW_RETURN";

    // title juga beda biar kebaca enak
    const title =
      prevBorrowStatus === "DIPAKAI" ? "Pemakaian selesai" : "Peminjaman dikembalikan";

    await createAssetLog(tx, {
      action,
      description: buildLogDescription({
        title,
        detail:
          prevBorrowStatus === "DIPAKAI"
            ? `Asset "${originStock.asset.asset_name} (${originStock.asset.asset_code})" selesai dipakai kantor qty ${borrow.quantity}`
            : `Asset "${originStock.asset.asset_name} (${originStock.asset.asset_code})" dikembalikan qty ${borrow.quantity}`,
        meta: {
          id_asset_borrowed: updatedBorrow.id_asset_borrowed,
          id_asset_stock_origin: originStock.id_asset_stock,
          id_asset_stock_bucket: bucketStock.id_asset_stock,
          bucket_status: bucketStatus, // DIPINJAM / DIPAKAI
          asset_name: originStock.asset.asset_name,
          asset_code: originStock.asset.asset_code,
          location_name: originStock.location.name,

          // untuk pemakaian kantor, user biasanya null
          user:
            prevBorrowStatus === "DIPINJAM" || prevBorrowStatus === "TERLAMBAT"
              ? updatedBorrow.user
                ? { id_user: updatedBorrow.user.id_user, name: updatedBorrow.user.name }
                : null
              : null,

          returned_qty: borrow.quantity,
          origin_qty: { from: beforeOriginQty, to: updatedOrigin.quantity },
          bucket_qty: {
            from: beforeBucketQty,
            to: bucketAfterQty,
            deleted_row: bucketDeleted,
          },
          borrow_status: { from: prevBorrowStatus, to: updatedBorrow.status },
          returned_date: updatedBorrow.returned_date,
        },
      }),
    });

    return updatedBorrow;
  });
}
// why are you here? for testing purpose of course, i had no idea how to make these borrow feature so this is the first before i my engineering-programming-college-student-brain began to braining.
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

  // this is not used
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
