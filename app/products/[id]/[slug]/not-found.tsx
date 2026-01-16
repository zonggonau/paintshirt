import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 px-4">
            <div className="text-center">
                <div className="mb-8">
                    <h1 className="text-9xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        404
                    </h1>
                    <h2 className="text-3xl font-bold text-gray-900 mt-4 mb-2">
                        Product Not Found
                    </h2>
                    <p className="text-gray-600 mb-8">
                        Sorry, we couldn't find the product you're looking for.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/">
                        <button className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition shadow-lg">
                            Back to Home
                        </button>
                    </Link>
                    <Link href="/">
                        <button className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-indigo-600 hover:text-indigo-600 transition">
                            Browse Products
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
