import { prisma } from '../utils/prisma';
import { MaintenanceStatus } from '@prisma/client';
import {createAssetLog,buildLogDescription} from '../utils/asset-logs'
export class assetMaintenanceService {
static async getAll() {
  return prisma.assetMaintenance.findMany({
    orderBy:{created_at:'desc'},
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

static async createMaintenance(input: {
  id_asset_stock: number;
  quantity: number;
  cost?: number;
  description?: string;
}) {
  if (input.quantity <= 0) {
    throw new Error("Quantity harus lebih dari 0");
  }

  return prisma.$transaction(async (tx) => {
    // Ambil stock lengkap untuk log (asset + location)
    const stock = await tx.assetStock.findUnique({
      where: { id_asset_stock: input.id_asset_stock },
      include: { asset: true, location: true },
    });

    if (!stock) throw new Error("Stock tidak ditemukan");

    if (stock.condition !== "BAIK" || stock.status === "MAINTENANCE") {
      throw new Error("Stock tidak valid untuk maintenance");
    }

    if (stock.quantity < input.quantity) {
      throw new Error("Stock tidak mencukupi");
    }

    const beforeGoodQty = stock.quantity;
    const remainingQty = stock.quantity - input.quantity;

    // 1) Kurangi stock asal (BAIK)
    const updatedGoodStock = await tx.assetStock.update({
      where: { id_asset_stock: stock.id_asset_stock },
      data: { quantity: remainingQty },
      include: { asset: true, location: true },
    });

    // 2) Tambah / update stock RUSAK + MAINTENANCE
    const maintenanceStock = await tx.assetStock.findFirst({
      where: {
        id_asset: stock.id_asset,
        id_location: stock.id_location,
        condition: "RUSAK",
        status: "MAINTENANCE",
      },
    });

    let updatedMaintenanceStockId: number | null = null;
    let maintenanceBeforeQty = maintenanceStock?.quantity ?? 0;
    let maintenanceAfterQty = maintenanceBeforeQty;

    if (maintenanceStock) {
      const upd = await tx.assetStock.update({
        where: { id_asset_stock: maintenanceStock.id_asset_stock },
        data: { quantity: maintenanceStock.quantity + input.quantity },
      });
      updatedMaintenanceStockId = upd.id_asset_stock;
      maintenanceAfterQty = upd.quantity;
    } else {
      const createdMaintStock = await tx.assetStock.create({
        data: {
          id_asset: stock.id_asset,
          id_location: stock.id_location,
          condition: "RUSAK",
          status: "MAINTENANCE",
          quantity: input.quantity,
        },
      });
      updatedMaintenanceStockId = createdMaintStock.id_asset_stock;
      maintenanceAfterQty = createdMaintStock.quantity; // = input.quantity
    }

    // 3) Create record maintenance
    const maintenanceRecord = await tx.assetMaintenance.create({
      data: {
        id_asset_stock: stock.id_asset_stock, // stock asal (BAIK)
        quantity: input.quantity,
        cost: input.cost,
        description: input.description,
        status: "ON_PROGRESS",
      },
    });

    // LOG: MAINTENANCE_CREATE
    await createAssetLog(tx, {
      action: "MAINTENANCE_CREATE",
      description: buildLogDescription({
        title: "Maintenance dibuat",
        detail: `Maintenance untuk "${stock.asset.asset_name} (${stock.asset.asset_code})" di lokasi "${stock.location.name}" sebanyak ${input.quantity} dibuat`,
        meta: {
          id_asset_maintenance: maintenanceRecord.id_asset_maintenance,
          id_asset_stock_good: stock.id_asset_stock,
          id_asset_stock_maintenance: updatedMaintenanceStockId,
          asset_name: stock.asset.asset_name,
          asset_code: stock.asset.asset_code,
          location_name: stock.location.name,
          moved_to_maintenance_qty: input.quantity,
          good_qty: { from: beforeGoodQty, to: updatedGoodStock.quantity },
          maintenance_qty: { from: maintenanceBeforeQty, to: maintenanceAfterQty },
          cost: input.cost ?? null,
          description: input.description ?? null,
          status: maintenanceRecord.status,
        },
      }),
    });

    return maintenanceRecord;
  });
}

// Pengembalian
static async fixedAsset(id: number) {
  return prisma.$transaction(async (tx) => {
    const maintenance = await tx.assetMaintenance.findUnique({
      where: { id_asset_maintenance: id },
    });

    if (!maintenance) throw new Error("Data tidak ditemukan");
    if (maintenance.status === "DONE") throw new Error("Asset sudah selesai diperbaiki");

    // stock asal (BAIK) + include untuk log
    const goodStock = await tx.assetStock.findUnique({
      where: { id_asset_stock: maintenance.id_asset_stock },
      include: { asset: true, location: true },
    });

    if (!goodStock) throw new Error("Stock asal tidak ditemukan");

    const maintenanceStock = await tx.assetStock.findFirst({
      where: {
        id_asset: goodStock.id_asset,
        id_location: goodStock.id_location,
        condition: "RUSAK",
        status: "MAINTENANCE",
      },
    });

    if (!maintenanceStock) throw new Error("Stock maintenance tidak ditemukan");
    if (maintenanceStock.quantity < maintenance.quantity) {
      throw new Error("Quantity maintenance tidak valid");
    }

    const beforeMaintQty = maintenanceStock.quantity;
    const beforeGoodQty = goodStock.quantity;

    // 1) Kurangi RUSAK + MAINTENANCE
    const remainingMaintenanceQty = maintenanceStock.quantity - maintenance.quantity;

    let maintenanceStockAfter: number | null = null;
    let maintenanceStockDeleted = false;

    if (remainingMaintenanceQty > 0) {
      const upd = await tx.assetStock.update({
        where: { id_asset_stock: maintenanceStock.id_asset_stock },
        data: { quantity: remainingMaintenanceQty },
      });
      maintenanceStockAfter = upd.quantity;
    } else {
      await tx.assetStock.delete({
        where: { id_asset_stock: maintenanceStock.id_asset_stock },
      });
      maintenanceStockDeleted = true;
      maintenanceStockAfter = 0;
    }

    // 2) Tambah kembali ke BAIK + TERSEDIA
    const newGoodQty = goodStock.quantity + maintenance.quantity;

    const updatedGoodStock = await tx.assetStock.update({
      where: { id_asset_stock: goodStock.id_asset_stock },
      data: { quantity: newGoodQty, status: "TERSEDIA" },
      include: { asset: true, location: true },
    });

    // 3) Update maintenance status -> DONE
    const updatedMaintenance = await tx.assetMaintenance.update({
      where: { id_asset_maintenance: id },
      data: { status: "DONE" },
    });

    // LOG: MAINTENANCE_DONE
    await createAssetLog(tx, {
      action: "MAINTENANCE_DONE",
      description: buildLogDescription({
        title: "Maintenance selesai",
        detail: `Maintenance "${goodStock.asset.asset_name} (${goodStock.asset.asset_code})" di lokasi "${goodStock.location.name}" selesai. Qty ${maintenance.quantity} dikembalikan ke stok baik`,
        meta: {
          id_asset_maintenance: id,
          id_asset_stock_good: goodStock.id_asset_stock,
          id_asset_stock_maintenance: maintenanceStock.id_asset_stock,
          asset_name: goodStock.asset.asset_name,
          asset_code: goodStock.asset.asset_code,
          location_name: goodStock.location.name,
          fixed_qty: maintenance.quantity,
          good_qty: { from: beforeGoodQty, to: updatedGoodStock.quantity },
          maintenance_qty: {
            from: beforeMaintQty,
            to: maintenanceStockAfter,
            deleted_row: maintenanceStockDeleted,
          },
          maintenance_status: { from: maintenance.status, to: updatedMaintenance.status },
        },
      }),
    });

    return updatedMaintenance;
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
