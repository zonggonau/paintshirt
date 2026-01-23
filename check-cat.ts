import "dotenv/config";
import { db } from "./src/db";
import { categories } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function check() {
    const cat = await db.select().from(categories).where(eq(categories.id, 26)).limit(1);
    console.log("Category ID 26:", JSON.stringify(cat, null, 2));
    process.exit(0);
}
check();
