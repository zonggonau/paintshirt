import { db, productVariants } from "../../../../src/db";
import { eq, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

type Data = {
    id: string;
    price: number;
    url: string;
};

type Error = {
    errors: { key: string; message: string }[];
};

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        if (!db) throw new Error("Database not available");

        // Try to find variant by externalId or printfulVariantId
        const variantData = await db
            .select()
            .from(productVariants)
            .where(or(
                eq(productVariants.externalId, id),
                eq(productVariants.printfulVariantId, id)
            ))
            .limit(1);

        if (variantData.length === 0) {
            return NextResponse.json(
                {
                    errors: [{ key: "not_found", message: "Product variant not found" }],
                } as Error,
                { status: 404 }
            );
        }

        const variant = variantData[0];

        return NextResponse.json(
            {
                id: id,
                price: Number(variant.retailPrice),
                url: `/api/products/${id}`,
            } as Data,
            {
                headers: {
                    "Cache-Control": "s-maxage=3600, stale-while-revalidate",
                },
            }
        );
    } catch (error: any) {
        console.error("[API Products] Error:", error);
        return NextResponse.json(
            {
                errors: [
                    {
                        key: error?.message || "unknown_error",
                        message: error?.message || "An error occurred",
                    },
                ],
            } as Error,
            { status: 500 }
        );
    }
}
