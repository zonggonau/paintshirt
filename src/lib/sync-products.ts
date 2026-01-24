import { db, products, productVariants, categories, productCategories } from "@/src/db";
import { printful } from "./printful-client";
import { eq, and, sql, desc, inArray } from "drizzle-orm";
import { PrintfulProduct, PrintfulCategory } from "../types";

export interface SyncResult {
    success: boolean;
    productsAdded: number;
    productsUpdated: number;
    totalProducts: number;
    error?: string;
}

interface PrintfulSyncProduct {
    id: number;
    external_id: string;
    name: string;
    variants: number;
    synced: number;
    thumbnail_url?: string;
    is_ignored?: boolean;
}

interface PrintfulSyncVariant {
    id: number;
    external_id: string;
    sync_product_id: number;
    name: string;
    synced: boolean;
    variant_id: number;
    retail_price: string;
    currency: string;
    sku?: string;
    is_ignored?: boolean;
    size?: string;
    color?: string;
    product: {
        variant_id: number;
        product_id: number;
        image: string;
        name: string;
    };
    files: Array<{
        type: string;
        preview_url: string;
    }>;
    options: Array<{
        id: string;
        value: string;
    }>;
}

interface PrintfulCatalogCategory {
    id: number;
    parent_id: number;
    title: string;
    image_url: string;
}

/**
 * Helper to map database variant to PrintfulProduct variant structure
 */
export function mapDBVariantToPrintful(v: any) {
    return {
        id: v.printfulVariantId,
        external_id: v.externalId || v.printfulVariantId,
        name: v.name,
        size: v.size || undefined,
        color: v.color || undefined,
        retail_price: Number(v.retailPrice),
        currency: v.currency || "USD",
        preview_url: v.previewUrl || undefined,
        files: Array.isArray(v.files) ? v.files : [],
        options: Array.isArray(v.options) ? v.options : [],
        in_stock: v.inStock ?? true,
    };
}

/**
 * Parse size and color from variant name if options are missing
 * Examples: 
 * - "T-Shirt / Black / XL" -> { color: "Black", size: "XL" }
 * - "Mug / Black / 11oz" -> { color: "Black", size: "11oz" }
 * - "Hat / Red" -> { color: "Red", size: null }
 */
function parseSizeAndColor(name: string) {
    // Normalize delimiters: replace " - " with " / "
    const normalizedName = name.replace(/\s-\s/g, ' / ');
    const parts = normalizedName.split(' / ').map(p => p.trim());

    let color: string | null = null;
    let size: string | null = null;

    if (parts.length >= 3) {
        // [Product, Color, Size]
        color = parts[1];
        size = parts[parts.length - 1]; // Size is usually last
    } else if (parts.length === 2) {
        const val = parts[1];
        const commonSizes = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', 'XS', '2XS', 'One size', 'oz', '"', 'inch'];

        // If it looks like a size
        if (commonSizes.some(s => val.includes(s)) || /\d/.test(val)) {
            size = val;
        } else {
            color = val;
        }
    }

    return { color, size };
}

/**
 * Fetch all categories from Printful and sync to database
 */
export async function syncCategories(): Promise<{ added: number; updated: number }> {
    if (!db) return { added: 0, updated: 0 };

    let added = 0;
    let updated = 0;

    try {
        const response = await printful.get("categories");
        // Safe check for result format
        const catList: PrintfulCatalogCategory[] = Array.isArray(response.result)
            ? response.result
            : (response.result?.categories || []);

        for (const cat of catList) {
            const existing = await db
                .select()
                .from(categories)
                .where(eq(categories.printfulId, cat.id))
                .limit(1);

            if (existing.length > 0) {
                await db
                    .update(categories)
                    .set({
                        parentId: cat.parent_id || null,
                        name: cat.title,
                        imageUrl: cat.image_url,
                        updatedAt: new Date(),
                    })
                    .where(eq(categories.id, existing[0].id));
                updated++;
            } else {
                await db.insert(categories).values({
                    printfulId: cat.id,
                    parentId: cat.parent_id || null,
                    name: cat.title,
                    imageUrl: cat.image_url,
                });
                added++;
            }
        }
    } catch (e) {
        console.error("[Sync] Category sync failed:", e);
    }

    return { added, updated };
}

/**
 * Fetch all products from Printful and sync to database
 */
export async function syncProducts(): Promise<SyncResult> {
    if (!db) {
        return {
            success: false,
            productsAdded: 0,
            productsUpdated: 0,
            totalProducts: 0,
            error: "Database not available",
        };
    }


    let productsAdded = 0;
    let productsUpdated = 0;
    let totalProducts = 0;

    try {
        // First sync categories
        console.log("[Sync] Syncing categories...");
        await syncCategories();

        // Fetch all sync products from Printful with pagination
        let offset = 0;
        const limit = 100;
        let hasMore = true;

        while (hasMore) {
            console.log(`[Sync] Fetching products (offset: ${offset}, limit: ${limit})...`);
            const response = await printful.get(`store/products?offset=${offset}&limit=${limit}`);
            const syncProductsList: PrintfulSyncProduct[] = response.result || [];

            if (syncProductsList.length === 0) {
                hasMore = false;
                break;
            }

            for (const syncProduct of syncProductsList) {
                // Force sync every product to ensure all data (color/size/etc) is captured
                const { added, updated } = await syncSingleProductDetail(syncProduct.id);
                productsAdded += added;
                productsUpdated += updated;
                totalProducts++;
            }

            const paging = response.paging;
            if (paging && offset + limit < paging.total) {
                offset += limit;
            } else {
                hasMore = false;
            }
        }


        return {
            success: true,
            productsAdded,
            productsUpdated,
            totalProducts,
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";


        return {
            success: false,
            productsAdded,
            productsUpdated,
            totalProducts,
            error: errorMessage,
        };
    }
}


/**
 * Get all synced products from database
 */
export async function getProductsFromDB(): Promise<PrintfulProduct[]> {
    if (!db) {
        return [];
    }

    // Get all active products with their variants
    const productsData = await db
        .select()
        .from(products)
        .where(eq(products.isActive, true))
        .orderBy(desc(products.updatedAt), desc(products.id));

    // Get variants and categories for each product
    const result = await Promise.all(
        productsData.map(async (product) => {
            const variantsData = await db
                .select()
                .from(productVariants)
                .where(eq(productVariants.productId, product.id));

            // Map variants to UI structure
            const variants = variantsData.map(mapDBVariantToPrintful);

            // Get categories through junction table
            const categoriesData = await db
                .select({
                    id: categories.id,
                    printfulId: categories.printfulId,
                    name: categories.name,
                    imageUrl: categories.imageUrl,
                })
                .from(productCategories)
                .innerJoin(categories, eq(productCategories.categoryId, categories.id))
                .where(eq(productCategories.productId, product.id));

            return {
                ...product,
                id: product.printfulId,
                description: product.description || undefined,
                variants,
                categories: categoriesData
            };
        })
    );

    return result;
}

/**
 * Get products for UI with pagination and filtering
 */
export async function getProductsForUI(page = 1, limit = 20, categoryFilter?: string | number) {
    if (!db) return { products: [], total: 0 };

    const offset = (page - 1) * limit;

    if (categoryFilter) {
        // Find category by ID (number) or Name (string)
        const isId = !isNaN(Number(categoryFilter));

        const dbCategory = await db
            .select()
            .from(categories)
            .where(isId ? eq(categories.printfulId, Number(categoryFilter)) : eq(categories.name, String(categoryFilter)))
            .limit(1);

        if (dbCategory.length > 0) {
            // Get all sub-category IDs recursively
            const allCategoryIds = [dbCategory[0].id];

            // Helper function to get children
            const getChildren = async (parentIds: number[]) => {
                const children = await db
                    .select({ id: categories.id, printfulId: categories.printfulId })
                    .from(categories)
                    .where(inArray(categories.parentId, parentIds));

                if (children.length > 0) {
                    const childIds = children.map(c => c.id);
                    const childPrintfulIds = children.map(c => c.printfulId);

                    // Filter out IDs already in the list to avoid infinite loops if data is corrupt
                    const newChildIds = childIds.filter(id => !allCategoryIds.includes(id));
                    if (newChildIds.length > 0) {
                        allCategoryIds.push(...newChildIds);
                        await getChildren(childPrintfulIds);
                    }
                }
            };

            // Start recursive search for sub-categories
            // Note: targetCat.parent_id in DB corresponds to Printful category ID
            await getChildren([dbCategory[0].printfulId]);

            const filteredProducts = await db
                .select({ product: products })
                .from(products)
                .innerJoin(productCategories, eq(products.id, productCategories.productId))
                .where(and(
                    eq(products.isActive, true),
                    inArray(productCategories.categoryId, allCategoryIds)
                ))
                .orderBy(desc(products.updatedAt), desc(products.id))
                .limit(limit)
                .offset(offset);

            const [countResult] = await db
                .select({ count: sql<number>`count(DISTINCT ${products.id})` })
                .from(products)
                .innerJoin(productCategories, eq(products.id, productCategories.productId))
                .where(and(
                    eq(products.isActive, true),
                    inArray(productCategories.categoryId, allCategoryIds)
                ));

            const productsWithData = await Promise.all(filteredProducts.map(async ({ product: p }) => {
                const [variantsData, catData] = await Promise.all([
                    db.select().from(productVariants).where(eq(productVariants.productId, p.id)),
                    db.select({ id: categories.printfulId, name: categories.name })
                        .from(productCategories)
                        .innerJoin(categories, eq(productCategories.categoryId, categories.id))
                        .where(eq(productCategories.productId, p.id))
                        .limit(1)
                ]);

                const variants = variantsData.map(mapDBVariantToPrintful);
                const category = catData.length > 0 ? catData[0] : null;
                return { ...p, id: p.printfulId, variants, category };
            }));

            return { products: productsWithData, total: Number(countResult.count) };
        } else {
            return { products: [], total: 0 };
        }
    }

    const productsData = await db
        .select()
        .from(products)
        .where(eq(products.isActive, true))
        .orderBy(desc(products.updatedAt), desc(products.id))
        .limit(limit)
        .offset(offset);

    const [totalCountResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(eq(products.isActive, true));

    const productsWithData = await Promise.all(productsData.map(async (p) => {
        const [variantsData, catData] = await Promise.all([
            db.select().from(productVariants).where(eq(productVariants.productId, p.id)),
            db.select({ id: categories.printfulId, name: categories.name })
                .from(productCategories)
                .innerJoin(categories, eq(productCategories.categoryId, categories.id))
                .where(eq(productCategories.productId, p.id))
                .limit(1)
        ]);

        const variants = variantsData.map(mapDBVariantToPrintful);
        const category = catData.length > 0 ? catData[0] : null;
        return { ...p, id: p.printfulId, variants, category };
    }));

    return { products: productsWithData, total: Number(totalCountResult.count) };
}

/**
 * Get all categories from DB formatted for UI
 */
export async function getCategoriesFromDB() {
    if (!db) return {};

    const dbCategories = await db.select().from(categories);
    const categoryMap: Record<number, string> = {};
    dbCategories.forEach(cat => {
        categoryMap[cat.printfulId] = cat.name;
    });

    return categoryMap;
}

/**
 * Get raw categories from database for layout
 */
export async function getRawCategoriesFromDB(): Promise<PrintfulCategory[]> {
    if (!db) return [];

    try {
        const dbCategories = await db.select().from(categories);
        return dbCategories.map(cat => ({
            id: cat.id,
            printful_id: cat.printfulId,
            parent_id: cat.parentId || 0,
            image_url: cat.imageUrl || "",
            catalog_position: 0,
            size: "",
            title: cat.name,
            name: cat.name
        }));
    } catch (error) {
        console.error("Error fetching raw categories from DB:", error);
        return [];
    }
}

/**
 * Get single product from DB by Printful ID with category info
 */
export async function getProductFromDB(printfulId: string): Promise<any | null> {
    if (!db) return null;

    try {
        const productData = await db
            .select()
            .from(products)
            .where(eq(products.printfulId, printfulId))
            .limit(1);

        if (productData.length === 0) return null;

        const product = productData[0];

        const [variantsData, catData] = await Promise.all([
            db.select().from(productVariants).where(eq(productVariants.productId, product.id)),
            db.select({ id: categories.printfulId, name: categories.name })
                .from(productCategories)
                .innerJoin(categories, eq(productCategories.categoryId, categories.id))
                .where(eq(productCategories.productId, product.id))
                .limit(1)
        ]);

        const variants = variantsData.map(mapDBVariantToPrintful);
        const category = catData.length > 0 ? catData[0] : null;

        return { ...product, id: product.printfulId, variants, category };
    } catch (e) {
        console.error("[DB] Failed to get product:", e);
        return null;
    }
}

/**
 * Get all brands (categories with parent ID 159) from DB
 */
export async function getBrandsFromDB(): Promise<any[]> {
    if (!db) return [];

    try {
        // Parent ID 159 is "Brands" in Printful catalog
        return await db
            .select()
            .from(categories)
            .where(eq(categories.parentId, 159));
    } catch (e) {
        console.error("[DB] Failed to get brands:", e);
        return [];
    }
}

/**
 * Sync a single product by its Printful ID
 */
export async function syncProductById(
    printfulProductId: number | string
): Promise<SyncResult> {
    if (!db) return { success: false, productsAdded: 0, productsUpdated: 0, totalProducts: 0, error: "Database not available" };

    try {
        const { added, updated } = await syncSingleProductDetail(Number(printfulProductId));

        return {
            success: true,
            productsAdded: added,
            productsUpdated: updated,
            totalProducts: 1,
        };
    } catch (e) {
        const error = e instanceof Error ? e.message : "Unknown error";
        return {
            success: false,
            productsAdded: 0,
            productsUpdated: 0,
            totalProducts: 1,
            error,
        };
    }
}

/**
 * Internal helper to sync a single product's detail
 */
async function syncSingleProductDetail(printfulProductId: number): Promise<{ added: number; updated: number }> {
    if (!db) return { added: 0, updated: 0 };

    // Fetch detailed product info with variants
    const productDetailResponse = await printful.get(`store/products/${printfulProductId}`);
    const productDetail = productDetailResponse.result;
    const syncProductData = productDetail.sync_product;
    const syncVariants: PrintfulSyncVariant[] = productDetail.sync_variants || [];

    let added = 0;
    let updated = 0;

    // Check if product exists
    const existingProduct = await db
        .select()
        .from(products)
        .where(eq(products.printfulId, String(syncProductData.id)))
        .limit(1);

    let productId: number;

    if (existingProduct.length > 0) {
        // Update existing product
        await db
            .update(products)
            .set({
                name: syncProductData.name,
                description: syncProductData.description || null,
                thumbnailUrl: syncProductData.thumbnail_url,
                variantsCount: syncProductData.variants || 0,
                syncedCount: syncProductData.synced || 0,
                isIgnored: syncProductData.is_ignored === true,
                isActive: syncProductData.is_ignored !== true,
                syncedAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(products.id, existingProduct[0].id));

        productId = existingProduct[0].id;
        updated = 1;
    } else {
        // Insert new product
        const [newProduct] = await db
            .insert(products)
            .values({
                printfulId: String(syncProductData.id),
                externalId: syncProductData.external_id,
                name: syncProductData.name,
                description: syncProductData.description || null,
                thumbnailUrl: syncProductData.thumbnail_url,
                variantsCount: syncProductData.variants || 0,
                syncedCount: syncProductData.synced || 0,
                isIgnored: syncProductData.is_ignored === true,
                isActive: syncProductData.is_ignored !== true,
                syncedAt: new Date(),
            })
            .returning();

        productId = newProduct.id;
        added = 1;
    }

    // Sync variants
    for (const variant of syncVariants) {
        const existingVariant = await db
            .select()
            .from(productVariants)
            .where(eq(productVariants.printfulVariantId, String(variant.id)))
            .limit(1);

        // Use direct fields if available, otherwise try options or name parsing
        let vSize = variant.size || null;
        let vColor = variant.color || null;

        if (!vSize || !vColor) {
            const sizeOption = variant.options?.find(
                (opt) => opt.id === "size" || opt.id.toLowerCase().includes("size")
            );
            const colorOption = variant.options?.find(
                (opt) => opt.id === "color" || opt.id.toLowerCase().includes("color")
            );

            if (!vSize) vSize = sizeOption?.value || null;
            if (!vColor) vColor = colorOption?.value || null;
        }

        if (!vSize || !vColor) {
            const parsed = parseSizeAndColor(variant.name);
            if (!vSize) vSize = parsed.size;
            if (!vColor) vColor = parsed.color;
        }

        // Final fallback: If still missing, try fetching the catalog-level variant info
        if (!vSize || !vColor) {
            try {
                const catalogVariantRes = await printful.get(`variants/${variant.variant_id}`);
                const cv = catalogVariantRes.result?.variant;
                if (cv) {
                    if (!vSize) vSize = cv.size || null;
                    if (!vColor) vColor = cv.color || null;
                }
            } catch (e) {
                console.warn(`[Sync] Failed to fetch catalog variant ${variant.variant_id} for extra metadata`);
            }
        }

        const previewUrl =
            variant.files?.find((f) => f.type === "preview")?.preview_url ||
            variant.product?.image;

        if (existingVariant.length > 0) {
            // Update existing variant
            await db
                .update(productVariants)
                .set({
                    name: variant.name,
                    size: vSize,
                    color: vColor,
                    retailPrice: variant.retail_price,
                    currency: variant.currency,
                    previewUrl: previewUrl,
                    files: variant.files,
                    options: variant.options,
                    updatedAt: new Date(),
                })
                .where(eq(productVariants.id, existingVariant[0].id));
        } else {
            // Insert new variant
            await db.insert(productVariants).values({
                productId,
                printfulVariantId: String(variant.id),
                externalId: variant.external_id,
                name: variant.name,
                size: vSize,
                color: vColor,
                retailPrice: variant.retail_price,
                currency: variant.currency,
                previewUrl: previewUrl,
                files: variant.files,
                options: variant.options,
            });
        }
    }

    // Sync product categories (from catalog product)
    const firstVariant = syncVariants[0];
    if (firstVariant && firstVariant.product) {
        const catalogId = firstVariant.product.product_id;
        try {
            const catalogProductResponse = await printful.get(`products/${catalogId}`);
            const mainCategoryId = catalogProductResponse.result?.product?.main_category_id;

            if (mainCategoryId) {
                // 1. Check if category exists in our DB
                let dbCategory = await db
                    .select()
                    .from(categories)
                    .where(eq(categories.printfulId, mainCategoryId))
                    .limit(1);

                // 2. If it doesn't exist, fetch it from Printful and save it!
                if (dbCategory.length === 0) {
                    console.log(`[Sync] Category ${mainCategoryId} missing, fetching from Printful...`);
                    try {
                        const allCatsRes = await printful.get("categories");
                        const allCats: PrintfulCatalogCategory[] = Array.isArray(allCatsRes.result)
                            ? allCatsRes.result
                            : (allCatsRes.result?.categories || []);
                        const targetCat = allCats.find(c => c.id === mainCategoryId);

                        if (targetCat) {
                            const [newCat] = await db.insert(categories).values({
                                printfulId: targetCat.id,
                                parentId: targetCat.parent_id || null,
                                name: targetCat.title,
                                imageUrl: targetCat.image_url,
                            }).returning();
                            dbCategory = [newCat];
                        }
                    } catch (catErr) {
                        console.error(`[Sync] Failed to fetch missing category ${mainCategoryId}:`, catErr);
                    }
                }

                if (dbCategory.length > 0) {
                    // 3. Link product to this category in junction table
                    const existingLink = await db
                        .select()
                        .from(productCategories)
                        .where(
                            and(
                                eq(productCategories.productId, productId),
                                eq(productCategories.categoryId, dbCategory[0].id)
                            )
                        )
                        .limit(1);

                    if (existingLink.length === 0) {
                        await db.insert(productCategories).values({
                            productId,
                            categoryId: dbCategory[0].id,
                        });
                        console.log(`[Sync] Linked product ${productId} to category ${dbCategory[0].name}`);
                    }
                }
            }
        } catch (e) {
            console.error(`[Sync] Failed to sync category for product ${productId}:`, e);
        }
    }

    return { added, updated };
}

/**
 * Deactivate or delete a product by its Printful ID
 */
export async function deleteProductByPrintfulId(printfulId: string | number) {
    if (!db) return;

    try {
        // 1. Delete from Printful API first
        console.log(`[Sync] Deleting product ${printfulId} from Printful...`);
        await printful.delete(`store/products/${printfulId}`);

        // 2. Deactivate in local database
        // We set isActive to false instead of hard-delete to keep data integrity for existing orders
        await db
            .update(products)
            .set({ isActive: false, updatedAt: new Date() })
            .where(eq(products.printfulId, String(printfulId)));

        console.log(`[Sync] Product ${printfulId} successfully removed from Printful & Database.`);
    } catch (error) {
        console.error(`[Sync] Failed to delete product ${printfulId} from Printful:`, error);
        throw error;
    }
}

/**
 * Update stock status for a specific variant
 */
export async function updateVariantStock(printfulVariantId: string | number, inStock: boolean) {
    if (!db) return;

    await db
        .update(productVariants)
        .set({ inStock, updatedAt: new Date() })
        .where(eq(productVariants.printfulVariantId, String(printfulVariantId)));

    console.log(`[Sync] Variant ${printfulVariantId} stock updated to ${inStock}.`);
}
