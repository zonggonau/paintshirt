"use client";

import Link from "next/link";
import Image from "next/image";

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

    const activeVariantFile = (product.thumbnail_url ? { preview_url: product.thumbnail_url } : null)
        || activeVariant.files?.find(({ type }: any) => type === "preview")
        || (activeVariant.preview_url ? { preview_url: activeVariant.preview_url } : null)
        || (activeVariant.product?.image ? { preview_url: activeVariant.product.image } : null);

    if (!activeVariant) {
        return null; // Or some fallback UI
    }

    const price = typeof activeVariant.retail_price === 'number' ? activeVariant.retail_price : Number(activeVariant.retail_price);
    const formattedPrice = isNaN(price) ? "Price N/A" : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: activeVariant.currency || "USD",
    }).format(price);

    const addToWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addItem(product);
    };

    const onWishlist = isSaved(id);

    const truncatedName = name.length > 50 ? name.substring(0, 50) + "..." : name;
    const slug = slugify(name);

    // Construct new URL: /products/categories/[catId]/[catSlug]/[prodId]/[prodSlug]
    const catId = product.category?.id || "uncategorized";
    const catSlug = slugify(product.category?.name || "all");
    const productUrl = `/products/categories/${catId}/${catSlug}/${id}/${slug}`;

    return (
        <Link href={productUrl}>
            <article className="group relative bg-white rounded-2xl overflow-hidden hover-lift shadow-sm hover:shadow-xl transition-all duration-300 animate-scale-in cursor-pointer h-full flex flex-col border border-gray-100">
                <button
                    onClick={addToWishlist}
                    aria-label="Add to wishlist"
                    className="absolute top-3 right-3 z-10 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-md group/wishlist"
                >
                    {onWishlist ? (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="w-4 h-4 text-pink-500 animate-pulse"
                            fill="currentColor"
                        >
                            <path d="M12.001 4.529c2.349-2.109 5.979-2.039 8.242.228 2.262 2.268 2.34 5.88.236 8.236l-8.48 8.492-8.478-8.492c-2.104-2.356-2.025-5.974.236-8.236 2.265-2.264 5.888-2.34 8.244-.228z" />
                        </svg>
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="w-4 h-4 text-gray-600 group-hover/wishlist:text-pink-500 transition"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M12.001 4.529c2.349-2.109 5.979-2.039 8.242.228 2.262 2.268 2.34 5.88.236 8.236l-8.48 8.492-8.478-8.492c-2.104-2.356-2.025-5.974.236-8.236 2.265-2.264 5.888-2.34 8.244-.228z" />
                        </svg>
                    )}
                </button>

                {/* Product Image */}
                <div className="relative w-full aspect-square bg-gray-50 overflow-hidden flex-shrink-0">
                    {activeVariantFile ? (
                        <Image
                            src={activeVariantFile.preview_url}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                            alt={`${activeVariant.name} ${name}`}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    )}

                    {/* Gradient Overlay on Hover */}
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    {/* Quick View Badge */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 transform opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                        <span className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-bold text-gray-900 shadow-xl uppercase tracking-wider">
                            View Details
                        </span>
                    </div>
                </div>

                {/* Product Info */}
                <div className="p-4 flex flex-col flex-grow">
                    <div className="mb-auto">
                        <h3 className="font-medium text-gray-800 line-clamp-2 text-xs md:text-sm h-8 md:h-10 mb-2 leading-tight group-hover:text-indigo-600 transition-colors" title={name}>
                            {name}
                        </h3>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-50 mt-2">
                        <p className="text-sm md:text-base font-bold text-gray-900">
                            {formattedPrice}
                        </p>
                        {variants.length > 1 && (
                            <span className="text-[10px] text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100 flex-shrink-0">
                                {variants.length} variants available
                            </span>
                        )}
                    </div>
                </div>
            </article>
        </Link>
    );
};

export default Product;
