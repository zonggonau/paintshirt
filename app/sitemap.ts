import { MetadataRoute } from 'next';
import { printful, fetchWithRetry } from '../src/lib/printful-client';
import { slugify } from '../src/lib/slugify';
import { formatVariantName } from '../src/lib/format-variant-name';
import { PrintfulProduct } from '../src/types';

// Base URL website Anda - ganti jika menggunakan domain lain
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://printfultshirt.com';

async function getProducts(): Promise<PrintfulProduct[]> {
    try {
        // Fetch product IDs
        const productIdsResponse = await fetchWithRetry<any>(
            () => printful.get("sync/products")
        );
        const productIds = productIdsResponse.result;

        // Fetch all products
        const allProducts = await Promise.all(
            productIds.map(async ({ id }: any) =>
                await fetchWithRetry<any>(() => printful.get(`sync/products/${id}`))
            )
        );

        return allProducts.map(
            (response: any) => {
                const { sync_product, sync_variants } = response.result;
                return {
                    ...sync_product,
                    variants: sync_variants.map(({ name, ...variant }: any) => ({
                        name: formatVariantName(name),
                        ...variant,
                    })),
                };
            }
        );
    } catch (error) {
        console.error("Error fetching products for sitemap:", error);
        return [];
    }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const products = await getProducts();

    const productUrls = products.map((product) => ({
        url: `${BASE_URL}/products/${product.id}/${slugify(product.name)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    return [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${BASE_URL}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${BASE_URL}/terms-of-sale`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        ...productUrls,
    ];
}
