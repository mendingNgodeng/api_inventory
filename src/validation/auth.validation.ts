import { z } from 'zod';
export const urlSchema = z.object({
  // email: z.email(),

  username: z
    .string()
    .min(1, 'username tidak boleh kosong')
    .max(50, 'username maksimal 50 karakter'),

  password: z.string().min(6, 'Password minimal 6 karakter'),
});