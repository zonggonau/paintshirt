import "dotenv/config";
import { printful } from "../src/lib/printful-client";

async function checkWebhooks() {
    console.log("🔍 Checking registered Webhooks on Printful...");

    try {
        const response = await printful.get("webhooks");

        if (response.code === 200) {
            const webhookData = response.result;

            if (webhookData && webhookData.url) {
                console.log("✅ Webhook is ACTIVE and REGISTERED!");
                console.log("------------------------------------------");
                console.log(`🔗 URL   : ${webhookData.url}`);
                console.log(`📦 Events: ${webhookData.types.join(", ")}`);
                console.log("------------------------------------------");
            } else {
                console.log("⚠️ Webhook is NOT registered (URL is null).");
                console.log("Please run: npx tsx scripts/setup-webhooks.ts");
            }
        } else {
            console.error("❌ Failed to fetch webhook status:", response);
        }
    } catch (error) {
        console.error("❌ Error connecting to Printful API:", error);
    }
}

checkWebhooks();
