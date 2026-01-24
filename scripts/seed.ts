import "dotenv/config";
import { db } from "../src/db";
import { users } from "../src/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { syncCategories } from "../src/lib/sync-products";

async function seed() {
    console.log("🌱 Seeding database...");

    // 1. Create Admin User
    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (!adminEmail || !adminPassword) {
        console.error("❌ ADMIN_EMAIL or ADMIN_PASSWORD not found in .env");
        process.exit(1);
    }

    const existingUser = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);

    if (existingUser.length === 0) {
        console.log(`👤 Creating admin user: ${adminEmail}`);
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        await db.insert(users).values({
            email: adminEmail,
            password: hashedPassword,
            name: "Admin",
        });
        console.log("✅ Admin user created.");
    } else {
        console.log("ℹ️ Admin user already exists.");
    }

    // 2. Sync Categories
    console.log("📂 Syncing categories from Printful...");
    try {
        const result = await syncCategories();
        console.log(`✅ Categories synced: Added ${result.added}, Updated ${result.updated}`);
    } catch (error) {
        console.error("❌ Failed to sync categories:", error);
    }

    // 3. Optional: Clear Products (Only if requested via environment variable)
    if (process.env.CLEAN_START === "true") {
        console.log(" Cleaning up existing products as requested...");
        const { products, productVariants, productCategories } = await import("../src/db/schema");
        await db.delete(productCategories);
        await db.delete(productVariants);
        await db.delete(products);
        console.log("✅ Products cleared. Categories preserved.");
    }

    console.log("✨ Seeding completed.");
    process.exit(0);
}

seed();
