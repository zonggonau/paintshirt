import { NextResponse } from "next/server";
import { printful } from "@/src/lib/printful-client";

export async function GET() {
    try {
        const response = await printful.get("categories");
        return NextResponse.json({ success: true, data: response });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Failed to fetch categories" },
            { status: 500 }
        );
    }
}
