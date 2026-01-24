import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import ProductDetailImages from "../../../../src/components/ProductDetailImages";
import ProductDetailClient from "../../../../src/components/ProductDetailClient";
import RelatedProducts from "../../../../src/components/RelatedProducts";
import ProductGrid from "../../../../src/components/ProductGrid";
import { getProductFromDB, getProductsFromDB, getProductsForUI, getCategoriesFromDB } from "../../../../src/lib/sync-products";
import { formatVariantName } from "../../../../src/lib/format-variant-name";
import { PrintfulProduct } from "../../../../src/types";

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ dynamic?: string[] }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// ============================================================================
// Helper Functions
// ============================================================================

async function getCategories() {
    try {
        return await getCategoriesFromDB();
    } catch (error) {
        console.error("Error fetching categories:", error);
        return {};
    }
}

async function getCategoryProducts(categoryId: string, page: number, limit: number) {
    try {
        const { products, total } = await getProductsForUI(page, limit, categoryId);
        const formattedProducts = (products as PrintfulProduct[]).map((p) => ({
            ...p,
            variants: p.variants.map((v: any) => ({
                ...v,
                name: formatVariantName(v.name)
            }))
        }));
        return { products: formattedProducts, total };
    } catch (error) {
        console.error("Error fetching category products:", error);
        return { products: [], total: 0, error: "Failed to load products." };
    }
}

// ============================================================================
// Metadata Generation
// ============================================================================

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { dynamic: slugs } = await params;

    if (!slugs || slugs.length < 2) {
        return { title: "Categories | PrintfulTshirt" };
    }

    // Category Page: [categoryId, categorySlug]
    if (slugs.length === 2) {
        const title = slugs[1].split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        return {
            title: `${title} | PrintfulTshirt`,
            description: `Browse our collection of ${title} products.`
        };
    }

    // Product Page: [categoryId, categorySlug, productId, productSlug]
    if (slugs.length === 4) {
        const productId = slugs[2];
        const product = await getProductFromDB(productId);
        if (!product) return { title: "Product Not Found" };

        const title = `${product.name} | TEE-SOCIETY`;
        // Strip HTML tags from description for metadata
        const description = product.description?.replace(/<[^>]*>?/gm, '').substring(0, 160) || `Buy ${product.name} at TEE-SOCIETY.`;

        // Find best image for OG
        let imageUrl = product.thumbnail_url;
        if (!imageUrl && product.variants && product.variants.length > 0) {
            const firstVariant = product.variants[0];
            // Need to handle potential inconsistent data structure
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            imageUrl = (firstVariant as any).files?.find((f: any) => f.type === 'preview')?.preview_url || (firstVariant as any).preview_url;
        }

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                images: imageUrl ? [{ url: imageUrl, width: 800, height: 800, alt: product.name }] : [],
                url: `/products/categories/${slugs.join('/')}`,
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: imageUrl ? [imageUrl] : [],
            }
        };
    }

    return { title: "PrintfulTshirt" };
}

// ============================================================================
// Main Page Component
// ============================================================================

export default async function DynamicCategoryPage({ params, searchParams }: PageProps) {
    const { dynamic: slugs } = await params;
    const resolvedSearchParams = await searchParams;

    if (!slugs || slugs.length < 2) {
        notFound();
    }

    // ------------------------------------------------------------------------
    // Case 1: Category Listing ([categoryId, categorySlug])
    // ------------------------------------------------------------------------
    if (slugs.length === 2) {
        const [categoryId, categorySlug] = slugs;
        const page = typeof resolvedSearchParams.page === 'string' ? parseInt(resolvedSearchParams.page) : 1;
        const limit = 20;

        const [categoryMap, { products, total, error }] = await Promise.all([
            getCategories(),
            getCategoryProducts(categoryId, page, limit)
        ]);

        const title = categorySlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

        return (
            <div className="bg-gray-50 min-h-screen py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex mb-8 text-sm text-gray-500" aria-label="Breadcrumb">
                        <ol className="flex items-center space-x-2">
                            <li><Link href="/" className="hover:text-indigo-600">Home</Link></li>
                            <li className="flex items-center space-x-2"><span>/</span><Link href="/products" className="hover:text-indigo-600">Products</Link></li>
                            <li className="flex items-center space-x-2"><span>/</span><span className="text-gray-900 font-medium">{title}</span></li>
                        </ol>
                    </nav>

                    <div className="text-center mb-12">
                        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">{title}</h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">Showing all products in our {title} collection.</p>
                    </div>

                    {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-8 text-center border border-red-200">{error}</div>}

                    <ProductGrid products={products} totalProducts={total} currentPage={page} categoryMap={categoryMap} />
                </div>
            </div>
        );
    }

    // ------------------------------------------------------------------------
    // Case 2: Product Detail ([categoryId, categorySlug, productId, productSlug])
    // ------------------------------------------------------------------------
    if (slugs.length === 4) {
        const [categoryId, categorySlug, productId] = slugs;
        const [product, allProducts] = await Promise.all([
            getProductFromDB(productId),
            getProductsFromDB()
        ]);

        if (!product) notFound();

        const structuredData = {
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.description,
            sku: product.id,
            offers: {
                "@type": "Offer",
                priceCurrency: "USD",
                price: product.variants[0]?.retail_price,
                availability: "https://schema.org/InStock",
            }
        };

        return (
            <>
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

                <div className="min-h-screen bg-gray-50 py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <nav className="mb-8" aria-label="Breadcrumb">
                            <ol className="flex items-center space-x-2 text-sm text-gray-500">
                                <li><Link href="/" className="hover:text-indigo-600">Home</Link></li>
                                <li>/</li>
                                <li>
                                    <Link href={`/products/categories/${categoryId}/${categorySlug}`} className="hover:text-indigo-600">
                                        {product.category?.name || "Category"}
                                    </Link>
                                </li>
                                <li>/</li>
                                <li className="text-gray-900 font-medium">{product.name}</li>
                            </ol>
                        </nav>

                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 p-8 lg:p-12">
                                <ProductDetailImages product={product} />
                                <ProductDetailClient product={product} />
                            </div>
                        </div>

                        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Features</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <FeatureItem title="Premium Quality" desc="Top-tier materials" color="green" />
                                <FeatureItem title="Fast Shipping" desc="2-7 business days" color="blue" />
                                <FeatureItem title="Eco-Friendly" desc="Sustainable practices" color="purple" />
                                <FeatureItem title="Made with Love" desc="Quality checked" color="pink" />
                            </div>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                        <RelatedProducts currentProduct={product} allProducts={allProducts} />
                    </div>
                </div>
            </>
        );
    }

    // Default: Not found for other lengths
    notFound();
}

function FeatureItem({ title, desc, color }: any) {
    const colors: any = { green: "text-green-500", blue: "text-blue-500", purple: "text-purple-500", pink: "text-pink-500" };
    return (
        <div className="flex items-start space-x-3">
            <div className={`flex-shrink-0 ${colors[color]}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <div>
                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-gray-600 text-sm">{desc}</p>
            </div>
        </div>
    );
}
