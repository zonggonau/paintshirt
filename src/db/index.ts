import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Database connection URL from environment variable
// Use a dummy URL during build if not provided to prevent Drizzle initialization errors
const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres";

if (!process.env.DATABASE_URL) {
    console.warn(
        "WARNING: DATABASE_URL is not defined. Database features will not work."
    );
}

// Create postgres client
// For production: Use connection pooling with max connections
// For development: Use default settings
const client = connectionString
    ? postgres(connectionString, {
        max: process.env.NODE_ENV === "production" ? 10 : 1,
        idle_timeout: 20,
        connect_timeout: 10,
    })
    : (null as unknown as ReturnType<typeof postgres>);

// Create drizzle database instance with schema
export const db = client
    ? drizzle(client, { schema })
    : (null as unknown as ReturnType<typeof drizzle>);

// Helper function to check if database is available
export function isDatabaseAvailable(): boolean {
    return !!connectionString && !!client;
}

// Export schema for use in other files
export * from "./schema";
