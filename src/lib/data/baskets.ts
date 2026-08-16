import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import type { BasketWithItems } from "@/lib/data/types";

type Client = SupabaseClient<Database>;

const BASKET_WITH_ITEMS_SELECT = `
  *,
  category:categories ( * ),
  items:basket_items (
    *,
    product:products ( *, business:businesses (*) )
  )
`;

export async function getBasketTemplates(supabase: Client) {
  const { data, error } = await supabase
    .from("baskets")
    .select(BASKET_WITH_ITEMS_SELECT)
    .eq("kind", "template")
    .order("name");

  if (error) throw error;
  return (data ?? []) as unknown as BasketWithItems[];
}

export async function getBasketById(supabase: Client, basketId: string) {
  const { data, error } = await supabase
    .from("baskets")
    .select(BASKET_WITH_ITEMS_SELECT)
    .eq("id", basketId)
    .single();

  if (error) throw error;
  return data as unknown as BasketWithItems;
}

export async function getBasketsForOwner(
  supabase: Client,
  ownerId: string,
  status?: Database["public"]["Tables"]["baskets"]["Row"]["status"],
) {
  let query = supabase
    .from("baskets")
    .select(BASKET_WITH_ITEMS_SELECT)
    .eq("owner_id", ownerId)
    .order("updated_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as BasketWithItems[];
}

export async function createBasket(
  supabase: Client,
  params: { ownerId: string; name: string; categoryId?: string | null },
) {
  const { data, error } = await supabase
    .from("baskets")
    .insert({
      owner_id: params.ownerId,
      name: params.name,
      category_id: params.categoryId ?? null,
      kind: "custom",
      status: "draft",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** "Customize this Basket": clones a template's items into a new custom basket owned by the customer. */
export async function cloneTemplateForOwner(
  supabase: Client,
  templateId: string,
  ownerId: string,
) {
  const template = await getBasketById(supabase, templateId);

  const basket = await createBasket(supabase, {
    ownerId,
    name: template.name,
    categoryId: template.category_id,
  });

  if (template.items.length > 0) {
    const { error } = await supabase.from("basket_items").insert(
      template.items.map((item) => ({
        basket_id: basket.id,
        product_id: item.product_id,
        quantity: item.quantity,
      })),
    );
    if (error) throw error;
  }

  return basket;
}

export async function setBasketItemQuantity(
  supabase: Client,
  basketId: string,
  productId: string,
  quantity: number,
) {
  if (quantity <= 0) {
    const { error } = await supabase
      .from("basket_items")
      .delete()
      .eq("basket_id", basketId)
      .eq("product_id", productId);
    if (error) throw error;
    return;
  }

  const { error } = await supabase
    .from("basket_items")
    .upsert(
      { basket_id: basketId, product_id: productId, quantity },
      { onConflict: "basket_id,product_id" },
    );
  if (error) throw error;

  await supabase
    .from("baskets")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", basketId);
}

export async function saveBasket(supabase: Client, basketId: string) {
  const { error } = await supabase
    .from("baskets")
    .update({ status: "saved" })
    .eq("id", basketId);
  if (error) throw error;
}
