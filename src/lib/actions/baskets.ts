"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  createBasket,
  cloneTemplateForOwner,
  saveBasket,
  setBasketItemQuantity,
} from "@/lib/data/baskets";

export async function getMyDraftBaskets() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("baskets")
    .select("id, name, status")
    .eq("owner_id", user.id)
    .eq("kind", "custom")
    .in("status", ["draft", "saved"])
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function addProductToBasket(params: {
  productId: string;
  basketId?: string;
  newBasketName?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  let basketId: string;
  if (params.basketId) {
    basketId = params.basketId;
  } else {
    const basket = await createBasket(supabase, {
      ownerId: user.id,
      name: params.newBasketName?.trim() || "My Basket",
    });
    basketId = basket.id;
  }

  const { data: existing } = await supabase
    .from("basket_items")
    .select("quantity")
    .eq("basket_id", basketId)
    .eq("product_id", params.productId)
    .maybeSingle();

  await setBasketItemQuantity(
    supabase,
    basketId,
    params.productId,
    (existing?.quantity ?? 0) + 1,
  );

  revalidatePath("/baskets");
  revalidatePath("/");
  revalidatePath(`/baskets/${basketId}`);

  return { basketId };
}

export async function createBasketAction(formData: FormData) {
  const name = String(formData.get("name") ?? "");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const basket = await createBasket(supabase, {
    ownerId: user.id,
    name: name.trim() || "My Basket",
  });

  revalidatePath("/baskets");
  redirect(`/baskets/${basket.id}`);
}

export async function updateItemQuantityAction(
  basketId: string,
  productId: string,
  quantity: number,
) {
  const supabase = await createClient();
  await setBasketItemQuantity(supabase, basketId, productId, quantity);
  revalidatePath(`/baskets/${basketId}`);
}

export async function addItemDirectAction(basketId: string, productId: string) {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("basket_items")
    .select("quantity")
    .eq("basket_id", basketId)
    .eq("product_id", productId)
    .maybeSingle();

  await setBasketItemQuantity(
    supabase,
    basketId,
    productId,
    (existing?.quantity ?? 0) + 1,
  );
  revalidatePath(`/baskets/${basketId}`);
}

export async function saveBasketAction(basketId: string) {
  const supabase = await createClient();
  await saveBasket(supabase, basketId);
  revalidatePath(`/baskets/${basketId}`);
  revalidatePath("/baskets");
}

export async function cloneTemplateAction(templateId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const basket = await cloneTemplateForOwner(supabase, templateId, user.id);
  revalidatePath("/baskets");
  redirect(`/baskets/${basket.id}`);
}
