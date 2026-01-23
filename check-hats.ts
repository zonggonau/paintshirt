import "dotenv/config";
import { db } from "./src/db";
import { categories } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function checkHats() {
    const root = await db.select().from(categories).where(eq(categories.printfulId, 93)).limit(1);
    console.log("Root Category (Hats):", JSON.stringify(root, null, 2));

    if (root.length > 0) {
        const children = await db.select().from(categories).where(eq(categories.parentId, 93));
        console.log("Children of Category 93:", JSON.stringify(children, null, 2));
    }
    process.exit(0);
}
checkHats();
