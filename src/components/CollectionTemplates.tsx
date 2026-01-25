import Link from 'next/link';
import Image from 'next/image';
import { PrintfulProduct } from '../types';

interface CollectionTemplateProps {
    title: string;
    description?: string;
    products: PrintfulProduct[];
    categorySlug: string;
}

// Helper to format price
const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(price);
};

// Helper for product slug
const getProductSlug = (name: string) => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
};

// Helper to get structured product URL
const getProductUrl = (product: any) => {
    const slug = getProductSlug(product.name);
    const catId = product.category?.id || "uncategorized";
    const catSlug = getProductSlug(product.category?.name || "all");
    return `/products/categories/${catId}/${catSlug}/${product.id}/${slug}`;
};

/**
 * 2-Grid Layout: Large impactful images
 */
export function CollectionTwoGrid({ title, products, categorySlug }: CollectionTemplateProps) {
    if (products.length < 2) return null;
    const displayProducts = products.slice(0, 2);

    return (
        <div className="mb-20">
            <div className="flex justify-between items-end mb-8 px-2">
                <h3 className="text-3xl font-bold text-gray-900">{title}</h3>
                <Link href={`/products?category=${encodeURIComponent(categorySlug)}`} className="text-indigo-600 hover:text-indigo-700 font-medium">
                    View Collection →
                </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {displayProducts.map((product) => {
                    const price = product.variants?.[0]?.retail_price || 0;
                    const currency = product.variants?.[0]?.currency || 'USD';
                    const image = product.variants?.[0]?.files?.find((f: any) => f.type === 'preview')?.preview_url || product.variants?.[0]?.preview_url || product.thumbnail_url;

                    return (
                        <Link key={product.id} href={getProductUrl(product)} className="group relative aspect-[4/5] md:aspect-square rounded-2xl overflow-hidden block">
                            {image && (
                                <Image
                                    src={image}
                                    alt={product.name}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                            <div className="absolute bottom-0 left-0 right-0 p-8 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                <h4 className="text-2xl font-bold mb-2">{product.name}</h4>
                                <p className="text-lg font-medium opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                                    {formatPrice(price, currency)}
                                </p>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

/**
 * 3-Grid Layout: Standard Cards
 */
export function CollectionThreeGrid({ title, products, categorySlug }: CollectionTemplateProps) {
    if (products.length < 3) return null;
    const displayProducts = products.slice(0, 3);

    return (
        <div className="mb-16">
            <div className="text-center mb-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
                <Link href={`/products?category=${encodeURIComponent(categorySlug)}`} className="text-sm text-gray-500 hover:text-indigo-600 uppercase tracking-widest font-semibold">
                    Show All
                </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {displayProducts.map((product) => {
                    const price = product.variants?.[0]?.retail_price || 0;
                    const currency = product.variants?.[0]?.currency || 'USD';
                    const image = product.variants?.[0]?.files?.find((f: any) => f.type === 'preview')?.preview_url || product.variants?.[0]?.preview_url || product.thumbnail_url;

                    return (
                        <Link key={product.id} href={getProductUrl(product)} className="group block">
                            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 mb-4">
                                {image && (
                                    <Image
                                        src={image}
                                        alt={product.name}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                    />
                                )}
                                <div className="absolute bottom-4 right-4 bg-white px-3 py-1 rounded-full shadow-lg text-sm font-bold opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                                    {formatPrice(price, currency)}
                                </div>
                            </div>
                            <h4 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600 transition-colors text-center">{product.name}</h4>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

/**
 * Carousel Layout
 */
export function CollectionCarousel({ title, products, categorySlug }: CollectionTemplateProps) {
    if (products.length === 0) return null;
    const displayProducts = products.slice(0, 5); // Allow more for carousel

    return (
        <div className="mb-20 bg-gray-50 -mx-4 md:-mx-8 lg:-mx-12 px-4 md:px-8 lg:px-12 py-16">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h3>
                    <div className="flex gap-2">
                        {/* Fake Navigation Controls for visual effect */}
                        <button className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-white hover:border-gray-800 transition">
                            ←
                        </button>
                        <button className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-white hover:border-gray-800 transition">
                            →
                        </button>
                    </div>
                </div>
                <div className="flex gap-6 overflow-x-auto pb-8 snap-x hide-scrollbar">
                    {displayProducts.map((product) => {
                        const price = product.variants?.[0]?.retail_price || 0;
                        const currency = product.variants?.[0]?.currency || 'USD';
                        const image = product.variants?.[0]?.files?.find((f: any) => f.type === 'preview')?.preview_url || product.variants?.[0]?.preview_url || product.thumbnail_url;

                        return (
                            <Link key={product.id} href={getProductUrl(product)} className="min-w-[280px] md:min-w-[320px] snap-center group block bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                                <div className="aspect-[4/5] rounded-xl overflow-hidden bg-gray-100 mb-4 relative">
                                    {image && (
                                        <Image
                                            src={image}
                                            alt={product.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            sizes="320px"
                                        />
                                    )}
                                </div>
                                <div className="flex justify-between items-start">
                                    <h4 className="text-base font-semibold text-gray-900 line-clamp-1">{product.name}</h4>
                                    <span className="text-sm font-bold text-indigo-600">{formatPrice(price, currency)}</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

/**
 * 6-Grid Compact Layout
 */
export function CollectionSixGrid({ title, products, categorySlug }: CollectionTemplateProps) {
    if (products.length < 3) return null; // Min 3 but ideally 6
    const displayProducts = products.slice(0, 6);

    return (
        <div className="mb-20">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-4 flex justify-between items-center">
                <span>{title}</span>
                <Link href={`/products?category=${encodeURIComponent(categorySlug)}`} className="text-sm font-normal text-indigo-600 hover:underline">
                    Shop collection
                </Link>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {displayProducts.map((product) => {
                    const price = product.variants?.[0]?.retail_price || 0;
                    const currency = product.variants?.[0]?.currency || 'USD';
                    const image = product.variants?.[0]?.files?.[0]?.preview_url || product.variants?.[0]?.preview_url || product.thumbnail_url;

                    return (
                        <Link key={product.id} href={getProductUrl(product)} className="group block">
                            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-3 relative group-hover:ring-2 ring-indigo-500 transition-all">
                                {image && (
                                    <Image
                                        src={image}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 50vw, 16vw"
                                    />
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                            </div>
                            <h4 className="text-sm font-medium text-gray-900 truncate">{product.name}</h4>
                            <p className="text-xs text-gray-500 mt-1">{formatPrice(price, currency)}</p>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
/**
 * Rich Grid Layout: Full details with description
 * Mimics "Card with full details" style
 */
export function CollectionRichGrid({ title, products, categorySlug }: CollectionTemplateProps) {
    if (products.length === 0) return null;
    const displayProducts = products.slice(0, 4); // Show 4 items for this layout

    return (
        <div className="mb-24">
            <div className="flex justify-between items-end mb-8">
                <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
                <Link href={`/products?category=${encodeURIComponent(categorySlug)}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                    Browse all &rarr;
                </Link>
            </div>
            <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                {displayProducts.map((product) => {
                    const price = product.variants?.[0]?.retail_price || 0;
                    const currency = product.variants?.[0]?.currency || 'USD';
                    const image = product.variants?.[0]?.files?.find((f: any) => f.type === 'preview')?.preview_url || product.variants?.[0]?.preview_url || product.thumbnail_url;

                    // Simple logic to determine "colors" count based on variants
                    const colorCount = new Set(product.variants.map((v: any) => v.color)).size;

                    return (
                        <div key={product.id} className="group relative">
                            <div className="aspect-[1/1] w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-80 relative">
                                {image ? (
                                    <Image
                                        src={image}
                                        alt={product.name}
                                        fill
                                        className="object-cover object-center lg:h-full lg:w-full"
                                        sizes="(max-width: 768px) 100vw, 25vw"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-gray-400">No Image</div>
                                )}
                            </div>
                            <div className="mt-4 flex justify-between">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700">
                                        <Link href={getProductUrl(product)}>
                                            <span aria-hidden="true" className="absolute inset-0" />
                                            {product.name}
                                        </Link>
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">{colorCount > 1 ? `${colorCount} colors` : 'Single color'}</p>
                                </div>
                                <p className="text-sm font-medium text-gray-900">{formatPrice(price, currency)}</p>
                            </div>
                            {/* Optional: Add to cart button overlay on desktop could go here */}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/**
 * Border Grid Layout
 * Clean grid with borders separating items
 */
export function CollectionBorderGrid({ title, products, categorySlug }: CollectionTemplateProps) {
    if (products.length === 0) return null;
    const displayProducts = products.slice(0, 8); // Allows up to 8 items

    return (
        <div className="mb-20 border-t border-gray-200">
            <div className="py-8 text-center">
                <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                <Link href={`/products?category=${encodeURIComponent(categorySlug)}`} className="mt-2 block text-sm text-gray-500 hover:text-gray-900">
                    See everything in this collection
                </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 border-l border-b border-gray-200">
                {displayProducts.map((product) => {
                    const price = product.variants?.[0]?.retail_price || 0;
                    const currency = product.variants?.[0]?.currency || 'USD';
                    const image = product.variants?.[0]?.files?.find((f: any) => f.type === 'preview')?.preview_url || product.thumbnail_url;

                    return (
                        <Link
                            key={product.id}
                            href={getProductUrl(product)}
                            className="group relative border-r border-t border-gray-200 p-4 sm:p-6 hover:bg-gray-50 transition"
                        >
                            <div className="aspect-[1/1] overflow-hidden rounded-lg bg-gray-100 group-hover:opacity-75 relative">
                                {image && (
                                    <Image
                                        src={image}
                                        alt={product.name}
                                        fill
                                        className="object-contain object-center"
                                        sizes="(max-width: 768px) 50vw, 25vw"
                                    />
                                )}
                            </div>
                            <div className="pt-4 text-center">
                                <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</h3>
                                <div className="mt-2 flex flex-col items-center gap-1">
                                    <p className="text-sm text-gray-500">{formatPrice(price, currency)}</p>
                                    <div className="flex text-yellow-400 text-xs">
                                        {[...Array(5)].map((_, i) => <span key={i}>★</span>)}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
