import "dotenv/config";
import { db } from "./src/db";
import { productVariants } from "./src/db/schema";

async function checkVariants() {
    const variants = await db.select().from(productVariants).limit(5);
    console.log("Variant Data Sample:", JSON.stringify(variants.map(v => ({
        id: v.id,
        name: v.name,
        size: v.size,
        color: v.color,
        options: v.options
    })), null, 2));
    process.exit(0);
}
checkVariants();
