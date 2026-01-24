import { NextRequest, NextResponse } from "next/server";
import { printful } from "@/src/lib/printful-client";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const variantId = searchParams.get('variantId');

    if (!variantId) {
        return NextResponse.json({ error: "Variant ID is required" }, { status: 400 });
    }

    // 1. Detect Country
    // Vercel / Cloudflare usually provides this header. 
    // If running locally, we might not have it, so default to 'US' or 'ID'.
    // User specifically asked about "Indonesia -> detecting location".
    let countryCode = request.headers.get('x-vercel-ip-country') || request.headers.get('cf-ipcountry') || 'US';

    // Convert generic local IP to US for dev testing purposes if needed, or keep generic.
    if (countryCode === '::1' || countryCode === '127.0.0.1') countryCode = 'US';

    // Map of country codes to names for display
    const countryNames: Record<string, string> = {
        'US': 'United States',
        'ID': 'Indonesia',
        'GB': 'United Kingdom',
        'CA': 'Canada',
        'AU': 'Australia',
        'DE': 'Germany',
        'FR': 'France',
        'ES': 'Spain',
        'IT': 'Italy',
        'JP': 'Japan',
        'BR': 'Brazil',
        // Add more as needed
    };

    const countryName = countryNames[countryCode] || countryCode;

    try {
        // 2. Fetch Shipping Rates from Printful
        // Endpoint: POST /shipping/rates
        // Docs: https://developers.printful.com/docs/#operation/calculateShippingRates
        const payload = {
            recipient: {
                country_code: countryCode,
                // city, state, zip are optional but improve accuracy. 
                // For "Starting at" estimate, country is enough.
            },
            items: [
                {
                    variant_id: Number(variantId),
                    quantity: 1
                }
            ],
            locale: "en_US"
        };

        const response = await printful.post('shipping/rates', payload);
        const rates = response.result || [];

        if (rates.length === 0) {
            return NextResponse.json({
                countryCode,
                countryName,
                estimate: null
            });
        }

        // 3. Process Rates
        // Usually we want the cheapest option (Standard)
        // Printful returns estimated days (min-max).
        const cheapestRate = rates.reduce((prev: any, curr: any) => {
            return parseFloat(curr.rate) < parseFloat(prev.rate) ? curr : prev;
        });

        return NextResponse.json({
            countryCode,
            countryName,
            currency: cheapestRate.currency,
            rate: cheapestRate.rate,
            minDays: cheapestRate.minDeliveryDays,
            maxDays: cheapestRate.maxDeliveryDays,
            name: cheapestRate.name // e.g. "Standard"
        });

    } catch (error) {
        console.error("Shipping Estimate Error:", error);
        // Fallback or error
        return NextResponse.json({ error: "Failed to calculate shipping" }, { status: 500 });
    }
}
