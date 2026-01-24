import { NextRequest, NextResponse } from "next/server";
import { printful } from "@/src/lib/printful-client";
// import geoip from 'geoip-lite'; // REMOVED to prevent static bundling issues

// Cache countries in memory briefly to reduce API calls (simple caching)
let countriesCache: any[] | null = null;
let lastFetch = 0;
const CACHE_TTL = 3600 * 1000; // 1 hour

async function getPrintfulCountries() {
    const now = Date.now();
    if (countriesCache && (now - lastFetch < CACHE_TTL)) {
        return countriesCache;
    }

    try {
        const res = await printful.get('countries');
        if (res && res.result) {
            countriesCache = res.result;
            lastFetch = now;
            return res.result;
        }
    } catch (error) {
        console.error("Failed to fetch countries:", error);
    }
    return [];
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const variantId = searchParams.get('variantId');

    if (!variantId) {
        return NextResponse.json({ error: "Variant ID is required" }, { status: 400 });
    }

    // 1. Detect Country (VPS Friendly using GeoIP Lite)
    let countryCode = searchParams.get('country');

    if (!countryCode) {
        // Try standard Vercel/Cloudflare headers first (if used later)
        countryCode = request.headers.get('x-vercel-ip-country') || request.headers.get('cf-ipcountry');

        if (!countryCode) {
            // VPS Logic: Get Request IP
            const forwardedFor = request.headers.get('x-forwarded-for');
            let ip = forwardedFor ? forwardedFor.split(',')[0].trim() : null;

            // Fallback for direct connection (x-real-ip is often used by Nginx)
            if (!ip) ip = request.headers.get('x-real-ip');

            // Handle localhost (::1) -> Default to US for dev
            if (ip === '::1' || ip === '127.0.0.1' || !ip) {
                countryCode = 'US'; // Default for Dev
            } else {
                // Lookup GeoIP from local database dynamically
                try {
                    // Dynamic import to prevent build-time bundling constraints
                    const geoip = await import('geoip-lite');
                    const geo = geoip.lookup(ip);
                    countryCode = geo ? geo.country : 'US';
                } catch (e) {
                    console.warn(`[GeoIP] Failed to load or lookup IP ${ip}:`, e);
                    countryCode = 'US';
                }
            }
        }
    }

    // Safety check fallback
    if (!countryCode) countryCode = 'US';

    try {
        // 2. Fetch official country data from Printful
        const allCountries = await getPrintfulCountries();

        // Find current country data to get Name and States
        const countryData = allCountries.find((c: any) => c.code === countryCode);
        const countryName = countryData ? countryData.name : countryCode;

        // 3. Prepare Recipient Data
        const recipient: any = {
            country_code: countryCode
        };

        // Handle mandatory state codes for US, AU, CA, etc.
        if (countryData?.states?.length > 0) {
            // If we are in the US/AU/CA, we need a state code.
            // Since we only know the Country from GeoIP, we pick a default state 
            // to allow the estimate API to succeed.
            recipient.state_code = countryData.states[0].code;
        }

        // 4. Fetch Shipping Rates
        // Handle variant ID type: Printful internal ID (int) vs External ID (string)
        const itemObj: any = { quantity: 1 };
        const isNumericId = /^\d+$/.test(variantId);

        if (isNumericId) {
            itemObj.variant_id = Number(variantId);
        } else {
            itemObj.external_variant_id = variantId;
        }

        const payload = {
            recipient: recipient,
            items: [itemObj],
            locale: "en_US",
            currency: "USD"
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

        // 5. Select Best Rate (Cheapest)
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
            name: cheapestRate.name,
            usedState: recipient.state_code
        });

    } catch (error: any) {
        console.error("Shipping Estimate Error:", error);
        const message = error.message || "Failed to calculate shipping";
        const status = error.message?.includes('400') ? 400 : 500;
        return NextResponse.json({ error: message }, { status });
    }
}
