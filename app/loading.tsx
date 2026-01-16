export default function Loading() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 animate-pulse">
            {/* Header Skeleton */}
            <div className="text-center mb-12">
                <div className="h-10 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-96 mx-auto"></div>
            </div>

            {/* Product Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
                        {/* Image Skeleton */}
                        <div className="aspect-square bg-gray-200 rounded-xl w-full"></div>

                        {/* Content Skeleton */}
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                        </div>

                        {/* Button Skeleton */}
                        <div className="pt-2">
                            <div className="h-10 bg-gray-200 rounded-xl w-full"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
