"use client";

import { useMemo } from "react";
import { PrintfulProduct } from "../types";
import { getCategoryFromProduct } from "../lib/product-category";

interface ProductFilterProps {
    products: PrintfulProduct[];
    selectedCategory: string;
    sortOption: string;
    onCategoryChange: (category: string) => void;
    onSortChange: (sort: string) => void;
    onClearFilters: () => void;
}

const ProductFilter = ({
    products,
    selectedCategory,
    sortOption,
    onCategoryChange,
    onSortChange,
    onClearFilters,
}: ProductFilterProps) => {
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

    const hasActiveFilters = selectedCategory || sortOption;

    return (
        <div className="mb-8 bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full"></div>
                    <h3 className="text-lg font-bold text-gray-900">Filters & Sort</h3>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Category Filter */}
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

                {/* Sort Option */}
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                        Sort By
                    </label>
                    <select
                        value={sortOption}
                        onChange={(e) => onSortChange(e.target.value)}
                        className="w-full text-sm px-3 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white hover:border-gray-300 transition cursor-pointer"
                    >
                        <option value="">Default</option>
                        <option value="name-asc">Name (A-Z)</option>
                        <option value="name-desc">Name (Z-A)</option>
                        <option value="price-asc">Price (Low to High)</option>
                        <option value="price-desc">Price (High to Low)</option>
                    </select>
                </div>

                {/* Results Count */}
                <div className="flex items-end">
                    <div className="w-full px-2 py-2 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border-indigo-100 flex items-center gap-2">
                        <div className="text-sm font-semibold text-gray-600">Results :</div>
                        <div className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            {products.length}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductFilter;
