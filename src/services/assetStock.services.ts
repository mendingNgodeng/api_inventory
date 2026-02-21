import { prisma } from '../utils/prisma';
import { AssetStockStatus,BorrowStatus, AssetCondition,MaintenanceStatus } from '@prisma/client';
export class assetStockService {

  static async getAll() {
    return prisma.assetStock.findMany({
      include: {
        asset:
        {
          select:
          {
            asset_code:true,
            asset_name:true,
            is_rentable:true
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
      data: {...input,status,condition:"BAIK"}
    });
  }

  static async update(id: number, input: {
    id_asset: number;
    id_location: number;
    // condition: AssetCondition;
    quantity: number;
  }) {
    const status =
    input.quantity > 0
      ? AssetStockStatus.TERSEDIA
      : AssetStockStatus.TIDAK_TERSEDIA;
    return prisma.assetStock.update({
      where: { id_asset_stock: id },
      data: {
       ...input,
       status
      }
    });
  }

  // static async delete(id: number) {
  //   return prisma.assetStock.delete({
  //     where: { id_asset_stock: id }
  //   });
  // }

   static async delete(id: number) {
    // pastikan stoknya ada dulu
    const stock = await prisma.assetStock.findUnique({
      where: { id_asset_stock: id },
      select: { id_asset_stock: true }
    });

    if (!stock) {
      throw new Error("Stock tidak ditemukan");
    }

    // 1) Cek borrow yang masih aktif (dipinjam/dipakai/terlambat)
    const activeBorrow = await prisma.assetBorrowed.findFirst({
      where: {
        id_asset_stock: id,
        status: { not: BorrowStatus.DIKEMBALIKAN }
      },
      select: { id_asset_borrowed: true, status: true }
    });

    if (activeBorrow) {
      throw new Error(
        `Stock tidak bisa dihapus karena masih ada transaksi borrow aktif (status: ${activeBorrow.status})`
      );
    }

    // 2) Cek maintenance yang masih aktif
    const activeMaintenance = await prisma.assetMaintenance.findFirst({
      where: {
        id_asset_stock: id,
        status: { not: MaintenanceStatus.DONE }
      },
      select: { id_asset_maintenance: true, status: true }
    });

    if (activeMaintenance) {
      throw new Error(
        `Stock tidak bisa dihapus karena masih ada maintenance aktif (status: ${activeMaintenance.status})`
      );
    }

    // Kalau kamu ingin: blok juga bila ada RIWAYAT borrow/maintenance walaupun sudah selesai
    // (hapus block ini kalau kamu tetap mau boleh hapus setelah selesai)
    const anyBorrowHistory = await prisma.assetBorrowed.findFirst({
      where: { id_asset_stock: id },
      select: { id_asset_borrowed: true }
    });
    if (anyBorrowHistory) {
      throw new Error("Stock tidak bisa dihapus karena memiliki riwayat peminjaman/pemakaian. Gunakan soft delete.");
    }

    const anyMaintenanceHistory = await prisma.assetMaintenance.findFirst({
      where: { id_asset_stock: id },
      select: { id_asset_maintenance: true }
    });
    if (anyMaintenanceHistory) {
      throw new Error("Stock tidak bisa dihapus karena memiliki riwayat maintenance. Gunakan soft delete.");
    }

    return prisma.assetStock.delete({
      where: { id_asset_stock: id }
    });
  }
}
