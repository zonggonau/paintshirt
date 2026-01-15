import { printful } from "./printful-client";
import type { SnipcartShippingRate, PrintfulShippingItem } from "../types";

type ShippingRatesResponse = {
    rates?: SnipcartShippingRate[];
    errors?: { key: string; message: string }[];
};

export const fetchShippingRates = async (content: any): Promise<ShippingRatesResponse> => {
    if (!content.items || content.items.length === 0) {
        return {
            errors: [
                {
                    key: "no_items",
                    message: "No items in cart to calculate shipping.",
                },
            ],
        };
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

        return {
            rates: result.map((rate: any) => ({
                cost: rate.rate,
                description: rate.name,
                userDefinedId: rate.id,
                guaranteedDaysToDelivery: rate.maxDeliveryDays,
            })),
        };
    } catch (error: any) {
        console.error("Printful Shipping Error:", error);
        return {
            errors: [
                {
                    key: error?.error?.reason || "shipping_error",
                    message: error?.error?.message || "Failed to fetch shipping rates",
                },
            ],
        };
    }
};
