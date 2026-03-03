import { prisma } from '../utils/prisma';
import { AssetStockStatus,BorrowStatus, AssetCondition,MaintenanceStatus } from '@prisma/client';
import { createAssetLog,buildLogDescription} from '../utils/asset-logs';

export class assetStockService {

  static async getAll() {
    return prisma.assetStock.findMany({
      orderBy:{created_at:'desc'},
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

      return prisma.$transaction(async(tx) => {
     const created = await prisma.assetStock.create({
      data: {...input,status:"TERSEDIA",condition:"BAIK"}, 
      include:{
        asset:true,
        location:true
      }
    });

      await createAssetLog(tx,{
        action:"ASSET_STOCK_CREATE",
        description:buildLogDescription({
          title:"Stok Aset dibuat",
        detail: `Stok aset "${created.asset.asset_name} (${created.asset.asset_code})"  dengan kuantitas ${created.quantity} berhasil dibuat`,
          meta: {
            id_asset_stock: created.id_asset_stock,
            asset: created.asset.asset_name," - ":created.asset.asset_code,
            quantity: created.quantity,
            condition:created.condition,
            status:created.status
          },
        }),
      });
      return created;
    });
    // const status =
    // input.quantity > 0
      // ? AssetStockStatus.TERSEDIA
      // : AssetStockStatus.TIDAK_TERSEDIA;

    // return prisma.assetStock.create({
    //   data: {...input,status:"TERSEDIA",condition:"BAIK"}, 
    //   include:{
    //     asset:true,
    //     location:true
    //   }
    // });
  }


static async update(
  id: number,
  input: { id_asset: number; id_location: number; quantity: number }
) {
  return prisma.$transaction(async(tx) => {

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
    current.status === AssetStockStatus.TERSEDIA && current.quantity > 0
    // ||
    // current.status === AssetStockStatus.TIDAK_TERSEDIA;

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

  // const nextStatus =
  //   input.quantity > 0 ? AssetStockStatus.TERSEDIA : AssetStockStatus.TIDAK_TERSEDIA;

  return prisma.assetStock.update({
    where: { id_asset_stock: id },
    data: { ...input},
    // data: { ...input, status: nextStatus },
    include: { asset: true, location: true },
  });
  })

}


  static async delete(id: number) {
    // 0) ambil stock lengkap (butuh status)
    return prisma.$transaction(async(tx) =>{

    const stock = await prisma.assetStock.findUnique({
      where: { id_asset_stock: id },
      select: {
        id_asset_stock: true,
        status: true,
      },
    });
     const before = await prisma.assetStock.findUnique({
      where: { id_asset_stock: id },
      include:{
        asset:true
      }
    });

    if (!stock) {
      throw new Error("Stock tidak ditemukan");
    }
       if (!before) {
      throw new Error("data aset stok tidak ditemukan");
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

    // lolos semua validasi, delete
    const data = await prisma.assetStock.delete({
      where: { id_asset_stock: id },
    });

      await createAssetLog(tx, {
        action: "ASSET_STOCK_DELETE",
        description: buildLogDescription({
          title: "Stok Aset dihapus",
          detail: `Stok Aset "${before.asset.asset_name} (${before.asset.asset_code})" dihapus`,
          meta: {
           id_asset_stock: before.id_asset_stock,
            asset: before.asset.asset_name," - ":before.asset.asset_code,
            quantity: before.quantity,
            condition:before.condition,
            status:before.status
          },
        }),
      });
    })

  }
  }

