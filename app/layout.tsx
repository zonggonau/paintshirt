import type { Metadata } from "next";
import "./globals.css";
import { WishlistProvider } from "../src/context/wishlist";
import Layout from "../src/components/Layout";
import Script from "next/script";

export const metadata: Metadata = {
  title: "PrintfulTshirt - Dropshipping Store",
  description: "High quality print-on-demand products powered by Printful",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
          <Layout>{children}</Layout>
        </WishlistProvider>

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
