export const PRODUCT_CATEGORIES = [
    "T-Shirt", "Hoodie", "Sweatshirt", "Jacket",
    "Tank Top", "Leggings", "Hat", "Cap", "Mug",
    "Poster", "Canvas", "Bag", "Phone Case", "Sticker"
];

export function getCategoryFromProduct(product: { name: string }): string {
    const name = product.name.toLowerCase();
    const found = PRODUCT_CATEGORIES.find(k => name.includes(k.toLowerCase()));
    return found || "Other";
}
