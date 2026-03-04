import { RetentionService } from "../services/retention.services";

async function main() {
  try {
    console.log("Running retention job...");

    const result = await RetentionService.run();

    console.log("Retention result:", result);
  } catch (err) {
    console.error("Retention job failed:", err);
  } finally {
    process.exit(0);
  }
}

main();