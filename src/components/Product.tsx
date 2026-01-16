"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import useWishlistDispatch from "../hooks/useWishlistDispatch";
import useWishlistState from "../hooks/useWishlistState";

import { slugify } from "../lib/slugify";

const Product = (product: any) => {
    const wishlistDispatch = useWishlistDispatch();
    const wishlistState = useWishlistState();

    if (!wishlistDispatch || !wishlistState) {
        return null;
    }

    const { addItem } = wishlistDispatch;
    const { isSaved } = wishlistState;

    const { id, name, variants } = product;
    const [firstVariant] = variants;

    const activeVariant = firstVariant;

    const activeVariantFile = activeVariant.files.find(
        ({ type }: any) => type === "preview"
    );

    const formattedPrice = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: activeVariant.currency,
    }).format(activeVariant.retail_price);

    const addToWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addItem(product);
    };

    const onWishlist = isSaved(id);

    const truncatedName = name.length > 15 ? name.substring(0, 15) + "..." : name;
    const slug = slugify(name);

    return (
        <Link href={`/products/${id}/${slug}`}>
            <article className="group relative bg-white rounded-2xl overflow-hidden hover-lift shadow-md hover:shadow-2xl transition-all duration-300 animate-scale-in cursor-pointer">
                <button
                    onClick={addToWishlist}
                    aria-label="Add to wishlist"
                    className="absolute top-4 right-4 z-1 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg group/wishlist"
                >
                    {onWishlist ? (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="w-5 h-5 text-pink-500 animate-pulse"
                            fill="currentColor"
                        >
                            <path d="M12.001 4.529c2.349-2.109 5.979-2.039 8.242.228 2.262 2.268 2.34 5.88.236 8.236l-8.48 8.492-8.478-8.492c-2.104-2.356-2.025-5.974.236-8.236 2.265-2.264 5.888-2.34 8.244-.228z" />
                        </svg>
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="w-5 h-5 text-gray-600 group-hover/wishlist:text-pink-500 transition"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M12.001 4.529c2.349-2.109 5.979-2.039 8.242.228 2.262 2.268 2.34 5.88.236 8.236l-8.48 8.492-8.478-8.492c-2.104-2.356-2.025-5.974.236-8.236 2.265-2.264 5.888-2.34 8.244-.228z" />
                        </svg>
                    )}
                </button>

                {/* Product Image */}
                <div className="relative w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    {activeVariantFile && (
                        <Image
                            src={activeVariantFile.preview_url}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            style={{ objectFit: "cover" }}
                            alt={`${activeVariant.name} ${name}`}
                            title={`${activeVariant.name} ${name}`}
                            className="group-hover:scale-110 transition-transform duration-500"
                        />
                    )}

                    {/* Gradient Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    {/* Quick View Badge */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full text-sm font-semibold text-gray-900 shadow-lg">
                            Quick View
                        </span>
                    </div>
                </div>

                {/* Product Info */}
                <div className="p-5">
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm md:text-lg hover:text-indigo-600 transition" title={name}>
                        {truncatedName}
                    </h3>

                    <div className="flex items-center justify-between">
                        <p className="text-lg md:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            {formattedPrice}
                        </p>
                        {variants.length > 1 && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                {variants.length} options
                            </span>
                        )}
                    </div>
                </div>
            </article>
        </Link>
    );
};

export default Product;
