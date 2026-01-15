import { NextRequest, NextResponse } from "next/server";
import createOrder from "../../../../src/lib/create-order";
import { SnipcartWebhookContent } from "../../../../src/types";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { eventName, content } = body;

        const allowedEvents = ["order.completed", "customauth:customer_updated"];

        if (!allowedEvents.includes(eventName)) {
            return NextResponse.json({ message: "This event is not permitted" }, { status: 400 });
        }

        // Optional: Token verification logic here if needed
        // const token = request.headers.get("x-snipcart-requesttoken");

        switch (eventName) {
            case "order.completed":
                try {
                    const orderResult = await createOrder(content as SnipcartWebhookContent);
                    console.log("Printful Order Created:", orderResult);
                    return NextResponse.json({ success: true, order: orderResult });
                } catch (error) {
                    console.error("Failed to create Printful order:", error);
                    // Return 200 to prevent Snipcart validity checks from failing, but log error
                    return NextResponse.json({ success: false, error: "Failed to create order" });
                }
            case "customauth:customer_updated":
                return NextResponse.json({ message: "Customer updated - no action taken" });
            default:
                return NextResponse.json({ message: "No such event handler exists" }, { status: 400 });
        }
    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}
