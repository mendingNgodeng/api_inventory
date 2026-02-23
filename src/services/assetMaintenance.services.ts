import { prisma } from '../utils/prisma';
import { MaintenanceStatus } from '@prisma/client';

export class assetMaintenanceService {
static async getAll() {
  return prisma.assetMaintenance.findMany({
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
    return prisma.assetMaintenance.findUnique({
      where: { id_asset_maintenance:id }
    });
  }

static async createMaintenance(
  input: {
    id_asset_stock: number;
    quantity: number;
    cost: number;
    description:string;
  }
) {
  if (input.quantity <= 0) {
    throw new Error("Quantity harus lebih dari 0");
  }

  return prisma.$transaction(async (tx) => {

    const stock = await tx.assetStock.findUnique({
      where: { id_asset_stock: input.id_asset_stock }
    });

    if (!stock) {
      throw new Error("Stock tidak ditemukan");
    }

    if (stock.condition !== "BAIK" || stock.status === "MAINTENANCE") {
      throw new Error("Stock tidak valid untuk maintenance");
    }

    if (stock.quantity < input.quantity) {
      throw new Error("Stock tidak mencukupi");
    }

    // Kurangi stock lama
    const remainingQty = stock.quantity - input.quantity;

    const newStatus =
      remainingQty > 0 ? "TERSEDIA" : "TIDAK_TERSEDIA";

    await tx.assetStock.update({
      where: { id_asset_stock: stock.id_asset_stock },
      data: {
        quantity: remainingQty,
        status: newStatus
      }
    });

    // tambah / update RUSAK + MAINTENANCE
    const maintenanceStock = await tx.assetStock.findFirst({
      where: {
        id_asset: stock.id_asset,
        id_location: stock.id_location,
        condition: "RUSAK",
        status: "MAINTENANCE"
      }
    });
    if (maintenanceStock) {
      await tx.assetStock.update({
        where: { id_asset_stock: maintenanceStock.id_asset_stock },
        data: {
          quantity: maintenanceStock.quantity + input.quantity
        }
      });
    } else {
      await tx.assetStock.create({
        data: {
          id_asset: stock.id_asset,
          id_location: stock.id_location,
          condition: "RUSAK",
          status: "MAINTENANCE",
          quantity: input.quantity
        }
      });
    }

    // create record maintenance
    return tx.assetMaintenance.create({
      data: {
        id_asset_stock: stock.id_asset_stock,
        quantity: input.quantity,
        status: "ON_PROGRESS"
      }
    });
  });
}


// Pengembaian
static async fixedAsset(id: number) {
  return prisma.$transaction(async (tx) => {

    const maintenance = await tx.assetMaintenance.findUnique({
      where: { id_asset_maintenance: id }
    });

    if (!maintenance) {
      throw new Error("Data tidak ditemukan");
    }

    if (maintenance.status === "DONE") {
      throw new Error("Asset sudah selesai diperbaiki");
    }

    // Ambil stock asal (BAIK)
    const goodStock = await tx.assetStock.findUnique({
      where: { id_asset_stock: maintenance.id_asset_stock }
    });

    if (!goodStock) {
      throw new Error("Stock asal tidak ditemukan");
    }

    // Cari stock RUSAK MAINTENANCE
    const maintenanceStock = await tx.assetStock.findFirst({
      where: {
        id_asset: goodStock.id_asset,
        id_location: goodStock.id_location,
        condition: "RUSAK",
        status: "MAINTENANCE"
      }
    });

    if (!maintenanceStock) {
      throw new Error("Stock maintenance tidak ditemukan");
    }

    if (maintenanceStock.quantity < maintenance.quantity) {
      throw new Error("Quantity maintenance tidak valid");
    }

    // 1️Kurangi RUSAK + MAINTENANCE
    const remainingMaintenanceQty =
      maintenanceStock.quantity - maintenance.quantity;

    if (remainingMaintenanceQty > 0) {
      await tx.assetStock.update({
        where: { id_asset_stock: maintenanceStock.id_asset_stock },
        data: { quantity: remainingMaintenanceQty }
      });
    } else {
      //  delete row rusak maintenance dari 
      await tx.assetStock.delete({
        where: { id_asset_stock: maintenanceStock.id_asset_stock }
      });
    }

    // 2️Tambah kembali ke BAIK + TERSEDIA
    const newGoodQty = goodStock.quantity + maintenance.quantity;

    await tx.assetStock.update({
      where: { id_asset_stock: goodStock.id_asset_stock },
      data: {
        quantity: newGoodQty,
        status: "TERSEDIA"
      }
    });
    // Update maintenance status
    return tx.assetMaintenance.update({
      where: { id_asset_maintenance: id },
      data: {
        status: "DONE"
      }
    });

  });
}


  static async update(id: number, input: {
    id_user: number;
    id_asset_stock: number;
    quantity:number;
    status: MaintenanceStatus;
  }) {
    return prisma.assetMaintenance.update({
      where: { id_asset_maintenance: id },
      data: {
       ...input
      }
    });
  }

  static async delete(id: number) {
  const maintenance = await prisma.assetMaintenance.findUnique({
    where: { id_asset_maintenance: id }
  });

  if (!maintenance) {
    throw new Error("Data tidak ditemukan");
  }

  if (maintenance.status === "ON_PROGRESS") {
    throw new Error("Tidak bisa menghapus data yang masih maintenance");
  }

  return prisma.assetMaintenance.delete({
    where: { id_asset_maintenance: id }
  });
}

}
