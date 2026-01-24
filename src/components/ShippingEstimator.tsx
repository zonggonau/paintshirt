"use client";

import { useEffect, useState } from 'react';

export default function ShippingEstimator({ variantId }: { variantId: string | number }) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!variantId) {
            setLoading(false);
            return;
        }

        // Server-side detection only (Clean & Fast)
        // Backend will detect country from headers (x-vercel-ip-country)
        const fetchEstimate = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/shipping?variantId=${variantId}`);
                const data = await res.json();
                setData(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchEstimate();
    }, [variantId]);

    if (loading) {
        return (
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 animate-pulse mt-6">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
        );
    }

    if (!data || data.error || !data.rate) {
        return null;
    }

    return (
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group hover:border-indigo-100 transition-colors mt-6">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-50 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition"></div>

            <div className="flex items-start gap-4 relative z-10">
                <div className="p-3 bg-indigo-50 rounded-full text-indigo-600 shrink-0">
                    <span className="material-symbols-outlined text-2xl">local_shipping</span>
                </div>

                <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                        Estimated delivery to <span className="text-indigo-600 underline decoration-dotted">{data.countryName}</span>
                    </p>

                    <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-2xl font-black text-gray-900 leading-none">
                            {data.minDays}–{data.maxDays}
                        </span>
                        <span className="text-sm font-medium text-gray-500">days</span>
                    </div>

                    <div className="text-sm text-gray-500">
                        Shipping starts at <span className="font-bold text-gray-900">{Number(data.rate).toLocaleString('en-US', { style: 'currency', currency: data.currency })}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
