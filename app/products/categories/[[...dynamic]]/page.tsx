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

// Caching is now handled by unstable_cache in src/lib/sync-products.ts
// export const dynamic = 'force-dynamic';

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
        return {
            title: "Categories | Printful T-shirt",
            description: "Browse our extensive collection of print-on-demand products."
        };
    }

    // Category Page: [categoryId, categorySlug]
    if (slugs.length === 2) {
        const title = slugs[1].split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        const url = `/products/categories/${slugs.join('/')}`;
        
        return {
            title: `${title} | Printful T-shirt`,
            description: `Shop the best ${title} designs at Printful T-shirt. High quality, custom printed apparel and accessories.`,
            openGraph: {
                title: `${title} - Premium Collection`,
                description: `Explore our unique ${title} collection.`,
                url,
                type: 'website',
            },
            alternates: {
                canonical: url,
            }
        };
    }

    // Product Page: [categoryId, categorySlug, productId, productSlug]
    if (slugs.length === 4) {
        const productId = slugs[2];
        const product = await getProductFromDB(productId);
        if (!product) return { title: "Product Not Found" };

        const title = `${product.name} | Printful T-Shirt`;
        // Strip HTML tags from description for metadata
        const description = product.description?.replace(/<[^>]*>?/gm, '').substring(0, 160) || `Buy ${product.name} at Printful T-shirt. Premium quality custom print.`;

        // Find best images for OG
        const images: any[] = [];
        
        // Thumbnail first
        if (product.thumbnail_url) {
            images.push({ url: product.thumbnail_url, width: 800, height: 800, alt: product.name });
        }

        // Add variants previews
        if (product.variants && product.variants.length > 0) {
            product.variants.slice(0, 3).forEach((v: any) => {
                 const previewUrl = v.files?.find((f: any) => f.type === 'preview')?.preview_url || v.preview_url;
                 if (previewUrl && previewUrl !== product.thumbnail_url) {
                     images.push({ url: previewUrl, width: 800, height: 800, alt: `${product.name} - ${v.name}` });
                 }
            });
        }

        const url = `/products/categories/${slugs.join('/')}`;

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                images: images,
                url,
                type: 'website', // Use 'website' or 'article' as 'product' is not a standard OG type, though typically handled via schema
                siteName: 'Printful T-shirt',
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: images.map(img => img.url),
            },
            alternates: {
                canonical: url,
            }
        };
    }

    return { title: "Printful T-shirt" };
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
        const categoryUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/products/categories/${categoryId}/${categorySlug}`;

        // Breadcrumb Schema for Category
        const breadcrumbSchema = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [{
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": process.env.NEXT_PUBLIC_SITE_URL || "https://printfultshirt.com"
            }, {
                "@type": "ListItem",
                "position": 2,
                "name": "Products",
                "item": `${process.env.NEXT_PUBLIC_SITE_URL || "https://printfultshirt.com"}/products`
            }, {
                "@type": "ListItem",
                "position": 3,
                "name": title,
                "item": categoryUrl
            }]
        };

        return (
            <>
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
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
            </>
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

        // Calculate Price Range
        const prices = product.variants.map((v: any) => Number(v.retail_price));
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const currency = product.variants[0]?.currency || "USD";
        const inStock = product.variants.some((v: any) => v.in_stock !== false);
        
        // Collect Images
        const images = [product.thumbnail_url];
        product.variants.forEach((v: any) => {
            const previewUrl = v.files?.find((f: any) => f.type === 'preview')?.preview_url || v.preview_url;
            if (previewUrl && !images.includes(previewUrl)) {
                 images.push(previewUrl);
            }
        });

        // Product Schema
        const productSchema = {
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.description?.replace(/<[^>]*>?/gm, '').substring(0, 500), // Clean description
            image: images.filter(Boolean),
            sku: product.id,
            mpn: product.external_id, // Manufacturer Part Number
            brand: {
                "@type": "Brand",
                name: "Printful" 
            },
            offers: {
                "@type": "AggregateOffer",
                priceCurrency: currency,
                lowPrice: minPrice,
                highPrice: maxPrice,
                offerCount: product.variants.length,
                availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0], // 1 year from now
                url: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/products/categories/${categoryId}/${categorySlug}/${productId}/${slugs[3]}`
            }
        };

        // Breadcrumb Schema
        const breadcrumbSchema = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [{
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": process.env.NEXT_PUBLIC_SITE_URL || "https://printfultshirt.com"
            }, {
                "@type": "ListItem",
                "position": 2,
                "name": "Products",
                "item": `${process.env.NEXT_PUBLIC_SITE_URL || "https://printfultshirt.com"}/products`
            }, {
                "@type": "ListItem",
                "position": 3,
                "name": product.category?.name || "Category",
                "item": `${process.env.NEXT_PUBLIC_SITE_URL || "https://printfultshirt.com"}/products/categories/${categoryId}/${categorySlug}`
            }, {
                "@type": "ListItem",
                "position": 4,
                "name": product.name,
                "item": `${process.env.NEXT_PUBLIC_SITE_URL || "https://printfultshirt.com"}/products/categories/${categoryId}/${categorySlug}/${productId}/${slugs[3]}`
            }]
        };

        return (
            <>
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

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
                                <li className="text-gray-900 font-medium truncate max-w-[200px] md:max-w-xs">{product.name}</li>
                            </ol>
                        </nav>

                        <div className="bg-white shadow-xl overflow-hidden rounded-2xl">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 p-8 lg:p-12">
                                <ProductDetailImages product={product} />
                                <ProductDetailClient product={product} />
                            </div>

                            {/* Description Section - Full Width Row */}
                            {product.description && (
                                <div className="border-t border-gray-100 p-8 lg:p-12 bg-gray-50/50">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Description</h2>
                                    <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed">
                                        <div dangerouslySetInnerHTML={{ __html: product.description }} />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-12 bg-white shadow-lg p-8 rounded-2xl">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Features</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <FeatureItem title="Premium Quality" desc="Top-tier materials" color="green" />
                                <FeatureItem title="Fast Shipping" desc="2-7 business days" color="blue" />
                                <FeatureItem title="Eco-Friendly" desc="Sustainable practices" color="purple" />
                                <FeatureItem title="Made with Love" desc="Quality checked" color="pink" />
                            </div>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 mt-12">
                        <RelatedProducts currentProduct={product} allProducts={allProducts} />
                    </div>
                </div >
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
