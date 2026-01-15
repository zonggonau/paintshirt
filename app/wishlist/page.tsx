"use client";

import ProductGrid from "../../src/components/ProductGrid";
import useWishlistState from "../../src/hooks/useWishlistState";
import Link from "next/link";

export default function WishlistPage() {
    const wishlistState = useWishlistState();
    const items = wishlistState?.items || [];

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                        My Wishlist
                    </h1>
                    <p className="text-lg text-gray-600">
                        {items.length > 0
                            ? `You have ${items.length} item${items.length > 1 ? "s" : ""} saved in your wishlist`
                            : "Your wishlist is empty"}
                    </p>
                </div>

                {/* Products or Empty State */}
                {items.length > 0 ? (
                    <ProductGrid products={items} />
                ) : (
                    <div className="text-center py-16">
                        <div className="max-w-md mx-auto">
                            <svg
                                className="w-24 h-24 mx-auto text-gray-300 mb-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                            </svg>
                            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                                Your wishlist is empty
                            </h3>
                            <p className="text-gray-600 mb-8">
                                Start adding products you love to your wishlist!
                            </p>
                            <Link href="/">
                                <button className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition shadow-lg">
                                    Browse Products
                                </button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
