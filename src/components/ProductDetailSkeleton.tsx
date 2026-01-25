export default function ProductDetailSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 animate-pulse">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb Skeleton */}
                <div className="mb-8 flex space-x-2">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                    <div className="h-4 bg-gray-200 rounded w-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 p-8 lg:p-12">
                        {/* Left Column: Image Skeleton */}
                        <div className="space-y-4">
                            {/* Main Image */}
                            <div className="aspect-square bg-gray-200 rounded-2xl w-full"></div>
                            {/* Thumbnails */}
                            <div className="grid grid-cols-4 gap-4">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
                                ))}
                            </div>
                        </div>

                        {/* Right Column: Details Skeleton */}
                        <div className="flex flex-col space-y-6">
                            {/* Title & Share Icon */}
                            <div className="flex justify-between items-start">
                                <div className="h-10 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-10 bg-gray-200 rounded-full w-10"></div>
                            </div>

                            {/* Price & Variants Count */}
                            <div className="space-y-2">
                                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            </div>

                            {/* Rating Stars */}
                            <div className="flex space-x-1">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="h-5 w-5 bg-gray-200 rounded-full"></div>
                                ))}
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-gray-200 w-full my-6"></div>

                            {/* Color Selector Skeleton */}
                            <div className="space-y-3">
                                <div className="h-4 bg-gray-200 rounded w-20"></div>
                                <div className="flex space-x-3">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="h-10 w-20 bg-gray-200 rounded-lg"></div>
                                    ))}
                                </div>
                            </div>

                            {/* Size Selector Skeleton */}
                            <div className="space-y-3">
                                <div className="h-4 bg-gray-200 rounded w-20"></div>
                                <div className="grid grid-cols-4 gap-2">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="h-12 bg-gray-200 rounded-lg"></div>
                                    ))}
                                </div>
                            </div>

                            {/* Buttons Skeleton */}
                            <div className="space-y-3 pt-4">
                                <div className="h-14 bg-gray-200 rounded-xl w-full"></div>
                                <div className="h-12 bg-gray-200 rounded-xl w-full"></div>
                            </div>

                            {/* Payment Icons Skeleton */}
                            <div className="pt-4 flex justify-center space-x-3 opacity-50">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="h-8 w-12 bg-gray-200 rounded"></div>
                                ))}
                            </div>

                            {/* Feature Bullets Skeleton */}
                            <div className="space-y-2 pt-4">
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Section Skeleton */}
                <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
                    <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex items-start space-x-3">
                                <div className="h-6 w-6 bg-gray-200 rounded"></div>
                                <div className="space-y-2 flex-1">
                                    <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
