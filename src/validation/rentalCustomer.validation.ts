import { z } from 'zod';
export const Schema = z.object({
  name: z
    .string()
    .min(6, 'tidak boleh kosong')
    .max(40, 'username maksimal 20 karakter'),
  phone: z.string().min(1,"tidak boleh kosong"),
  email: z.string(),
  address: z.string()
});