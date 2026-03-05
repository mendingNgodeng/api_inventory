// src/jobs/retention.job.ts
import { RetentionService } from "../services/retention.services";
import { prisma } from "../utils/prisma";

async function main() {
  console.log("Running retention job...");
  const result = await RetentionService.run();
  console.log("Retention result:", result);
}

main()
  .then(async () => {
    // ✅ tutup semua koneksi DB
    await prisma.$disconnect();

    // ✅ kasih jeda kecil biar event-loop bersih (kadang bun/prisma masih nahan handle)
    setTimeout(() => process.exit(0), 100);
  })
  .catch(async (err) => {
    console.error("Retention job failed:", err);
    await prisma.$disconnect();
    setTimeout(() => process.exit(1), 100);
  });