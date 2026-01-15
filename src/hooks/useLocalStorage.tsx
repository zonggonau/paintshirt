"use client";

import { useState, useEffect } from "react";

const useLocalStorage = (
    key: string,
    initialValue: string
): [string, (value: string) => void] => {
    const [storedValue, setStoredValue] = useState<string>(initialValue);

    useEffect(() => {
        try {
            const item = window.localStorage.getItem(key);
            if (item) {
                setStoredValue(item);
            }
        } catch (error) {
            console.error(error);
        }
    }, [key]);

    const setValue = (value: string) => {
        try {
            setStoredValue(value);
            window.localStorage.setItem(key, value);
        } catch (error) {
            console.error(error);
        }
    };

    return [storedValue, setValue];
};

export default useLocalStorage;
