import { z } from 'zod';
export const Schema = z.object({
  name: z
    .string()
    .min(1, 'tidak boleh kosong')
    .max(50, 'nama maksimal 50 karakter'),
  description: z.string()
});