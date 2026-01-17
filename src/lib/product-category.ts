
import { PrintfulProduct } from "../types";

export const PRODUCT_CATEGORIES = [
    "T-Shirt", "Hoodie", "Sweatshirt", "Jacket",
    "Tank Top", "Leggings", "Hat", "Cap", "Mug",
    "Poster", "Canvas", "Bag", "Phone Case", "Sticker"
];

// Map Printful main_category_id to readable names
// You can expand this list as you discover more IDs
export const CATEGORY_ID_MAP: Record<number, string> = {
    // Men's Clothing
    6: "T-Shirt",
    7: "Hoodie",
    8: "Sweatshirt",
    12: "Tank Top",
    15: "Jacket",

    // Women's Clothing
    32: "T-Shirt",
    33: "Hoodie",
    34: "Sweatshirt",
    36: "Tank Top",
    39: "Jacket",
    43: "Leggings",

    // Hats
    21: "Cap", // Snapbacks
    22: "Hat", // Trucker hats
    23: "Hat", // 5-panel

    // Accessories
    1: "Poster",
    2: "Canvas",
    3: "Unknown",
    4: "Mug",
    19: "Bag",
    51: "Phone Case",
};

export function getCategoryFromProduct(
    product: PrintfulProduct | { name: string },
    categoryMap?: Record<number, string>
): string {
    // Try to get category from ID first
    if ('variants' in product && product.variants && product.variants.length > 0) {
        const firstVariant = product.variants[0];
        if (firstVariant.parent_id) {
            // Check dynamic map first
            if (categoryMap && categoryMap[firstVariant.parent_id]) {
                return categoryMap[firstVariant.parent_id];
            }

            // Fallback to static map
            const mappedCategory = CATEGORY_ID_MAP[firstVariant.parent_id];
            if (mappedCategory) {
                return mappedCategory;
            }
        }
    }

    // Fallback to name-based matching
    const name = product.name.toLowerCase();
    const found = PRODUCT_CATEGORIES.find(k => name.includes(k.toLowerCase()));

    return found || "Other";
}
