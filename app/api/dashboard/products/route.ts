import { NextRequest, NextResponse } from "next/server";
import { getProductsFromDB, getProductsForUI, deleteProductByPrintfulId } from "@/src/lib/sync-products";

/**
 * GET /api/dashboard/products
 * Fetch products with pagination
 */
export async function GET(request: NextRequest) {
    const secret = request.headers.get("x-webhook-secret");
    if (secret !== process.env.SYNC_WEBHOOK_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");

        const result = await getProductsForUI(page, limit);
        return NextResponse.json({
            success: true,
            data: result.products,
            total: result.total,
            page,
            limit
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Failed to fetch products" }, { status: 500 });
    }
}

/**
 * DELETE /api/dashboard/products
 * Deactivate a product from the database
 */
export async function DELETE(request: NextRequest) {
    const secret = request.headers.get("x-webhook-secret");
    if (secret !== process.env.SYNC_WEBHOOK_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get("printfulId"); // Use printfulId for clarity

        if (!productId) {
            return NextResponse.json({ error: "Printful Product ID is required" }, { status: 400 });
        }

        await deleteProductByPrintfulId(productId);

        return NextResponse.json({
            success: true,
            message: `Product ${productId} deactivated successfully`
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
}
