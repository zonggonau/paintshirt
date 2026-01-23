import { NextRequest, NextResponse } from "next/server";
import { syncProductById, deleteProductByPrintfulId, updateVariantStock } from "@/src/lib/sync-products";

/**
 * Printful Webhook Handler
 * Handling: product_synced, product_updated, product_deleted, stock_updated
 * 
 * Documentation: https://developers.printful.com/docs/#section/Webhooks
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { type, data } = body;

        console.log(`[Printful Webhook] Received event: ${type}`);

        switch (type) {
            case "product_synced":
            case "product_updated":
                // data.sync_product.id contains the Printful ID
                if (data?.sync_product?.id) {
                    console.log(`[Webhook] Syncing product ${data.sync_product.id}...`);
                    await syncProductById(data.sync_product.id, "webhook");
                }
                break;

            case "product_deleted":
                // data.sync_product.id contains the deleted Printful ID
                if (data?.sync_product?.id) {
                    console.log(`[Webhook] Deleting product ${data.sync_product.id}...`);
                    await deleteProductByPrintfulId(data.sync_product.id);
                }
                break;

            case "stock_updated":
                // data.sync_variant_id and data.in_stock
                if (data?.sync_variant_id !== undefined) {
                    console.log(`[Webhook] Updating stock for variant ${data.sync_variant_id}: ${data.in_stock}`);
                    await updateVariantStock(data.sync_variant_id, data.in_stock);
                }
                break;

            case "package_shipped":
                // Optional: Handle shipment notifications if needed
                console.log(`[Webhook] Package shipped for order ${data?.order?.id}`);
                break;

            default:
                console.log(`[Webhook] Unhandled event type: ${type}`);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[Printful Webhook Error]", error);
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

/**
 * Handle GET for initial webhook verification (if needed by some platforms)
 */
export async function GET() {
    return new Response("Printful Webhook Listener Active", { status: 200 });
}
