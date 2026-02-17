import { prisma } from '../utils/prisma';
import { AssetStockStatus, AssetCondition } from '@prisma/client';
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
      data: {...input,status}
    });
  }

  static async update(id: number, input: {
    id_asset: number;
    id_location: number;
    condition: AssetCondition;
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

  static async delete(id: number) {
    return prisma.assetStock.delete({
      where: { id_asset_stock: id }
    });
  }
}
