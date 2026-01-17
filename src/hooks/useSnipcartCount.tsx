"use client";

import { useState, useEffect } from "react";
import { hasSnipcart } from "../lib/has-snipcart";

interface CartState {
    items: {
        count: number;
    };
}

const useSnipcartCount = () => {
    const [cart, setCart] = useState<CartState>({
        items: {
            count: 0,
        },
    });

    useEffect(() => {
        if (!hasSnipcart() || !window.Snipcart) return;

        const unsubscribe = window.Snipcart.store.subscribe(() => {
            if (window.Snipcart) {
                setCart(window.Snipcart.store.getState().cart);
            }
        });

        return unsubscribe;
    }, []);

    return { cart };
};

export default useSnipcartCount;
