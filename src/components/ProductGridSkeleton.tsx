export default function ProductGridSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 h-full flex flex-col">
                    <div className="w-full aspect-square bg-gray-100"></div>
                    <div className="p-4 space-y-3 flex-grow">
                        <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                        <div className="flex justify-between items-center pt-2 mt-auto">
                            <div className="h-6 bg-gray-100 rounded w-20"></div>
                            <div className="h-4 bg-gray-100 rounded w-12"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
