import { prisma } from '../utils/prisma';

export class userService {

  static async getAll() {
    return prisma.user.findMany();
  }

  static async getById(id: number) {
    return prisma.user.findUnique({
      where: { id_user:id }
    });
  }

  static async create(input: {
    name: string;
    jabatan?: string;
    no_hp?: string;

  }) {
    return prisma.user.create({
      data: input
    });
  }

  static async update(id: number, input: {
    name: string;
    jabatan?: string;
    no_hp?: string;
  }) {
    return prisma.user.update({
      where: { id_user: id },
      data: {
       ...input
      }
    });
  }

  static async delete(id: number) {
    return prisma.user.delete({
      where: { id_user: id }
    });
  }
}
