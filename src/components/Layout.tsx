"use client";

import Link from "next/link";
import useWishlistState from "../hooks/useWishlistState";
import useSnipcartCount from "../hooks/useSnipcartCount";

const Layout = ({ children }: { children: React.ReactNode }) => {
    const wishlistState = useWishlistState();
    const { cart } = useSnipcartCount();

    const hasItems = wishlistState?.hasItems || false;
    const cartHasItems = cart.items.count !== 0;

    return (
        <>
            {/* Modern Sticky Header with Glassmorphism */}
            <header className="sticky top-0 z-10 glass-dark border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        {/* Logo with Gradient */}
                        <Link href="/" className="flex items-center space-x-3 group">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur opacity-75 group-hover:opacity-100 transition"></div>
                                <div className="relative bg-white rounded-full p-2">
                                    <svg
                                        className="w-8 h-8 text-indigo-600"
                                        viewBox="0 0 70 70"
                                        fill="currentColor"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            clipRule="evenodd"
                                            d="M55.4994 63.3717C64.2846 57.013 70 46.674 70 35C70 15.67 54.33 0 35 0C15.67 0 0 15.67 0 35C0 46.674 5.71537 57.013 14.5006 63.3717V44.3834L4.37865 34.0052C4.36359 33.9907 4.34884 33.9758 4.33454 33.9605C3.87179 33.4664 3.89156 32.6853 4.37865 32.2159L17.0919 20.7148C17.2087 20.6068 17.345 20.5231 17.4934 20.468L26.7394 17.0744C26.8484 17.0356 26.9624 17.0127 27.0776 17.0064C27.7486 16.97 28.3216 17.4921 28.3575 18.1727C28.3696 18.4442 28.7589 24.7007 34.9635 24.7994C41.1316 24.7007 41.533 18.4442 41.533 18.1727C41.5391 18.0499 41.5632 17.9288 41.6045 17.8133C41.8338 17.1727 42.5317 16.8418 43.1633 17.0744L52.4214 20.431C52.5699 20.486 52.7061 20.5698 52.8229 20.6778L65.6214 32.2159C65.6364 32.2304 65.6512 32.2454 65.6655 32.2606C66.1282 32.7549 66.1084 33.5359 65.6214 34.0052L55.4994 44.3834V63.3717ZM53.0297 65.0049V35.1405C53.0297 34.4591 53.5745 33.9065 54.2463 33.9065C54.9182 33.9065 55.4629 34.4591 55.4629 35.1405V40.8664L62.9327 33.1908L51.3874 22.6769L43.7716 19.888C43.0748 23.5295 40.2678 26.3767 36.6778 27.0834C31.8167 28.0404 27.1111 24.8189 26.1676 19.888L18.5518 22.6769L6.96996 33.1908L14.4519 40.8788V35.1405C14.4519 34.4591 14.9967 33.9065 15.6685 33.9065C16.3404 33.9065 16.8851 34.4591 16.8851 35.1405V64.9535C22.1696 68.1563 28.3695 70 35 70C41.5949 70 47.7638 68.176 53.0297 65.0049Z"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                PrintfulTshirt
                            </span>
                        </Link>

                        {/* Navigation - Hidden on mobile */}
                        <nav className="hidden md:flex items-center space-x-8">
                            <Link href="/" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition">
                                SHOP
                            </Link>
                            <Link href="/about" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition">
                                ABOUT
                            </Link>
                            <Link href="/terms-of-sale" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition">
                                TERMS
                            </Link>
                        </nav>

                        {/* Action Icons */}
                        <div className="flex items-center space-x-2 md:space-x-4">
                            <button
                                className="snipcart-customer-signin relative p-2 rounded-full hover:bg-gray-100 transition group"
                                aria-label="User login"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    className="w-6 h-6 text-gray-700 group-hover:text-indigo-600 transition"
                                    fill="currentColor"
                                >
                                    <path d="M4 22a8 8 0 1 1 16 0h-2a6 6 0 1 0-12 0H4zm8-9c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6zm0-2c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
                                </svg>
                            </button>

                            <Link
                                href="/wishlist"
                                className="relative p-2 rounded-full hover:bg-gray-100 transition group"
                                aria-label="Wishlist"
                            >
                                {hasItems && (
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full animate-pulse"></span>
                                )}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    className="w-6 h-6 text-gray-700 group-hover:text-pink-500 transition"
                                    fill={hasItems ? "currentColor" : "none"}
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M12.001 4.529c2.349-2.109 5.979-2.039 8.242.228 2.262 2.268 2.34 5.88.236 8.236l-8.48 8.492-8.478-8.492c-2.104-2.356-2.025-5.974.236-8.236 2.265-2.264 5.888-2.34 8.244-.228z" />
                                </svg>
                            </Link>

                            <button
                                className="snipcart-checkout relative p-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition group"
                                aria-label="Cart"
                            >
                                {cartHasItems && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
                                        {cart.items.count}
                                    </span>
                                )}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    className="w-6 h-6 text-white"
                                    fill="currentColor"
                                >
                                    <path d="M4 16V4H2V2h3a1 1 0 0 1 1 1v12h12.438l2-8H8V5h13.72a1 1 0 0 1 .97 1.243l-2.5 10a1 1 0 0 1-.97.757H5a1 1 0 0 1-1-1zm2 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm12 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="min-h-screen">
                {children}
            </main>

            {/* Modern Footer */}
            <footer className="bg-gradient-to-b from-gray-50 to-white border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        {/* Brand */}
                        <div>
                            <h3 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                                PrintfulTshirt
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Premium print-on-demand products, delivered worldwide with love.
                            </p>
                            <div className="flex space-x-4">
                                <a href="#" className="text-gray-400 hover:text-indigo-600 transition">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                </a>
                                <a href="#" className="text-gray-400 hover:text-indigo-600 transition">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                                </a>
                                <a href="#" className="text-gray-400 hover:text-indigo-600 transition">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" /></svg>
                                </a>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                                Quick Links
                            </h3>
                            <ul className="space-y-2">
                                <li><Link href="/about" className="text-sm text-gray-600 hover:text-indigo-600 transition">About Us</Link></li>
                                <li><Link href="/terms-of-sale" className="text-sm text-gray-600 hover:text-indigo-600 transition">Terms of Sale</Link></li>
                                <li><Link href="/wishlist" className="text-sm text-gray-600 hover:text-indigo-600 transition">My Wishlist</Link></li>
                            </ul>
                        </div>

                        {/* Newsletter */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                                Stay Updated
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Subscribe to get special offers and new products.
                            </p>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const form = e.target as HTMLFormElement;
                                    const input = form.elements.namedItem('email') as HTMLInputElement;
                                    const email = input.value;

                                    if (email) {
                                        // Simulate API call
                                        const btn = form.querySelector('button');
                                        if (btn) {
                                            const originalText = btn.innerHTML;
                                            btn.disabled = true;
                                            btn.innerHTML = '<span class="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>';

                                            setTimeout(() => {
                                                btn.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;
                                                btn.classList.remove('from-indigo-600', 'to-purple-600');
                                                btn.classList.add('bg-green-500');
                                                input.value = '';
                                                input.placeholder = 'Thanks for subscribing!';

                                                setTimeout(() => {
                                                    btn.disabled = false;
                                                    btn.innerHTML = originalText;
                                                    btn.classList.add('from-indigo-600', 'to-purple-600');
                                                    btn.classList.remove('bg-green-500');
                                                    input.placeholder = 'Your email';
                                                }, 3000);
                                            }, 1000);
                                        }
                                    }
                                }}
                                className="flex"
                            >
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    placeholder="Your email"
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                                />
                                <button type="submit" className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-r-lg hover:from-indigo-700 hover:to-purple-700 transition flex items-center justify-center min-w-[3rem]">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="border-t border-gray-200 pt-8 mt-8">
                        <p className="text-center text-sm text-gray-500">
                            © {new Date().getFullYear()} PrintfulTshirt. Powered by{" "}
                            <a
                                href="https://printfultshirt.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                                PrintfulTshirt
                            </a>

                        </p>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default Layout;
