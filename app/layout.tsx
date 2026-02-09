import type { Metadata } from "next";
import "./globals.css";
import { WishlistProvider } from "../src/context/wishlist";
import Layout from "../src/components/Layout";
import Script from "next/script";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://printfultshirt.com'),
  title: {
    default: "Printful T-shirt - Premium Custom Apparel",
    template: "%s | Printful T-shirt"
  },
  description: "Discover high-quality print-on-demand t-shirts, hoodies, and accessories. Unique designs, premium materials, and worldwide shipping powered by Printful.",
  keywords: ["custom t-shirts", "print on demand", "premium apparel", "unique designs", "clothing store"],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Printful T-shirt',
    title: 'Printful T-shirt - Premium Custom Apparel',
    description: 'Discover high-quality print-on-demand t-shirts, hoodies, and accessories.',
    images: [
      {
        url: '/og-image.jpg', // Ensure this aligns with an actual asset or dynamic generation
        width: 1200,
        height: 630,
        alt: 'Printful T-shirt Store',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Printful T-shirt - Premium Custom Apparel',
    description: 'Discover high-quality print-on-demand t-shirts, hoodies, and accessories.',
    creator: '@printful', // Update with actual handle if available
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

import { getRawCategoriesFromDB } from "../src/lib/sync-products";
import { PrintfulCategory } from "../src/types";

// Cache layout for 10 minutes (categories don't change often)
export const revalidate = 600;

// Helper to fetch categories
async function getCategories(): Promise<PrintfulCategory[]> {
  try {
    // Fetch from DB instead of API to prevent "fetch failed" and improve performance
    return await getRawCategoriesFromDB();
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

        {/* Google Analytics & Google Ads */}
        {(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GOOGLE_ADS_ID) && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  
                  ${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? `
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                    page_path: window.location.pathname,
                  });` : ''}
                  
                  ${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ? `
                  gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}');` : ''}
                `,
              }}
            />
          </>
        )}

        {/* Google Ads Conversion - Snipcart Integration */}
        {process.env.NEXT_PUBLIC_GOOGLE_ADS_ID && (
          <Script
            id="google-ads-conversion"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                document.addEventListener('snipcart.ready', function() {
                  Snipcart.events.on('order.completed', function(order) {
                    gtag('event', 'conversion', {
                      'send_to': '${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}/JmLMCK2Iv_QbEKOz-eNC',
                      'value': order.total,
                      'currency': order.currency,
                      'transaction_id': order.invoiceNumber
                    });
                  });
                });
              `,
            }}
          />
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
