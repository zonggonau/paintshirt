"use client";

import { useState, useMemo, useEffect } from "react";

export default function ProductDetailImages({ product }: { product: any }) {
    const { variants } = product;
    const [firstVariant] = variants;

    const [activeVariantExternalId, setActiveVariantExternalId] = useState(
        firstVariant.external_id
    );

    const activeVariant = variants.find(
        (v: any) => v.external_id === activeVariantExternalId
    );

    const activeVariantFile = activeVariant.files?.find(({ type }: any) => type === "preview")
        || (activeVariant.preview_url ? { preview_url: activeVariant.preview_url } : null)
        || (activeVariant.product?.image ? { preview_url: activeVariant.product.image } : null)
        || (product.thumbnail_url ? { preview_url: product.thumbnail_url } : null);

    // Get all unique images from all variants
    const allImages = useMemo(() => {
        const imageMap = new Map();
        variants.forEach((variant: any) => {
            const previewUrl = variant.files?.find((f: any) => f.type === "preview")?.preview_url
                || variant.preview_url
                || variant.product?.image
                || product.thumbnail_url;

            if (previewUrl) {
                // Use URL as key to avoid duplicates
                if (!imageMap.has(previewUrl)) {
                    imageMap.set(previewUrl, {
                        url: previewUrl,
                        variantId: variant.external_id,
                        color: variant.color || "",
                        size: variant.size || "",
                    });
                }
            }
        });
        return Array.from(imageMap.values());
    }, [variants]);

    const [selectedImageUrl, setSelectedImageUrl] = useState(
        activeVariantFile?.preview_url || ""
    );

    // Zoom state
    const [isHovered, setIsHovered] = useState(false);
    const [zoomStyle, setZoomStyle] = useState({ transformOrigin: "center center", transform: "scale(1)" });


    // Carousel state
    const [startIndex, setStartIndex] = useState(0);
    const itemsToShow = 4; // Adjust based on breakpoints in real implementation if needed

    // Update selected image when active variant changes (from parent)
    useEffect(() => {
        if (activeVariantFile) {
            setSelectedImageUrl(activeVariantFile.preview_url);
        }
    }, [activeVariantFile]);

    // Listen to color/size changes from ProductDetailClient
    useEffect(() => {
        const handleVariantChange = (event: CustomEvent) => {
            setActiveVariantExternalId(event.detail.variantId);
        };

        window.addEventListener("variantChanged" as any, handleVariantChange);
        return () => {
            window.removeEventListener("variantChanged" as any, handleVariantChange);
        };
    }, []);

    // Zoom Handlers
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setZoomStyle({
            transformOrigin: `${x}% ${y}%`,
            transform: "scale(2)", // 2x Zoom level
        });
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setZoomStyle({
            transformOrigin: "center center",
            transform: "scale(1)",
        });
    };

    const slideNext = () => {
        setStartIndex((prev) =>
            Math.min(prev + 1, Math.max(0, allImages.length - itemsToShow))
        );
    };

    const slidePrev = () => {
        setStartIndex((prev) => Math.max(prev - 1, 0));
    };

    // Ensure selected image is visible in carousel when it changes
    useEffect(() => {
        const index = allImages.findIndex(img => img.url === selectedImageUrl);
        if (index !== -1) {
            if (index < startIndex) {
                setStartIndex(index);
            } else if (index >= startIndex + itemsToShow) {
                setStartIndex(index - itemsToShow + 1);
            }
        }
    }, [selectedImageUrl, allImages, startIndex]);


    const visibleImages = allImages.slice(startIndex, startIndex + itemsToShow);

    return (
        <div className="space-y-4">
            {/* Main Image */}
            <div
                className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 cursor-crosshair group"
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {selectedImageUrl && (
                    <div className="w-full h-full relative">
                        <img
                            key={selectedImageUrl}
                            src={selectedImageUrl}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                transition: "transform 0.2s ease-out",
                                ...zoomStyle
                            }}
                            alt={product.name}
                        />
                    </div>
                )}
                {/* Hint Icon (only visible when not hovered) */}
                {!isHovered && (
                    <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Carousel Thumbnails */}
            {allImages.length > 0 && (
                <div className="relative group/carousel">
                    {/* Prev Button */}
                    <button
                        onClick={slidePrev}
                        disabled={startIndex === 0}
                        className={`absolute left-0 top-1/2 -translate-y-1/2 -ml-2 sm:-ml-4 z-10 p-1.5 bg-white border border-gray-200 rounded-full shadow-lg text-gray-700 hover:text-indigo-600 hover:border-indigo-200 transition disabled:opacity-0 disabled:invisible ${allImages.length > itemsToShow ? 'opacity-100' : 'opacity-0 invisible'}`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <div className="grid grid-cols-4 gap-3 overflow-hidden">
                        {visibleImages.map((image, idx) => (
                            <button
                                key={`${image.url}-${idx}`}
                                onClick={() => setSelectedImageUrl(image.url)}
                                className={`relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer transition ${selectedImageUrl === image.url
                                    ? "ring-2 ring-indigo-600 ring-offset-1"
                                    : "hover:ring-2 hover:ring-gray-300 ring-offset-1"
                                    }`}
                            >
                                <img
                                    src={image.url}
                                    className="absolute inset-0 w-full h-full object-cover"
                                    alt={`${product.name} - ${image.color} ${image.size}`}
                                />
                                {image.color && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm px-1 py-0.5">
                                        <p className="text-white text-[10px] font-medium truncate text-center">
                                            {image.color}
                                        </p>
                                    </div>
                                )}
                            </button>
                        ))}
                        {/* Fill empty spots if less than itemsToShow (only visual, not functional) */}
                        {[...Array(Math.max(0, itemsToShow - visibleImages.length))].map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square"></div>
                        ))}
                    </div>

                    {/* Next Button */}
                    <button
                        onClick={slideNext}
                        disabled={startIndex >= allImages.length - itemsToShow}
                        className={`absolute right-0 top-1/2 -translate-y-1/2 -mr-2 sm:-mr-4 z-10 p-1.5 bg-white border border-gray-200 rounded-full shadow-lg text-gray-700 hover:text-indigo-600 hover:border-indigo-200 transition disabled:opacity-0 disabled:invisible ${allImages.length > itemsToShow ? 'opacity-100' : 'opacity-0 invisible'}`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
}
