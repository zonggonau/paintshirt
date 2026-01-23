import "dotenv/config";
import { db } from "./src/db";
import { categories, products, productCategories } from "./src/db/schema";
import { sql } from "drizzle-orm";

async function checkDB() {
    try {
        const catCount = await db.select({ count: sql`count(*)` }).from(categories);
        const prodCount = await db.select({ count: sql`count(*)` }).from(products);
        const linkCount = await db.select({ count: sql`count(*)` }).from(productCategories);

        console.log("Categories:", catCount[0].count);
        console.log("Products:", prodCount[0].count);
        console.log("Links (productCategories):", linkCount[0].count);

        const sampleLinks = await db.select().from(productCategories).limit(5);
        console.log("Sample Links:", JSON.stringify(sampleLinks, null, 2));

        const sampleCats = await db.select().from(categories).limit(5);
        console.log("Sample Categories:", JSON.stringify(sampleCats, null, 2));

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkDB();
