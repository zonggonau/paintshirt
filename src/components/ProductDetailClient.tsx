"use client";

import { useState, useMemo, useEffect } from "react";
import useWishlistDispatch from "../hooks/useWishlistDispatch";
import useWishlistState from "../hooks/useWishlistState";
import { PrintfulProduct } from "../types";
import { trackEvent } from "./GoogleAnalytics";

export default function ProductDetailClient({ product }: { product: PrintfulProduct }) {
    const wishlistDispatch = useWishlistDispatch();
    const wishlistState = useWishlistState();

    const { addItem } = wishlistDispatch || {};
    const { isSaved } = wishlistState || {};

    const { id, name, variants } = product;
    const [firstVariant] = variants;

    const [activeVariantExternalId, setActiveVariantExternalId] = useState(
        firstVariant.external_id
    );

    // Extract unique sizes and colors - must be before early return
    const uniqueSizes = useMemo(() => {
        const sizes = variants
            .map((v) => v.size)
            .filter((s): s is string => !!s)
            .filter((v, i, arr) => arr.indexOf(v) === i);
        return sizes;
    }, [variants]);

    const uniqueColors = useMemo(() => {
        const colors = variants
            .map((v) => v.color)
            .filter((c): c is string => !!c)
            .filter((v, i, arr) => arr.indexOf(v) === i);
        return colors;
    }, [variants]);

    const activeVariant = variants.find(
        (v) => v.external_id === activeVariantExternalId
    );

    const [selectedSize, setSelectedSize] = useState(activeVariant?.size || "");
    const [selectedColor, setSelectedColor] = useState(activeVariant?.color || "");

    // Track Snipcart add to cart events with Google Analytics
    useEffect(() => {
        if (!activeVariant) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handleAddToCart = (event: any) => {
            const item = event.detail?.item;
            if (item && item.id === activeVariantExternalId) {
                trackEvent('add_to_cart', {
                    currency: activeVariant.currency,
                    value: activeVariant.retail_price,
                    items: [{
                        item_id: activeVariantExternalId,
                        item_name: name,
                        item_variant: activeVariant.name,
                        price: activeVariant.retail_price,
                        quantity: 1
                    }]
                });
            }
        };

        // Listen to Snipcart cart events
        document.addEventListener('snipcart.ready', () => {
            if (window.Snipcart) {
                window.Snipcart.events.on('item.added', handleAddToCart);
            }
        });

        return () => {
            if (window.Snipcart) {
                window.Snipcart.events.off('item.added', handleAddToCart);
            }
        };
    }, [activeVariantExternalId, activeVariant, name]);

    // Early return AFTER all hooks
    if (!activeVariant) return null;

    const activeVariantFile = activeVariant.files.find(
        ({ type }) => type === "preview"
    );

    const formattedPrice = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: activeVariant.currency,
    }).format(activeVariant.retail_price);

    const addToWishlist = () => addItem?.(product);
    const onWishlist = isSaved?.(id) || false;

    const handleSizeChange = (size: string) => {
        setSelectedSize(size);
        const variant =
            variants.find((v) => v.size === size && v.color === selectedColor) ||
            variants.find((v) => v.size === size);

        if (variant) {
            setActiveVariantExternalId(variant.external_id);
            setSelectedColor(variant.color || "");
            // Emit event for image component
            window.dispatchEvent(new CustomEvent('variantChanged', {
                detail: { variantId: variant.external_id }
            }));
        }
    };

    const handleColorChange = (color: string) => {
        setSelectedColor(color);
        const variant =
            variants.find((v) => v.color === color && v.size === selectedSize) ||
            variants.find((v) => v.color === color);

        if (variant) {
            setActiveVariantExternalId(variant.external_id);
            setSelectedSize(variant.size || "");
            // Emit event for image component
            window.dispatchEvent(new CustomEvent('variantChanged', {
                detail: { variantId: variant.external_id }
            }));
        }
    };

    return (
        <div className="flex flex-col space-y-6">
            {/* Product Title & Price */}
            <div>
                <div className="flex items-start justify-between mb-2">
                    <h1 className="text-2xl lg:text-4xl font-bold text-gray-900">{name}</h1>
                    <button
                        onClick={addToWishlist}
                        className="p-3 rounded-full bg-gray-100 hover:bg-pink-50 transition group"
                        aria-label="Add to wishlist"
                    >
                        {onWishlist ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                className="w-6 h-6 text-pink-500"
                                fill="currentColor"
                            >
                                <path d="M12.001 4.529c2.349-2.109 5.979-2.039 8.242.228 2.262 2.268 2.34 5.88.236 8.236l-8.48 8.492-8.478-8.492c-2.104-2.356-2.025-5.974.236-8.236 2.265-2.264 5.888-2.34 8.244-.228z" />
                            </svg>
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                className="w-6 h-6 text-gray-600 group-hover:text-pink-500 transition"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M12.001 4.529c2.349-2.109 5.979-2.039 8.242.228 2.262 2.268 2.34 5.88.236 8.236l-8.48 8.492-8.478-8.492c-2.104-2.356-2.025-5.974.236-8.236 2.265-2.264 5.888-2.34 8.244-.228z" />
                            </svg>
                        )}
                    </button>
                    <button
                        onClick={() => {
                            if (navigator.share) {
                                navigator.share({
                                    title: name,
                                    text: `Check out ${name}`,
                                    url: window.location.href,
                                });
                            } else {
                                navigator.clipboard.writeText(window.location.href);
                                alert("Link copied to clipboard!");
                            }
                        }}
                        className="p-3 rounded-full bg-gray-100 hover:bg-indigo-50 transition group ml-2"
                        aria-label="Share product"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-6 h-6 text-gray-600 group-hover:text-indigo-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                            />
                        </svg>
                    </button>
                </div>

                <div className="flex items-baseline space-x-3 mb-4">
                    <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        {formattedPrice}
                    </p>
                    {variants.length > 1 && (
                        <span className="text-sm text-gray-500">
                            {variants.length} variants available
                        </span>
                    )}
                </div>

                <div className="flex items-center space-x-2 mb-6">
                    <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                            <svg
                                key={i}
                                className="w-5 h-5 text-yellow-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        ))}
                    </div>
                    <span className="text-sm text-gray-600">(4.9 rating)</span>
                </div>
            </div>

            {/* Variant Selection */}
            <div className="space-y-4 border-t border-b border-gray-200 py-6">
                {/* Color Selector */}
                {uniqueColors.length > 0 && (
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">
                            Color: <span className="text-indigo-600">{selectedColor}</span>
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {uniqueColors.map((color: string) => (
                                <button
                                    key={color}
                                    onClick={() => handleColorChange(color)}
                                    className={`px-4 py-3 border-2 rounded-lg text-sm font-medium transition ${selectedColor === color
                                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                                        }`}
                                >
                                    {color}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Size Selector */}
                {uniqueSizes.length > 0 && (
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">
                            Size: <span className="text-indigo-600">{selectedSize}</span>
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {uniqueSizes.map((size: string) => (
                                <button
                                    key={size}
                                    onClick={() => handleSizeChange(size)}
                                    className={`px-4 py-3 border-2 rounded-lg text-sm font-bold transition ${selectedSize === size
                                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                                        }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Add to Cart Button */}
            <div className="space-y-3">
                <button
                    className="snipcart-add-item w-full flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                    data-item-id={activeVariantExternalId}
                    data-item-price={activeVariant.retail_price}
                    data-item-url={`/api/products/${activeVariantExternalId}`}
                    data-item-description={activeVariant.name}
                    data-item-image={activeVariantFile?.preview_url || ""}
                    data-item-name={name}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                    </svg>
                    <span>Add to Cart</span>
                </button>

                <button
                    onClick={addToWishlist}
                    className="w-full flex items-center justify-center gap-2 py-3 px-6 border-2 border-gray-300 hover:border-pink-500 text-gray-700 hover:text-pink-500 font-semibold rounded-xl transition-all"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        fill={onWishlist ? "currentColor" : "none"}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                    </svg>
                    {onWishlist ? "Saved to Wishlist" : "Add to Wishlist"}
                </button>

                {/* Payment Methods */}
                <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 text-center">
                        Secure Payment
                    </p>
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                        {/* Visa */}
                        <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 hover:border-gray-300 transition">
                            <svg className="h-6 w-auto" viewBox="0 0 48 16" fill="none">
                                <path d="M19.6 1.3l-5.9 13.4h-3.8L7.2 3.9c-.2-.7-.3-1-.9-1.3C5.5 2.2 4.1 1.8 2.9 1.5l.1-.2h6.5c.8 0 1.6.6 1.7 1.5l1.6 8.4 3.9-9.9h3.8zm15 9c0-3.5-4.9-3.7-4.8-5.3 0-.5.5-1 1.5-1.1.5-.1 1.9-.1 3.5.6l.6-2.9c-.8-.3-2-.6-3.3-.6-3.5 0-6 1.9-6 4.5 0 2 1.8 3.1 3.1 3.7 1.4.7 1.8 1.1 1.8 1.7 0 .9-1.1 1.3-2.1 1.3-1.8 0-2.7-.5-3.5-.8l-.6 3c.8.4 2.3.7 3.8.7 3.7.2 6.1-1.7 6.1-4.5v-.3zM45.1 14.7h3.3L45.8 1.3h-3c-.7 0-1.3.4-1.6 1l-5.5 12.4h3.7l.7-2h4.6l.4 2zm-4-4.8l1.9-5.3.9 5.3h-2.8zm-14.8-8.6l-2.9 13.4h-3.6L22.7 1.3h3.6z" fill="#1434CB" />
                            </svg>
                        </div>

                        {/* Mastercard */}
                        <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 hover:border-gray-300 transition">
                            <svg className="h-6 w-auto" viewBox="0 0 48 32" fill="none">
                                <circle cx="18" cy="16" r="14" fill="#EB001B" />
                                <circle cx="30" cy="16" r="14" fill="#F79E1B" />
                                <path d="M24 6.5c-2.7 2.3-4.4 5.7-4.4 9.5s1.7 7.2 4.4 9.5c2.7-2.3 4.4-5.7 4.4-9.5s-1.7-7.2-4.4-9.5z" fill="#FF5F00" />
                            </svg>
                        </div>

                        {/* American Express */}
                        <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 hover:border-gray-300 transition">
                            <svg className="h-6 w-auto" viewBox="0 0 48 16" fill="none">
                                <rect width="48" height="16" rx="2" fill="#006FCF" />
                                <text x="24" y="11" fontFamily="Arial" fontSize="8" fontWeight="bold" fill="white" textAnchor="middle">AMEX</text>
                            </svg>
                        </div>

                        {/* PayPal */}
                        <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 hover:border-gray-300 transition">
                            <svg className="h-6 w-auto" viewBox="0 0 48 16" fill="none">
                                <path d="M18.5 2.5h-6c-.4 0-.8.3-.9.7l-2.6 16.5c0 .4.2.7.6.7h3.2c.4 0 .8-.3.9-.7l.7-4.5c.1-.4.5-.7.9-.7h2.1c4.3 0 6.8-2.1 7.4-6.2.3-1.8 0-3.2-.8-4.2-1-1.1-2.7-1.6-5-1.6zm.8 6.1c-.4 2.3-2.3 2.3-4.1 2.3h-1l.7-4.5c0-.2.3-.4.5-.4h.5c1.2 0 2.3 0 2.9.7.3.4.4 1 .3 1.9z" fill="#003087" />
                                <path d="M37.5 2.5h-6c-.4 0-.8.3-.9.7l-2.6 16.5c0 .4.2.7.6.7h2.9c.3 0 .5-.2.6-.5l.7-4.7c.1-.4.5-.7.9-.7h2.1c4.3 0 6.8-2.1 7.4-6.2.3-1.8 0-3.2-.8-4.2-1-1.1-2.7-1.6-5-1.6zm.8 6.1c-.4 2.3-2.3 2.3-4.1 2.3h-1l.7-4.5c0-.2.3-.4.5-.4h.5c1.2 0 2.3 0 2.9.7.3.4.4 1 .3 1.9z" fill="#0070E0" />
                                <path d="M26.8 8.5h-3c-.3 0-.5.2-.6.4l-1.5 9.3c0 .3.2.5.4.5h2.5c.4 0 .8-.3.9-.7l.7-4.3c.1-.4.5-.7.9-.7h2.1c1.3 0 2.3-.3 3-1-.6.9-1.6 1.4-3.1 1.4h-1.3z" fill="#003087" />
                            </svg>
                        </div>

                        {/* Apple Pay */}
                        <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 hover:border-gray-300 transition">
                            <svg className="h-6 w-auto" viewBox="0 0 48 16" fill="none">
                                <path d="M9.5 2.8c.6-.7 1-1.7.9-2.7-.9 0-2 .6-2.6 1.4-.6.7-.9 1.6-.8 2.6 1 .1 2-.5 2.5-1.3zm.9 1.4c-1.4-.1-2.5.8-3.2.8-.6 0-1.7-.7-2.8-.7-1.4 0-2.7.8-3.5 2.1-1.5 2.6-.4 6.4 1.1 8.5.7 1 1.6 2.2 2.7 2.2 1.1 0 1.5-.7 2.8-.7s1.7.7 2.8.7c1.2 0 1.9-1.1 2.6-2.1.8-1.2 1.1-2.3 1.1-2.4 0 0-2.2-.8-2.2-3.3 0-2.1 1.7-3.1 1.8-3.2-1-1.5-2.6-1.7-3.2-1.9z" fill="black" />
                                <text x="24" y="11" fontFamily="Arial" fontSize="7" fill="black">Pay</text>
                            </svg>
                        </div>

                        {/* Google Pay */}
                        <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 hover:border-gray-300 transition">
                            <svg className="h-6 w-auto" viewBox="0 0 48 16" fill="none">
                                <path d="M23.7 8.5v4.7h-1.5V2h4c1 0 1.9.3 2.5.9.7.6 1 1.4 1 2.4s-.3 1.7-1 2.3c-.7.6-1.6.9-2.5.9h-2.5zm0-5.2v3.7h2.6c.6 0 1.1-.2 1.5-.6.4-.4.6-.9.6-1.5s-.2-1-.6-1.4c-.4-.4-.9-.6-1.5-.6h-2.6z" fill="#5F6368" />
                                <path d="M33.8 7.3c1.1 0 2 .3 2.6.9.6.6.9 1.4.9 2.5v4.5h-1.4v-1h-.1c-.6.8-1.3 1.2-2.3 1.2-1 0-1.8-.3-2.3-.8-.6-.5-.8-1.2-.8-1.9 0-.8.3-1.5.9-2 .6-.5 1.4-.7 2.4-.7.8 0 1.5.1 2 .4v-.3c0-.5-.2-1-.6-1.3-.4-.3-.9-.5-1.4-.5-.8 0-1.5.3-1.9 1l-1.3-.8c.7-1 1.8-1.5 3.3-1.5zm-1.7 5.5c0 .4.2.7.5.9.3.2.7.4 1.1.4.6 0 1.2-.2 1.7-.7.5-.4.8-1 .8-1.6-.4-.3-1.1-.5-1.9-.5-.6 0-1.1.1-1.5.4-.4.3-.7.6-.7 1.1z" fill="#5F6368" />
                                <path d="M45.7 7.5l-5.3 12.3h-1.5l2-4.3-3.5-8h1.6l2.6 6.2h0l2.5-6.2h1.6z" fill="#5F6368" />
                                <path d="M15.3 8c-.2.2-.3.5-.3.8s.1.6.3.8c.2.2.5.3.8.3.3 0 .6-.1.8-.3.2-.2.3-.5.3-.8s-.1-.6-.3-.8c-.2-.2-.5-.3-.8-.3-.3 0-.6.1-.8.3z" fill="#4285F4" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Info */}
            <div className="bg-gray-50 rounded-xl p-6 space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    In stock and ready to ship
                </div>
                <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Ships within 2-7 business days
                </div>
                <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Secure payment processing
                </div>
            </div>

            {/* Description */}
            {product.description && (
                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Description</h3>
                    <div className="prose prose-sm text-gray-600 leading-relaxed">
                        <div dangerouslySetInnerHTML={{ __html: product.description }} />
                    </div>
                </div>
            )}
        </div>
    );
}
