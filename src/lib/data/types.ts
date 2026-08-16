import type { Database } from "@/lib/database.types";

export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Business = Database["public"]["Tables"]["businesses"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Basket = Database["public"]["Tables"]["baskets"]["Row"];
export type BasketItem = Database["public"]["Tables"]["basket_items"]["Row"];
export type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];
export type SubscriptionItem =
  Database["public"]["Tables"]["subscription_items"]["Row"];
export type Delivery = Database["public"]["Tables"]["deliveries"]["Row"];
export type DeliveryItem = Database["public"]["Tables"]["delivery_items"]["Row"];
export type Address = Database["public"]["Tables"]["addresses"]["Row"];
export type PaymentMethod = Database["public"]["Tables"]["payment_methods"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type ActivityEvent = Database["public"]["Tables"]["activity_events"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export interface BasketItemWithProduct extends BasketItem {
  product: Product & { business: Business | null };
}

export interface BasketWithItems extends Basket {
  items: BasketItemWithProduct[];
  category: Category | null;
}

export interface SubscriptionItemWithProduct extends SubscriptionItem {
  product: Product | null;
}

export interface SubscriptionWithDetails extends Subscription {
  basket: Basket | null;
  items: SubscriptionItemWithProduct[];
  address: Address | null;
}

export interface DeliveryItemWithProduct extends DeliveryItem {
  product: Product | null;
}

export interface DeliveryWithItems extends Delivery {
  items: DeliveryItemWithProduct[];
}

export interface BasketSummary {
  itemCount: number;
  productTotal: number;
  estimatedDelivery: number;
  estimatedTotal: number;
}

export function summarizeBasket(
  items: BasketItemWithProduct[],
  deliveryFee = 2000,
): BasketSummary {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const productTotal = items.reduce(
    (sum, item) => sum + item.quantity * item.product.price,
    0,
  );
  return {
    itemCount,
    productTotal,
    estimatedDelivery: items.length > 0 ? deliveryFee : 0,
    estimatedTotal: productTotal + (items.length > 0 ? deliveryFee : 0),
  };
}
