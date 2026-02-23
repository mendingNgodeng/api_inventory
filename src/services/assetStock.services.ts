import { prisma } from '../utils/prisma';
import { AssetStockStatus,BorrowStatus, AssetCondition,MaintenanceStatus } from '@prisma/client';
export class assetStockService {

  static async getAll() {
    return prisma.assetStock.findMany({
      orderBy:{created_at:'asc'},
      include: {
        asset:
        {
          select:
          {
            asset_code:true,
            asset_name:true,
            is_rentable:true
          }
      },
      location:{
        select:{
          name:true
        }
      }
      }
    });
  }

  static async getById(id: number) {
    return prisma.assetStock.findUnique({
      where: { id_asset_stock:id }
    });
  }

  static async create(input: {
    id_asset: number;
    id_location: number;
    condition: AssetCondition;
    quantity: number;
  }) {
    const status =
    input.quantity > 0
      ? AssetStockStatus.TERSEDIA
      : AssetStockStatus.TIDAK_TERSEDIA;

    return prisma.assetStock.create({
      data: {...input,status,condition:"BAIK"}, 
      include:{
        asset:true,
        location:true
      }
    });
  }

//   static async update(id: number, input: {
//     id_asset: number;
//     id_location: number;
//     // condition: AssetCondition;
//     quantity: number;
//   }) {
    
//    const current = await prisma.assetStock.findUnique({
//   where: { id_asset_stock: id },
//   select: { status: true },
// });

//   if (!current) throw new Error("Data asset stock tidak ditemukan");

//   const canEditAll =
//     current.status === AssetStockStatus.TERSEDIA ||
//     current.status === AssetStockStatus.TIDAK_TERSEDIA;

//   if (!canEditAll) {
//     const isChangingAsset = input.id_asset !== current.id_assets;
//     const isChangingQty = input.quantity !== current.quantity;

//     if (isChangingAsset || isChangingQty) {
//       throw new Error("Tidak boleh update asset/quantity untuk status ini!");
//     }

//     const status =
//     input.quantity > 0
//       ? AssetStockStatus.TERSEDIA
//       : AssetStockStatus.TIDAK_TERSEDIA;
//     return prisma.assetStock.update({
//       where: { id_asset_stock: id },
//       data: {
//        ...input,
//        status
//       },
//       include:{
//         asset:true,
//         location:true
//       }
//     });
//   }}
static async update(
  id: number,
  input: { id_asset: number; id_location: number; quantity: number }
) {
  const current = await prisma.assetStock.findUnique({
    where: { id_asset_stock: id },
    select: {
      status: true,
      id_asset: true,
      quantity: true,
      id_location: true,
    },
  });

  if (!current) throw new Error("Data asset stock tidak ditemukan");

  const canEditAll =
    current.status === AssetStockStatus.TERSEDIA ||
    current.status === AssetStockStatus.TIDAK_TERSEDIA;

  if (!canEditAll) {
    const isChangingAsset = input.id_asset !== current.id_asset;
    const isChangingQty = input.quantity !== current.quantity;

    if (isChangingAsset || isChangingQty) {
      throw new Error("Tidak boleh update asset/quantity untuk status ini!");
    }

    return prisma.assetStock.update({
      where: { id_asset_stock: id },
      data: { id_location: input.id_location },
      include: { asset: true, location: true },
    });
  }

  const nextStatus =
    input.quantity > 0 ? AssetStockStatus.TERSEDIA : AssetStockStatus.TIDAK_TERSEDIA;

  return prisma.assetStock.update({
    where: { id_asset_stock: id },
    data: { ...input, status: nextStatus },
    include: { asset: true, location: true },
  });
}
  // static async delete(id: number) {
  //   return prisma.assetStock.delete({
  //     where: { id_asset_stock: id }
  //   });
  // }

  static async delete(id: number) {
    // 0) ambil stock lengkap (butuh status)
    const stock = await prisma.assetStock.findUnique({
      where: { id_asset_stock: id },
      select: {
        id_asset_stock: true,
        status: true,
      },
    });

    if (!stock) {
      throw new Error("Stock tidak ditemukan");
    }

    // 1) Larang hapus untuk stock “non-deletable” berdasarkan statusnya
    const blockedStatuses: AssetStockStatus[] = [
      "MAINTENANCE",
      "DIPINJAM",
      "DIPAKAI",
      "DISEWA",
    ];

    if (blockedStatuses.includes(stock.status)) {
      throw new Error(
        `Stock tidak bisa dihapus karena statusnya ${stock.status}. Selesaikan prosesnya terlebih dahulu.`
      );
    }

    // 2) Walaupun TERSEDIA / TIDAK_TERSEDIA, kalau direferensikan table lain => tidak boleh delete
    // "dipakai oleh table lain" = ada record sama sekali (history pun termasuk)
    const [borrowRef, maintenanceRef] = await Promise.all([
      prisma.assetBorrowed.findFirst({
        where: { id_asset_stock: id },
        select: { id_asset_borrowed: true, status: true },
      }),
      prisma.assetMaintenance.findFirst({
        where: { id_asset_stock: id },
        select: { id_asset_maintenance: true, status: true },
      }),
    ]);

    if (borrowRef) {
      throw new Error(
        `Stock tidak bisa dihapus karena sudah digunakan di transaksi borrow (status borrow: ${borrowRef.status}).`
      );
    }

    if (maintenanceRef) {
      throw new Error(
        `Stock tidak bisa dihapus karena sudah digunakan di transaksi maintenance (status maintenance: ${maintenanceRef.status}).`
      );
    }

    // 3) kalau lolos semua validasi, baru delete
    return prisma.assetStock.delete({
      where: { id_asset_stock: id },
    });
  }
  }

