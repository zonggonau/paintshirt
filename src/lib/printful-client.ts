import { PrintfulClient } from "printful-request";

export const printful = new PrintfulClient(process.env.PRINTFUL_API_KEY);

/**
 * Wrapper function for Printful API calls with error handling and retry logic
 */
export async function fetchWithRetry<T>(
    fetchFn: () => Promise<T>,
    retries = 3,
    delay = 1000
): Promise<T> {
    for (let i = 0; i < retries; i++) {
        try {
            return await fetchFn();
        } catch (error) {
            console.error(`Attempt ${i + 1} failed:`, error);

            if (i === retries - 1) {
                throw error;
            }

            // Wait before retrying
            await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
        }
    }

    throw new Error("Max retries reached");
}
