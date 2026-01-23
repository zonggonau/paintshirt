"use client";

import { useState, useEffect } from "react";

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
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const fetchLogs = async () => {
        try {
            const res = await fetch("/api/sync/products", {
                headers: { "x-webhook-secret": webhookSecret }
            });
            const result = await res.json();
            if (result.success) {
                setLogs(result.data);
            }
        } catch (error) {
            console.error("Failed to fetch logs", error);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const handleSync = async () => {
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
                fetchLogs();
            } else {
                setMessage({ type: 'error', text: result.error || "Sync Failed" });
            }
        } catch (error) {
            setMessage({ type: 'error', text: "Internal Server Error" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                    <p className="text-gray-500 mt-1">Manage your Printful products and synchronization.</p>
                </div>
                <button
                    onClick={handleSync}
                    disabled={isLoading}
                    className={`px-6 py-3 rounded-lg font-semibold text-white transition-all ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl active:scale-95'
                        }`}
                >
                    {isLoading ? (
                        <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Syncing...
                        </span>
                    ) : "Sync Products Now"}
                </button>
            </div>

            {message && (
                <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <h2 className="font-semibold text-gray-800 dark:text-gray-200">Recent Sync History</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs uppercase text-gray-400 font-bold border-b border-gray-100 dark:border-gray-700">
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
                                        <span className={`px-2 py-1 text-xs rounded-full font-semibold ${log.status === 'success' ? 'bg-green-100 text-green-700' :
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
        </div>
    );
}
