const apiKey = process.env.PRINTFUL_API_KEY;

if (!apiKey) {
    console.warn("WARNING: PRINTFUL_API_KEY is not defined in environment variables.");
}

class PrintfulClient {
    private apiKey: string;
    private baseUrl: string = "https://api.printful.com";

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    private async request(method: string, endpoint: string, body?: any, options?: RequestInit) {
        const url = `${this.baseUrl}/${endpoint.replace(/^\/+/, '')}`;
        const headers: HeadersInit = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.apiKey}`,
        };

        const timeout = 30000; // 30 seconds timeout

        return fetchWithRetry(async () => {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), timeout);

            try {
                const response = await fetch(url, {
                    method,
                    headers,
                    body: body ? JSON.stringify(body) : undefined,
                    signal: controller.signal,
                    ...options,
                });

                clearTimeout(id);

                if (!response.ok) {
                    let errorData;
                    try {
                        errorData = await response.json();
                    } catch (e) {
                        errorData = { error: response.statusText };
                    }
                    throw new Error(`Printful API Error ${response.status}: ${JSON.stringify(errorData)}`);
                }

                return await response.json();
            } catch (error) {
                clearTimeout(id);
                throw error;
            }
        }, 3, 1500); // 3 retries, starting with 1.5s delay
    }

    async get(endpoint: string, options?: RequestInit) {
        return this.request("GET", endpoint, undefined, options);
    }

    async post(endpoint: string, body: any, options?: RequestInit) {
        return this.request("POST", endpoint, body, options);
    }

    async delete(endpoint: string, options?: RequestInit) {
        return this.request("DELETE", endpoint, undefined, options);
    }
}

export const printful = new PrintfulClient(apiKey || "dummy_key");

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
            const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
            console.error(`Attempt ${i + 1} failed: ${errorMessage}`, error);

            if (i === retries - 1) {
                throw error;
            }

            // Wait before retrying
            await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
        }
    }

    throw new Error("Max retries reached");
}
