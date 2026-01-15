import { printful } from "../../../../src/lib/printful-client";
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
        const { result } = await printful.get(`store/variants/@${id}`);

        return NextResponse.json(
            {
                id: id as string,
                price: result.retail_price,
                url: `/api/products/${id}`,
            } as Data,
            {
                headers: {
                    "Cache-Control": "s-maxage=3600, stale-while-revalidate",
                },
            }
        );
    } catch (error: any) {
        console.log(error);
        return NextResponse.json(
            {
                errors: [
                    {
                        key: error?.message || "unknown_error",
                        message: error?.message || "An error occurred",
                    },
                ],
            } as Error,
            { status: 404 }
        );
    }
}
