export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="relative">
                {/* Outer Ring */}
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>

                {/* Inner Ring */}
                <div className="absolute top-2 left-2 w-12 h-12 border-4 border-purple-200 border-b-purple-600 rounded-full animate-spin reverse-spin"></div>

                {/* Logo/Icon in center (optional) */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
                </div>
            </div>
        </div>
    );
}
