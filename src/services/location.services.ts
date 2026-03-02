import { prisma } from '../utils/prisma';
import { AssetLogAction,createAssetLog,buildLogDescription} from '../utils/asset-logs';
export class locationService {

  static async getAll() {
    return prisma.location.findMany();
  }

  static async getById(id: number) {
    return prisma.location.findUnique({
      where: { id_location:id }
    });
  }

  static async create(input: {
    name: string;
    description?: string;
  }) {
   
    return prisma.location.create({
      data: input
    });
  }

  static async createLog(input:{
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
  static async update(id: number, input: {
    name: string;
    description?: string;
  }) {

    return prisma.location.update({
      where: { id_location: id },
      data: {
       ...input
      }
    });
  }

  static async delete(id: number) {
    return prisma.location.delete({
      where: { id_location: id }
    });
  }
}
