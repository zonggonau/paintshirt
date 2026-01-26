import { NextRequest, NextResponse } from "next/server";
import { syncProductById, deleteProductByPrintfulId, updateVariantStock } from "@/src/lib/sync-products";
import { revalidateTag as nextRevalidateTag } from "next/cache";

// Cast to any because of weird lint error in this environment
const revalidateTag = nextRevalidateTag as any;

/**
 * Printful Webhook Handler
 * Handling: product_synced, product_updated, product_deleted, stock_updated
 * 
 * Documentation: https://developers.printful.com/docs/#section/Webhooks
 */
export async function POST(req: NextRequest) {
    // Optional Security: Check for secret in URL if configured
    const { searchParams } = new URL(req.url);
    const urlSecret = searchParams.get("secret");
    const expectedSecret = process.env.SYNC_WEBHOOK_SECRET;

    if (expectedSecret && urlSecret !== expectedSecret) {
        console.warn("[Printful Webhook] Unauthorized access attempt with invalid secret.");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Robust JSON parsing for simulators
        const rawBody = await req.text();
        if (!rawBody) {
            console.log("[Printful Webhook] Received empty body (possibly a ping/simulator check).");
            return NextResponse.json({ success: true, message: "Ping received" });
        }

        let body;
        try {
            body = JSON.parse(rawBody);
        } catch (parseErr) {
            console.warn("[Printful Webhook] Failed to parse JSON body:", rawBody.substring(0, 100));
            return NextResponse.json({ success: true, message: "Invalid JSON but acknowledged" });
        }

        const { type, data } = body;

        console.log(`[Printful Webhook] Received event: ${type}`);

        switch (type) {
            case "product_synced":
            case "product_updated":
                // data.sync_product.id contains the Printful ID
                if (data?.sync_product?.id) {
                    const printfulId = data.sync_product.id;
                    const isIgnored = data.sync_product.is_ignored === true;

                    if (isIgnored) {
                        console.log(`[Webhook] Product ${printfulId} is ignored on Printful. Deactivating...`);
                        await deleteProductByPrintfulId(printfulId);
                    } else {
                        console.log(`[Webhook] Syncing product ${printfulId} (Trigger: ${type})...`);
                        await syncProductById(printfulId);

                        // Revalidate cache
                        revalidateTag("products");
                        revalidateTag(`product-${printfulId}`);
                    }
                }
                break;

            case "product_deleted":
                if (data?.sync_product?.id) {
                    console.log(`[Webhook] Deleting product ${data.sync_product.id}...`);
                    await deleteProductByPrintfulId(data.sync_product.id);
                    // Revalidate cache
                    revalidateTag("products");
                    revalidateTag(`product-${data.sync_product.id}`);
                }
                break;

            case "stock_updated":
                if (data?.sync_variant_id !== undefined) {
                    console.log(`[Webhook] Updating stock for variant ${data.sync_variant_id}: ${data.in_stock}`);
                    await updateVariantStock(data.sync_variant_id, data.in_stock);
                    // Revalidate products as stock change affects product listing/detail
                    revalidateTag("products");
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
