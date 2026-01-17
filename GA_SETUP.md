# Google Analytics Setup Instructions

## 1. Get Your GA4 Measurement ID

1. Go to https://analytics.google.com/
2. Create a new GA4 property
3. Copy your Measurement ID (format: `G-XXXXXXXXXX`)

## 2. Add to Environment Variables

Add this to your `.env.local` file:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-83MF6YBJYJ
```

## 3. Integration Already Done! ✅

The GoogleAnalytics component has been created and is ready to use.

## 4. Track Custom Events (Optional)

In your components, you can track events:

```typescript
import { trackEvent } from '@/components/GoogleAnalytics';

// Track add to cart
trackEvent('add_to_cart', {
  product_id: product.id,
  product_name: product.name,
  value: product.price
});

// Track purchase (Snipcart webhook)
trackEvent('purchase', {
  transaction_id: order.id,  
  value: order.total,
  currency: 'USD'
});
```

## Next Steps:
1. Create GA4 property
2. Add measurement ID to `.env.local`
3. Deploy and test!
