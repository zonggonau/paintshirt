import shuffle from "lodash.shuffle";
import { printful, fetchWithRetry } from "../src/lib/printful-client";
import { formatVariantName } from "../src/lib/format-variant-name";
import { PrintfulProduct } from "../src/types";
import { productCache } from "../src/lib/product-cache";
import ProductGrid from "../src/components/ProductGrid";
import Link from "next/link";

export const revalidate = 60; // Revalidate every 60 seconds


async function getProducts(): Promise<{ products: PrintfulProduct[]; error?: string }> {
  try {
    // Check cache first
    const cachedProducts = productCache.get();

    if (cachedProducts) {
      console.log("Serving from cache");
      return {
        products: shuffle(cachedProducts),
      };
    }

    console.log("Fetching fresh data from Printful");

    // Fetch product IDs with retry logic
    const productIdsResponse = await fetchWithRetry<any>(
      () => printful.get("sync/products?limit=15")
    );
    const productIds = productIdsResponse.result;

    // Fetch all products
    const allProducts = await Promise.all(
      productIds.map(async ({ id }: any) =>
        await fetchWithRetry<any>(() => printful.get(`sync/products/${id}`))
      )
    );

    const products: PrintfulProduct[] = allProducts.map(
      (response: any) => {
        const { sync_product, sync_variants } = response.result;
        return {
          ...sync_product,
          variants: sync_variants.map(({ name, ...variant }: any) => ({
            name: formatVariantName(name),
            ...variant,
          })),
        };
      }
    );

    // Store in cache
    productCache.set(products);

    return {
      products: shuffle(products),
    };
  } catch (error) {
    console.error("Error fetching products:", error);

    return {
      products: [],
      error: "Failed to load products. Please try again later.",
    };
  }
}

export default async function Home() {
  const { products, error } = await getProducts();

  return (
    <>
      {/* Hero Section with Gradient */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 py-20 md:py-32">
        {/* Animated Background Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <h1 className="text-3xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
              Express Yourself with
              <span className="block mt-2 bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
                Premium Apparel
              </span>
            </h1>
            <p className="text-lg md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              Discover unique, high-quality print-on-demand products that showcase your style.
              Free worldwide shipping on all orders.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="#products"
                className="px-8 py-4 bg-white text-indigo-600 font-semibold rounded-full hover:bg-gray-100 transition transform hover:scale-105 shadow-lg"
              >
                Shop Now
              </a>
            </div>
          </div>

          {/* Decorative Floating Product Images */}
          {products.length > 0 && (
            <>
              {/* Left Floating Image */}
              <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-12 md:left-10 md:translate-x-0 hidden lg:block animate-float-slow">
                <div className="relative w-64 h-64 rotate-[-12deg] hover:rotate-0 transition duration-500 hover:scale-105 hover:z-10">
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-md rounded-2xl shadow-2xl transform"></div>
                  {products[0]?.variants?.[0]?.files?.find((f: any) => f.type === 'preview')?.preview_url && (
                    <img
                      src={products[0].variants[0].files.find((f: any) => f.type === 'preview')?.preview_url}
                      alt="Featured Product"
                      className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] object-cover rounded-xl shadow-lg"
                    />
                  )}
                </div>
              </div>

              {/* Right Floating Image */}
              <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-12 md:right-10 md:translate-x-0 hidden lg:block animate-float-slow delay-700">
                <div className="relative w-64 h-64 rotate-[12deg] hover:rotate-0 transition duration-500 hover:scale-105 hover:z-10">
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-md rounded-2xl shadow-2xl transform"></div>
                  {products[1]?.variants?.[0]?.files?.find((f: any) => f.type === 'preview')?.preview_url && (
                    <img
                      src={products[1].variants[0].files.find((f: any) => f.type === 'preview')?.preview_url}
                      alt="Featured Product"
                      className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] object-cover rounded-xl shadow-lg"
                    />
                  )}
                </div>
              </div>
            </>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">100+</div>
              <div className="text-sm md:text-base text-white/80">Products</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-sm md:text-base text-white/80">Support</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">★ 4.9</div>
              <div className="text-sm md:text-base text-white/80">Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-12 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Browse our curated collection of premium apparel and accessories
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
              <p className="text-red-600 text-center">{error}</p>
            </div>
          )}

          <ProductGrid products={products.slice(0, 12)} hideFilters={true} />

          <div className="mt-12 text-center">
            <Link
              href="/products"
              className="inline-flex items-center px-8 py-3 bg-white border-2 border-indigo-600 text-indigo-600 font-semibold rounded-full hover:bg-indigo-50 transition transform hover:scale-105 shadow-md"
            >
              View All Products
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6 rounded-2xl hover:bg-gray-50 transition group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mb-4 group-hover:scale-110 transition">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Premium Quality</h3>
              <p className="text-gray-600">
                All products are made with high-quality materials and state-of-the-art printing technology.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6 rounded-2xl hover:bg-gray-50 transition group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-orange-500 rounded-full mb-4 group-hover:scale-110 transition">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Fast Shipping</h3>
              <p className="text-gray-600">
                Quick fulfillment and worldwide shipping. Track your order every step of the way.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6 rounded-2xl hover:bg-gray-50 transition group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-full mb-4 group-hover:scale-110 transition">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">100% Satisfaction</h3>
              <p className="text-gray-600">
                Not happy? We offer hassle-free returns on defective items within 14 days.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
