import type { Metadata } from "next";
import "./globals.css";
import { WishlistProvider } from "../src/context/wishlist";
import Layout from "../src/components/Layout";
import Script from "next/script";

export const metadata: Metadata = {
  title: "PrintfulTshirt - Dropshipping Store",
  description: "High quality print-on-demand products powered by Printful",
};

import { printful, fetchWithRetry } from "../src/lib/printful-client";
import { PrintfulCategory } from "../src/types";

// Cache layout for 10 minutes (categories don't change often)
export const revalidate = 600;

// Helper to fetch categories
async function getCategories(): Promise<PrintfulCategory[]> {
  try {
    const response = await fetchWithRetry<any>(
      () => printful.get("categories")
    );
    return response.result.categories;
  } catch (error) {
    console.error("Error fetching categories for layout:", error);
    return [];
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Only fetch categories - no need for products in layout
  // This reduces API calls and prevents rate limiting
  const categories = await getCategories();

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="preconnect" href="https://app.snipcart.com" />
        <link rel="preconnect" href="https://cdn.snipcart.com" />
        <link
          rel="stylesheet"
          href="https://cdn.snipcart.com/themes/v3.2.0/default/snipcart.css"
        />
      </head>
      <body suppressHydrationWarning>
        <WishlistProvider>
          <Layout categories={categories}>
            {children}
          </Layout>
        </WishlistProvider>

        {/* Google Analytics 4 - Only in production */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}

        <div
          hidden
          id="snipcart"
          data-api-key={process.env.NEXT_PUBLIC_SNIPCART_API_KEY}
          data-config-modal-style="side"
        />

        <Script
          src="https://cdn.snipcart.com/themes/v3.2.0/default/snipcart.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
