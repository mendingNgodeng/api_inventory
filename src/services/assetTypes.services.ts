import { prisma } from '../utils/prisma';

export class AssetTypesService {

  static async getAll() {
    return prisma.assetTypes.findMany({
    // orderBy:{created_at:'desc'},

    });
  }

  static async getById(id: number) {
    return prisma.assetTypes.findUnique({
      where: { id_asset_types:id }
    });
  }

  static async create(input: {
    name: string;
    description?: string;
  }) {
    return prisma.assetTypes.create({
      data: input
    });
  }

  static async update(id: number, input: {
    name: string;
    description?: string;
  }) {
    return prisma.assetTypes.update({
      where: { id_asset_types: id },
      data: {
       ...input
      }
    });
  }

  static async delete(id: number) {
    return prisma.assetTypes.delete({
      where: { id_asset_types: id }
    });
  }
}
