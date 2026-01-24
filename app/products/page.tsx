

import { getCategoriesFromDB, getProductsForUI } from "../../src/lib/sync-products";
import { formatVariantName } from "../../src/lib/format-variant-name";
import { PrintfulProduct } from "../../src/types";
import ProductGrid from "../../src/components/ProductGrid";
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
    const sp = await searchParams;
    const page = typeof sp.page === 'string' ? parseInt(sp.page) : 1;

    // Base URL should ideally come from env, fallback to localhost for dev
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // SEO Optimization:
    // If page is 1, canonical should be /products (clean URL) to avoid duplicate content with /products?page=1
    const canonicalPath = page > 1 ? `/products?page=${page}` : '/products';

    return {
        title: `All Products ${page > 1 ? `- Page ${page}` : ''} | TEE-SOCIETY`,
        description: 'Browse our complete collection of premium print-on-demand products.',
        alternates: {
            canonical: `${baseUrl}${canonicalPath}`,
        },
    };
}

async function getCategories(): Promise<Record<number, string>> {
    try {
        return await getCategoriesFromDB();
    } catch (error) {
        console.error("Error fetching categories from DB:", error);
        return {};
    }
}

async function getProducts(
    page: number = 1,
    limit: number = 20,
    filter?: { category?: string, sort?: string, search?: string }
): Promise<{ products: any[]; total: number; error?: string }> {
    try {
        const { products, total } = await getProductsForUI(
            page,
            limit,
            filter?.category,
            filter?.sort,
            filter?.search
        );

        // Format variant names for consistency if needed
        const formattedProducts = products.map((p: any) => ({
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
    const sort = typeof resolvedSearchParams.sort === 'string' ? resolvedSearchParams.sort : 'newest';
    const search = typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : undefined;

    // Also support 'q' for search standard
    const query = search || (typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : undefined);

    const limit = 20;

    // Fetch categories first to get the ID map
    const categoryMap = await getCategories();

    // Fetch products with all filters
    const { products, total, error } = await getProducts(page, limit, {
        category: categoryName,
        sort,
        search: query
    });

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
