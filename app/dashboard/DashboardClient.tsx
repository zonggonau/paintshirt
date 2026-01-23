"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface SyncLog {
    id: number;
    type: string;
    status: string;
    productsAdded: number;
    productsUpdated: number;
    errorMessage: string | null;
    startedAt: string;
    completedAt: string | null;
}

export default function DashboardClient({ webhookSecret }: { webhookSecret: string }) {
    const [logs, setLogs] = useState<SyncLog[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [totalProducts, setTotalProducts] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingData, setIsFetchingData] = useState(true);
    const [activeTab, setActiveTab] = useState<'products' | 'logs'>('products');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const fetchData = async () => {
        setIsFetchingData(true);
        try {
            // Fetch Logs
            const logsRes = await fetch("/api/sync/products", {
                headers: { "x-webhook-secret": webhookSecret }
            });
            const logsResult = await logsRes.json();
            if (logsResult.success) setLogs(logsResult.data);

            // Fetch Products with pagination
            const prodRes = await fetch(`/api/dashboard/products?page=${currentPage}&limit=${itemsPerPage}`, {
                headers: { "x-webhook-secret": webhookSecret }
            });
            const prodResult = await prodRes.json();
            if (prodResult.success) {
                setProducts(prodResult.data);
                setTotalProducts(prodResult.total);
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setIsFetchingData(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentPage, itemsPerPage]);

    const handleSyncAll = async () => {
        setIsLoading(true);
        setMessage(null);
        try {
            const res = await fetch("/api/sync/products?type=manual", {
                method: "POST",
                headers: { "x-webhook-secret": webhookSecret }
            });
            const result = await res.json();
            if (result.success) {
                setMessage({ type: 'success', text: `Sync Success: ${result.data.productsAdded} added, ${result.data.productsUpdated} updated.` });
                fetchData();
            } else {
                setMessage({ type: 'error', text: result.error || "Sync Failed" });
            }
        } catch (error) {
            setMessage({ type: 'error', text: "Internal Server Error" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSyncProduct = async (id: string) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/sync/products?productId=${id}&type=manual`, {
                method: "POST",
                headers: { "x-webhook-secret": webhookSecret }
            });
            const result = await res.json();
            if (result.success) {
                setMessage({ type: 'success', text: `Product ${id} updated successfully.` });
                fetchData();
            }
        } catch (error) {
            console.error("Failed to sync product", error);
        } finally {
            setIsLoading(false);
        }
    };

    const totalPages = Math.ceil(totalProducts / itemsPerPage);

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Total Library</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{totalProducts}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Last Sync Status</p>
                    <p className="text-3xl font-bold text-green-500 mt-1 capitalize">{logs[0]?.status || '-'}</p>
                </div>
                <div className="md:col-span-2 bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-xl shadow-lg flex justify-between items-center text-white">
                    <div>
                        <p className="font-bold opacity-80 uppercase text-xs tracking-widest">Global Action</p>
                        <p className="text-xl font-bold mt-1">Sync Printful Library</p>
                    </div>
                    <button
                        onClick={handleSyncAll}
                        disabled={isLoading}
                        className="bg-white text-blue-700 px-6 py-2 rounded-lg font-bold shadow-sm hover:bg-gray-100 transition active:scale-95 disabled:bg-gray-300"
                    >
                        {isLoading ? "Running..." : "Sync All Products"}
                    </button>
                </div>
            </div>

            {/* Tabs & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200 dark:border-gray-700 mb-6 gap-4">
                <div className="flex gap-8">
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`pb-4 px-2 font-bold text-sm transition-all border-b-2 ${activeTab === 'products' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Synced Products ({totalProducts})
                    </button>
                    <button
                        onClick={() => setActiveTab('logs')}
                        className={`pb-4 px-2 font-bold text-sm transition-all border-b-2 ${activeTab === 'logs' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Sync Logs History
                    </button>
                </div>

                {activeTab === 'products' && (
                    <div className="flex items-center gap-3 pb-4">
                        <label className="text-xs font-bold text-gray-400 uppercase">Show:</label>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                )}
            </div>

            {message && (
                <div className={`p-4 rounded-lg mb-6 flex justify-between items-center ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <span>{message.text}</span>
                    <button onClick={() => setMessage(null)} className="font-bold text-xl leading-none">×</button>
                </div>
            )}

            {activeTab === 'products' ? (
                <>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-gray-900/50">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Product</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Variants</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y divide-gray-100 dark:divide-gray-700 ${isFetchingData ? 'opacity-50' : ''}`}>
                                    {products.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    {product.thumbnailUrl && (
                                                        <img src={product.thumbnailUrl} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-100 shadow-sm" />
                                                    )}
                                                    <div>
                                                        <p className="font-bold text-gray-900 dark:text-white line-clamp-1">{product.name}</p>
                                                        <p className="text-[10px] text-gray-400 font-mono mt-0.5 uppercase tracking-tighter">PF-ID: {product.printfulId}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                                    {product.variants?.length || 0} Variants
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {product.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleSyncProduct(product.printfulId)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                                                        title="Sync this product"
                                                    >
                                                        <svg className="w-5 h-5 focus:animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                        </svg>
                                                    </button>
                                                    <Link
                                                        href={`/products/${product.id}/${product.name.toLowerCase().replace(/[\s/]+/g, '-')}`}
                                                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg transition"
                                                        title="View on store"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {products.length === 0 && !isFetchingData && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                                No products found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalProducts)} of {totalProducts} products
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 text-xs font-bold uppercase tracking-widest border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50 transition"
                            >
                                Previous
                            </button>

                            <div className="flex gap-1">
                                {[...Array(totalPages)].map((_, i) => {
                                    const pageNum = i + 1;
                                    // Only show current, first, last, and neighbours
                                    if (
                                        pageNum === 1 ||
                                        pageNum === totalPages ||
                                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                    ) {
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`w-10 h-10 text-xs font-bold rounded-lg transition ${currentPage === pageNum
                                                        ? 'bg-blue-600 text-white'
                                                        : 'hover:bg-gray-100 text-gray-600'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    } else if (
                                        pageNum === currentPage - 2 ||
                                        pageNum === currentPage + 2
                                    ) {
                                        return <span key={pageNum} className="px-1 text-gray-400">...</span>;
                                    }
                                    return null;
                                })}
                            </div>

                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 text-xs font-bold uppercase tracking-widest border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50 transition"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-900/50">
                                <tr className="text-[10px] uppercase text-gray-400 font-bold border-b border-gray-100 dark:border-gray-700 tracking-widest">
                                    <th className="px-6 py-4">Time</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-center">Added</th>
                                    <th className="px-6 py-4 text-center">Updated</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {new Date(log.startedAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                                            {log.type}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-[10px] rounded-full font-bold uppercase tracking-wider ${log.status === 'success' ? 'bg-green-100 text-green-700' :
                                                log.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {log.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-center font-bold text-blue-600">{log.productsAdded}</td>
                                        <td className="px-6 py-4 text-sm text-center font-bold text-green-600">{log.productsUpdated}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
