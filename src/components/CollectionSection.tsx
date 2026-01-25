import Link from 'next/link';
import Image from 'next/image';
import { PrintfulProduct } from '../types';

interface CollectionSectionProps {
    title: string;
    description?: string;
    products: PrintfulProduct[];
    categorySlug: string;
}

/**
 * Collection Section Component
 * Displays a collection with up to 3 products
 */
export default function CollectionSection({
    title,
    description,
    products,
    categorySlug
}: CollectionSectionProps) {
    const displayProducts = products.slice(0, 3);

    if (displayProducts.length === 0) {
        return null; // Don't render empty collections
    }

    return (
        <div className="mb-16">
            {/* Collection Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                        {title}
                    </h3>
                    {description && (
                        <p className="text-gray-600">{description}</p>
                    )}
                </div>
                <Link
                    href={`/products?category=${encodeURIComponent(title)}`}
                    className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 group"
                >
                    View All
                    <svg
                        className="w-5 h-5 transition-transform group-hover:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayProducts.map((product) => {
                    const previewImage = product.variants?.[0]?.files?.find(
                        (f: any) => f.type === 'preview'
                    )?.preview_url || product.variants?.[0]?.preview_url || product.thumbnail_url;

                    const minPrice = product.variants && product.variants.length > 0
                        ? Math.min(...product.variants.map((v: any) => parseFloat(v.retail_price)))
                        : 0;

                    // Create slug from product name
                    const slug = product.name
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)/g, '');

                    return (
                        <Link
                            key={product.id}
                            href={`/products/${product.id}/${slug}`}
                            className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                        >
                            {/* Product Image */}
                            <div className="relative aspect-square overflow-hidden bg-gray-100">
                                {previewImage ? (
                                    <Image
                                        src={previewImage}
                                        alt={product.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        No image
                                    </div>
                                )}

                                {/* Price Badge */}
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-md">
                                    <span className="text-sm font-bold text-indigo-600">
                                        ${minPrice.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="p-4">
                                <h4 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition">
                                    {product.name}
                                </h4>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
