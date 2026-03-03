import { z } from 'zod';
export const Schema = z.object({

  name: z
    .string()
    .min(1, 'Kategori boleh kosong'),
  description: z.string()
});

// export const UpdateSchema = CreateSchema.partial();