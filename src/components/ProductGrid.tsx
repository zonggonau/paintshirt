"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PrintfulProduct } from "../types";
import Product from "./Product";
import SearchBar from "./SearchBar";

import ProductGridSkeleton from "./ProductGridSkeleton";

interface ProductGridProps {
    products: PrintfulProduct[];
    hideFilters?: boolean;
    totalProducts?: number;
    currentPage?: number;
    categoryMap?: Record<number, string>;
}

const ProductGrid: React.FC<ProductGridProps> = ({
    products,
    hideFilters = false,
    totalProducts,
    currentPage: propPage,
    categoryMap
}) => {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOption, setSortOption] = useState("");
    const [isPaginating, setIsPaginating] = useState(false);

    // Pagination State
    const [internalPage, setInternalPage] = useState(1);
    const isServerSidePagination = totalProducts !== undefined && propPage !== undefined;
    const currentPage = isServerSidePagination ? propPage! : internalPage;
    const productsPerPage = 20;

    // Reset pagination state when page changes
    useEffect(() => {
        setIsPaginating(false);
    }, [currentPage]);

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

            return matchesSearch;
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
    }, [products, searchQuery, sortOption]);

    // Reset to first page when filters change (only for client-side)
    useEffect(() => {
        if (!isServerSidePagination) {
            setInternalPage(1);
        }
    }, [searchQuery, sortOption, isServerSidePagination]);

    // Pagination Logic
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;

    // If server-side, we accept that 'products' is already the correct slice for this page.
    const currentProducts = isServerSidePagination ? filteredProducts : filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

    const totalPages = isServerSidePagination
        ? Math.ceil(totalProducts! / productsPerPage)
        : Math.ceil(filteredProducts.length / productsPerPage);

    const paginate = (pageNumber: number) => {
        setIsPaginating(true);
        if (isServerSidePagination) {
            // Server-side: Update URL while keeping path (important for dynamic category routes)
            const currentPath = window.location.pathname;
            router.push(`${currentPath}?page=${pageNumber}`);
        } else {
            // Client-side: Update state
            setTimeout(() => {
                setInternalPage(pageNumber);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 300); // Small delay for transition feel
        }
    };

    const clearFilters = () => {
        setSearchQuery("");
        setSortOption("");
    };

    const hasActiveFilters = searchQuery || sortOption;

    return (
        <div>
            {/* Search Bar with Sort */}
            {!hideFilters && (
                <div className="mb-8 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
                    {/* Search Bar */}
                    <div className="flex-1 w-full">
                        <SearchBar
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Search products..."
                        />
                    </div>

                    {/* Sort Selector */}
                    <div className="relative w-full md:w-48">
                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            className="w-full appearance-none px-4 py-3 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition cursor-pointer font-medium"
                        >
                            <option value="">Sort by: Default</option>
                            <option value="name-asc">Name (A-Z)</option>
                            <option value="name-desc">Name (Z-A)</option>
                            <option value="price-asc">Price (Low to High)</option>
                            <option value="price-desc">Price (High to Low)</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
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
                        Clear filters
                    </button>
                </div>
            )}

            {/* Product Grid */}
            {isPaginating ? (
                <div className="mb-12">
                    <ProductGridSkeleton />
                </div>
            ) : filteredProducts.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {currentProducts.map((product) => (
                            <Product key={product.id} {...product} />
                        ))}
                    </div>

                    {/* Pagination - Only show if there are actually more products than one page */}
                    {(() => {
                        // For server-side pagination with category filter, use actual product count
                        // because API's paging.total can be inaccurate for filtered results
                        const actualTotal = isServerSidePagination ? totalProducts! : filteredProducts.length;
                        const shouldShowPagination = actualTotal > productsPerPage;

                        return shouldShowPagination && totalPages > 1 && (
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
                        );
                    })()}
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
                            Clear filters
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProductGrid;
