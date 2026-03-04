import { prisma } from "../utils/prisma";

function daysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

export class RetentionService {
  static async run() {
    const enabled = String(process.env.RETENTION_ENABLED ?? "false") === "true";
    if (!enabled) return { enabled: false };

    const logsDays = Number(process.env.RETENTION_LOGS_DAYS ?? 180);
    const borrowDays = Number(process.env.RETENTION_BORROW_DAYS ?? 365);
    const rentalDays = Number(process.env.RETENTION_RENTAL_DAYS ?? 365);
    const maintDays = Number(process.env.RETENTION_MAINTENANCE_DAYS ?? 365);

    const cutLogs = daysAgo(logsDays);
    const cutBorrow = daysAgo(borrowDays);
    const cutRental = daysAgo(rentalDays);
    const cutMaint = daysAgo(maintDays);

    // pakai transaction biar konsisten
    const result = await prisma.$transaction(async (tx) => {
      const deletedLogs = await tx.assetLogs.deleteMany({
        where: { created_at: { lt: cutLogs } },
      });

      const deletedBorrow = await tx.assetBorrowed.deleteMany({
        where: {
          status: "DIKEMBALIKAN",
          returned_date: { lt: cutBorrow },
        },
      });

      const deletedRental = await tx.assetRental.deleteMany({
        where: {
          status: { in: ["SELESAI", "DIBATALKAN"] },
          // returned_date bisa null, jadi pakai OR dengan updated_at
          OR: [
            { returned_date: { lt: cutRental } },
            { returned_date: null, rental_end: { lt: cutRental } }, // fallback kalau returned_date null
          ],
        },
      });

      const deletedMaint = await tx.assetMaintenance.deleteMany({
        where: {
          status: "DONE",
          updated_at: { lt: cutMaint },
        },
      });

      return {
        deletedLogs: deletedLogs.count,
        deletedBorrow: deletedBorrow.count,
        deletedRental: deletedRental.count,
        deletedMaintenance: deletedMaint.count,
      };
    });

    return {
      enabled: true,
      cutoffs: {
        logs: cutLogs,
        borrow: cutBorrow,
        rental: cutRental,
        maintenance: cutMaint,
      },
      ...result,
    };
  }
}