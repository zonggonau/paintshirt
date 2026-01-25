import ProductGridSkeleton from "@/src/components/ProductGridSkeleton";

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

                <ProductGridSkeleton />
            </div>
        </div>
    );
}
