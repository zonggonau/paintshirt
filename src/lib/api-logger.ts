/**
 * Enhanced API Client with Logging
 * Wraps Printful client with request/response logging for debugging
 */

import { printful as originalPrintful, fetchWithRetry as originalFetchWithRetry } from './printful-client';

// Environment-based logging
const isDevelopment = process.env.NODE_ENV === 'development';
const enableLogging = process.env.ENABLE_API_LOGGING === 'true' || isDevelopment;

/**
 * Log API requests for debugging
 */
function logRequest(method: string, endpoint: string, data?: any) {
    if (!enableLogging) return;

    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🔵 API Request: ${method} ${endpoint}`);
    if (data) {
        console.log('Request Data:', JSON.stringify(data, null, 2));
    }
}

/**
 * Log API responses
 */
function logResponse(method: string, endpoint: string, response: any, duration: number) {
    if (!enableLogging) return;

    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🟢 API Response: ${method} ${endpoint} (${duration}ms)`);

    // Log response size
    const responseSize = JSON.stringify(response).length;
    console.log(`Response Size: ${(responseSize / 1024).toFixed(2)}KB`);
}

/**
 * Log API errors
 */
function logError(method: string, endpoint: string, error: any, duration: number) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] 🔴 API Error: ${method} ${endpoint} (${duration}ms)`);
    console.error('Error Details:', error);
}

/**
 * Enhanced fetch with logging
 */
export async function fetchWithRetry<T>(
    fn: () => Promise<T>,
    retries = 3,
    delay = 1000
): Promise<T> {
    const startTime = Date.now();
    const method = 'GET'; // Most Printful requests are GET
    const endpoint = 'unknown'; // We don't have direct access to endpoint here

    try {
        logRequest(method, endpoint);
        const result = await originalFetchWithRetry(fn, retries, delay);
        const duration = Date.now() - startTime;
        logResponse(method, endpoint, result, duration);
        return result;
    } catch (error) {
        const duration = Date.now() - startTime;
        logError(method, endpoint, error, duration);
        throw error;
    }
}

// Export the original printful client
export { originalPrintful as printful };

// Performance tracking
export class PerformanceTracker {
    private static metrics: Map<string, { count: number; totalTime: number; errors: number }> = new Map();

    static track(endpoint: string, duration: number, isError: boolean = false) {
        const current = this.metrics.get(endpoint) || { count: 0, totalTime: 0, errors: 0 };

        current.count++;
        current.totalTime += duration;
        if (isError) current.errors++;

        this.metrics.set(endpoint, current);
    }

    static getReport() {
        const report: any[] = [];

        this.metrics.forEach((metrics, endpoint) => {
            report.push({
                endpoint,
                calls: metrics.count,
                avgDuration: Math.round(metrics.totalTime / metrics.count),
                totalDuration: metrics.totalTime,
                errors: metrics.errors,
                errorRate: `${((metrics.errors / metrics.count) * 100).toFixed(2)}%`,
            });
        });

        return report.sort((a, b) => b.calls - a.calls);
    }

    static logReport() {
        if (!enableLogging) return;

        console.log('\n📊 API Performance Report:');
        console.table(this.getReport());
    }
}
