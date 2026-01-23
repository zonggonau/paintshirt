import Link from 'next/link';
import { PrintfulCategory } from '../types';

interface BrandsSectionProps {
    brands: any[];
}

const slugify = (text: string) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w-]+/g, '')   // Remove all non-word chars
        .replace(/--+/g, '-');    // Replace multiple - with single -
};

/**
 * All Brands Section Component
 * Displays brand logos in a grid layout
 */
export default function BrandsSection({ brands }: BrandsSectionProps) {
    if (brands.length === 0) {
        return null;
    }

    return (
        <div className="bg-gray-50 py-12 md:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                        Shop by Brand
                    </h2>
                    <p className="text-gray-600">
                        Premium brands from around the world
                    </p>
                </div>

                {/* Brands Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {brands.map((brand) => {
                        const brandId = brand.printfulId || brand.id;
                        const brandName = brand.title || brand.name;
                        const brandImg = brand.imageUrl || brand.image_url;

                        return (
                            <Link
                                key={brand.id}
                                href={`/products/categories/${brandId}/${slugify(brandName)}`}
                                className="group bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center aspect-square"
                            >
                                {brandImg ? (
                                    <div className="relative w-full h-full flex items-center justify-center">
                                        <img
                                            src={brandImg}
                                            alt={brandName}
                                            className="max-w-full max-h-full object-contain opacity-70 group-hover:opacity-100 transition-opacity"
                                        />
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <span className="text-sm font-semibold text-gray-700 group-hover:text-indigo-600 transition">
                                            {brandName}
                                        </span>
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* View All Brands Link */}
                <div className="text-center mt-8">
                    <Link
                        href="/products"
                        className="inline-flex items-center px-6 py-3 bg-white border-2 border-indigo-600 text-indigo-600 font-semibold rounded-full hover:bg-indigo-50 transition transform hover:scale-105 shadow-sm"
                    >
                        View All Collections
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    );
}
