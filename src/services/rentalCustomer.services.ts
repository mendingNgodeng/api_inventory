import { prisma } from '../utils/prisma';
import { createAssetLog,buildLogDescription} from '../utils/asset-logs';
import { encrypt,decrypt } from "../utils/encryption";
import { build } from 'bun';
export class rentalCustomerService {

  static async getAll() {
    return prisma.rentalCustomer.findMany({
      orderBy:{created_at:'desc'},
      include:{
        rentals:true
      }
    });
  }

  static async getById(id: number) {
   const data = await prisma.rentalCustomer.findUnique({ where: { id_rental_customer: id }});
  if (!data) return null;

  return {
    ...data,
    pictureKtp: data.pictureKtp ? decrypt(data.pictureKtp) : ""
  };
  }

  static async create(input: {
    name: string;
    phone: string;
    pictureKtp?: string;
  }) {
    return prisma.$transaction(async(tx) =>{
     const encrypted = input.pictureKtp ? encrypt(input.pictureKtp) : undefined;

      const created = await tx.rentalCustomer.create({
        data:{
          name:input.name,
          phone:input.phone,
          pictureKtp: encrypted ?? ""
        }
      })
      await createAssetLog(tx,{
        action:"RENTAL_CUSTOMER_CREATE",
        description:buildLogDescription({
          title:"rental customer dibuat",
          detail: `rental customer ${created.name} (${created.phone}) dibuat`,
          meta:{
            id_rental_customer:created.id_rental_customer,
            name:created.name,
            phone:created.phone ?? null
          }
        })
      })
      return created
    })
    //  const encrypted = input.pictureKtp ? encrypt(input.pictureKtp) : undefined;
    // return prisma.rentalCustomer.create({
    //  data: {
    //   name: input.name,
    //   phone: input.phone,
    //   pictureKtp: encrypted ?? "",
    // },
    // });
  }

  static async update(id: number, input: {
    name: string;
    phone: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const before = await tx.rentalCustomer.findUnique({
        where: { id_rental_customer: id },
      });
      if (!before) throw new Error("Customer tidak ditemukan");
      const updated = await tx.rentalCustomer.update({
        where: { id_rental_customer: id },
        data: { ...input },
      });
     await createAssetLog(tx, {
        action: "RENTAL_CUSTOMER_UPDATE",
        description: buildLogDescription({
          title: "Rental Customer diupdate",
          detail: `Rental Customer "${before.name}(${before.phone})" → "${updated.name}(${updated.phone}"`,
          meta: {
            id_rental_customer: id,
            before: {
              name: before.name,
              phone: before.phone ?? null,
            },
            after: {
              name: updated.name,
              phone: updated.phone ?? null,
            },
          },
        }),
      });
    })
    // return prisma.rentalCustomer.update({
    //   where: { id_rental_customer: id },
    //   data: {
    //    ...input
    //   }
    // });

  }

  static async delete(id: number) {

return prisma.$transaction(async (tx) => {
      // ambil dulu buat log (karena setelah delete datanya hilang)
      const before = await tx.rentalCustomer.findUnique({
        where: { id_rental_customer: id },
      });
      if (!before) throw new Error("rentalCustomer tidak ditemukan");

      const deleted = await tx.rentalCustomer.delete({
        where: { id_rental_customer: id },
      });

      await createAssetLog(tx, {
        action: "RENTAL_CUSTOMER_DELETE",
        description: buildLogDescription({
          title: "Lokasi dihapus",
          detail: `Lokasi "${before.name}" dihapus`,
          meta: {
            id_rental_customer: before.id_rental_customer,
            name: before.name,
            phone: before.phone ?? null,
          },
        }),
      });

      return deleted;
    });

    // return prisma.rentalCustomer.delete({
    //   where: { id_rental_customer: id }
    // });
  }
}
