import { z } from 'zod';
export const Schema = z.object({
  name: z
    .string()
    .min(6, 'tidak boleh kosong')
    .max(40, 'name maksimal 40 karakter'),
  phone: z.string().min(1,"Nomor HP tidak boleh kosong"),
  pictureKtp: z.string().optional()
              
});

export const UpdateSchema = z.object({
  name: z
    .string()
    .min(6, 'tidak boleh kosong')
    .max(40, 'name maksimal 40 karakter'),
  phone: z.string().min(1,"Nomor HP tidak boleh kosong"),
});