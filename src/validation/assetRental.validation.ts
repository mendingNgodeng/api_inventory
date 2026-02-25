import { z } from "zod";

export const RentalStatusEnum = z.enum([ "AKTIF", "SELESAI", "DIBATALKAN"]);

// number preprocess (biar string dari form aman)
const intField = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
  z.number().int("harus bilangan bulat")
);

const floatField = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
  z.number()
);

const dateField = z.preprocess((val) => {
  if (val instanceof Date) return val;
  if (typeof val === "string" || typeof val === "number") {
    const d = new Date(val);
    return isNaN(d.getTime()) ? undefined : d;
  }
  return undefined;
}, z.date({ message: "Tanggal tidak valid" }));

const intPositive = (msg: string) =>
  z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
    z
      .number({ message: msg })
      .int("harus bilangan bulat")
      .gt(0, msg)
  );

const numberNonNegative = (msg: string) =>
  z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
    z.number().min(0, msg)
  );
// base64 (longgar tapi cukup)
// - boleh kosong / null
// - kalau ada, harus string base64 (dengan atau tanpa prefix data:image/*;base64,)
const base64ImageOptional = z
  .string()
  .trim()
  .optional()
  .refine((v) => {
    if (!v) return true;
    const s = v.startsWith("data:") ? v.split(",")[1] ?? "" : v;
    // cek karakter base64
    return /^[A-Za-z0-9+/=\r\n]+$/.test(s);
  }, "Format gambar tidak valid (base64)");

// CREATE
export const CreateAssetRentalSchema = z
  .object({
    id_rental_customer: intPositive("Customer wajib diisi"),
    id_asset_stock: intPositive("Asset stock wajib diisi"),
    quantity: intPositive("Quantity minimal 1"),
    rental_start: dateField,
    rental_end: dateField,
    price: numberNonNegative("Harga tidak boleh negatif"),
    status: RentalStatusEnum.optional().default("AKTIF"),
  })
  .superRefine((val, ctx) => {
    if (val.rental_end <= val.rental_start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["rental_end"],
        message: "Tanggal selesai harus setelah tanggal mulai",
      });
    }
  });

// UPDATE biasa (tanpa stok mutasi)
export const UpdateAssetRentalSchema = z
  .object({
    rental_start: dateField.optional(),
    rental_end: dateField.optional(),
    price: floatField.optional(),
    status: RentalStatusEnum.optional(),
  })
  .superRefine((val, ctx) => {
    if (val.rental_start && val.rental_end && val.rental_end <= val.rental_start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["rental_end"],
        message: "Tanggal selesai harus setelah tanggal mulai",
      });
    }
  });

// FINISH payload: foto optional + boleh update condition (kalau kamu mau nanti)
export const FinishRentalSchema = z.object({
  image_after_rental: base64ImageOptional,
});

// CANCEL payload (kalau butuh reason nanti bisa ditambah)
export const CancelRentalSchema = z.object({});