import { z } from 'zod';
import {prisma} from "../utils/prisma"

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
    .enum(["BAIK", "RUSAK", "MAINTENANCE"]),
  // status: z
    // .enum(["TERSEDIA", "TIDAK_TERSEDIA", "DIPINJAM","DIPAKAI","DISEWA"]),
});

// later
// async function validateAssetTypeId(id: number) {
//   const assetType = await prisma.assetTypes.findUnique({
//     where: { id_asset_types: id }
//   });
//   return !!assetType;
// }

// async function validateAssetCategoryId(id: number) {
//   const assetCategory = await prisma.assetCategories.findUnique({
//     where: { id_asset_categories: id }
//   });
//   return !!assetCategory;
// }

//  unique asset_code
export async function validateUniqueAssetCode(assetCode: string, excludeId?: number) {
  const existing = await prisma.asset.findFirst({
    where: {
      asset_code: assetCode,
      ...(excludeId ? { NOT: { id_assets: excludeId } } : {})
    }
  });
  
  return !existing;
}