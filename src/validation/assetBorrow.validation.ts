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

export const borrowRequestSchema = z.object({
  borrower_id: z.number().int().positive().optional(),
  id_asset_stock: z.number().int().positive(),
  quantity: z.number().int().positive(),
  due_date: z.coerce.date().refine((date) => date > new Date(), {
    message: "Batas pengembalian harus setelah waktu sekarang",
  }),
});

export const rejectBorrowSchema = z.object({
  approval_note: z.string().trim().max(255).optional(),
});

export const returnBorrowSchema = z.object({
  image_after_return: z
    .string()
    .min(1, "Foto pengembalian wajib diisi")
    .refine((value) => value.startsWith("data:image/"), {
      message: "File harus berupa gambar base64",
    }),
});