// for dashboard
import { prisma } from '../utils/prisma';

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

export class StatisticService {
  static async get5LatestLogs() {
    return prisma.assetLogs.findMany({
      orderBy:{created_at:'desc'},
      take:5
    })
  }
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

// summary of it all more EFFICIENT!
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

 static async getBorrowSummary() {
    const dayStart = startOfDay();
    const dayEnd = endOfDay();

    const [dipinjamAktif, dipakaiAktif, returnedToday] =
      await Promise.all([
        prisma.assetBorrowed.aggregate({
          where: { status: "DIPINJAM" },
          _sum: { quantity: true },
          _count: { _all: true },
        }),
        prisma.assetBorrowed.aggregate({
          where: { status: "DIPAKAI" },
          _sum: { quantity: true },
          _count: { _all: true },
        }),
      
        prisma.assetBorrowed.aggregate({
          where: {
            status: "DIKEMBALIKAN",
            returned_date: { gte: dayStart, lte: dayEnd },
          },
          _sum: { quantity: true },
          _count: { _all: true },
        }),
      ]);

    return {
      dipinjam_aktif: {
        total_qty: dipinjamAktif._sum.quantity ?? 0,
        total_row: dipinjamAktif._count._all ?? 0,
      },
      dipakai_aktif: {
        total_qty: dipakaiAktif._sum.quantity ?? 0,
        total_row: dipakaiAktif._count._all ?? 0,
      },
      returned_today: {
        total_qty: returnedToday._sum.quantity ?? 0,
        total_row: returnedToday._count._all ?? 0,
        day_start: dayStart.toISOString(),
      },
    };
  }

  /**
   * Rental Summary + Revenue:
   * - count status (AKTIF, SELESAI, DIBATALKAN)
   * - revenue bulan ini (sum price dari rental SELESAI, berdasarkan rental_start >= awal bulan)
   * - revenue total (sum price dari rental SELESAI)
   */
  static async getRentalSummary() {
    const monthStart = startOfMonth();

    const [aktifCount, selesaiCount, dibatalkanCount, revenueMonth, revenueTotal] =
      await Promise.all([
        prisma.assetRental.count({ where: { status: "AKTIF" } }),
        prisma.assetRental.count({ where: { status: "SELESAI" } }),
        prisma.assetRental.count({ where: { status: "DIBATALKAN" } }),
        prisma.assetRental.aggregate({
          where: { status: "SELESAI", rental_start: { gte: monthStart } },
          _sum: { price: true },
        }),
        prisma.assetRental.aggregate({
          where: { status: "SELESAI" },
          _sum: { price: true },
        }),
      ]);

    return {
      aktif_count: aktifCount,
      selesai_count: selesaiCount,
      dibatalkan_count: dibatalkanCount,
      revenue_month: revenueMonth._sum.price ?? 0,
      revenue_total: revenueTotal._sum.price ?? 0,
      month_start: monthStart.toISOString(),
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
