export default function Testimonials() {
    const testimonials = [
        {
            id: 1,
            name: "Sarah Jenkins",
            role: "Verified Buyer",
            content: "Absolutely in love with the quality! The fabric feels premium and the print hasn't faded after multiple washes. Will definitely order again.",
            avatar: "https://randomuser.me/api/portraits/women/44.jpg",
            rating: 5
        },
        {
            id: 2,
            name: "Michael Chen",
            role: "Fashion Blogger",
            content: "Finally found a print-on-demand store that actually cares about fit and finish. The shipping was surprisingly fast too!",
            avatar: "https://randomuser.me/api/portraits/men/32.jpg",
            rating: 5
        },
        {
            id: 3,
            name: "Emily Rodriguez",
            role: "Artist",
            content: "I love the unique designs available here. It's great to support independent artists while getting high-quality apparel.",
            avatar: "https://randomuser.me/api/portraits/women/65.jpg",
            rating: 4
        }
    ];

    return (
        <section className="py-20 bg-gray-50 border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Loved by Customers</h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Don't just take our word for it. Here's what our community has to say.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((item) => (
                        <div key={item.id} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative">
                            {/* Quote Icon */}
                            <div className="absolute top-6 right-8 text-indigo-100 font-serif text-6xl leading-none">"</div>

                            <div className="flex gap-1 mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <svg
                                        key={i}
                                        className={`w-5 h-5 ${i < item.rating ? 'text-yellow-400' : 'text-gray-200'}`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>

                            <p className="text-gray-600 mb-8 leading-relaxed relative z-10">
                                {item.content}
                            </p>

                            <div className="flex items-center gap-4 border-t border-gray-100 pt-6">
                                <img
                                    src={item.avatar}
                                    alt={item.name}
                                    className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-50"
                                />
                                <div>
                                    <h4 className="font-bold text-gray-900">{item.name}</h4>
                                    <p className="text-sm text-indigo-600 font-medium">{item.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
