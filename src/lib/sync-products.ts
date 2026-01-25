import { db, products, productVariants, categories, productCategories } from "@/src/db";
import { printful } from "./printful-client";
import { eq, and, sql, desc, asc, inArray, like, or } from "drizzle-orm";
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
        product: v.previewUrl ? {
            variant_id: Number(v.printfulVariantId),
            product_id: 0,
            image: v.previewUrl,
            name: v.name
        } : undefined,
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
                thumbnail_url: product.thumbnailUrl || undefined,
                description: product.description || undefined,
                variants,
                categories: categoriesData
            };
        })
    );

    return result;
}

/**
 * Get products for UI with pagination, filtering, searching and sorting
 * FULL DATABASE IMPLEMENTATION (No client-side slicing/sorting for main logic)
 */
export async function getProductsForUI(
    page = 1,
    limit = 20,
    categoryFilter?: string | number,
    sortOption: string = 'newest',
    searchQuery?: string
) {
    if (!db) return { products: [], total: 0 };

    const offset = (page - 1) * limit;
    let allCategoryIds: number[] = [];

    // 1. Resolve Category Filters (Recursive)
    if (categoryFilter) {
        const isId = !isNaN(Number(categoryFilter));
        const dbCategory = await db
            .select()
            .from(categories)
            .where(isId ? eq(categories.printfulId, Number(categoryFilter)) : eq(categories.name, String(categoryFilter)))
            .limit(1);

        if (dbCategory.length > 0) {
            allCategoryIds = [dbCategory[0].id];

            const getChildren = async (parentIds: number[]) => {
                const children = await db
                    .select({ id: categories.id, printfulId: categories.printfulId })
                    .from(categories)
                    .where(inArray(categories.parentId, parentIds));

                if (children.length > 0) {
                    const childIds = children.map(c => c.id);
                    const childPrintfulIds = children.map(c => c.printfulId);
                    const newChildIds = childIds.filter(id => !allCategoryIds.includes(id));
                    if (newChildIds.length > 0) {
                        allCategoryIds.push(...newChildIds);
                        await getChildren(childPrintfulIds);
                    }
                }
            };
            await getChildren([dbCategory[0].printfulId]);
        } else {
            return { products: [], total: 0 };
        }
    }

    // 2. Build Main Query with Group By for accurate Price Sort
    // We select products.* and min_price
    const baseQuery = db
        .select({
            id: products.id,
            printfulId: products.printfulId,
            name: products.name,
            thumbnailUrl: products.thumbnailUrl,
            description: products.description,
            isActive: products.isActive,
            updatedAt: products.updatedAt,
            // Calculate min price for sorting
            minPrice: sql<number>`MIN(CAST(${productVariants.retailPrice} AS DECIMAL))`
        })
        .from(products);

    // Always join variants for price info/sorting
    baseQuery.leftJoin(productVariants, eq(products.id, productVariants.productId));

    // Join Categories if needed
    if (allCategoryIds.length > 0) {
        baseQuery.innerJoin(productCategories, eq(products.id, productCategories.productId));
    }

    // 3. Apply Conditions
    const conditions = [eq(products.isActive, true)];

    if (allCategoryIds.length > 0) {
        conditions.push(inArray(productCategories.categoryId, allCategoryIds));
    }

    if (searchQuery) {
        // Database-level Search
        conditions.push(sql`lower(${products.name}) LIKE lower(${`%${searchQuery}%`})`);
    }

    // 4. Grouping & Sorting
    baseQuery.groupBy(products.id);

    const orderByClauses = [];
    switch (sortOption) {
        case 'price-asc':
            // Sort by the aggregated min price calculated above
            orderByClauses.push(sql`MIN(CAST(${productVariants.retailPrice} AS DECIMAL)) ASC`);
            break;
        case 'price-desc':
            orderByClauses.push(sql`MAX(CAST(${productVariants.retailPrice} AS DECIMAL)) DESC`);
            break;
        case 'title-asc':
            orderByClauses.push(asc(products.name));
            break;
        case 'title-desc':
            orderByClauses.push(desc(products.name));
            break;
        case 'newest':
        default:
            orderByClauses.push(desc(products.updatedAt));
            orderByClauses.push(desc(products.id));
    }

    // Execute Main Query (Paginated)
    // @ts-ignore
    if (orderByClauses.length > 0) baseQuery.orderBy(...orderByClauses);

    const filteredProducts = await baseQuery
        .where(and(...conditions))
        .limit(limit)
        .offset(offset);

    // 5. Get Total Count (Separate Query for Pagination)
    // Needs to mirror the joins/conditions of main query to be accurate
    const countQuery = db
        .select({ count: sql<number>`count(DISTINCT ${products.id})` })
        .from(products);

    if (allCategoryIds.length > 0) {
        countQuery.innerJoin(productCategories, eq(products.id, productCategories.productId));
    }

    if (searchQuery || allCategoryIds.length > 0) {
        countQuery.where(and(...conditions));
    } else {
        countQuery.where(eq(products.isActive, true));
    }

    const [countResult] = await countQuery;


    // 6. Hydrate results with full variants data
    // Converting the raw query result back to expected Full Product structure
    const productsWithData = await Promise.all(filteredProducts.map(async (p) => {
        // Fetch full variant details for the UI
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

        // Reconstruct PrintfulProduct object
        return {
            ...p,
            id: p.printfulId, // Map back to printful ID for UI compatibility
            variants,
            category,
            // Ensure thumbnail exists
            thumbnail_url: p.thumbnailUrl || (variants[0] as any)?.preview_url
        };
    }));

    return { products: productsWithData, total: Number(countResult?.count || 0) };
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

        return {
            ...product,
            id: product.printfulId,
            thumbnail_url: product.thumbnailUrl || undefined,
            description: product.description || undefined,
            variants,
            category
        };
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

    // Fallback description from catalog
    let catalogDescription: string | null = null;
    let catalogData: any = null;
    const firstVariant = syncVariants[0];
    if (firstVariant && firstVariant.product) {
        try {
            const catalogId = firstVariant.product.product_id;
            const catRes = await printful.get(`products/${catalogId}`);
            catalogData = catRes.result;
            catalogDescription = catalogData?.product?.description || null;
        } catch (e) {
            console.warn(`[Sync] Could not fetch catalog data for product ${printfulProductId}`);
        }
    }

    const finalDescription = syncProductData.description || catalogDescription || null;

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
                description: finalDescription,
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
                description: finalDescription,
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
    if (firstVariant && firstVariant.product) {
        try {
            // Use cached catalogData if available to save API calls
            const mainCategoryId = catalogData?.product?.main_category_id;

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
