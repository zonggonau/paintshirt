// Type definitions for Snipcart v3
// Add this to global window object

export { };

declare global {
    interface Window {
        Snipcart?: {
            events: {
                on: (eventName: string, callback: (data: any) => void) => () => void;
            };
            api: {
                cart: {
                    items: {
                        count: () => number;
                    };
                };
            };
            store: {
                subscribe: (callback: () => void) => () => void;
                getState: () => {
                    cart: {
                        items: {
                            count: number;
                        };
                    };
                };
            };
        };
        gtag?: (...args: any[]) => void;
        dataLayer?: any[];
    }
}
