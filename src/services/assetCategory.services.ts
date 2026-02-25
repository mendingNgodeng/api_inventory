import { prisma } from '../utils/prisma';

export class AssetCategoryService {

  static async getAll() {
    return prisma.assetCategories.findMany({
    // orderBy:{created_at:'desc'},
    });
  }

  static async getById(id: number) {
    return prisma.assetCategories.findUnique({
      where: { id_asset_categories:id }
    });
  }

  static async create(input: {
    name: string;
    description?: string;
  }) {
    return prisma.assetCategories.create({
      data: input
    });
  }

  static async update(id: number, input: {
    name: string;
    description?: string;
  }) {
    return prisma.assetCategories.update({
      where: { id_asset_categories: id },
      data: {
       ...input
      }
    });
  }

  static async delete(id: number) {
    return prisma.assetCategories.delete({
      where: { id_asset_categories: id }
    });
  }
}
