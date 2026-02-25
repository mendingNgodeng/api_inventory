// import { prisma as tx } from "./prisma";

// export class clearpicture(){
// static async clearKtpIfNoActiveRentals(tx: any, id_rental_customer: number) {
//   const activeCount = await tx.assetRental.count({
//     where: {
//       id_rental_customer,
//       status: "AKTIF",
//     },
//   });

//   if (activeCount > 0) return { cleared: false };

//   await tx.rentalCustomer.update({
//     where: { id_rental_customer },
//     data: {
//       pictureKtp: null, // atau "" kalau field non-nullable
//       // ktp_deleted_at: new Date(), // opsional
//     },
//   });

//   return { cleared: true };
// }
// }
