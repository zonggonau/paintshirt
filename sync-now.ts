import "dotenv/config";
import { syncProducts } from "./src/lib/sync-products";

async function runSync() {
    console.log("Starting full sync including categories...");
    const result = await syncProducts("manual");
    console.log("Sync Result:", JSON.stringify(result, null, 2));
    process.exit(0);
}

runSync().catch(err => {
    console.error("Sync failed:", err);
    process.exit(1);
});
