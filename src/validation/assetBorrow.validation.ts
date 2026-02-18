import { z } from 'zod';

export const borrowSchema = z.object({
  id_user: z
    .number()
    .int("harus bilangan bulat")
    .nonnegative("tidak boleh negatif"),
  id_asset_stock: z
    .number()
    .int("harus bilangan bulat")
    .nonnegative("tidak boleh negatif"),
  quantity: z
    .number()
    .int("harus bilangan bulat")
    .nonnegative("tidak boleh negatif"),
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