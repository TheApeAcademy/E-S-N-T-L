import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import type {
  Basket,
  Business,
  Category,
  Payment,
  Product,
  Profile,
  Subscription,
} from "@/lib/data/types";

type Client = SupabaseClient<Database>;

export async function getOverviewStats(supabase: Client) {
  const [
    { count: customerCount },
    { count: businessCount },
    { count: productCount },
    { count: activeSubscriptionCount },
    { count: failedPaymentCount },
    { data: successfulPayments },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer"),
    supabase.from("businesses").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase.from("payments").select("id", { count: "exact", head: true }).eq("status", "failed"),
    supabase.from("payments").select("amount").eq("status", "successful"),
  ]);

  const revenue = (successfulPayments ?? []).reduce((sum, p) => sum + Number(p.amount), 0);

  return {
    customerCount: customerCount ?? 0,
    businessCount: businessCount ?? 0,
    productCount: productCount ?? 0,
    activeSubscriptionCount: activeSubscriptionCount ?? 0,
    failedPaymentCount: failedPaymentCount ?? 0,
    revenue,
  };
}

export async function getAllCustomers(supabase: Client, search?: string) {
  let query = supabase
    .from("profiles")
    .select("*")
    .eq("role", "customer")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.ilike("full_name", `%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Profile[];
}

interface BusinessWithProductCount extends Business {
  products: { count: number }[];
}

export async function getAllBusinesses(supabase: Client) {
  const { data, error } = await supabase
    .from("businesses")
    .select("*, products:products(count)")
    .order("name");
  if (error) throw error;
  return (data ?? []) as unknown as BusinessWithProductCount[];
}

interface BusinessWithProducts extends Business {
  products: Product[];
}

export async function getBusinessById(supabase: Client, id: string) {
  const { data, error } = await supabase
    .from("businesses")
    .select("*, products:products(*)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as unknown as BusinessWithProducts;
}

interface ProductWithRelations extends Product {
  business: Business | null;
  category: Category | null;
}

export async function getAllProducts(supabase: Client) {
  const { data, error } = await supabase
    .from("products")
    .select("*, business:businesses(*), category:categories(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as ProductWithRelations[];
}

interface SubscriptionWithOwner extends Subscription {
  basket: Basket | null;
  owner: Profile | null;
}

export async function getAllSubscriptions(
  supabase: Client,
  status?: Database["public"]["Tables"]["subscriptions"]["Row"]["status"],
) {
  let query = supabase
    .from("subscriptions")
    .select("*, basket:baskets(*), owner:profiles(*)")
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as SubscriptionWithOwner[];
}

interface PaymentWithOwner extends Payment {
  owner: Profile | null;
}

export async function getAllPayments(
  supabase: Client,
  status?: Database["public"]["Tables"]["payments"]["Row"]["status"],
) {
  let query = supabase
    .from("payments")
    .select("*, owner:profiles(*)")
    .order("created_at", { ascending: false })
    .limit(200);

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as PaymentWithOwner[];
}

interface DeliveryWithSubscription {
  id: string;
  subscription_id: string;
  status: Database["public"]["Tables"]["deliveries"]["Row"]["status"];
  scheduled_at: string;
  delivered_at: string | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  created_at: string;
  updated_at: string;
  subscription: (Subscription & { basket: Basket | null; owner: Profile | null }) | null;
}

export async function getAllDeliveries(
  supabase: Client,
  status?: Database["public"]["Tables"]["deliveries"]["Row"]["status"],
) {
  let query = supabase
    .from("deliveries")
    .select("*, subscription:subscriptions(*, basket:baskets(*), owner:profiles(*))")
    .order("scheduled_at", { ascending: true })
    .limit(200);

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as DeliveryWithSubscription[];
}
