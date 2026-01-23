"use client";


import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useWishlistState from "../hooks/useWishlistState";
import useSnipcartCount from "../hooks/useSnipcartCount";
import { PrintfulCategory } from "../types";

const slugify = (text: string) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w-]+/g, '')   // Remove all non-word chars
        .replace(/--+/g, '-');    // Replace multiple - with single -
};

const Layout = ({ children, categories = [] }: { children: React.ReactNode, categories?: PrintfulCategory[] }) => {
    const router = useRouter();
    const wishlistState = useWishlistState();
    const { cart } = useSnipcartCount();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
    const [activeRootId, setActiveRootId] = useState<number | null>(null);

    const hasItems = wishlistState?.hasItems || false;
    const cartHasItems = cart.items.count !== 0;

    // Process categories into hierarchy
    const categoryTree = useMemo(() => {
        const roots: PrintfulCategory[] = [];
        const childrenMap: Record<number, PrintfulCategory[]> = {};

        // User requested specific root categories in this order
        const allowedRootPrintfulIds = [1, 2, 3, 4, 5, 93];

        // Sort categories by catalog_position if available, otherwise by ID
        const sortedCategories = [...categories].sort((a, b) => {
            const posA = a.catalog_position ?? a.id;
            const posB = b.catalog_position ?? b.id;
            return posA - posB;
        });

        sortedCategories.forEach(cat => {
            const printfulId = Number(cat.printful_id || cat.id);

            if (cat.parent_id === 0) {
                // Only add if it's in the allowed roots list
                if (allowedRootPrintfulIds.includes(printfulId)) {
                    roots.push(cat);
                }
            } else {
                if (!childrenMap[cat.parent_id]) {
                    childrenMap[cat.parent_id] = [];
                }
                childrenMap[cat.parent_id].push(cat);
            }
        });

        // Flatten logic: If a root has only ONE child and that child's name contains "All ",
        // promote the grandchildren to be direct children of the root.
        // This is specifically for "Hats" -> "All hats" -> [Snapbacks, etc.]
        roots.forEach(root => {
            const rootId = root.printful_id || root.id;
            const children = childrenMap[rootId] || [];

            if (children.length === 1) {
                const onlyChild = children[0];
                const onlyChildId = onlyChild.printful_id || onlyChild.id;
                const grandChildren = childrenMap[onlyChildId] || [];

                if (grandChildren.length > 0 &&
                    (onlyChild.title.toLowerCase().startsWith("all ") || onlyChild.name?.toLowerCase().startsWith("all "))) {
                    // Replace the single "All" wrapper with its children
                    childrenMap[rootId] = grandChildren;
                    console.log(`[Layout] Flattened category ${root.title} by removing ${onlyChild.title} wrapper`);
                }
            }
        });

        // Re-sort roots to match the EXACT requested order
        roots.sort((a, b) => {
            const idA = Number(a.printful_id || a.id);
            const idB = Number(b.printful_id || b.id);
            return allowedRootPrintfulIds.indexOf(idA) - allowedRootPrintfulIds.indexOf(idB);
        });

        return { roots, childrenMap };
    }, [categories]);

    // Set default active root when menu opens or roots load
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (isMegaMenuOpen && categoryTree.roots.length > 0 && activeRootId === null) {
            const firstRoot = categoryTree.roots[0];
            setActiveRootId(firstRoot.printful_id || firstRoot.id);
        }
    }, [isMegaMenuOpen, categoryTree.roots]);

    // Auto-detect active category from URL
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const categoryParam = params.get('category');

            if (categoryParam && categoryTree.roots.length > 0) {
                // Find root category that matches
                const matchingRoot = categoryTree.roots.find(root =>
                    root.title.toLowerCase() === categoryParam.toLowerCase()
                );

                if (matchingRoot) {
                    setActiveRootId(matchingRoot.printful_id || matchingRoot.id);
                    return;
                }

                // If not found in roots, search in sub-categories (Level 2 & Level 3)
                for (const root of categoryTree.roots) {
                    const rootId = root.printful_id || root.id;
                    const level2 = categoryTree.childrenMap[rootId] || [];

                    // Check Level 2
                    const matchingL2 = level2.find(sub =>
                        (sub.title || sub.name || "").toLowerCase() === categoryParam.toLowerCase()
                    );
                    if (matchingL2) {
                        setActiveRootId(rootId);
                        return;
                    }

                    // Check Level 3
                    for (const sub of level2) {
                        const subId = sub.printful_id || sub.id;
                        const level3 = categoryTree.childrenMap[subId] || [];
                        const matchingL3 = level3.find(l3 =>
                            (l3.title || l3.name || "").toLowerCase() === categoryParam.toLowerCase()
                        );
                        if (matchingL3) {
                            setActiveRootId(rootId);
                            return;
                        }
                    }
                }
            }
        }
    }, [categoryTree]);

    return (
        <>
            {/* Modern Sticky Header with Glassmorphism */}
            <header className="sticky top-0 z-10 fixed glass-dark border-b border-white/10" onMouseLeave={() => setIsMegaMenuOpen(false)}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        {/* Logo with Gradient */}
                        <Link href="/" className="flex items-center space-x-2 md:space-x-3 group z-50">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur opacity-75 group-hover:opacity-100 transition"></div>
                                <div className="relative bg-white rounded-full p-1.5 md:p-2">
                                    <svg
                                        className="w-6 h-6 md:w-8 md:h-8 text-indigo-600"
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
                            <span className="text-lg md:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent truncate max-w-[120px] md:max-w-none">
                                PrintfulTshirt
                            </span>
                        </Link>

                        {/* Navigation - Hidden on mobile */}
                        <nav className="hidden md:flex items-center space-x-8">
                            {/* Mega Menu Trigger */}
                            <div
                                className="group h-full flex items-center"
                                onMouseEnter={() => setIsMegaMenuOpen(true)}
                            >
                                <button className={`text-sm font-medium transition flex items-center gap-1 ${isMegaMenuOpen ? 'text-indigo-600' : 'text-gray-700 hover:text-indigo-600'}`}>
                                    CATEGORIES
                                    <svg className={`w-4 h-4 transition-transform duration-200 ${isMegaMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            </div>

                            <Link href="/products?page=1" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition">
                                ALL PRODUCTS
                            </Link>
                            <Link href="/about" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition">
                                ABOUT
                            </Link>
                        </nav>

                        {/* Action Icons & Mobile Menu Button */}
                        <div className="flex items-center gap-1 md:space-x-4">
                            <button
                                className="snipcart-customer-signin relative p-1.5 md:p-2 rounded-full hover:bg-gray-100 transition group"
                                aria-label="User login"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    className="w-5 h-5 md:w-6 md:h-6 text-gray-700 group-hover:text-indigo-600 transition"
                                    fill="currentColor"
                                >
                                    <path d="M4 22a8 8 0 1 1 16 0h-2a6 6 0 1 0-12 0H4zm8-9c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6zm0-2c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
                                </svg>
                            </button>

                            <Link
                                href="/wishlist"
                                className="relative p-1.5 md:p-2 rounded-full hover:bg-gray-100 transition group"
                                aria-label="Wishlist"
                            >
                                {hasItems && (
                                    <span className="absolute top-1 right-1 w-1.5 h-1.5 md:w-2 md:h-2 bg-pink-500 rounded-full animate-pulse"></span>
                                )}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    className="w-5 h-5 md:w-6 md:h-6 text-gray-700 group-hover:text-pink-500 transition"
                                    fill={hasItems ? "currentColor" : "none"}
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M12.001 4.529c2.349-2.109 5.979-2.039 8.242.228 2.262 2.268 2.34 5.88.236 8.236l-8.48 8.492-8.478-8.492c-2.104-2.356-2.025-5.974.236-8.236 2.265-2.264 5.888-2.34 8.244-.228z" />
                                </svg>
                            </Link>

                            <button
                                className="snipcart-checkout relative p-1.5 md:p-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition group"
                                aria-label="Cart"
                            >
                                {cartHasItems && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-pink-500 text-white text-[10px] md:text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
                                        {cart.items.count}
                                    </span>
                                )}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    className="w-5 h-5 md:w-6 md:h-6 text-white"
                                    fill="currentColor"
                                >
                                    <path d="M4 16V4H2V2h3a1 1 0 0 1 1 1v12h12.438l2-8H8V5h13.72a1 1 0 0 1 .97 1.243l-2.5 10a1 1 0 0 1-.97.757H5a1 1 0 0 1-1-1zm2 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm12 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
                                </svg>
                            </button>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="md:hidden p-1.5 text-gray-700 hover:text-indigo-600 transition"
                                aria-label="Menu"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {isMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Navigation Dropdown */}
                    {isMenuOpen && (
                        <nav className="md:hidden py-4 border-t border-gray-100 animate-fade-in max-h-[calc(100vh-80px)] overflow-y-auto">
                            <ul className="flex flex-col space-y-2">
                                {/* Categories Accordion */}
                                <li className="border-b border-gray-100 pb-2">
                                    <button
                                        onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
                                        className="w-full flex items-center justify-between px-4 py-3 text-base font-semibold text-gray-900 hover:bg-gray-50 rounded-lg transition"
                                    >
                                        <span>CATEGORIES</span>
                                        <svg
                                            className={`w-5 h-5 transition-transform duration-200 ${isMegaMenuOpen ? 'rotate-180' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {/* Category List */}
                                    {isMegaMenuOpen && (
                                        <div className="mt-2 space-y-1 animate-fade-in">
                                            {categoryTree.roots.map((root) => {
                                                const rootId = root.printful_id || root.id;
                                                const hasChildren = categoryTree.childrenMap[rootId]?.length > 0;
                                                const isExpanded = activeRootId === rootId;

                                                return (
                                                    <div key={root.id} className="ml-2">
                                                        <button
                                                            onClick={() => {
                                                                if (hasChildren) {
                                                                    setActiveRootId(isExpanded ? null : rootId);
                                                                } else {
                                                                    router.push(`/products/categories/${rootId}/${slugify(root.title || root.name || "category")}`);
                                                                    setIsMenuOpen(false);
                                                                    setIsMegaMenuOpen(false);
                                                                }
                                                            }}
                                                            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all ${isExpanded
                                                                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                                                                : 'text-gray-700 hover:bg-gray-50'
                                                                }`}
                                                        >
                                                            <span className="text-sm font-medium">{root.title}</span>
                                                            {hasChildren && (
                                                                <svg
                                                                    className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                </svg>
                                                            )}
                                                        </button>

                                                        {/* Sub-categories */}
                                                        {
                                                            isExpanded && hasChildren && (
                                                                <div className="ml-4 mt-1 space-y-1 animate-fade-in border-l-2 border-indigo-200 pl-2">
                                                                    {categoryTree.childrenMap[rootId].map((subCat) => (
                                                                        <div key={subCat.id}>
                                                                            <Link
                                                                                href={`/products/categories/${subCat.id}/${slugify(subCat.title || subCat.name || "category")}`}
                                                                                className="block px-3 py-2 text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition"
                                                                                onClick={() => {
                                                                                    setIsMenuOpen(false);
                                                                                    setIsMegaMenuOpen(false);
                                                                                }}
                                                                            >
                                                                                {subCat.title || subCat.name}
                                                                            </Link>

                                                                            {/* Level 3 Sub-categories */}
                                                                            {categoryTree.childrenMap[subCat.printful_id || subCat.id]?.length > 0 && (
                                                                                <div className="ml-3 mt-1 space-y-1 border-l border-gray-200 pl-2">
                                                                                    {categoryTree.childrenMap[subCat.printful_id || subCat.id].map((level3) => (
                                                                                        <Link
                                                                                            key={level3.id}
                                                                                            href={`/products/categories/${level3.id}/${slugify(level3.title || level3.name || "category")}`}
                                                                                            className="block px-2 py-1.5 text-xs text-gray-500 hover:text-indigo-600 rounded transition flex items-center"
                                                                                            onClick={() => {
                                                                                                setIsMenuOpen(false);
                                                                                                setIsMegaMenuOpen(false);
                                                                                            }}
                                                                                        >
                                                                                            <span className="w-1 h-1 rounded-full bg-gray-300 mr-2"></span>
                                                                                            {level3.title || level3.name}
                                                                                        </Link>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )
                                                        }
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </li>

                                {/* Other Menu Items */}
                                <li>
                                    <Link
                                        href="/products?page=1"
                                        className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 rounded-lg transition"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        ALL PRODUCTS
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/about"
                                        className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 rounded-lg transition"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        ABOUT
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/terms-of-sale"
                                        className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 rounded-lg transition"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        TERMS OF SALE
                                    </Link>
                                </li>
                            </ul>
                        </nav>
                    )}
                </div>

                {/* Mega Menu Dropdown (Flowbite Style) */}
                {isMegaMenuOpen && (
                    <div
                        className="absolute top-full left-1/2 -translate-x-1/2 max-w-screen-xl w-full bg-white border border-gray-200 rounded-b-lg shadow-lg z-10 animate-fade-in"
                        onMouseEnter={() => setIsMegaMenuOpen(true)}
                        onMouseLeave={() => setIsMegaMenuOpen(false)}
                    >
                        <div className="flex divide-x divide-gray-200">
                            {/* Column 1: Root Categories (Left) */}
                            <div className="w-80 py-6 px-4">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-3">Main Categories</h3>
                                <ul className="space-y-1">
                                    {categoryTree.roots.map((root) => (
                                        <li key={root.id}>
                                            <button
                                                className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center justify-between group ${activeRootId === (root.printful_id || root.id)
                                                    ? "bg-indigo-50 text-indigo-700 font-semibold"
                                                    : "text-gray-700 hover:bg-gray-50 font-medium"
                                                    }`}
                                                onMouseEnter={() => setActiveRootId(root.printful_id || root.id)}
                                                onClick={() => {
                                                    router.push(`/products/categories/${root.printful_id || root.id}/${slugify(root.title)}`);
                                                    setIsMegaMenuOpen(false);
                                                }}
                                            >
                                                <span>{root.title}</span>
                                                <svg
                                                    className={`w-4 h-4 transition-transform ${activeRootId === (root.printful_id || root.id) ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Column 2: Sub-Categories (Middle/Right) with Scroll */}
                            {activeRootId && categoryTree.childrenMap[activeRootId] && (
                                <div className="flex-1 bg-gray-50/50 flex flex-col max-h-[600px]">
                                    <div className="py-6 px-6 border-b border-gray-200">
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            {categoryTree.roots.find(r => (r.printful_id || r.id) === activeRootId)?.title} - Categories
                                        </h3>
                                    </div>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar py-6 px-6">
                                        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
                                            {categoryTree.childrenMap[activeRootId].map((subCat) => (
                                                <div key={subCat.id} className="flex flex-col space-y-4">
                                                    {/* Sub-category Header with Image */}
                                                    <Link
                                                        href={`/products/categories/${subCat.printful_id || subCat.id}/${slugify(subCat.title || subCat.name || "")}`}
                                                        className="group flex flex-col space-y-3"
                                                        onClick={() => setIsMegaMenuOpen(false)}
                                                    >
                                                        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm transition-transform duration-300 group-hover:scale-[1.02] group-hover:shadow-md">
                                                            {subCat.image_url ? (
                                                                <img
                                                                    src={subCat.image_url}
                                                                    alt={subCat.title}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                                                        </div>
                                                        <span className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight text-sm">
                                                            {subCat.title || subCat.name}
                                                        </span>
                                                    </Link>

                                                    {/* Level 3: Sub-Sub-Categories */}
                                                    {categoryTree.childrenMap[subCat.printful_id || subCat.id] && categoryTree.childrenMap[subCat.printful_id || subCat.id].length > 0 ? (
                                                        <ul className="space-y-1.5 border-l border-gray-100 pl-2">
                                                            {categoryTree.childrenMap[subCat.printful_id || subCat.id].map((level3) => (
                                                                <li key={level3.id}>
                                                                    <Link
                                                                        href={`/products/categories/${level3.printful_id || level3.id}/${slugify(level3.title || level3.name || "")}`}
                                                                        className="text-xs text-gray-600 hover:text-indigo-600 hover:translate-x-1 transition-all flex items-center group/item"
                                                                        onClick={() => setIsMegaMenuOpen(false)}
                                                                    >
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-200 mr-2 group-hover/item:bg-indigo-500 transition-colors"></span>
                                                                        {level3.title || level3.name}
                                                                    </Link>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <Link
                                                            href={`/products/categories/${subCat.printful_id || subCat.id}/${slugify(subCat.title || subCat.name || "")}`}
                                                            className="text-xs font-medium text-indigo-500 hover:text-indigo-700 transition-colors inline-flex items-center"
                                                            onClick={() => setIsMegaMenuOpen(false)}
                                                        >
                                                            Shop Collection →
                                                        </Link>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Fallback if no active category */}
                            {activeRootId && !categoryTree.childrenMap[activeRootId] && (
                                <div className="flex-1 py-6 px-6 bg-gray-50/50 min-h-[400px] flex items-center justify-center">
                                    <div className="text-center">
                                        <p className="text-gray-500 mb-4">No sub-categories available</p>
                                        <Link
                                            href={`/products/categories/${activeRootId}/${slugify(categoryTree.roots.find(r => (r.printful_id || r.id) === activeRootId)?.title || '')}`}
                                            className="inline-flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                                            onClick={() => setIsMegaMenuOpen(false)}
                                        >
                                            View All Products
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content */}
            {children}

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
