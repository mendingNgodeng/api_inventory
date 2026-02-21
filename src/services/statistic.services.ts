// for dashboard
import { prisma } from '../utils/prisma';

export class StatisticService {
  static async getCategoryRankingByStock() {
  const result = await prisma.assetStock.groupBy({
    by: ['id_asset'],
    _sum: {
      quantity: true,
    },
  });

  const assets = await prisma.asset.findMany({
    include: {
      category: true, 
    },
  });

  const categoryMap: Record<number, { name: string; total: number }> = {};

  for (const stock of result) {
    const asset = assets.find(a => a.id_assets === stock.id_asset);
    if (!asset) continue;

    const categoryId = asset.id_asset_categories;

    if (!categoryMap[categoryId]) {
      categoryMap[categoryId] = {
        name: asset.category.name, 
        total: 0,
      };
    }

    categoryMap[categoryId].total += stock._sum.quantity ?? 0;
  }

  return Object.entries(categoryMap)
    .map(([id, value]) => ({
      id_asset_categories: Number(id),
      name: value.name,
      total_stock: value.total,
    }))
    .sort((a, b) => b.total_stock - a.total_stock).splice(0,7);
}

// summary of it all
static async getDashboardSummary() {
  const [
    totalAsset,
    totalUser,
    totalCategory,
    usedAsset,
    maintenanceAsset
  ] = await Promise.all([
    prisma.assetStock.aggregate({
      _sum: { quantity: true },
    }),
    prisma.user.count(),
    prisma.assetCategories.count(),
    prisma.assetBorrowed.aggregate({
      where: { status: "DIPAKAI" },
      _sum: { quantity: true },
    }),
    prisma.assetStock.aggregate({
      where:{status:"MAINTENANCE"},
      _sum:{quantity:true}
    })
  ]);

  return {
    total_asset: totalAsset._sum.quantity ?? 0,
    total_user: totalUser,
    total_category: totalCategory,
    total_used_asset: usedAsset._sum.quantity ?? 0,
    total_maintenance_asset: maintenanceAsset._sum.quantity ?? 0,
  };
}


// not used
static async totalAsset() {
  const result = await prisma.assetStock.aggregate({
    _sum: {
      quantity: true,
    },
  });

  return result._sum.quantity ?? 0;
}

static async totalAssetKinds() {
  return prisma.asset.count();
}

static async totalUser() {
  return prisma.user.count();
}

static async totalUsedAsset() {
  const result = await prisma.assetBorrowed.aggregate({
    where: {
      status: "DIPAKAI",
    },
    _sum: {
      quantity: true,
    },
  });

  return result._sum.quantity ?? 0;
}

static async totalCategory(){
 return prisma.assetCategories.count();
}
}
