# Google Analytics Tracking Implementation Guide

## 📍 Di Mana Tracking Event Dipasang

### 1. **Add to Cart Tracking** ✅

**File**: `src/components/ProductDetailClient.tsx`

**Kapan**: Ketika user klik tombol "Add to Cart" dan item berhasil ditambahkan ke keranjang Snipcart

**Event yang di-track**: `add_to_cart`

**Data yang dikirim**:
```typescript
{
  currency: "USD",
  value: 29.99, // Harga produk
  items: [{
    item_id: "variant_external_id",
    item_name: "Product Name",
    item_variant: "Variant Name (size/color)",
    price: 29.99,
    quantity: 1
  }]
}
```

**Implementasi**:
```typescript
// Di src/components/ProductDetailClient.tsx (sudah ditambahkan!)
useEffect(() => {
    const handleAddToCart = (event: any) => {
        const item = event.detail?.item;
        if (item && item.id === activeVariantExternalId) {
            trackEvent('add_to_cart', {
                currency: activeVariant.currency,
                value: activeVariant.retail_price,
                items: [{
                    item_id: activeVariantExternalId,
                    item_name: name,
                    item_variant: activeVariant.name,
                    price: activeVariant.retail_price,
                    quantity: 1
                }]
            });
        }
    };

    document.addEventListener('snipcart.ready', () => {
        if (window.Snipcart) {
            window.Snipcart.events.on('item.added', handleAddToCart);
        }
    });

    return () => {
        if (window.Snipcart) {
            window.Snipcart.events.off('item.added', handleAddToCart);
        }
    };
}, [activeVariantExternalId, activeVariant, name]);
```

---

### 2. **Purchase Tracking** 🔜

**File**: Pilih salah satu opsi:

#### **Opsi A: Track di Layout.tsx (Recommended)**

Pasang di `src/components/Layout.tsx` untuk mendengarkan event purchase dari Snipcart:

```typescript
// Tambahkan di Layout.tsx
import { trackEvent } from './GoogleAnalytics';

useEffect(() => {
    document.addEventListener('snipcart.ready', () => {
        if (window.Snipcart) {
            window.Snipcart.events.on('order.completed', (order: any) => {
                trackEvent('purchase', {
                    transaction_id: order.invoiceNumber,
                    value: order.total,
                    currency: order.currency,
                    tax: order.taxesTotal,
                    shipping: order.shippingTotal,
                    items: order.items.map((item: any) => ({
                        item_id: item.id,
                        item_name: item.name,
                        price: item.price,
                        quantity: item.quantity
                    }))
                });
            });
        }
    });
}, []);
```

#### **Opsi B: Track via Server-Side (Webhook)**

Jika Anda punya webhook Snipcart, pasang di API route untuk lebih akurat:

**File**: `app/api/snipcart-webhook/route.ts` (buat baru jika belum ada)

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const body = await request.json();
    
    if (body.eventName === 'order.completed') {
        const order = body.content;
        
        // Send to Google Analytics via Measurement Protocol
        // atau simpan ke database untuk tracking
        
        console.log('Order completed:', {
            transaction_id: order.invoiceNumber,
            value: order.total,
            currency: order.currency
        });
    }
    
    return NextResponse.json({ received: true });
}
```

---

### 3. **Page View Tracking** (Optional)

**File**: `app/layout.tsx` atau component pages

Untuk track page views saat navigasi client-side:

```typescript
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { trackPageView } from '@/components/GoogleAnalytics';

export default function SomeComponent() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        const url = pathname + searchParams.toString();
        trackPageView(url);
    }, [pathname, searchParams]);

    return <div>Your content</div>;
}
```

---

### 4. **Wishlist Tracking** (Optional)

**File**: Di mana action wishlist terjadi

```typescript
// Contoh: di ProductDetailClient.tsx atau Product card
const addToWishlist = () => {
    addItem?.(product);
    
    // Track wishlist event
    trackEvent('add_to_wishlist', {
        currency: activeVariant.currency,
        value: activeVariant.retail_price,
        items: [{
            item_id: product.id,
            item_name: product.name,
            price: activeVariant.retail_price
        }]
    });
};
```

---

## 🧪 Cara Test Tracking

### 1. Install Google Tag Assistant
- Install [Tag Assistant](https://chrome.google.com/webstore/detail/tag-assistant-legacy-by-g/kejbdjndbnbjgmefkgdddjlbokphdefk)
- Buka website Anda
- Klik extension Tag Assistant dan "Enable"

### 2. Test Add to Cart
1. Buka product detail page
2. Klik "Add to Cart"
3. Check console browser: `window.dataLayer` harus menampilkan event

### 3. Test di Google Analytics Real-Time
1. Buka Google Analytics → Reports → Realtime
2. Lakukan action (add to cart, purchase)
3. Lihat event muncul di real-time report

---

## 📊 Event Names (GA4 Recommended Events)

✅ **Sudah Diimplementasikan**:
- `add_to_cart` - Ketika item ditambahkan ke cart

🔜 **Rekomendasi untuk ditambahkan**:
- `purchase` - Ketika order selesai
- `view_item` - Ketika user lihat product detail
- `add_to_wishlist` - Ketika item ditambahkan ke wishlist
- `view_cart` - Ketika user buka cart
- `begin_checkout` - Ketika user mulai checkout
- `add_shipping_info` - Ketika shipping info ditambahkan
- `add_payment_info` - Ketika payment info ditambahkan

---

## 🔗 Resources

- [GA4 Ecommerce Events](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce)
- [Snipcart Events Documentation](https://docs.snipcart.com/v3/sdk/events)
- [Google Tag Manager Guide](https://tagmanager.google.com/)

---

## 🚀 Next Steps

1. ✅ Add to Cart tracking sudah aktif
2. [ ] Implementasikan Purchase tracking (pilih Opsi A atau B)
3. [ ] Test semua tracking events
4. [ ] Setup Goals/Conversions di Google Analytics
5. [ ] Monitor data masuk di GA4 Real-time
