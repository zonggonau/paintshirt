import { PrintfulProduct } from "../types";

interface Cache {
    data: PrintfulProduct[] | null;
    timestamp: number | null;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let cache: Cache = { data: null, timestamp: null };

export const productCache = {
    get: (): PrintfulProduct[] | null => {
        if (!cache.data || !cache.timestamp) return null;

        const now = Date.now();
        if (now - cache.timestamp > CACHE_DURATION) {
            return null;
        }

        return cache.data;
    },

    set: (data: PrintfulProduct[]): void => {
        cache = {
            data,
            timestamp: Date.now(),
        };
    },

    clear: (): void => {
        cache = { data: null, timestamp: null };
    },
};
