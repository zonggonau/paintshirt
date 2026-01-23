
import { printful } from "./src/lib/printful-client";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function inspect() {
    try {
        const response = await printful.get("store/products");
        if (response.result && response.result.length > 0) {
            const firstId = response.result[0].id;
            const detail = await printful.get(`store/products/${firstId}`);
            console.log(JSON.stringify(detail.result.sync_product, null, 2));
        }
    } catch (e) {
        console.error(e);
    }
}

inspect();
