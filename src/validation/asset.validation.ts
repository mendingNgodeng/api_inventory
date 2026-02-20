import { z } from 'zod';
import { validateUnique } from '../utils/unique_validation';
import {prisma} from "../utils/prisma"

export const Schema = z.object({
  id_asset_types: z
    .number()
    .int("harus bilangan bulat")
    .nonnegative("tidak boleh negatif"),
  id_asset_categories: z
    .number()
    .int("harus bilangan bulat")
    .nonnegative("tidak boleh negatif"),
  purchase_price:
    z.number()
    .int("harus bilangan bulat")
    .nonnegative("tidak boleh negatif"),
  rental_price: z.number().optional(),
  asset_code: z.string().min(1, "tidak boleh kosong"),
  asset_name: z.string().min(1, "tidak boleh kosong"),
  is_rentable:z.boolean()
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
// export async function validateUniqueAssetCode(assetCode: string, excludeId?: number) {
//   const existing = await prisma.asset.findFirst({
//     where: {
//       asset_code: assetCode,
//       ...(excludeId ? { NOT: { id_assets: excludeId } } : {})
//     }
//   });
  
//   return !existing;
// }

export const CreateAssetSchema = Schema.superRefine(async (data, ctx) => {
  const isUnique = await validateUnique({
    model: prisma.asset,
    field: "asset_code",
    value: data.asset_code
  });

  if (!isUnique) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Asset code sudah digunakan",
      path: ["asset_code"]
    });
  }
});

export const UpdateAssetSchema = (id: number) =>
  Schema.superRefine(async (data, ctx) => {
    const isUnique = await validateUnique({
      model: prisma.asset,
      field: "asset_code",
      value: data.asset_code,
      excludeField: "id_assets",
      excludeId: id
    });

    if (!isUnique) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Asset code sudah digunakan",
        path: ["asset_code"]
      });
    }
  });
