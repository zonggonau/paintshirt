import { NextRequest, NextResponse } from "next/server";
import { syncProducts, syncProductById, getSyncLogs } from "@/src/lib/sync-products";

// Validate webhook secret
function validateWebhookSecret(request: NextRequest): boolean {
    const secret = request.headers.get("x-webhook-secret");
    const expectedSecret = process.env.SYNC_WEBHOOK_SECRET;

    if (!expectedSecret) {
        console.warn("SYNC_WEBHOOK_SECRET not configured");
        return false;
    }

    return secret === expectedSecret;
}

/**
 * POST /api/sync/products
 * Trigger product sync from Printful to database
 *
 * Headers:
 * - x-webhook-secret: Your webhook secret for authentication
 *
 * Query params:
 * - type: 'manual' | 'webhook' | 'scheduled' (default: 'webhook')
 */
export async function POST(request: NextRequest) {
    // Validate authentication
    if (!validateWebhookSecret(request)) {
        return NextResponse.json(
            { error: "Unauthorized: Invalid or missing webhook secret" },
            { status: 401 }
        );
    }

    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get("productId");
        const type =
            (searchParams.get("type") as "manual" | "webhook" | "scheduled") ||
            "webhook";

        console.log(`[Sync] Starting product sync (type: ${type}${productId ? `, productId: ${productId}` : ""})`);

        let result;
        if (productId) {
            result = await syncProductById(productId, type === "scheduled" ? "manual" : type as any);
        } else {
            result = await syncProducts(type);
        }

        if (result.success) {
            console.log(
                `[Sync] Completed: ${result.productsAdded} added, ${result.productsUpdated} updated`
            );
            return NextResponse.json({
                success: true,
                message: "Product sync completed successfully",
                data: {
                    productsAdded: result.productsAdded,
                    productsUpdated: result.productsUpdated,
                    totalProducts: result.totalProducts,
                },
            });
        } else {
            console.error(`[Sync] Failed: ${result.error}`);
            return NextResponse.json(
                {
                    success: false,
                    error: result.error,
                    data: {
                        productsAdded: result.productsAdded,
                        productsUpdated: result.productsUpdated,
                        totalProducts: result.totalProducts,
                    },
                },
                { status: 500 }
            );
        }
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        console.error(`[Sync] Error: ${errorMessage}`);

        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}

/**
 * GET /api/sync/products
 * Get sync status and history
 *
 * Query params:
 * - limit: Number of logs to return (default: 10)
 */
export async function GET(request: NextRequest) {
    // Validate authentication
    if (!validateWebhookSecret(request)) {
        return NextResponse.json(
            { error: "Unauthorized: Invalid or missing webhook secret" },
            { status: 401 }
        );
    }

    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "10", 10);

        const logs = await getSyncLogs(limit);

        return NextResponse.json({
            success: true,
            data: logs,
        });
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";

        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}
