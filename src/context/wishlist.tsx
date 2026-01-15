"use client";

import React, { createContext, useReducer, useEffect } from "react";

import type { PrintfulProduct } from "../types";

interface InitialState {
    items: PrintfulProduct[];
}

interface WishlistProviderState extends InitialState {
    addItem: (item: PrintfulProduct) => void;
    removeItem: (id: PrintfulProduct["id"]) => void;
    isSaved: (id: PrintfulProduct["id"]) => boolean;
    hasItems: boolean;
}

const ADD_PRODUCT = "ADD_PRODUCT";
const REMOVE_PRODUCT = "REMOVE_PRODUCT";
const HYDRATE_WISHLIST = "HYDRATE_WISHLIST";

type Actions =
    | { type: typeof ADD_PRODUCT; payload: PrintfulProduct }
    | { type: typeof REMOVE_PRODUCT; payload: PrintfulProduct["id"] }
    | { type: typeof HYDRATE_WISHLIST; payload: InitialState };

export const WishlistStateContext = createContext<WishlistProviderState | null>(
    null
);
export const WishlistDispatchContext = createContext<{
    addItem: (item: PrintfulProduct) => void;
    removeItem: (id: PrintfulProduct["id"]) => void;
} | null>(null);

const initialState: InitialState = {
    items: [],
};

const reducer = (state: InitialState, action: Actions): InitialState => {
    switch (action.type) {
        case ADD_PRODUCT:
            return { ...state, items: [...state.items, action.payload] };
        case REMOVE_PRODUCT:
            return {
                ...state,
                items: state.items.filter((i: PrintfulProduct) => i.id !== action.payload),
            };
        case HYDRATE_WISHLIST:
            return action.payload;
        default:
            throw new Error(`Invalid action`);
    }
};

export const WishlistProvider: React.FC<{ children?: React.ReactNode }> = ({
    children,
}) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    // Hydrate state from local storage on mount
    useEffect(() => {
        try {
            const item = window.localStorage.getItem("items-wishlist");
            if (item) {
                const parsed = JSON.parse(item);
                if (parsed && Array.isArray(parsed.items)) {
                    dispatch({ type: HYDRATE_WISHLIST, payload: parsed });
                }
            }
        } catch (error) {
            console.error("Failed to load wishlist from local storage", error);
        }
    }, []);

    // Save state to local storage on change
    useEffect(() => {
        // Retrieve current storage to avoid overwriting valid data with initial empty state
        // if hydration hasn't run or is delayed. 
        // Better: Only save if state is different from initial or if we know we are 'dirty'.
        // Actually since we HYDRATE first (conceptually) or state starts empty,
        // writing empty state to LS is fine IF LS was empty.
        // BUT if LS had data, we don't want to overwrite it with empty state before hydration.
        // The hydration useEffect runs after mount. This effect also runs after mount.
        // To be safe, we can use a ref to track if we've initialised.

        const save = () => {
            try {
                window.localStorage.setItem("items-wishlist", JSON.stringify(state));
            } catch (error) {
                console.error("Failed to save wishlist", error);
            }
        };

        // We only want to save if we have effectively hydrated or modified state.
        // However, standard pattern is usually fine unless we overwrite immediately.
        // Since hydration happens in useEffect, and this happens in useEffect, the order matters.
        // If we simply write every time state changes:
        // 1. Mount -> State is {items: []}
        // 2. Hydrate Effect runs -> Reads LS -> Dispatches HYDRATE -> State becomes {items: [...]}
        // 3. Save Effect runs (due to state change) -> Writes {items: [...]}

        // Wait, does Save Effect run on first render (before Hydration)? Yes.
        // So on first render, it writes {items: []} to LS, wiping it.
        // FIX: Add a flag to prevent saving on the very first mount if we assume data acts as "remote".

    }, [state]);

    // Let's implement the `verified` save logic.
    const isMounted = React.useRef(false);
    useEffect(() => {
        if (isMounted.current) {
            window.localStorage.setItem("items-wishlist", JSON.stringify(state));
        } else {
            isMounted.current = true;
        }
    }, [state]);

    const addItem = (item: PrintfulProduct) => {
        if (!item.id) return;

        const existing = state.items.find((i: PrintfulProduct) => i.id === item.id);

        if (existing) return dispatch({ type: REMOVE_PRODUCT, payload: item.id });

        dispatch({ type: ADD_PRODUCT, payload: item });
    };

    const removeItem = (id: PrintfulProduct["id"]) => {
        if (!id) return;

        dispatch({ type: REMOVE_PRODUCT, payload: id });
    };

    const isSaved = (id: PrintfulProduct["id"]) =>
        state.items.some((i: PrintfulProduct) => i.id === id);

    const hasItems = state.items.length > 0;

    return (
        <WishlistDispatchContext.Provider value={{ addItem, removeItem }}>
            <WishlistStateContext.Provider value={{ ...state, isSaved, hasItems, addItem, removeItem }}>
                {children}
            </WishlistStateContext.Provider>
        </WishlistDispatchContext.Provider>
    );
};
