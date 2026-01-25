import { NextResponse } from "next/server";
import { db, products, productVariants, categories, productCategories } from "@/src/db";
import { sql } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export async function GET() {
    const report: any = {
        database_url_configured: !!process.env.DATABASE_URL,
        database_url_is_local: process.env.DATABASE_URL?.includes("127.0.0.1") || process.env.DATABASE_URL?.includes("localhost"),
        node_env: process.env.NODE_ENV,
        status: "checking",
        errors: [],
        tables: {}
    };

    try {
        if (!db) {
            throw new Error("Drizzle 'db' object is null. Initial connection might have failed.");
        }

        // 1. Check basic connection
        try {
            await db.execute(sql`SELECT 1`);
            report.connection = "success";
        } catch (err: any) {
            report.connection = "failed";
            report.errors.push(`Connection test failed: ${err.message}`);
            return NextResponse.json(report, { status: 500 });
        }

        // 2. Check each table
        const tablesToCheck = [
            { name: "products", table: products },
            { name: "productVariants", table: productVariants },
            { name: "categories", table: categories },
            { name: "productCategories", table: productCategories }
        ];

        for (const { name, table } of tablesToCheck) {
            try {
                const countResult = await db.select({ count: sql`count(*)` }).from(table);
                const data: any = {
                    exists: true,
                    count: Number((countResult[0] as any).count)
                };

                // Add sample data for products to check descriptions
                if (name === "products") {
                    const samples = await db.select({
                        name: products.name,
                        description: products.description
                    }).from(products).limit(3);
                    data.samples = samples;
                }

                report.tables[name] = data;
            } catch (err: any) {
                report.tables[name] = {
                    exists: false,
                    error: err.message
                };
                report.errors.push(`Table '${name}' error: ${err.message}`);
            }
        }

        report.status = report.errors.length === 0 ? "healthy" : "issues_found";
        return NextResponse.json(report);

    } catch (error: any) {
        report.status = "error";
        report.errors.push(error.message);
        return NextResponse.json(report, { status: 500 });
    }
}
