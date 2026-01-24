import "dotenv/config";
import { db } from "../src/db";
import { syncCategories } from "../src/lib/sync-products";

async function seed() {
    console.log("🌱 Initializing database...");

    // 1. Sync Categories
    console.log("📂 Syncing categories from Printful...");
    try {
        const result = await syncCategories();
        console.log(`✅ Categories synced: Added ${result.added}, Updated ${result.updated}`);
    } catch (error) {
        console.error("❌ Failed to sync categories:", error);
    }

    // 2. Optional: Clear Products (Only if requested via environment variable)
    if (process.env.CLEAN_START === "true") {
        console.log(" Cleaning up existing products as requested...");
        const { products, productVariants, productCategories } = await import("../src/db/schema");
        await db.delete(productCategories);
        await db.delete(productVariants);
        await db.delete(products);
        console.log("✅ Products cleared. Categories preserved.");
    }

    console.log("✨ Initialization completed.");
    process.exit(0);
}

seed();
