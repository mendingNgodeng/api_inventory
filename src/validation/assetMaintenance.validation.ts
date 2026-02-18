import { z } from 'zod';

export const Schema = z.object({
  id_asset_stock: z
    .number()
    .int("harus bilangan bulat")
    .nonnegative("tidak boleh negatif"),
  quantity: z
    .number()
    .int("harus bilangan bulat")
    .nonnegative("tidak boleh negatif"),
  cost: z
    .number()
    .int("harus bilangan bulat")
    .nonnegative("tidak boleh negatif")
    .optional(),
  description: z
    .string().optional()
  // returned_data:z
  // .string()
  // // .datetime(),
  // status: z
  //   .enum(["DIPAKAI", "DIPINJAM", "DIKEMBALIKAN","TERLAMBAT"]),
});

export const UsedSchema = z.object({
  id_asset_stock: z
    .number()
    .int("harus bilangan bulat")
    .nonnegative("tidak boleh negatif"),
  quantity: z
    .number()
    .int("harus bilangan bulat")
    .nonnegative("tidak boleh negatif"),
});