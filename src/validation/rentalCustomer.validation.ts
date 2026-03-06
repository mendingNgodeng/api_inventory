import { z } from 'zod';
export const Schema = z.object({
  name: z
    .string()
    .min(6, 'Minimal 6 Karakter')
    .max(50, 'Maksimal maksimal 50 karakter'),
  phone: z.string().min(1,"Nomor HP tidak boleh kosong"),
  pictureKtp: z.string().optional()
              
});

export const UpdateSchema = z.object({
  name: z
    .string()
    .min(6, 'Minimal 6 Karakter')
    .max(50, 'Maksimal maksimal 50 karakter'),
  phone: z.string().min(1,"Nomor HP tidak boleh kosong"),
});