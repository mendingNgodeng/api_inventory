import { z } from 'zod';
export const urlSchema = z.object({
  // email: z.email(),

  username: z
    .string()
    .min(3, 'username minimal 6 karakter')
    .max(20, 'username maksimal 20 karakter'),

  password: z.string().min(6, 'Password minimal 6 karakter'),
});