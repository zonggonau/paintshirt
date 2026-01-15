# PainTshirt - Dropshipping Store

Toko dropshipping e-commerce modern yang dibangun dengan Next.js 16 (App Router), Printful API, dan Snipcart untuk pemrosesan pembayaran.

## 🚀 Fitur

- ✅ **Next.js 16 App Router** - Server Components dan streaming
- ✅ **Printful Integration** - Otomatis sinkronisasi produk print-on-demand
- ✅ **Snipcart E-commerce** - Checkout dan manajemen cart yang seamless
- ✅ **Product Filtering** - Filter berdasarkan kategori, warna, dan ukuran
- ✅ **Wishlist Functionality** - Simpan produk favorit
- ✅ **Responsive Design** - Mobile-first, modern UI
- ✅ **Product Search** - Cari produk dengan mudah
- ✅ **Variant Selection** - Pilih warna dan ukuran produk
- ✅ **Caching System** - In-memory cache untuk performa optimal

## 📁 Struktur Projek

```
dropshiping/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   └── products/[id]/        # Product API endpoint
│   ├── about/                    # About page
│   ├── terms-of-sale/            # Terms of Sale page
│   ├── wishlist/                 # Wishlist page
│   ├── layout.tsx                # Root layout dengan Snipcart
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── src/
│   ├── components/               # React Components
│   │   ├── Layout.tsx            # Header, footer, navigation
│   │   ├── Product.tsx           # Product card
│   │   ├── ProductGrid.tsx       # Product grid container
│   │   ├── ProductFilter.tsx     # Filter controls
│   │   └── SearchBar.tsx         # Search input
│   ├── context/                  # React Context
│   │   └── wishlist.tsx          # Wishlist state management
│   ├── hooks/                    # Custom hooks
│   │   ├── useLocalStorage.tsx   # Local storage hook
│   │   ├── useSnipcartCount.tsx  # Snipcart cart count
│   │   ├── useWishlistDispatch.ts
│   │   └── useWishlistState.ts
│   ├── lib/                      # Utilities
│   │   ├── printful-client.ts    # Printful API client
│   │   ├── format-variant-name.ts
│   │   ├── has-snipcart.ts
│   │   └── product-cache.ts      # Product caching
│   └── types.ts                  # TypeScript types
├── public/                       # Static assets
├── .env.local                    # Environment variables
├── package.json
└── README.md
```

## 🛠️ Setup & Installation

### Prerequisites

- Node.js 18+ atau 20+
- pnpm (recommended) atau npm
- Akun Printful (untuk API key)
- Akun Snipcart (untuk checkout)

### Installation Steps

1. **Clone repository**
   ```bash
   cd d:/projek/nextjs/dropshiping
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Setup environment variables**
   
   File `.env.local` sudah disediakan dengan:
   ```env
   PRINTFUL_API_KEY=your_printful_api_key
   NEXT_PUBLIC_SNIPCART_API_KEY=your_snipcart_api_key
   ```

4. **Run development server**
   ```bash
   pnpm dev
   ```

5. **Buka browser**
   ```
   http://localhost:3000
   ```

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PRINTFUL_API_KEY` | Printful API key untuk sync products | Yes |
| `NEXT_PUBLIC_SNIPCART_API_KEY` | Snipcart public API key | Yes |

## 📦 Dependencies

### Core
- **next** (16.1.2) - React framework
- **react** (19.2.3) - UI library
- **react-dom** (19.2.3) - React DOM

### Dropshipping & E-commerce
- **printful-request** - Printful API client
- **lodash.shuffle** - Array shuffling utility
- **classcat** - Conditional className utility

### Styling
- **tailwindcss** (v4) - Utility-first CSS
- **@tailwindcss/forms** - Form styling
- **@tailwindcss/postcss** - PostCSS integration

## 🎨 Features Explained

### Product Management
- Produk otomatis sync dari Printful
- Cache 5 menit untuk performa
- Retry logic untuk API calls
- Support multiple variants (size, color)

### Shopping Cart
- Snipcart integration
- Secure checkout
- Cart persistence
- Real-time updates

### Wishlist
- Client-side wishlist
- LocalStorage persistence
- Add/remove items
- View saved products

### Filtering & Search
- Search by product name
- Filter by category
- Filter by color
- Filter by size
- Clear all filters

## 🚀 Deployment

### Build untuk production
```bash
pnpm run build
pnpm start
```

### Deploy ke Vercel
```bash
vercel
```

Pastikan environment variables sudah diset di Vercel dashboard.

## 📝 API Routes

### GET /api/products/[id]
Mendapatkan detail variant produk untuk Snipcart validation.

**Response:**
```json
{
  "id": "variant_id",
  "price": 29.99,
  "url": "/api/products/variant_id"
}
```

## 🔧 Customization

### Update Brand Name
1. Edit `src/components/Layout.tsx` - Ubah "PainTshirt"
2. Edit `app/layout.tsx` - Ubah metadata title

### Custom Styling
- Edit `app/globals.css` untuk global styles
- Update Tailwind classes di components

### Add More Pages
Buat folder baru di `app/` directory:
```
app/
├── your-page/
│   └── page.tsx
```

## 🐛 Troubleshooting

### Produk tidak muncul
- Check Printful API key di `.env.local`
- Pastikan ada produk di Printful store
- Check console untuk errors

### Snipcart tidak bekerja
- Verify SNIPCART_API_KEY
- Check browser console untuk errors
- Pastikan domain di-whitelist di Snipcart dashboard

### Build errors
- Run `pnpm install` untuk update dependencies
- Clear `.next` folder: `rm -rf .next`
- Rebuild: `pnpm build`

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Printful API Docs](https://developers.printful.com/)
- [Snipcart Documentation](https://docs.snipcart.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 📄 License

This project is based on [Headless Dropshipping Starter](https://github.com/notrab/headless-dropshipping-starter) by [@notrab](https://twitter.com/notrab).

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## 👤 Author

Migrated to Next.js 16 App Router for modern architecture and improved performance.

---

**Happy Selling! 🛍️**
