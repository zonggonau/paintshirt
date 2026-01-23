"use server";

import { syncProducts, getSyncLogs, getProductsFromDB } from "@/src/lib/sync-products";
import { revalidatePath } from "next/cache";

/**
 * Server action to trigger manual product sync
 */
export async function triggerProductSync() {
    try {
        const result = await syncProducts("manual");

        if (result.success) {
            // Revalidate product pages after sync
            revalidatePath("/products");
            revalidatePath("/");
        }

        return result;
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        return {
            success: false,
            productsAdded: 0,
            productsUpdated: 0,
            totalProducts: 0,
            error: errorMessage,
        };
    }
}

/**
 * Server action to get sync logs
 */
export async function fetchSyncLogs(limit = 10) {
    try {
        const logs = await getSyncLogs(limit);
        return { success: true, data: logs };
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        return { success: false, error: errorMessage, data: [] };
    }
}

/**
 * Server action to get all products from database
 */
export async function fetchProductsFromDB() {
    try {
        const products = await getProductsFromDB();
        return { success: true, data: products };
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        return { success: false, error: errorMessage, data: [] };
    }
}
