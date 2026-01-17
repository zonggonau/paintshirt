import Link from 'next/link';
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
                    const image = product.variants?.[0]?.files?.find((f: any) => f.type === 'preview')?.preview_url;

                    return (
                        <Link key={product.id} href={`/products/${product.id}/${getProductSlug(product.name)}`} className="group relative aspect-[4/5] md:aspect-square rounded-2xl overflow-hidden block">
                            {image && (
                                <img src={image} alt={product.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
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
                    const image = product.variants?.[0]?.files?.find((f: any) => f.type === 'preview')?.preview_url;

                    return (
                        <Link key={product.id} href={`/products/${product.id}/${getProductSlug(product.name)}`} className="group block">
                            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 mb-4">
                                {image && (
                                    <img src={image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
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
                        const image = product.variants?.[0]?.files?.find((f: any) => f.type === 'preview')?.preview_url;

                        return (
                            <Link key={product.id} href={`/products/${product.id}/${getProductSlug(product.name)}`} className="min-w-[280px] md:min-w-[320px] snap-center group block bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                                <div className="aspect-[4/5] rounded-xl overflow-hidden bg-gray-100 mb-4 relative">
                                    {image && (
                                        <img src={image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
                    const image = product.variants?.[0]?.files?.find((f: any) => f.type === 'preview')?.preview_url;

                    return (
                        <Link key={product.id} href={`/products/${product.id}/${getProductSlug(product.name)}`} className="group block">
                            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-3 relative group-hover:ring-2 ring-indigo-500 transition-all">
                                {image && (
                                    <img src={image} alt={product.name} className="w-full h-full object-cover" />
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
