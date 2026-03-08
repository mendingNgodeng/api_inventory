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

        // ambil customer rental yang pictureKtp sudah null / kosong
      // DAN sudah tidak punya rental aktif
      const inactiveCustomers = await tx.rentalCustomer.findMany({
        where: {
          OR: [
            { pictureKtp: null },
            { pictureKtp: "" },
          ],
          rentals: {
            none: {},
          },
        },
        select: {
          id_rental_customer: true,
        },
      });

      let deletedRentalCustomers = 0;

      if (inactiveCustomers.length > 0) {
        const ids = inactiveCustomers.map((c) => c.id_rental_customer);

        const deletedCustomers = await tx.rentalCustomer.deleteMany({
          where: {
            id_rental_customer: { in: ids },
          },
        });

        deletedRentalCustomers = deletedCustomers.count;
      }
      // hapus blacklist token yang expired
      const now = new Date();
      const deletedBlacklistedTokens = await tx.blacklistedToken.deleteMany({
        where: {
          expiredAt: { lt: now },
        },
      });

      return {
        deletedLogs: deletedLogs.count,
        deletedBorrow: deletedBorrow.count,
        deletedRental: deletedRental.count,
        deletedMaintenance: deletedMaint.count,
        deletedRentalCustomers,
        deletedBlacklistedTokens: deletedBlacklistedTokens.count,
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