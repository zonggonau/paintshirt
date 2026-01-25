import { NextResponse } from "next/server";
import { syncProducts } from "@/src/lib/sync-products";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get("secret");

    // Simple protection using the same secret as webhooks
    if (process.env.SYNC_WEBHOOK_SECRET && secret !== process.env.SYNC_WEBHOOK_SECRET) {
        return NextResponse.json({ error: "Unauthorized. Please provide ?secret=YOUR_SYNC_WEBHOOK_SECRET" }, { status: 401 });
    }

    try {
        console.log("[Sync API] Starting full product sync...");
        const result = await syncProducts();

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: "Sync completed successfully",
                stats: {
                    added: result.productsAdded,
                    updated: result.productsUpdated,
                    total: result.totalProducts
                }
            });
        } else {
            return NextResponse.json({
                success: false,
                error: result.error,
                details: "Sync process failed partially or fully."
            }, { status: 500 });
        }
    } catch (error: any) {
        console.error("[Sync API] Critical failure:", error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
