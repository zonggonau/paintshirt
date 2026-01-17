

import { printful, fetchWithRetry } from "../../src/lib/printful-client";
import { formatVariantName } from "../../src/lib/format-variant-name";
import { PrintfulProduct } from "../../src/types";
import { productCache } from "../../src/lib/product-cache";
import ProductGrid from "../../src/components/ProductGrid";
import shuffle from "lodash.shuffle";
import { Metadata } from 'next';

// Cache for 10 minutes - optimized for performance
// Products don't change frequently in Printful, so longer cache is better
export const revalidate = 600;
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'All Products | PrintfulTshirt',
    description: 'Browse our complete collection of premium print-on-demand products.',
};


// Update type to include total count

import { PrintfulCategory } from "../../src/types";

async function getCategories(): Promise<Record<number, string>> {
    try {
        // Fetch all categories
        const response = await fetchWithRetry<any>(
            () => printful.get("categories")
        );

        const categories: PrintfulCategory[] = response.result.categories;

        // Create map of ID -> Title
        const categoryMap: Record<number, string> = {};
        categories.forEach(cat => {
            categoryMap[cat.id] = cat.title;
        });

        return categoryMap;
    } catch (error) {
        console.error("Error fetching categories:", error);
        return {};
    }
}


// Helper to invert map or find ID
function findCategoryIdByName(name: string, map: Record<number, string>): number | undefined {
    const entry = Object.entries(map).find(([_, title]) => title.toLowerCase() === name.toLowerCase());
    return entry ? parseInt(entry[0]) : undefined;
}

async function getProducts(page: number = 1, limit: number = 20, categoryIds?: number[]): Promise<{ products: PrintfulProduct[]; total: number; error?: string }> {
    try {
        const offset = (page - 1) * limit;
        let endpoint = `sync/products?limit=${limit}&offset=${offset}`;

        if (categoryIds && categoryIds.length > 0) {
            endpoint += `&category_id=${categoryIds.join(',')}`;
        }

        console.log(`Fetching products: ${endpoint}`);

        // Fetch product IDs with retry logic
        const productIdsResponse = await fetchWithRetry<any>(
            () => printful.get(endpoint)
        );

        const productIds = productIdsResponse.result;

        // Fetch all products details
        const allProducts = await Promise.all(
            productIds.map(async ({ id }: any) =>
                await fetchWithRetry<any>(() => printful.get(`sync/products/${id}`))
            )
        );

        const products: PrintfulProduct[] = allProducts.map(
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

        // Use actual product count, not paging.total which can be inaccurate for category filters
        // If we got less than limit products, that means this is the last page
        const actualTotal = products.length < limit
            ? (page - 1) * limit + products.length  // Last page
            : productIdsResponse.paging?.total || products.length;  // Use paging total if available

        return {
            products: products,
            total: actualTotal
        };
    } catch (error) {
        console.error("Error fetching products:", error);

        return {
            products: [],
            total: 0,
            error: "Failed to load products. Please try again later.",
        };
    }
}


export default async function ProductsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedSearchParams = await searchParams;
    const page = typeof resolvedSearchParams.page === 'string' ? parseInt(resolvedSearchParams.page) : 1;
    const categoryName = typeof resolvedSearchParams.category === 'string' ? resolvedSearchParams.category : undefined;
    const limit = 20;

    // Fetch categories first to get the ID map
    const categoryMap = await getCategories();

    // Determine category ID if search param exists
    let categoryIds: number[] | undefined = undefined;
    if (categoryName) {
        const id = findCategoryIdByName(categoryName, categoryMap);
        if (id) categoryIds = [id];
    }

    // Fetch products with optional category filter
    const { products, total, error } = await getProducts(page, limit, categoryIds);

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                        All Products
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Explore our wide range of premium custom apparel and accessories.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
                        <p className="text-red-600 text-center">{error}</p>
                    </div>
                )}

                <ProductGrid
                    products={products}
                    totalProducts={total}
                    currentPage={page}
                    categoryMap={categoryMap}
                />
            </div>
        </div>
    );
}
