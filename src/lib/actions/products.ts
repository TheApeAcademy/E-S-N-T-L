"use server";

import { createClient } from "@/lib/supabase/server";
import { searchProducts } from "@/lib/data/products";

export async function searchProductsAction(query: string) {
  const supabase = await createClient();
  return searchProducts(supabase, query);
}
