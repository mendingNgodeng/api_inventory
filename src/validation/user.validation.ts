import { z } from 'zod';
export const Schema = z.object({
  name: z
    .string()
    .min(6, 'tidak boleh kosong')
    .max(20, 'username maksimal 20 karakter'),
  jabatan: z.string(),
  no_hp: z.string()

});