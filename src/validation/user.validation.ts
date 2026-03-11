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