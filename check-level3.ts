import "dotenv/config";
import { db } from "./src/db";
import { categories } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function checkLevel3() {
    const childrenOf15 = await db.select().from(categories).where(eq(categories.parentId, 15));
    console.log("Children of 15 (All hats):", JSON.stringify(childrenOf15.map(c => ({ id: c.id, name: c.name, printfulId: c.printfulId })), null, 2));
    process.exit(0);
}
checkLevel3();
