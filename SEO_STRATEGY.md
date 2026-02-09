# SEO Strategy & Implementation Guide

## Overview

This document outlines the SEO optimizations implemented to ensure the Printful T-shirt Dropshipping website is easily discoverable by search engines (Google, Bing) and social media platforms (Facebook, Twitter), and is ready for AI interactions (URL-to-Video generators).

## 1. Technical SEO Implementation

### Global Metadata (`app/layout.tsx`)

We have upgraded the global metadata to establish a strong baseline for the entire site.

- **template**: `%s | Printful T-shirt` - Ensures consistent branding on all pages.
- **keywords**: Added high-value keywords ("custom t-shirts", "print on demand", etc.).
- **openGraph**: Configured for Facebook/LinkedIn sharing.
  - `type`: 'website'
  - `locale`: 'en_US'
  - `siteName`: Brands the site correctly.
- **twitter**: Configured for Twitter Cards (`summary_large_image`) to ensure large, clickable previews.
- **robots**: explicitly set to `index: true, follow: true` with specific directives for `googleBot`.

### Dynamic Product SEO (`app/products/categories/[[...dynamic]]/page.tsx`)

Product pages are the most critical for SEO. We implemented dynamic metadata that adjusts based on the specific product.

#### A. Smart Metadata

- **Title**: Dynamically uses `[Product Name] | Printful T-Shirt`.
- **Description**: Automatically stripes HTML tags from the product description to create a clean, search-engine-friendly meta description (capped at 160 chars).
- **Canonical URLs**: Uses `alternates` to prevent duplicate content issues, ensuring Google knows the "master" version of the page.
- **Social Images**: automatically pulls the main thumbnail _plus_ the first 3 variant previews (e.g., different colors) into `og:image`. This allows social platforms and AI tools to pick the best image.

#### B. Structure Data (JSON-LD)

We injected **Schema.org** structured data, which is the language Google uses to understand content.

1.  **Product Schema**:
    - `name`, `description`, `sku`, `mpn`.
    - `brand`: Explicitly defined.
    - `image`: Array of all available variant images.
    - `offers`: uses `AggregateOffer` to show the full price range (Low to High) and Availability (In Stock/Out of Stock).
    - **Why it matters**: This enables **Rich Snippets** in Google Search (showing Price, Stock status, and Star ratings directly in search results).
2.  **BreadcrumbList Schema**:
    - Maps the path: `Home > Products > [Category] > [Product Name]`.
    - **Why it matters**: Helps Google understand the site hierarchy and displays breadcrumbs in search results instead of long URLs.

## 2. "AI URL Generate Video" Readiness

To ensure the website works well with AI tools (like Opus, InVideo, or social bots that generate content from URLs):

1.  **Content Clarity**: The "Clean Description" logic ensures AI text-to-speech engines can read a coherent summary without reading HTML tags (`<p>`, `<br>`).
2.  **Visual Assets**: By providing an _array_ of high-resolution images in `og:image` and Schema `image`, video generation AI has a library of assets to create slideshows or dynamic video ads automatically.
3.  **Structured Data**: AI agents prefer structured data (JSON-LD) over parsing raw HTML. Our detailed `Product` schema gives them exactly what they need: Name, Price, and Availability.

## 3. How to Verify

### Google

1.  Use [Google Rich Results Test](https://search.google.com/test/rich-results).
2.  Enter a product URL (e.g., locally or deployed).
3.  Verify that "Product" and "Breadcrumbs" are detected with no errors.

### Facebook / Social

1.  Use [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/).
2.  Enter the URL.
3.  Verify that the Preview Image, Title, and Description appear correctly.

### Indexing

- **Sitemap**: A generic sitemap is generated at `/sitemap.xml`.
- **Robots.txt**: Located at `/robots.txt`, allowing full access to crawlers while blocking API routes.

## 4. Next Steps for Growth

- **Blog Strategy**: Create a blog section to target long-tail keywords (e.g., "Best custom t-shirt for events").
- **Backlinks**: Share your "Rich" URLs on social media to build domain authority.
- **Performance**: Keep an eye on Core Web Vitals (LCP, CLS) using PageSpeed Insights, as speed is a ranking factor.
