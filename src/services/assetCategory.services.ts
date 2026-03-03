import { prisma } from '../utils/prisma';
import { createAssetLog,buildLogDescription} from '../utils/asset-logs';

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
     return prisma.$transaction(async(tx) => {
      const created = await tx.assetCategories.create({data:input})

      await createAssetLog(tx,{
        action:"ASSET_CATEGORIES_CREATE",
        description:buildLogDescription({
          title:"Kategori dibuat",
        detail: `Kategori "${created.name}" berhasil dibuat`,
          meta: {
            id_asset_categories: created.id_asset_categories,
            name: created.name,
            description: created.description ?? null,
          },
        }),
      });
      return created;
    });
    // return prisma.assetCategories.create({
    //   data: input
    // });
  }

  static async update(id: number, input: {
    name: string;
    description?: string;
  }) {
     return prisma.$transaction(async (tx) => {
      // ambil data lama (opsional but why not?)
      const before = await tx.assetCategories.findUnique({
        where: { id_asset_categories: id },
      });
      if (!before) throw new Error("assetCategories tidak ditemukan");

      const updated = await tx.assetCategories.update({
        where: { id_asset_categories: id },
        data: { ...input },
      });

      await createAssetLog(tx, {
        action: "ASSET_CATEGORIES_UPDATE",
        description: buildLogDescription({
          title: "Kategori aset diupdate",
          detail: `Kategori aset "${before.name}" → "${updated.name}"`,
          meta: {
            id_asset_categories: id,
            before: {
              name: before.name,
              description: before.description ?? null,
            },
            after: {
              name: updated.name,
              description: updated.description ?? null,
            },
          },
        }),
      });

      return updated;
    });
    // return prisma.assetCategories.update({
    //   where: { id_asset_categories: id },
    //   data: {
    //    ...input
    //   }
    // });
  }

  static async delete(id: number) {
     return prisma.$transaction(async (tx) => {
      // ambil dulu buat log (karena setelah delete datanya hilang)
      const before = await tx.assetCategories.findUnique({
        where: { id_asset_categories: id },
      });
      if (!before) throw new Error("assetCategories tidak ditemukan");

      const deleted = await tx.assetCategories.delete({
        where: { id_asset_categories: id },
      });

      await createAssetLog(tx, {
        action: "ASSET_CATEGORIES_DELETE",
        description: buildLogDescription({
          title: "Lokasi dihapus",
          detail: `Lokasi "${before.name}" dihapus`,
          meta: {
            id_asset_categories: before.id_asset_categories,
            name: before.name,
            description: before.description ?? null,
          },
        }),
      });

      return deleted;
    });
    // return prisma.assetCategories.delete({
    //   where: { id_asset_categories: id }
    // });
  }
}
