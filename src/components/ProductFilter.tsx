"use client";

import { useMemo } from "react";
import { PrintfulProduct } from "../types";
import { getCategoryFromProduct } from "../lib/product-category";

interface ProductFilterProps {
    products: PrintfulProduct[];
    selectedColor: string;
    selectedSize: string;
    selectedCategory: string;
    onColorChange: (color: string) => void;
    onSizeChange: (size: string) => void;
    onCategoryChange: (category: string) => void;
    onClearFilters: () => void;
}

const ProductFilter = ({
    products,
    selectedColor,
    selectedSize,
    selectedCategory,
    onColorChange,
    onSizeChange,
    onCategoryChange,
    onClearFilters,
}: ProductFilterProps) => {
    // Extract unique colors from all product variants
    const availableColors = useMemo(() => {
        const colors = new Set<string>();
        products.forEach((product) => {
            product.variants.forEach((variant) => {
                if (variant.color) {
                    colors.add(variant.color);
                }
            });
        });
        return Array.from(colors).sort();
    }, [products]);

    // Extract unique sizes from all product variants
    const availableSizes = useMemo(() => {
        const sizes = new Set<string>();
        products.forEach((product) => {
            product.variants.forEach((variant) => {
                if (variant.size) {
                    sizes.add(variant.size);
                }
            });
        });
        // Sort sizes in logical order
        const sizeOrder = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"];
        return Array.from(sizes).sort((a, b) => {
            const indexA = sizeOrder.indexOf(a);
            const indexB = sizeOrder.indexOf(b);
            if (indexA === -1 && indexB === -1) return a.localeCompare(b);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });
    }, [products]);

    // Extract product categories/types
    const availableCategories = useMemo(() => {
        const categories = new Set<string>();
        products.forEach((product) => {
            categories.add(getCategoryFromProduct(product));
        });

        // Remove "Other" if it exists and sort, then append Other at end if needed
        const catArray = Array.from(categories);
        const hasOther = catArray.includes("Other");
        const sorted = catArray.filter(c => c !== "Other").sort();

        if (hasOther) {
            sorted.push("Other");
        }

        return sorted;
    }, [products]);

    const hasActiveFilters = selectedColor || selectedSize || selectedCategory;

    return (
        <div className="mb-8 bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full"></div>
                    <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                    {hasActiveFilters && (
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
                            Active
                        </span>
                    )}
                </div>
                {hasActiveFilters && (
                    <button
                        onClick={onClearFilters}
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 transition hover:underline"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Clear All
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category Filter */}
                {availableCategories.length > 0 && (
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                            Category
                        </label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => onCategoryChange(e.target.value)}
                            className="w-full text-sm px-3 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white hover:border-gray-300 transition cursor-pointer"
                        >
                            <option value="">All Categories</option>
                            {availableCategories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Color Filter */}
                {availableColors.length > 0 && (
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                            Color
                        </label>
                        <select
                            value={selectedColor}
                            onChange={(e) => onColorChange(e.target.value)}
                            className="w-full text-sm px-3 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white hover:border-gray-300 transition cursor-pointer"
                        >
                            <option value="">All Colors</option>
                            {availableColors.map((color) => (
                                <option key={color} value={color}>
                                    {color}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Size Filter */}
                {availableSizes.length > 0 && (
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                            Size
                        </label>
                        <select
                            value={selectedSize}
                            onChange={(e) => onSizeChange(e.target.value)}
                            className="w-full text-sm px-3 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white hover:border-gray-300 transition cursor-pointer"
                        >
                            <option value="">All Sizes</option>
                            {availableSizes.map((size) => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Results Count */}
                <div className="flex items-end">
                    <div className="w-full px-4 py-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-100">
                        <div className="text-xs text-gray-600 mb-1">Results</div>
                        <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            {products.length}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductFilter;
