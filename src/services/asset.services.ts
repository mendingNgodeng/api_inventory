import { prisma } from '../utils/prisma';

export class assetService {

  static async getAll() {
    return prisma.asset.findMany();
  }

  static async getById(id: number) {
    return prisma.asset.findUnique({
      where: { id_assets:id }
    });
  }

  static async create(input: {
    id_asset_categories: number;
    id_asset_types: number;
    purchase_price: number;
    rental_price?: number;
    asset_code:string;
    asset_name: string;
    is_rentable:boolean;
  }) {
    return prisma.asset.create({
      data: input
    });
  }

  static async update(id: number, input: {
    id_asset_categories: number;
    id_asset_types: number;
    purchase_price: number;
    rental_price?: number;
    asset_code:string;
    asset_name: string;
    is_rentable:boolean;
  }) {
    return prisma.asset.update({
      where: { id_assets: id },
      data: {
       ...input
      }
    });
  }

  static async delete(id: number) {
    return prisma.asset.delete({
      where: { id_assets: id }
    });
  }
}
