import { prisma } from '../utils/prisma';

export class rentalCustomerService {

  static async getAll() {
    return prisma.rentalCustomer.findMany();
  }

  static async getById(id: number) {
    return prisma.rentalCustomer.findUnique({
      where: { id_rental_customer:id }
    });
  }

  static async create(input: {
    name: string;
    phone: string;
    address?: string;
    email?: string;
  }) {
    return prisma.rentalCustomer.create({
      data: input
    });
  }

  static async update(id: number, input: {
    name: string;
    phone: string;
    address?: string;
    email?: string;
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
