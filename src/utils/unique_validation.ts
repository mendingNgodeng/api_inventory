import { prisma } from "../utils/prisma";

type ValidateUniqueParams = {
  model: any; // model database
  field: string;
  value: any;
  excludeField?: string;
  excludeId?: number;
};

export async function validateUnique({
  model,
  field,
  value,
  excludeField,
  excludeId
}: ValidateUniqueParams): Promise<boolean> {
  
  const whereCondition: any = {
    [field]: value
  };

  if (excludeField && excludeId) {
    whereCondition.NOT = {
      [excludeField]: excludeId
    };
  }

  const existing = await model.findFirst({
    where: whereCondition
  });

  return !existing;
}
