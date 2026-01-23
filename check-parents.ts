import "dotenv/config";
import { db } from "./src/db";
import { categories } from "./src/db/schema";
import { isNotNull } from "drizzle-orm";

async function checkChildren() {
    const withParents = await db.select().from(categories).where(isNotNull(categories.parentId)).limit(50);
    console.log("Categories with parents:", JSON.stringify(withParents.map(c => ({ id: c.id, name: c.name, parentId: c.parentId })), null, 2));
    process.exit(0);
}
checkChildren();
