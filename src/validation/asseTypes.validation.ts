import { z } from 'zod';
export const Schema = z.object({
  name: z
    .string()
    .min(1, 'tidak boleh kosong')
    .max(20, 'username maksimal 20 karakter'),
  description: z.string()
});