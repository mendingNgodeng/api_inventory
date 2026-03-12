import { z } from 'zod';
export const Schema = z.object({
  name: z
    .string()
    .nonempty("name Wajib Diisi")
    .min(6, 'minimal 6 karakter')
    .max(20, 'maksimal 20 karakter'),
  username: z
    .string()
    .nonempty("Username Wajib Diisi")
    .min(6, 'minimal 6 karakter')
    .max(20, 'maksimal 20 karakter'),
  password: z
    .string()
    .nonempty("Password Wajib Diisi")
    .min(6, 'minimal 6 karakter'),
    // .max(20, 'maksimal 20 karakter'),
  jabatan: z.string().optional(),
  no_hp: z.string().optional(),
  // role:z.enum(["ADMIN","KARYAWAN"])

});
// const ManySchema = z.array(Schema); Reuse the same schema but im too stoopid to remember so i write both and uses just one.
export const ManySchema = z.array(
  z.object({
    name: z
    .string()
    .nonempty("name Wajib Diisi")
    .min(6, 'minimal 6 karakter')
    .max(20, 'maksimal 20 karakter'),
  username: z
    .string()
    .nonempty("Username Wajib Diisi")
    .min(6, 'minimal 6 karakter')
    .max(20, 'maksimal 20 karakter'),
  password: z
    .string()
    .nonempty("Password Wajib Diisi")
    .min(6, 'minimal 6 karakter'),
    // .max(20, 'maksimal 20 karakter'),
  jabatan: z.string().optional(),
  no_hp: z.string().optional(),
  })
);

export const UpdateSchema = z.object({
  name: z
    .string()
    .nonempty("name Wajib Diisi")
    .min(6, "minimal 6 karakter")
    .max(20, "maksimal 20 karakter"),

  username: z
    .string()
    .nonempty("Username Wajib Diisi")
    .min(6, "minimal 6 karakter")
    .max(20, "maksimal 20 karakter"),

  password: z
    .string()
    .optional()
    .refine((val:any) => !val || val.length >= 6, {
      message: "minimal 6 karakter",
    }),

  jabatan: z.string().optional(),
  no_hp: z.string().optional(),
});