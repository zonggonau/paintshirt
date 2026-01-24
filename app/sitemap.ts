import { MetadataRoute } from 'next';
import { getProductsFromDB } from '../src/lib/sync-products';
import { slugify } from '../src/lib/slugify';
import { PrintfulProduct } from '../src/types';

// Base URL website Anda - ganti jika menggunakan domain lain
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://printfultshirt.com';

async function getProducts(): Promise<PrintfulProduct[]> {
    try {
        return await getProductsFromDB();
    } catch (error) {
        console.error("Error fetching products for sitemap from DB:", error);
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
