import { prisma } from '../utils/prisma';
import { BorrowStatus } from '@prisma/client';

export class AssetBorrowService {

  static async getAll() {
    return prisma.assetBorrowed.findMany();
  }

  static async getById(id: number) {
    return prisma.assetBorrowed.findUnique({
      where: { id_asset_borrowed:id }
    });
  }

  static async create(input: {
    id_asset: number;
    id_user: number;
    id_asset_stock: number;
    quantity:number;
    status: BorrowStatus;
  }) {
    return prisma.assetBorrowed.create({
      data: input
    });
  }

  static async update(id: number, input: {
    id_asset: number;
    id_user: number;
    id_asset_stock: number;
    quantity:number;
    status: BorrowStatus;
  }) {
    return prisma.assetBorrowed.update({
      where: { id_asset_borrowed: id },
      data: {
       ...input
      }
    });
  }

  static async delete(id: number) {
    return prisma.assetBorrowed.delete({
      where: { id_asset_borrowed: id }
    });
  }
}
