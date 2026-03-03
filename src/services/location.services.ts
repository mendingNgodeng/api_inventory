import { prisma } from '../utils/prisma';
import { createAssetLog,buildLogDescription} from '../utils/asset-logs';
export class locationService {

  static async getAll() {
    return prisma.location.findMany();
  }

  static async getById(id: number) {
    return prisma.location.findUnique({
      where: { id_location:id }
    });
  }

  // uhhh not used now i guess, safe keeping it here
  // static async createLog(input: {
  //   name: string;
  //   description?: string;
  // }) {
   
  //   return prisma.location.create({
  //     data: input
  //   });
  // }

  static async create(input:{
    name:string;
    description?:string;
  }){ 
    return prisma.$transaction(async(tx) => {
      const created = await tx.location.create({data:input})

      await createAssetLog(tx,{
        action:"LOCATION_CREATE",
        description:buildLogDescription({
          title:"lokasi dibuat",
        detail: `Lokasi "${created.name}" berhasil dibuat`,
          meta: {
            id_location: created.id_location,
            name: created.name,
            description: created.description ?? null,
          },
        }),
      });
      return created;
    });


  }
   static async update(id: number, input: { name: string; description?: string }) {
    return prisma.$transaction(async (tx) => {
      // ambil data lama (opsional but why not?)
      const before = await tx.location.findUnique({
        where: { id_location: id },
      });
      if (!before) throw new Error("Location tidak ditemukan");

      const updated = await tx.location.update({
        where: { id_location: id },
        data: { ...input },
      });

      await createAssetLog(tx, {
        action: "LOCATION_UPDATE",
        description: buildLogDescription({
          title: "Lokasi diupdate",
          detail: `Lokasi "${before.name}" → "${updated.name}"`,
          meta: {
            id_location: id,
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
  }
  

  // static async delete(id: number) {
  //   return prisma.location.delete({
  //     where: { id_location: id }
  //   });
  // }
  static async delete(id: number) {
    return prisma.$transaction(async (tx) => {
      // ambil dulu buat log (karena setelah delete datanya hilang)
      const before = await tx.location.findUnique({
        where: { id_location: id },
      });
      if (!before) throw new Error("Location tidak ditemukan");

      const deleted = await tx.location.delete({
        where: { id_location: id },
      });

      await createAssetLog(tx, {
        action: "LOCATION_DELETE",
        description: buildLogDescription({
          title: "Lokasi dihapus",
          detail: `Lokasi "${before.name}" dihapus`,
          meta: {
            id_location: before.id_location,
            name: before.name,
            description: before.description ?? null,
          },
        }),
      });

      return deleted;
    });
  }
}
