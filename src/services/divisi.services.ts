import { prisma } from '../utils/prisma';
import { createAssetLog,buildLogDescription} from '../utils/asset-logs';
export class divisiService {

  static async getAll() {
    return prisma.divisi.findMany();
  }

  static async getById(id: number) {
    return prisma.divisi.findUnique({
      where: { id_divisi:id }
    });
  }

  static async create(input:{
    name:string;
    description?:string;
  }){ 
    return prisma.$transaction(async(tx) => {
      const created = await tx.divisi.create({data:input})

      await createAssetLog(tx,{
        action:"DIVISI_CREATE",
        description:buildLogDescription({
          title:"Divisi dibuat",
        detail: `Divisi "${created.name}" berhasil dibuat`,
          meta: {
            id_divisi: created.id_divisi,
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
      const before = await tx.divisi.findUnique({
        where: { id_divisi: id },
      });
      if (!before) throw new Error("divisi tidak ditemukan");

      const updated = await tx.divisi.update({
        where: { id_divisi: id },
        data: { ...input },
      });

      await createAssetLog(tx, {
        action: "DIVISI_UPDATE",
        description: buildLogDescription({
          title: "Divisi diupdate",
          detail: `Divisi "${before.name}" → "${updated.name}"`,
          meta: {
            id_divisi: id,
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
  //   return prisma.divisi.delete({
  //     where: { id_divisi: id }
  //   });
  // }
  static async delete(id: number) {
    return prisma.$transaction(async (tx) => {
      // ambil dulu buat log (karena setelah delete datanya hilang)
      const before = await tx.divisi.findUnique({
        where: { id_divisi: id },
      });
      if (!before) throw new Error("divisi tidak ditemukan");

      const deleted = await tx.divisi.delete({
        where: { id_divisi: id },
      });

      await createAssetLog(tx, {
        action: "DIVISI_DELETE",
        description: buildLogDescription({
          title: "Divis dihapus",
          detail: `Divisi " ${before.name}" dihapus`,
          meta: {
            id_divisi: before.id_divisi,
            name: before.name,
            description: before.description ?? null,
          },
        }),
      });

      return deleted;
    });
  }
}
