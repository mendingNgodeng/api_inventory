import { z } from 'zod';
import {prisma} from "../utils/prisma"
import { validateUnique } from '../utils/unique_validation';

export const Schema = z.object({
  id_asset: z
    .number()
    .int("harus bilangan bulat")
    .nonnegative("tidak boleh negatif"),
  id_location: z
    .number()
    .int("harus bilangan bulat")
    .nonnegative("tidak boleh negatif"),
  quantity: z
    .number()
    .int("harus bilangan bulat")
    .nonnegative("tidak boleh negatif"),
  condition: z
    .enum(["BAIK", "RUSAK", "MAINTENANCE"]),
  // status: z
    // .enum(["TERSEDIA", "TIDAK_TERSEDIA", "DIPINJAM","DIPAKAI","DISEWA"]),
});

export const CreateAssetSchema = Schema.superRefine(async (data, ctx) => {
  const isUnique = await validateUnique({
    model: prisma.assetStock,
    field: "id_asset",
    value: data.id_asset
  });

  if (!isUnique) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Asset ini sudah terdaftar dalam stock",
      path: ["id_asset"]
    });
  }
});

export const UpdateAssetSchema = (id: number) =>
  Schema.superRefine(async (data, ctx) => {
    const isUnique = await validateUnique({
      model: prisma.assetStock,
      field: "id_assets",
      value: data.id_asset,
      excludeField: "id_asset_stock",
      excludeId: id
    });

    if (!isUnique) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Asset code sudah digunakan",
        path: ["id_assets"]
      });
    }
  });
