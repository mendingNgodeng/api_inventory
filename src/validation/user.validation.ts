import { z } from 'zod';
export const Schema = z.object({
  name: z
    .string()
    .min(6, 'minimal 6 karakter')
    .max(20, 'maksimal 20 karakter'),
  jabatan: z.string(),
  no_hp: z.string()

});