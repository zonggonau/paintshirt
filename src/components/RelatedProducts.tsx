"use client";

import { PrintfulProduct } from "../types";
import Product from "./Product";
import { getCategoryFromProduct } from "../lib/product-category";

interface RelatedProductsProps {
    currentProduct: PrintfulProduct;
    allProducts: PrintfulProduct[];
}

export default function RelatedProducts({ currentProduct, allProducts }: RelatedProductsProps) {
    const currentCategory = getCategoryFromProduct(currentProduct);

    // Filter products:
    // 1. Same category
    // 2. Not the current product
    // 3. Shuffle/Randomize (optional, here we just take the first 4)
    const related = allProducts
        .filter(
            (p) =>
                getCategoryFromProduct(p) === currentCategory &&
                p.id !== currentProduct.id
        )
        .slice(0, 4);

    if (related.length === 0) return null;

    return (
        <section className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {related.map((product) => (
                    <Product key={product.id} {...product} />
                ))}
            </div>
        </section>
    );
}
