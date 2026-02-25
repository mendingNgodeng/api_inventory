import { prisma } from '../utils/prisma';
import { encrypt,decrypt } from "../utils/encryption";
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
     const encrypted = input.pictureKtp ? encrypt(input.pictureKtp) : undefined;
    return prisma.rentalCustomer.create({
     data: {
      name: input.name,
      phone: input.phone,
      pictureKtp: encrypted ?? "",
    },
    });
  }

  static async update(id: number, input: {
    name: string;
    phone: string;
  }) {
    return prisma.rentalCustomer.update({
      where: { id_rental_customer: id },
      data: {
       ...input
      }
    });
  }

  static async delete(id: number) {
    return prisma.rentalCustomer.delete({
      where: { id_rental_customer: id }
    });
  }
}
