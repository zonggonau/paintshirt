import { NextRequest, NextResponse } from "next/server";
import { printful } from "../../../../src/lib/printful-client";
import type { PrintfulShippingItem } from "../../../../src/types";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { eventName, content } = body;

        if (eventName !== "taxes.calculate") {
            return new NextResponse(null, { status: 200 });
        }

        if (content.items.length === 0) {
            return NextResponse.json({
                errors: [
                    {
                        key: "no_items",
                        message: "No items in cart to calculate taxes.",
                    },
                ],
            });
        }

        const {
            items: cartItems,
            shippingAddress,
            shippingRateUserDefinedId,
        } = content;

        if (!shippingAddress) {
            return NextResponse.json({
                errors: [
                    {
                        key: "no_address",
                        message: "No address to calculate taxes.",
                    },
                ],
            });
        }

        const { address1, address2, city, country, province, postalCode, phone } =
            shippingAddress;

        const recipient = {
            ...(address1 && { address1 }),
            ...(address2 && { address2 }),
            ...(city && { city: city }),
            ...(country && { country_code: country }),
            ...(province && { state_code: province }),
            ...(postalCode && { zip: postalCode }),
            ...(phone && { phone }),
        };

        const items: PrintfulShippingItem[] = cartItems.map(
            (item: any): PrintfulShippingItem => ({
                external_variant_id: item.id,
                quantity: item.quantity,
            })
        );

        try {
            const { result } = await printful.post("orders/estimate-costs", {
                shipping: shippingRateUserDefinedId,
                recipient,
                items,
            });

            return NextResponse.json({
                taxes: [
                    {
                        name: "VAT",
                        amount: result.costs.vat,
                        rate: 0,
                    },
                ],
            });
        } catch (error: any) {
            console.log(error);
            return NextResponse.json({
                errors: [
                    {
                        key: error?.reason || "tax_error",
                        message: error?.message || "Failed to calculate taxes",
                    },
                ],
            });
        }
    } catch (error) {
        console.error("Tax Calculation Error:", error);
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}
