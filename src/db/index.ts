import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Use a dummy URL during build if not provided to prevent Drizzle initialization errors
// If in Docker, use 'postgres' as host, otherwise 'localhost'
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    if (process.env.NODE_ENV === "production") {
        console.error("CRITICAL: DATABASE_URL is not defined in production environment.");
    } else {
        console.warn("[DB] DATABASE_URL is missing. Database features will fail.");
    }
} else {
    // Mask password for safe logging
    const maskedUrl = connectionString.replace(/:([^:@]+)@/, ":****@");
    console.log(`[DB] Initializing connection to: ${maskedUrl}`);
}

// Create postgres client
const client = connectionString
    ? postgres(connectionString, {
        max: process.env.NODE_ENV === "production" ? 10 : 1,
        idle_timeout: 20,
        connect_timeout: 10,
    })
    : null;

// Create drizzle database instance
export const db = client
    ? drizzle(client, { schema })
    : null as any;

// Helper function to check if database is available
export function isDatabaseAvailable(): boolean {
    return !!connectionString && !!client;
}

// Export schema for use in other files
export * from "./schema";
