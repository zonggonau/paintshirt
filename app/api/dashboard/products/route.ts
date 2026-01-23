import { NextRequest, NextResponse } from "next/server";
import { getProductsFromDB, getProductsForUI } from "@/src/lib/sync-products";

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
