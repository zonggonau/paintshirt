import { PrintfulCategory } from "../types";
import { getCategoryFromProduct } from "./product-category";

export interface ProductWithCategories {
    id: string;
    name: string;
    variants: Array<{
        parent_id?: number;
        [key: string]: any;
    }>;
}

/**
 * Filter categories to only show those that have products (including child categories)
 * @param categories - All available categories
 * @param products - All products in the store
 * @returns Filtered categories that have at least one product
 */
export function filterCategoriesWithProducts(
    categories: PrintfulCategory[],
    products: ProductWithCategories[]
): PrintfulCategory[] {
    // Build a set of all category titles that have products
    const categoriesWithProducts = new Set<string>();
    const categoryIdsWithProducts = new Set<number>();

    products.forEach(product => {
        // Get category from product name/variants
        const category = getCategoryFromProduct(product);
        if (category && category !== "Other" && category !== "Unknown") {
            categoriesWithProducts.add(category.toLowerCase());
        }

        // Also track parent_id from variants 
        if (product.variants && product.variants.length > 0) {
            const parentId = product.variants[0].parent_id;
            if (parentId) {
                categoryIdsWithProducts.add(parentId);
            }
        }
    });

    // Helper to check if category or any of its descendants have products
    const categoryHasProducts = (cat: PrintfulCategory, allCats: PrintfulCategory[]): boolean => {
        // Check if this category directly has products
        if (categoriesWithProducts.has(cat.title.toLowerCase())) {
            return true;
        }

        // Check if any child category has products
        const children = allCats.filter(c => c.parent_id === cat.id);
        return children.some(child => categoryHasProducts(child, allCats));
    };

    // Filter categories - only include those with products (directly or through children)
    return categories.filter(cat => categoryHasProducts(cat, categories));
}
