import { prisma } from '../utils/prisma';

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
