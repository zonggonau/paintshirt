

import { getCategoriesFromDB, getProductsForUI } from "../../src/lib/sync-products";
import { formatVariantName } from "../../src/lib/format-variant-name";
import { PrintfulProduct } from "../../src/types";
import ProductGrid from "../../src/components/ProductGrid";
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'All Products | PrintfulTshirt',
    description: 'Browse our complete collection of premium print-on-demand products.',
};

async function getCategories(): Promise<Record<number, string>> {
    try {
        return await getCategoriesFromDB();
    } catch (error) {
        console.error("Error fetching categories from DB:", error);
        return {};
    }
}

async function getProducts(page: number = 1, limit: number = 20, categoryName?: string): Promise<{ products: any[]; total: number; error?: string }> {
    try {
        const { products, total } = await getProductsForUI(page, limit, categoryName);

        // Format variant names for consistency if needed, though they should be stored formatted or handled in UI
        const formattedProducts = products.map(p => ({
            ...p,
            variants: p.variants.map((v: any) => ({
                ...v,
                name: formatVariantName(v.name)
            }))
        }));

        return {
            products: formattedProducts,
            total: total
        };
    } catch (error) {
        console.error("Error fetching products from DB:", error);

        return {
            products: [],
            total: 0,
            error: "Failed to load products from database.",
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

    // Fetch products with optional category filter
    const { products, total, error } = await getProducts(page, limit, categoryName);

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
