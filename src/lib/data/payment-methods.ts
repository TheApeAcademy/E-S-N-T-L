import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

type Client = SupabaseClient<Database>;

export async function getPaymentMethodsForUser(supabase: Client, ownerId: string) {
  const { data, error } = await supabase
    .from("payment_methods")
    .select("*")
    .eq("owner_id", ownerId)
    .order("is_default", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
