import { getProductsFromDB, getCategoriesFromDB, getBrandsFromDB, mapDBVariantToPrintful } from "../src/lib/sync-products";
import { formatVariantName } from "../src/lib/format-variant-name";
import { db, products as productsTable, productVariants, productCategories, categories as categoriesTable } from "../src/db";
import { eq, and } from "drizzle-orm";
import BrandsSection from "../src/components/BrandsSection";
import { CollectionTwoGrid, CollectionThreeGrid, CollectionCarousel, CollectionSixGrid } from "../src/components/CollectionTemplates";
import Link from "next/link";
import shuffle from "lodash.shuffle";


async function getProducts(): Promise<{ products: any[]; error?: string }> {
  try {
    const products = await getProductsFromDB();

    // Format variant names
    const formattedProducts = products.map(p => ({
      ...p,
      variants: p.variants.map((v: any) => ({
        ...v,
        name: formatVariantName(v.name)
      }))
    }));

    return {
      products: formattedProducts.slice(0, 12),
    };
  } catch (error) {
    console.error("Error fetching products from DB:", error);
    return {
      products: [],
      error: "Failed to load products from database.",
    };
  }
}

// Fetch collections with products from DB
async function getCollectionsWithProducts(): Promise<{
  collections: Array<{ category: any; products: any[] }>;
  error?: string;
}> {
  try {
    if (!db) return { collections: [] };

    // Get all categories that are sub-collections (parentId corresponds to Printful ID 116 or similar)
    // For now, let's just get all categories with products
    const allCategories = await db.select().from(categoriesTable);

    // Filter categories that have products (you can refine this filter)
    const collectionsWithProducts = await Promise.all(
      allCategories.slice(0, 4).map(async (collection) => {
        const productLinks = await db
          .select({ product: productsTable })
          .from(productsTable)
          .innerJoin(productCategories, eq(productsTable.id, productCategories.productId))
          .where(eq(productCategories.categoryId, collection.id))
          .limit(6);

        const products = await Promise.all(productLinks.map(async ({ product: p }) => {
          const variantsData = await db.select().from(productVariants).where(eq(productVariants.productId, p.id));
          const variants = variantsData.map(mapDBVariantToPrintful);
          return {
            ...p,
            id: p.printfulId,
            variants: variants.map(v => ({ ...v, name: formatVariantName(v.name) }))
          };
        }));

        return {
          category: { ...collection, title: collection.name },
          products,
        };
      })
    );

    return {
      collections: collectionsWithProducts.filter(c => c.products.length > 0),
    };
  } catch (error) {
    console.error("Error fetching collections from DB:", error);
    return {
      collections: [],
      error: "Failed to load collections.",
    };
  }
}

async function getBrands(): Promise<any[]> {
  const brands = await getBrandsFromDB();
  return brands.map(b => ({ ...b, title: b.name }));
}

export default async function Home() {
  const [{ products, error }, { collections, error: collectionsError }, brands] = await Promise.all([
    getProducts(),
    getCollectionsWithProducts(),
    getBrands(),
  ]);

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

      {/* Collections Section with Varied Templates */}
      {collections.length > 0 && (
        <section className="py-12 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                Curated Collections
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Explore our hand-picked selections designed for your unique style.
              </p>
            </div>

            {/* Collections Error */}
            {collectionsError && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
                <p className="text-yellow-700 text-center">{collectionsError}</p>
              </div>
            )}

            {/* Render Each Collection with Rotated Templates */}
            {collections.map((collection, index) => {
              // Rotation Pattern: TwoGrid -> SixGrid -> Carousel -> ThreeGrid
              const patternIndex = index % 4;
              const props = {
                title: collection.category.title,
                products: collection.products,
                categorySlug: collection.category.title,
              };
              const key = collection.category.id;

              switch (patternIndex) {
                case 0:
                  return <CollectionTwoGrid key={key} {...props} />;
                case 1:
                  return <CollectionSixGrid key={key} {...props} />;
                case 2:
                  return <CollectionCarousel key={key} {...props} />;
                case 3:
                  return <CollectionThreeGrid key={key} {...props} />;
                default:
                  return <CollectionThreeGrid key={key} {...props} />;
              }
            })}
          </div>
        </section>
      )}

      {/* All Brands Section */}
      <BrandsSection brands={brands} />

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
