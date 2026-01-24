declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "address-fields": any;
      "snipcart-label": any;
      "snipcart-input": any;
    }
  }
}


export type SnipcartWebhookEvent =
  | "order.completed"
  | "order.status.changed"
  | "order.paymentStatus.changed"
  | "order.trackingNumber.changed"
  | "order.refund.created"
  | "order.notification.created"
  | "subscription.created"
  | "subscription.cancelled"
  | "subscription.paused"
  | "subscription.resumed"
  | "subscription.invoice.created"
  | "shippingrates.fetch"
  | "taxes.calculate"
  | "customauth:customer_updated";

export interface SnipcartItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  totalPrice: number;
  [key: string]: any;
}

export interface SnipcartWebhookContent {
  discounts: { [key: string]: any };
  items: SnipcartItem[];
  shippingAddress: {
    fullName: string;
    firstName?: string;
    name: string;
    company?: string;
    address1: string;
    address2?: string;
    fullAddress: string;
    city: string;
    country: string;
    postalCode: string;
    province: string;
    phone?: string;
  };
  shippingRateUserDefinedId?: string;
  [key: string]: any;
}

export type SnipcartShippingRate = {
  /** Shipping method's price. */
  cost: number;
  /** Name or description of the shipping method. */
  description: string;
  /** Estimated time for delivery in days. */
  guaranteedDaysToDelivery?: number;
  /** Internal ID of shipping method, can be useful when using shipping fulfillment solutions. */
  userDefinedId?: string;
};

export type SnipcartTaxItem = {
  name: string;
  amount: number;
  rate: number;
  numberForInvoice?: string;
  includedInPrice?: boolean;
  appliesOnShipping?: boolean;
};

export interface SnipcartRequest {
  headers: {
    "x-snipcart-requesttoken"?: string;
  };
  body: {
    eventName: SnipcartWebhookEvent;
    mode: string;
    createdOn: string;
    content: SnipcartWebhookContent;
  };
}

export interface ISyncProduct {
  id: string;
  external_id: string;
  name: string;
  variants: number;
  synced: number;
  thumbnail_url?: string;
  is_ignored?: boolean;
}

export interface PrintfulProduct {
  id: string;
  name: string;
  description?: string;
  thumbnail_url?: string;
  variants: Array<{
    id?: string;
    external_id: string;
    name: string;
    size?: string;
    color?: string;
    parent_id?: number;
    retail_price: number;
    currency: string;
    preview_url?: string;
    product?: {
      variant_id: number;
      product_id: number;
      image: string;
      name: string;
    };
    files: Array<{
      type: string;
      preview_url: string;
    }>;
    options?: any[];
    in_stock?: boolean;
  }>;
  categories?: Array<{
    id: number;
    printfulId: number;
    name: string;
    imageUrl?: string | null;
  }>;
}

export type PrintfulShippingItem = {
  external_variant_id: string;
  quantity: number;
};

export interface PrintfulCategory {
  id: number;
  printful_id?: number;
  parent_id: number;
  image_url: string;
  catalog_position: number;
  size: string;
  title: string;
  name?: string;
}
