import { db, products, productVariants, syncLogs, categories, productCategories } from "@/src/db";
import { printful } from "./printful-client";
import { eq, and, sql } from "drizzle-orm";
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
        files: Array.isArray(v.files) ? v.files : [],
        options: Array.isArray(v.options) ? v.options : [],
        in_stock: v.inStock ?? true,
    };
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
        const catList: PrintfulCatalogCategory[] = response.result || [];

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
export async function syncProducts(
    type: "manual" | "webhook" | "scheduled" = "manual"
): Promise<SyncResult> {
    if (!db) {
        return {
            success: false,
            productsAdded: 0,
            productsUpdated: 0,
            totalProducts: 0,
            error: "Database not available",
        };
    }

    // Create sync log entry
    const [syncLog] = await db
        .insert(syncLogs)
        .values({
            type,
            status: "pending",
            startedAt: new Date(),
        })
        .returning();

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

        // Update sync log with success
        await db
            .update(syncLogs)
            .set({
                status: "success",
                productsAdded,
                productsUpdated,
                completedAt: new Date(),
            })
            .where(eq(syncLogs.id, syncLog.id));

        return {
            success: true,
            productsAdded,
            productsUpdated,
            totalProducts,
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";

        // Update sync log with failure
        await db
            .update(syncLogs)
            .set({
                status: "failed",
                errorMessage,
                completedAt: new Date(),
            })
            .where(eq(syncLogs.id, syncLog.id));

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
 * Get the latest sync logs
 */
export async function getSyncLogs(limit = 10) {
    if (!db) {
        return [];
    }

    return db.select().from(syncLogs).orderBy(syncLogs.startedAt).limit(limit);
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
        .where(eq(products.isActive, true));

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
export async function getProductsForUI(page = 1, limit = 20, categoryName?: string) {
    if (!db) return { products: [], total: 0 };

    const offset = (page - 1) * limit;

    if (categoryName) {
        // Filter by category name
        const dbCategory = await db
            .select()
            .from(categories)
            .where(eq(categories.name, categoryName))
            .limit(1);

        if (dbCategory.length > 0) {
            const filteredProducts = await db
                .select({ product: products })
                .from(products)
                .innerJoin(productCategories, eq(products.id, productCategories.productId))
                .where(and(eq(products.isActive, true), eq(productCategories.categoryId, dbCategory[0].id)))
                .limit(limit)
                .offset(offset);

            const [countResult] = await db
                .select({ count: sql<number>`count(*)` })
                .from(productCategories)
                .where(eq(productCategories.categoryId, dbCategory[0].id));

            const productsWithData = await Promise.all(filteredProducts.map(async ({ product: p }) => {
                const variantsData = await db.select().from(productVariants).where(eq(productVariants.productId, p.id));
                const variants = variantsData.map(mapDBVariantToPrintful);
                return { ...p, id: p.printfulId, variants };
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
        .limit(limit)
        .offset(offset);

    const [totalCountResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(eq(products.isActive, true));

    const productsWithData = await Promise.all(productsData.map(async (p) => {
        const variantsData = await db.select().from(productVariants).where(eq(productVariants.productId, p.id));
        const variants = variantsData.map(mapDBVariantToPrintful);
        return { ...p, id: p.printfulId, variants };
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
 * Get single product from DB by Printful ID
 */
export async function getProductFromDB(printfulId: string): Promise<PrintfulProduct | null> {
    if (!db) return null;

    try {
        const productData = await db
            .select()
            .from(products)
            .where(eq(products.printfulId, printfulId))
            .limit(1);

        if (productData.length === 0) return null;

        const product = productData[0];

        const variantsData = await db
            .select()
            .from(productVariants)
            .where(eq(productVariants.productId, product.id));

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

        // Map to PrintfulProduct compatibility for UI
        return {
            id: product.printfulId,
            name: product.name,
            description: product.description || undefined,
            thumbnail_url: product.thumbnailUrl || undefined,
            variants: variantsData.map(mapDBVariantToPrintful),
            categories: categoriesData,
        };
    } catch (e) {
        console.error(`[DB] Failed to get product ${printfulId}:`, e);
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
    printfulProductId: number | string,
    type: "manual" | "webhook" = "manual"
): Promise<SyncResult> {
    if (!db) return { success: false, productsAdded: 0, productsUpdated: 0, totalProducts: 0, error: "Database not available" };

    const [syncLog] = await db
        .insert(syncLogs)
        .values({
            type,
            status: "pending",
            startedAt: new Date(),
        })
        .returning();

    try {
        const { added, updated } = await syncSingleProductDetail(Number(printfulProductId));

        await db
            .update(syncLogs)
            .set({
                status: "success",
                productsAdded: added,
                productsUpdated: updated,
                completedAt: new Date(),
            })
            .where(eq(syncLogs.id, syncLog.id));

        return {
            success: true,
            productsAdded: added,
            productsUpdated: updated,
            totalProducts: 1,
        };
    } catch (e) {
        const error = e instanceof Error ? e.message : "Unknown error";
        await db
            .update(syncLogs)
            .set({
                status: "failed",
                errorMessage: error,
                completedAt: new Date(),
            })
            .where(eq(syncLogs.id, syncLog.id));

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
                thumbnailUrl: syncProductData.thumbnail_url,
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
                thumbnailUrl: syncProductData.thumbnail_url,
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

        // Extract size and color from options
        const sizeOption = variant.options?.find(
            (opt) => opt.id === "size" || opt.id.toLowerCase().includes("size")
        );
        const colorOption = variant.options?.find(
            (opt) => opt.id === "color" || opt.id.toLowerCase().includes("color")
        );

        const previewUrl =
            variant.files?.find((f) => f.type === "preview")?.preview_url ||
            variant.product?.image;

        if (existingVariant.length > 0) {
            // Update existing variant
            await db
                .update(productVariants)
                .set({
                    name: variant.name,
                    size: sizeOption?.value || null,
                    color: colorOption?.value || null,
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
                size: sizeOption?.value || null,
                color: colorOption?.value || null,
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
                const dbCategory = await db
                    .select()
                    .from(categories)
                    .where(eq(categories.printfulId, mainCategoryId))
                    .limit(1);

                if (dbCategory.length > 0) {
                    // Check link
                    const link = await db
                        .select()
                        .from(productCategories)
                        .where(
                            and(
                                eq(productCategories.productId, productId),
                                eq(productCategories.categoryId, dbCategory[0].id)
                            )
                        )
                        .limit(1);

                    if (link.length === 0) {
                        await db.insert(productCategories).values({
                            productId,
                            categoryId: dbCategory[0].id,
                        });
                    }
                }
            }
        } catch (e) {
            console.error(`[Sync] Failed to sync category for product ${productId}:`, e);
        }
    }

    return { added, updated };
}
