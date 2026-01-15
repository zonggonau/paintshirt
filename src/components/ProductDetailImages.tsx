"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";

export default function ProductDetailImages({ product }: { product: any }) {
    const { variants } = product;
    const [firstVariant] = variants;

    const [activeVariantExternalId, setActiveVariantExternalId] = useState(
        firstVariant.external_id
    );

    const activeVariant = variants.find(
        (v: any) => v.external_id === activeVariantExternalId
    );

    const activeVariantFile = activeVariant.files.find(
        ({ type }: any) => type === "preview"
    );

    // Get all unique images from all variants
    const allImages = useMemo(() => {
        const imageMap = new Map();
        variants.forEach((variant: any) => {
            const previewFile = variant.files.find((f: any) => f.type === "preview");
            if (previewFile) {
                // Use URL as key to avoid duplicates
                if (!imageMap.has(previewFile.preview_url)) {
                    imageMap.set(previewFile.preview_url, {
                        url: previewFile.preview_url,
                        variantId: variant.external_id,
                        color: variant.color || "",
                        size: variant.size || "",
                    });
                }
            }
        });
        return Array.from(imageMap.values());
    }, [variants]);

    const [selectedImageUrl, setSelectedImageUrl] = useState(activeVariantFile?.preview_url || "");

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

        window.addEventListener('variantChanged' as any, handleVariantChange);
        return () => {
            window.removeEventListener('variantChanged' as any, handleVariantChange);
        };
    }, []);

    return (
        <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                {selectedImageUrl && (
                    <Image
                        key={selectedImageUrl}
                        src={selectedImageUrl}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        style={{ objectFit: "cover" }}
                        alt={product.name}
                        priority
                        className="hover:scale-105 transition-transform duration-500"
                    />
                )}
            </div>

            {/* Thumbnails - All variant images */}
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-4 gap-3">
                {allImages.map((image, idx) => (
                    <button
                        key={`${image.url}-${idx}`}
                        onClick={() => setSelectedImageUrl(image.url)}
                        className={`relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer transition ${selectedImageUrl === image.url
                                ? "ring-4 ring-indigo-500 ring-offset-2"
                                : "hover:ring-2 hover:ring-gray-300"
                            }`}
                    >
                        <Image
                            src={image.url}
                            fill
                            sizes="100px"
                            style={{ objectFit: "cover" }}
                            alt={`${product.name} - ${image.color} ${image.size}`}
                        />
                        {/* Color/Size label overlay */}
                        {image.color && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm px-1 py-0.5">
                                <p className="text-white text-[10px] font-medium truncate text-center">
                                    {image.color}
                                </p>
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
