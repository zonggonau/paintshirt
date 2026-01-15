import { notFound } from "next/navigation";
import ProductDetailImages from "../../../src/components/ProductDetailImages";
import { printful, fetchWithRetry } from "../../../src/lib/printful-client";
import { formatVariantName } from "../../../src/lib/format-variant-name";
import ProductDetailClient from "../../../src/components/ProductDetailClient";

async function getProduct(id: string) {
    try {
        const response = await fetchWithRetry<any>(
            () => printful.get(`sync/products/${id}`)
        );

        const { sync_product, sync_variants } = response.result;

        return {
            ...sync_product,
            variants: sync_variants.map(({ name, ...variant }: any) => ({
                name: formatVariantName(name),
                ...variant,
            })),
        };
    } catch (error) {
        console.error("Error fetching product:", error);
        return null;
    }
}

export default async function ProductDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <nav className="mb-8">
                    <ol className="flex items-center space-x-2 text-sm">
                        <li>
                            <a href="/" className="text-gray-500 hover:text-indigo-600 transition">
                                Home
                            </a>
                        </li>
                        <li className="text-gray-400">/</li>
                        <li className="text-gray-900 font-medium">{product.name}</li>
                    </ol>
                </nav>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 p-8 lg:p-12">
                        {/* Product Images - Server Component */}
                        <ProductDetailImages product={product} />

                        {/* Product Info - Client Component */}
                        <ProductDetailClient product={product} />
                    </div>
                </div>

                {/* Product Description / Features */}
                <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Premium Quality</h3>
                                <p className="text-gray-600 text-sm">High-quality materials and printing technology</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Fast Shipping</h3>
                                <p className="text-gray-600 text-sm">Delivered within 2-7 business days</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Eco-Friendly</h3>
                                <p className="text-gray-600 text-sm">Sustainable printing practices</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                                <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Made with Love</h3>
                                <p className="text-gray-600 text-sm">Carefully crafted and quality checked</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
