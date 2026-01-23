import "dotenv/config";
import { db } from "./src/db";
import { categories } from "./src/db/schema";
import { eq, or } from "drizzle-orm";

async function checkHatsDetails() {
    const idsToCheck = [93, 15, 11, 10];
    const results = await db.select().from(categories).where(or(...idsToCheck.map(id => eq(categories.printfulId, id))));
    console.log("Categories Details:", JSON.stringify(results.map(c => ({
        id: c.id,
        name: c.name,
        printfulId: c.printfulId,
        parentId: c.parentId
    })), null, 2));
    process.exit(0);
}
checkHatsDetails();
