"use client";

import { useState, useMemo, useEffect } from "react";
import { PrintfulProduct } from "../types";
import { getCategoryFromProduct } from "../lib/product-category";
import Product from "./Product";
import SearchBar from "./SearchBar";
import ProductFilter from "./ProductFilter";

interface ProductGridProps {
    products: PrintfulProduct[];
    hideFilters?: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, hideFilters = false }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [sortOption, setSortOption] = useState("");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 20;

    // Helper to get minimum price
    const getProductPrice = (product: PrintfulProduct) => {
        if (!product.variants || product.variants.length === 0) return 0;
        return Math.min(...product.variants.map(v => v.retail_price));
    };

    // Filter products
    const filteredProducts = useMemo(() => {
        let result = products.filter((product) => {
            const matchesSearch = product.name
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

            const matchesCategory = selectedCategory
                ? getCategoryFromProduct(product) === selectedCategory
                : true;

            return matchesSearch && matchesCategory;
        });

        // Apply sorting
        if (sortOption) {
            result = [...result].sort((a, b) => {
                switch (sortOption) {
                    case "name-asc":
                        return a.name.localeCompare(b.name);
                    case "name-desc":
                        return b.name.localeCompare(a.name);
                    case "price-asc":
                        return getProductPrice(a) - getProductPrice(b);
                    case "price-desc":
                        return getProductPrice(b) - getProductPrice(a);
                    default:
                        return 0;
                }
            });
        }

        return result;
    }, [products, searchQuery, selectedCategory, sortOption]);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedCategory, sortOption]);

    // Pagination Logic
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const clearFilters = () => {
        setSearchQuery("");
        setSelectedCategory("");
        setSortOption("");
    };

    const hasActiveFilters = selectedCategory || searchQuery || sortOption;

    return (
        <div>
            {/* Search Bar with Filter Toggle */}
            {!hideFilters && (
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
                                selectedCategory={selectedCategory}
                                sortOption={sortOption}
                                onCategoryChange={setSelectedCategory}
                                onSortChange={setSortOption}
                                onClearFilters={clearFilters}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Results Count */}
            {!hideFilters && hasActiveFilters && (
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
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {currentProducts.map((product) => (
                            <Product key={product.id} {...product} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center mt-12 space-x-2">
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`px-4 py-2 border rounded-lg transition ${currentPage === 1
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                                    }`}
                            >
                                Previous
                            </button>

                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => paginate(i + 1)}
                                    className={`w-10 h-10 border rounded-lg font-medium transition ${currentPage === i + 1
                                        ? "bg-indigo-600 text-white border-indigo-600"
                                        : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`px-4 py-2 border rounded-lg transition ${currentPage === totalPages
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                                    }`}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
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
