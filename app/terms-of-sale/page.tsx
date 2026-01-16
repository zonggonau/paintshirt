export default function TermsOfSalePage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                        Terms of Sale
                    </h1>
                    <p className="text-lg text-gray-600">
                        Please read these terms carefully before placing your order
                    </p>
                </div>

                {/* Content */}
                <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="w-1 h-8 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full mr-4"></span>
                            1. General
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            By placing an order with PrintfulTshirt, you agree to these terms and conditions.
                            Please read them carefully before making a purchase. These terms constitute a
                            binding agreement between you and PrintfulTshirt.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="w-1 h-8 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full mr-4"></span>
                            2. Product Information
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            We strive to provide accurate product descriptions and images. However, slight
                            variations in color and design may occur due to printing processes and monitor
                            settings. We reserve the right to correct any errors in product descriptions or
                            pricing.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="w-1 h-8 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full mr-4"></span>
                            3. Pricing
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            All prices are in USD and include applicable taxes. Shipping costs are calculated
                            at checkout based on your location and selected shipping method. Prices are subject
                            to change without notice, but changes will not affect orders already placed.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="w-1 h-8 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full mr-4"></span>
                            4. Payment
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            We accept all major credit cards and PayPal. Payment is securely processed through
                            Snipcart using industry-standard encryption. Your payment information is never
                            stored on our servers.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="w-1 h-8 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full mr-4"></span>
                            5. Order Processing
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            Orders are typically processed within 2-7 business days. You will receive tracking
                            information once your order ships. Processing times may be longer during peak
                            seasons or holidays.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="w-1 h-8 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full mr-4"></span>
                            6. Shipping
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            We ship worldwide. Shipping times vary by location and shipping method selected.
                            International orders may be subject to customs fees and import duties, which are
                            the responsibility of the customer.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="w-1 h-8 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full mr-4"></span>
                            7. Returns & Exchanges
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            Any claims for misprinted/damaged/defective items must be submitted within 30 days
                            after the product has been received. For packages lost in transit, all claims must
                            be submitted no later than 30 days after the estimated delivery date. Because our
                            products are printed on demand, we do not refund orders for buyer’s remorse or
                            wrong size selection.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="w-1 h-8 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full mr-4"></span>
                            8. Intellectual Property
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            All designs, logos, and content on this website are protected by copyright and
                            trademark laws. You may not reproduce, distribute, or use any content without
                            our express written permission.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="w-1 h-8 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full mr-4"></span>
                            9. Contact
                        </h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            If you have any questions about these terms or need assistance with your order,
                            please don't hesitate to contact us.
                        </p>
                        <a
                            href="mailto:support@printfultshirt.com"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition shadow-lg"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Contact Support
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
