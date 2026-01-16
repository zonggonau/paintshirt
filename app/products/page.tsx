
import { printful, fetchWithRetry } from "../../src/lib/printful-client";
import { formatVariantName } from "../../src/lib/format-variant-name";
import { PrintfulProduct } from "../../src/types";
import { productCache } from "../../src/lib/product-cache";
import ProductGrid from "../../src/components/ProductGrid";
import shuffle from "lodash.shuffle";
import { Metadata } from 'next';

export const revalidate = 60; // Revalidate every 60 seconds

export const metadata: Metadata = {
    title: 'All Products | PrintfulTshirt',
    description: 'Browse our complete collection of premium print-on-demand products.',
};

async function getProducts(): Promise<{ products: PrintfulProduct[]; error?: string }> {
    try {
        // Check cache first
        const cachedProducts = productCache.get();

        if (cachedProducts) {
            console.log("Serving from cache");
            return {
                products: shuffle(cachedProducts),
            };
        }

        console.log("Fetching fresh data from Printful");

        // Fetch product IDs with retry logic
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

        // Store in cache
        productCache.set(products);

        return {
            products: shuffle(products),
        };
    } catch (error) {
        console.error("Error fetching products:", error);

        return {
            products: [],
            error: "Failed to load products. Please try again later.",
        };
    }
}

export default async function ProductsPage() {
    const { products, error } = await getProducts();

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

                <ProductGrid products={products} />
            </div>
        </div>
    );
}
