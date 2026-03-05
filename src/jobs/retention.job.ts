import { RetentionService } from "../services/retention.services";
import { prisma } from "../utils/prisma";

async function main() {
  console.log("Running retention job...");
  const result = await RetentionService.run();
  console.log("Retention result:", result);
}

main()
  .then(async () => {
    // penting: tutup koneksi prisma
    await prisma.$disconnect();
    // penting: biar Railway job selesai
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("Retention job failed:", err);
    await prisma.$disconnect();
    process.exit(1);
  });