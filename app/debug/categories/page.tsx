"use client";

import { useState, useEffect } from "react";

export default function DebugCategoriesPage() {
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch("/api/debug/categories");
                const result = await res.json();
                if (result.success) {
                    setData(result.data);
                } else {
                    setError(result.error);
                }
            } catch (err) {
                setError("Failed to fetch from local proxy");
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    return (
        <div className="p-8 font-mono text-sm bg-gray-900 text-green-400 min-h-screen">
            <h1 className="text-2xl font-bold mb-6 text-white border-b border-gray-700 pb-2">
                Printful API Debug: /categories
            </h1>

            {error && (
                <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded mb-6">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {loading && <p className="animate-pulse">Fetching API data from Printful...</p>}

            {data ? (
                <div className="space-y-6">
                    <div className="bg-gray-800 p-4 rounded border border-gray-700">
                        <p className="text-blue-300 mb-2">Total Categories Found: {data.result?.length || 0}</p>
                        <p className="text-gray-400">Status Code: {data.code}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.result?.slice(0, 12).map((cat: any) => (
                            <div key={cat.id} className="bg-gray-800 p-4 rounded border border-gray-700 hover:border-blue-500 transition">
                                <div className="flex items-center gap-4 mb-3">
                                    {cat.image_url && (
                                        <img src={cat.image_url} alt="" className="w-12 h-12 rounded object-cover bg-white" />
                                    )}
                                    <div>
                                        <p className="font-bold text-white">{cat.title}</p>
                                        <p className="text-[10px] text-gray-500">ID: {cat.id} | Parent: {cat.parent_id}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8">
                        <p className="text-white font-bold mb-2">Raw JSON Response (Full):</p>
                        <pre className="bg-black p-6 rounded overflow-auto max-h-[500px] border border-gray-700">
                            {JSON.stringify(data, null, 2)}
                        </pre>
                    </div>
                </div>
            ) : !loading && !error ? (
                <p>No data found.</p>
            ) : null}
        </div>
    );
}
