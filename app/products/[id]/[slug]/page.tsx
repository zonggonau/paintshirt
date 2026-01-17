import { notFound } from "next/navigation";
import { Metadata } from "next";
import ProductDetailImages from "../../../../src/components/ProductDetailImages";
import { printful, fetchWithRetry } from "../../../../src/lib/printful-client";
import { formatVariantName } from "../../../../src/lib/format-variant-name";
import ProductDetailClient from "../../../../src/components/ProductDetailClient";
import RelatedProducts from "../../../../src/components/RelatedProducts";
import { productCache } from "../../../../src/lib/product-cache";
import { PrintfulCategory } from "../../../../src/types";

export const revalidate = 600; // 10 minutes cache


async function getProduct(id: string) {
    try {
        const response = await fetchWithRetry<any>(
            () => printful.get(`sync/products/${id}`)
        );

        const { sync_product, sync_variants } = response.result;

        return {
            ...sync_product,
            variants: sync_variants.map(({ name, ...variant }: any) => ({
                name: formatVariantName(name),
                ...variant,
            })),
        };
    } catch (error) {
        console.error("Error fetching product:", error);
        return null;
    }
}

// Shared function to fetch all products for Related Products section
async function getAllProducts() {
    try {
        const cachedProducts = productCache.get();
        if (cachedProducts) return cachedProducts;

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

        const products = allProducts.map(
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

        productCache.set(products);
        return products;
    } catch (error) {
        console.error("Error fetching all products:", error);
        return [];
    }
}

// Fetch all brands (sub-categories of Brands parent category ID: 159)
async function getBrands(): Promise<PrintfulCategory[]> {
    try {
        const response = await fetchWithRetry<any>(
            () => printful.get("categories")
        );
        const categories: PrintfulCategory[] = response.result.categories;

        // Get brands parent category (ID: 159) and its children
        const brands = categories
            .filter(cat => cat.parent_id === 159)
            .sort((a, b) => (a.catalog_position ?? a.id) - (b.catalog_position ?? b.id));

        return brands;
    } catch (error) {
        console.error("Error fetching brands:", error);
        return [];
    }
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string; slug: string }>;
}): Promise<Metadata> {
    const { id, slug } = await params;
    const product = await getProduct(id);

    if (!product) {
        return {
            title: "Product Not Found",
            description: "The product you are looking for does not exist.",
        };
    }

    const [firstVariant] = product.variants;
    const previewImage = firstVariant.files.find(
        (file: any) => file.type === "preview"
    )?.preview_url || "";

    const formattedPrice = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: firstVariant.currency,
    }).format(firstVariant.retail_price);

    const availableColors = [
        ...new Set(product.variants.map((v: any) => v.color).filter(Boolean)),
    ];
    const availableSizes = [
        ...new Set(product.variants.map((v: any) => v.size).filter(Boolean)),
    ];

    const description = `Buy ${product.name} for ${formattedPrice}. Available in ${availableColors.length} colors and ${availableSizes.length} sizes. Premium quality with fast shipping. Shop now at PrintfulTshirt!`;

    const keywords = [
        product.name,
        ...availableColors.map((c) => `${c} ${product.name}`),
        ...availableSizes.map((s) => `${s} ${product.name}`),
        "custom apparel",
        "dropshipping",
        "print on demand",
        "quality clothing",
    ].join(", ");

    return {
        title: `${product.name} - ${formattedPrice} | PrintfulTshirt`,
        description,
        keywords,
        authors: [{ name: "PrintfulTshirt" }],
        openGraph: {
            title: `${product.name} - PrintfulTshirt`,
            description,
            url: `https://printfultshirt.com/products/${id}/${slug}`,
            siteName: "PrintfulTshirt",
            images: [
                {
                    url: previewImage,
                    width: 1200,
                    height: 1200,
                    alt: product.name,
                },
            ],
            locale: "en_US",
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: `${product.name} - PrintfulTshirt`,
            description,
            images: [previewImage],
            creator: "@printfultshirt",
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                "max-video-preview": -1,
                "max-image-preview": "large",
                "max-snippet": -1,
            },
        },
        alternates: {
            canonical: `https://printfultshirt.com/products/${id}/${slug}`,
        },
    };
}

export default async function ProductDetailPage({
    params,
}: {
    params: Promise<{ id: string; slug: string }>;
}) {
    const { id, slug } = await params;
    const [product, allProducts] = await Promise.all([
        getProduct(id),
        getAllProducts()
    ]);

    if (!product) {
        notFound();
    }


    const [firstVariant] = product.variants;
    const previewImage = firstVariant.files.find(
        (file: any) => file.type === "preview"
    )?.preview_url || "";

    const formattedPrice = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: firstVariant.currency,
    }).format(firstVariant.retail_price);

    // Structured Data (JSON-LD) for Google Rich Snippets
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        image: previewImage,
        description: `High-quality ${product.name} with multiple color and size options. Fast shipping and premium quality.`,
        sku: product.id,
        brand: {
            "@type": "Brand",
            name: "PainTshirt",
        },
        offers: {
            "@type": "AggregateOffer",
            url: `https://printfultshirt.com/products/${id}/${slug}`,
            priceCurrency: firstVariant.currency,
            lowPrice: Math.min(...product.variants.map((v: any) => v.retail_price)),
            highPrice: Math.max(...product.variants.map((v: any) => v.retail_price)),
            offerCount: product.variants.length,
            availability: "https://schema.org/InStock",
            seller: {
                "@type": "Organization",
                name: "PrintfulTshirt",
            },
        },
        aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.9",
            reviewCount: "127",
        },
    };



    return (
        <>
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />

            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumb */}
                    <nav className="mb-8" aria-label="Breadcrumb">
                        <ol
                            className="flex items-center space-x-2 text-sm"
                            itemScope
                            itemType="https://schema.org/BreadcrumbList"
                        >
                            <li
                                itemProp="itemListElement"
                                itemScope
                                itemType="https://schema.org/ListItem"
                            >
                                <a
                                    href="/"
                                    className="text-gray-500 hover:text-indigo-600 transition"
                                    itemProp="item"
                                >
                                    <span itemProp="name">Home</span>
                                </a>
                                <meta itemProp="position" content="1" />
                            </li>
                            <li className="text-gray-400">/</li>
                            <li
                                itemProp="itemListElement"
                                itemScope
                                itemType="https://schema.org/ListItem"
                            >
                                <span className="text-gray-900 font-medium" itemProp="name">
                                    {product.name}
                                </span>
                                <meta itemProp="position" content="2" />
                            </li>
                        </ol>
                    </nav>

                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 p-8 lg:p-12">
                            {/* Product Images - Server Component */}
                            <ProductDetailImages product={product} />

                            {/* Product Info - Client Component */}
                            <ProductDetailClient product={product} />
                        </div>
                    </div>

                    {/* Product Description / Features */}
                    <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Features</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Premium Quality</h3>
                                    <p className="text-gray-600 text-sm">High-quality materials and printing technology</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Fast Shipping</h3>
                                    <p className="text-gray-600 text-sm">Delivered within 2-7 business days</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                    <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Eco-Friendly</h3>
                                    <p className="text-gray-600 text-sm">Sustainable printing practices</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                    <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Made with Love</h3>
                                    <p className="text-gray-600 text-sm">Carefully crafted and quality checked</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                    <RelatedProducts currentProduct={product} allProducts={allProducts} />
                </div>
            </div>
        </>
    );
}
