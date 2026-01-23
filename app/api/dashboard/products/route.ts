import { NextRequest, NextResponse } from "next/server";
import { getProductsFromDB } from "@/src/lib/sync-products";

export async function GET(request: NextRequest) {
    const secret = request.headers.get("x-webhook-secret");
    if (secret !== process.env.SYNC_WEBHOOK_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const products = await getProductsFromDB();
        return NextResponse.json({ success: true, data: products });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Failed to fetch products" }, { status: 500 });
    }
}
