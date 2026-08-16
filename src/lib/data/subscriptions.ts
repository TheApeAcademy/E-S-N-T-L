import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import type { DeliveryWithItems, SubscriptionWithDetails } from "@/lib/data/types";

type Client = SupabaseClient<Database>;

const SUBSCRIPTION_SELECT = `
  *,
  basket:baskets ( * ),
  items:subscription_items ( *, product:products (*) ),
  address:addresses ( * )
`;

export async function getSubscriptionsForUser(
  supabase: Client,
  ownerId: string,
  status?: Database["public"]["Tables"]["subscriptions"]["Row"]["status"],
) {
  let query = supabase
    .from("subscriptions")
    .select(SUBSCRIPTION_SELECT)
    .eq("owner_id", ownerId)
    .order("next_delivery_at", { ascending: true });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as SubscriptionWithDetails[];
}

export async function getSubscriptionById(supabase: Client, subscriptionId: string) {
  const { data, error } = await supabase
    .from("subscriptions")
    .select(SUBSCRIPTION_SELECT)
    .eq("id", subscriptionId)
    .single();

  if (error) throw error;
  return data as unknown as SubscriptionWithDetails;
}

export async function getDeliveriesForSubscription(
  supabase: Client,
  subscriptionId: string,
) {
  const { data, error } = await supabase
    .from("deliveries")
    .select("*, items:delivery_items ( *, product:products (*) )")
    .eq("subscription_id", subscriptionId)
    .order("scheduled_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as DeliveryWithItems[];
}

export function subscriptionAmount(
  items: { quantity: number; unit_price: number }[],
  deliveryFee: number,
) {
  return items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0) + deliveryFee;
}

export async function getPaymentsForSubscription(supabase: Client, subscriptionId: string) {
  const { data: deliveries } = await supabase
    .from("deliveries")
    .select("id")
    .eq("subscription_id", subscriptionId);

  const deliveryIds = (deliveries ?? []).map((d) => d.id);
  if (deliveryIds.length === 0) return [];

  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .in("delivery_id", deliveryIds)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
