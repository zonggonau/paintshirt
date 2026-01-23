import { redirect } from "next/navigation";
import { getProductFromDB } from "../../../../src/lib/sync-products";
import { slugify } from "../../../../src/lib/slugify";

export default async function ProductRedirectPage({
    params,
}: {
    params: Promise<{ id: string; slug: string }>;
}) {
    const { id } = await params;
    const product = await getProductFromDB(id);

    if (product) {
        const catId = product.category?.id || "uncategorized";
        const catSlug = slugify(product.category?.name || "all");
        const productSlug = slugify(product.name);
        redirect(`/products/categories/${catId}/${catSlug}/${id}/${productSlug}`);
    }

    redirect("/products");
}
