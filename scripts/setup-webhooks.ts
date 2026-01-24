import "dotenv/config";
import { printful } from "../src/lib/printful-client";

async function setupWebhooks() {
    console.log("🚀 Starting Webhook registration for Printful...");

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl) {
        console.error("❌ NEXT_PUBLIC_SITE_URL is not defined in your .env file.");
        process.exit(1);
    }

    const webhookUrl = `${siteUrl.replace(/\/$/, "")}/api/printful/webhook`;

    console.log(`🔗 Target URL: ${webhookUrl}`);

    try {
        const response = await printful.post("webhooks", {
            url: webhookUrl,
            types: [
                "product_synced",
                "product_updated",
                "product_deleted",
                "stock_updated",
                "order_failed",
                "order_canceled"
            ],
        });

        if (response.code === 200) {
            console.log("✅ Webhook successfully registered!");
            console.log("Details:", JSON.stringify(response.result, null, 2));
        } else {
            console.error("❌ Failed to register webhook:", response);
        }
    } catch (error) {
        console.error("❌ Error connecting to Printful API:", error);
    }
}

setupWebhooks();
