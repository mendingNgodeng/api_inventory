import { prisma } from '../utils/prisma';
import { createAssetLog,buildLogDescription} from '../utils/asset-logs';

export class assetService {

  static async getAll() {
    return prisma.asset.findMany({
    orderBy:{created_at:'asc'},
      include:{
        type:{
          select:{name:true}
        },
        category:{
          select:{name:true}
        }
      }
    });
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
    //rental_price?: number; // tidak jadi
    asset_code:string;
    asset_name: string;
    is_rentable:boolean;
  }) {
       return prisma.$transaction(async(tx) => {
          const created = await tx.asset.create({
            data:{...input},
            include:{
              category:true,
              type:true
            }
          })
    
          await createAssetLog(tx,{
            action:"ASSET_CREATE",
            description:buildLogDescription({
              title:"Asset dibuat",
            detail: `Asset "${created.asset_name}(${created.asset_code})" berhasil dibuat`,
              meta: {
                id_asset: created.id_assets,
                asset_name: created.asset_name,
                asset_code: created.asset_code,
                purchase_price: created.purchase_price ?? null,
              },
            }),
          });
          return created;
        });
    // return prisma.asset.create({
    //   data: {...input},
    //  include:{
    //     type:true,
    //     category:true
    //   }
    // });
  }

  static async update(id: number, input: {
    id_asset_categories: number;
    id_asset_types: number;
    purchase_price: number;
    //rental_price?: number;
    asset_code:string;
    asset_name: string;
    is_rentable:boolean;
  }) {
     return prisma.$transaction(async (tx) => {
      // ambil data lama (opsional but why not?)
      const before = await tx.asset.findUnique({
        where: { id_assets: id },
      });
      if (!before) throw new Error("asset tidak ditemukan");

      const updated = await tx.asset.update({
      where: { id_assets: id },
      data: {
       ...input,
      },
      include:{
        type:true,
        category:true
      }
      });

      await createAssetLog(tx, {
        action: "ASSET_UPDATE",
        description: buildLogDescription({
          title: "Aset diupdate",
          detail: `Aset "${before.asset_name}(${before.asset_code})" → "${updated.asset_name}(${updated.asset_code})"`,
          meta: {
            id_asset: id,
            before: {
               id_asset: before.id_assets,
              asset_name: before.asset_name,
                asset_code: before.asset_code,
                purchase_price: before.purchase_price ?? null,
            },
            after: {
              id_asset: updated.id_assets,
              asset_name: updated.asset_name,
              asset_code: updated.asset_code,
              purchase_price: updated.purchase_price ?? null,
            },
          },
        }),
      });

      return updated;
    });
    // return prisma.asset.update({
    //   where: { id_assets: id },
    //   data: {
    //    ...input,
    //   },
    //   include:{
    //     type:true,
    //     category:true
    //   }
    // });
  }

  static async delete(id: number) {
     return prisma.$transaction(async (tx) => {
      // ambil dulu buat log (karena setelah delete datanya hilang)
      const before = await tx.asset.findUnique({
        where: { id_assets: id },
      });
      if (!before) throw new Error("asset tidak ditemukan");

      const deleted = await tx.asset.delete({
        where: { id_assets: id },
      });

      await createAssetLog(tx, {
        action: "ASSET_DELETE",
        description: buildLogDescription({
          title: "Aset dihapus",
          detail: `Aset "${before.asset_name}(${before.asset_code})" dihapus`,
          meta: {
              id_asset: before.id_assets,
              asset_name: before.asset_name,
              asset_code: before.asset_code,
              purchase_price: before.purchase_price ?? null,
          },
        }),
      });

      return deleted;
    });
    // return prisma.asset.delete({
    //   where: { id_assets: id }
    // });
  }
}
