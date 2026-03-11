import { z } from 'zod';

export const borrowSchema = z.object({
  // borrower_id: z //refers to id_user
  //   .number()
  //   .int("harus bilangan bulat")
  //   .nonnegative("tidak boleh negatif"),
      borrower_id: z //refers to id_user
    .number().optional(),
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