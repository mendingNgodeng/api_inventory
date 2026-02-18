import { z } from 'zod';
import {prisma} from "../utils/prisma"
import { validateUnique } from '../utils/unique_validation';

export const Schema = z.object({
  id_asset: z
    .number()
    .int("harus bilangan bulat")
    .nonnegative("tidak boleh negatif"),
  id_location: z
    .number()
    .int("harus bilangan bulat")
    .nonnegative("tidak boleh negatif"),
  quantity: z
    .number()
    .int("harus bilangan bulat")
    .nonnegative("tidak boleh negatif"),
  condition: z
    .enum(["BAIK", "RUSAK"]),
  // status: z
    // .enum(["TERSEDIA", "TIDAK_TERSEDIA", "DIPINJAM","DIPAKAI","DISEWA"]),
});
