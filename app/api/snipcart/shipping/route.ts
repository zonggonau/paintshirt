import { NextRequest, NextResponse } from "next/server";
import { printful } from "../../../../src/lib/printful-client";
import type { SnipcartShippingRate, PrintfulShippingItem } from "../../../../src/types";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { eventName, content } = body;

        if (eventName !== "shippingrates.fetch") {
            return new NextResponse(null, { status: 200 }); // Return 200 OK to ignore other events
        }

        if (content.items.length === 0) {
            return new NextResponse(null, { status: 200 });
        }

        const {
            items: cartItems,
            shippingAddress1,
            shippingAddress2,
            shippingAddressCity,
            shippingAddressCountry,
            shippingAddressProvince,
            shippingAddressPostalCode,
            shippingAddressPhone,
        } = content;

        const recipient = {
            ...(shippingAddress1 && { address1: shippingAddress1 }),
            ...(shippingAddress2 && { address2: shippingAddress2 }),
            ...(shippingAddressCity && { city: shippingAddressCity }),
            ...(shippingAddressCountry && { country_code: shippingAddressCountry }),
            ...(shippingAddressProvince && { state_code: shippingAddressProvince }),
            ...(shippingAddressPostalCode && { zip: shippingAddressPostalCode }),
            ...(shippingAddressPhone && { phone: shippingAddressPhone }),
        };

        const items: PrintfulShippingItem[] = cartItems.map(
            (item: any): PrintfulShippingItem => ({
                external_variant_id: item.id,
                quantity: item.quantity,
            })
        );

        try {
            const { result } = await printful.post("shipping/rates", {
                recipient,
                items,
            });

            return NextResponse.json({
                rates: result.map((rate: any) => ({
                    cost: rate.rate,
                    description: rate.name,
                    userDefinedId: rate.id,
                    guaranteedDaysToDelivery: rate.maxDeliveryDays,
                })),
            });
        } catch (error: any) {
            console.log(error);
            return NextResponse.json({
                errors: [
                    {
                        key: error?.reason || "shipping_error",
                        message: error?.message || "Failed to fetch shipping rates",
                    },
                ],
            });
        }
    } catch (error) {
        console.error("Shipping Rate Error:", error);
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}
