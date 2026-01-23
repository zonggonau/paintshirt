import "dotenv/config";
import { db } from "./src/db";
import { productVariants } from "./src/db/schema";
import { eq } from "drizzle-orm";

function parseSizeAndColor(name: string) {
    const parts = name.split(' / ');
    if (parts.length >= 3) {
        return {
            color: parts[parts.length - 2].trim(),
            size: parts[parts.length - 1].trim()
        };
    } else if (parts.length === 2) {
        const commonSizes = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', 'XS', '2XS', 'One size'];
        const val = parts[1].trim();
        if (commonSizes.some(s => val.includes(s))) {
            return { color: null, size: val };
        }
        return { color: val, size: null };
    }
    return { color: null, size: null };
}

async function fixVariants() {
    console.log("Starting variant fix...");
    const variants = await db.select().from(productVariants);
    let fixedCount = 0;

    for (const v of variants) {
        if (!v.size || !v.color) {
            const { size, color } = parseSizeAndColor(v.name);
            if (size !== v.size || color !== v.color) {
                await db.update(productVariants)
                    .set({ size: size || v.size, color: color || v.color })
                    .where(eq(productVariants.id, v.id));
                fixedCount++;
            }
        }
    }
    console.log(`Finished! Fixed ${fixedCount} variants.`);
    process.exit(0);
}
fixVariants();
