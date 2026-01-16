export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                        About PrintfulTshirt
                    </h1>
                    <p className="text-lg text-gray-600">
                        Your one-stop shop for high-quality print-on-demand products
                    </p>
                </div>

                {/* Content */}
                <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="w-1 h-8 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full mr-4"></span>
                            Our Story
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            Welcome to PrintfulTshirt, your one-stop shop for high-quality print-on-demand products.
                            We're passionate about creating unique, custom products that help you express yourself.
                            Using print-on-demand technology powered by Printful, we ensure that every product is
                            made with care and delivered directly to you.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="w-1 h-8 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full mr-4"></span>
                            Quality Guarantee
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            All our products are produced using premium materials and state-of-the-art printing
                            technology. We stand behind the quality of every item we sell. Each product is
                            carefully crafted to meet our high standards before it reaches your doorstep.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="w-1 h-8 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full mr-4"></span>
                            Shipping
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            We offer worldwide shipping with transparent pricing. Your order will be fulfilled and
                            shipped within 2-7 business days. We partner with reliable carriers to ensure your
                            products arrive safely and on time.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="w-1 h-8 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full mr-4"></span>
                            Sustainability
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            We're committed to sustainable practices. Our print-on-demand model means we only
                            produce what's ordered, reducing waste. We work with eco-conscious partners who share
                            our values of environmental responsibility.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="w-1 h-8 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full mr-4"></span>
                            Have Questions?
                        </h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            Feel free to reach out to us if you have any questions about our products or services.
                            We're here to help!
                        </p>
                        <a
                            href="mailto:support@printfultshirt.com"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition shadow-lg"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Contact Us
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
