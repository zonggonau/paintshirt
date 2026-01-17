export default function ProductsLoading() {
    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Skeleton */}
                <div className="text-center mb-12 animate-pulse">
                    <div className="h-10 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded max-w-lg mx-auto"></div>
                </div>

                {/* Filter Bar Skeleton */}
                <div className="mb-6 flex gap-4 animate-pulse">
                    <div className="flex-1 h-14 bg-gray-200 rounded-xl"></div>
                    <div className="w-14 h-14 bg-gray-200 rounded-xl"></div>
                    <div className="w-32 h-14 bg-gray-200 rounded-xl"></div>
                </div>

                {/* Product Grid Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
                            {/* Image Placeholder */}
                            <div className="w-full aspect-square bg-gray-200"></div>

                            {/* Content Placeholder */}
                            <div className="p-5 space-y-3">
                                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                                <div className="flex justify-between items-center pt-2">
                                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
