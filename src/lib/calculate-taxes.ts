import { printful } from "./printful-client";
import type { SnipcartTaxItem, PrintfulShippingItem } from "../types";

type TaxResponse = {
    taxes?: SnipcartTaxItem[];
    errors?: { key: string; message: string }[];
};

export const calculateTaxes = async (content: any): Promise<TaxResponse> => {
    if (!content.items || content.items.length === 0) {
        return {
            errors: [
                {
                    key: "no_items",
                    message: "No items in cart to calculate taxes.",
                },
            ],
        };
    }

    const {
        items: cartItems,
        shippingAddress,
        shippingRateUserDefinedId,
    } = content;

    if (!shippingAddress) {
        return {
            errors: [
                {
                    key: "no_address",
                    message: "No address to calculate taxes.",
                },
            ],
        };
    }

    const {
        address1,
        address2,
        city,
        country,
        province,
        postalCode,
        phone,
    } = shippingAddress;

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

        return {
            taxes: [
                {
                    name: "VAT",
                    amount: result.costs.vat,
                    rate: 0,
                },
            ],
        };
    } catch (error: any) {
        console.error("Printful Tax Error:", error);
        return {
            errors: [
                {
                    key: error?.reason || "tax_error",
                    message: error?.message || "Failed to calculate taxes",
                },
            ],
        };
    }
};
