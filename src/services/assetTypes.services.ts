import { prisma } from '../utils/prisma';
import { createAssetLog,buildLogDescription} from '../utils/asset-logs';
import { createToJSONSchemaMethod } from 'zod/v4/core';

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
    return prisma.$transaction(async(tx) =>{
      const created = await tx.assetTypes.create({data:input})

      await createAssetLog(tx,{
        action:"ASSET_TYPE_CREATE",
        description:buildLogDescription({
          title:"Tipe Aset Dibuat",
          detail:`tipe aset ${created.name} berhasil dibuat`,
          meta:{
            id_asset_type:created.id_asset_types,
            name:created.name,
            description:created.description ?? null
          }
        })
      })
      return created
    })
    // return prisma.assetTypes.create({
    //   data: input
    // });
  }

  static async update(id: number, input: {
    name: string;
    description?: string;
  }) {
    return prisma.$transaction(async(tx) =>{
      const before = await tx.assetTypes.findUnique({where:{id_asset_types:id}})

      if(!before) throw new Error("Tipe asset tidak ditemukan")

        const updated = await tx.assetTypes.update({
          where:{id_asset_types:id},
          data:{...input},
        })
        await createAssetLog(tx,{
          action:"ASSET_TYPE_UPDATE",
          description:buildLogDescription({
            title:"Tipe aset diupdate",
            detail: `Tipe aset ${before.name} → ${updated.name}`,
            meta:{
              id_asset_types:id,
              before:{
                nameL:before.name,
                description: before.description ?? null
              },
              after:{
                name:updated.name,
                description:updated.description ?? null
              }
            }
          }),
        })
        return updated
    })
    // return prisma.assetTypes.update({
    //   where: { id_asset_types: id },
    //   data: {
    //    ...input
    //   }
    // });
  }

  static async delete(id: number) {
    return prisma.$transaction(async(tx) => {
      const before = await tx.assetTypes.findUnique({
        where:{id_asset_types:id}
      })
      if(!before) throw new Error('Tipe aset tidak ditemukan')

        const deleted = await tx.assetTypes.delete({
          where:{id_asset_types:id}
        })

        await createAssetLog(tx,{
          action:"ASSET_TYPE_DELETE",
          description:buildLogDescription({
            title:"Tipe aset dihapus",
            detail:`Tipe Aset ${before.name} Dihapus`,
            meta:{
              id_asset_types:before.id_asset_types,
              name:before.name,
              description:before.description
            }
          })
        })
        return deleted
    })
    // return prisma.assetTypes.delete({
    //   where: { id_asset_types: id }
    // });
  }
}
