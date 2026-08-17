import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import type { Business, Product } from "@/lib/data/types";

type Client = SupabaseClient<Database>;
type ProductWithBusiness = Product & { business: Business | null };

const PRODUCT_WITH_BUSINESS_SELECT = `*, business:businesses (*)`;

/** Product discovery search — returns all vendor listings for a query, so customers can compare price/vendor (spec section 5/15). */
export async function searchProducts(supabase: Client, query: string) {
  if (!query.trim()) return [];

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_WITH_BUSINESS_SELECT)
    .ilike("name", `%${query}%`)
    .eq("is_available", true)
    .order("price", { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as ProductWithBusiness[];
}

export async function getSuggestedProducts(
  supabase: Client,
  categoryId: string | null,
  excludeProductIds: string[],
  limit = 6,
) {
  let query = supabase
    .from("products")
    .select(PRODUCT_WITH_BUSINESS_SELECT)
    .eq("is_available", true)
    .limit(limit);

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }
  if (excludeProductIds.length > 0) {
    query = query.not("id", "in", `(${excludeProductIds.join(",")})`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as ProductWithBusiness[];
}

/** Full marketplace browse — every available product, optionally filtered by category. */
export async function browseProducts(supabase: Client, categoryId?: string, limit?: number) {
  let query = supabase
    .from("products")
    .select(PRODUCT_WITH_BUSINESS_SELECT)
    .eq("is_available", true)
    .order("name", { ascending: true });

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }
  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as ProductWithBusiness[];
}

export async function getCategories(supabase: Client) {
  const { data, error } = await supabase.from("categories").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}
