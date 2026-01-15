"use client";

import { useState, useMemo } from "react";
import { PrintfulProduct } from "../types";
import Product from "./Product";
import SearchBar from "./SearchBar";
import ProductFilter from "./ProductFilter";

interface ProductGridProps {
    products: PrintfulProduct[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Filter products
    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const matchesSearch = product.name
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

            const matchesColor = selectedColor
                ? product.variants.some((v) => v.color === selectedColor)
                : true;

            const matchesSize = selectedSize
                ? product.variants.some((v) => v.size === selectedSize)
                : true;

            const matchesCategory = selectedCategory
                ? product.name.toLowerCase().includes(selectedCategory.toLowerCase())
                : true;

            return matchesSearch && matchesColor && matchesSize && matchesCategory;
        });
    }, [products, searchQuery, selectedColor, selectedSize, selectedCategory]);

    const clearFilters = () => {
        setSearchQuery("");
        setSelectedColor("");
        setSelectedSize("");
        setSelectedCategory("");
    };

    const hasActiveFilters = selectedColor || selectedSize || selectedCategory || searchQuery;

    return (
        <div>
            {/* Search Bar with Filter Toggle */}
            <div className="mb-6">
                <div className="flex items-center gap-3">
                    {/* Search Bar */}
                    <div className="flex-1">
                        <SearchBar
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Search products..."
                        />
                    </div>

                    {/* Search Icon Button */}
                    <button
                        className="flex-shrink-0 p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition"
                        aria-label="Search"
                    >
                        <svg
                            className="w-6 h-6 text-gray-700"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </button>

                    {/* Filter Toggle Button */}
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`flex-shrink-0 flex items-center gap-2 px-6 py-4 border-2 rounded-xl font-semibold transition ${isFilterOpen || hasActiveFilters
                                ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                            }`}
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                            />
                        </svg>
                        <span className="hidden sm:inline">Filter</span>
                        {hasActiveFilters && (
                            <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></span>
                        )}
                    </button>
                </div>

                {/* Collapsible Filter Section */}
                {isFilterOpen && (
                    <div className="mt-4 animate-fade-in">
                        <ProductFilter
                            products={products}
                            selectedColor={selectedColor}
                            selectedSize={selectedSize}
                            selectedCategory={selectedCategory}
                            onColorChange={setSelectedColor}
                            onSizeChange={setSelectedSize}
                            onCategoryChange={setSelectedCategory}
                            onClearFilters={clearFilters}
                        />
                    </div>
                )}
            </div>

            {/* Results Count */}
            {hasActiveFilters && (
                <div className="mb-6 flex items-center justify-between">
                    <p className="text-gray-600">
                        Showing <span className="font-semibold text-indigo-600">{filteredProducts.length}</span> of{" "}
                        <span className="font-semibold">{products.length}</span> products
                    </p>
                    <button
                        onClick={clearFilters}
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Clear all filters
                    </button>
                </div>
            )}

            {/* Product Grid */}
            {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                        <Product key={product.id} {...product} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                        <svg
                            className="w-10 h-10 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-600 mb-4">
                        Try adjusting your search or filters to find what you're looking for.
                    </p>
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition"
                        >
                            Clear all filters
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProductGrid;
