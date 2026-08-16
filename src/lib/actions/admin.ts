"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { DeliveryStatus } from "@/lib/database.types";

const DELIVERY_PIPELINE: DeliveryStatus[] = [
  "pending",
  "processing",
  "vendor_confirmed",
  "out_for_delivery",
  "delivered",
];

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Forbidden");

  return { supabase, user };
}

export async function createBusinessAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const { error } = await supabase.from("businesses").insert({
    name,
    slug,
    description: description || null,
  });
  if (error) throw error;

  revalidatePath("/admin/businesses");
}

export async function createProductAction(formData: FormData) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase.from("products").insert({
    business_id: String(formData.get("business_id")),
    category_id: String(formData.get("category_id") || "") || null,
    name: String(formData.get("name") ?? "").trim(),
    unit: String(formData.get("unit") ?? "unit").trim(),
    price: Number(formData.get("price") ?? 0),
    stock_qty: Number(formData.get("stock_qty") ?? 0),
  });
  if (error) throw error;

  revalidatePath("/admin/products");
}

export async function createBasketTemplateAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const categoryId = String(formData.get("category_id") || "") || null;

  const { data: basket, error } = await supabase
    .from("baskets")
    .insert({
      kind: "template",
      owner_id: null,
      status: "saved",
      name,
      description: description || null,
      category_id: categoryId,
    })
    .select()
    .single();
  if (error) throw error;

  revalidatePath("/admin/baskets");
  redirect(`/admin/baskets/${basket.id}`);
}

export async function addTemplateItemAction(
  basketId: string,
  productId: string,
  quantity: number,
) {
  const { supabase } = await requireAdmin();

  if (quantity <= 0) {
    await supabase
      .from("basket_items")
      .delete()
      .eq("basket_id", basketId)
      .eq("product_id", productId);
  } else {
    await supabase
      .from("basket_items")
      .upsert(
        { basket_id: basketId, product_id: productId, quantity },
        { onConflict: "basket_id,product_id" },
      );
  }

  revalidatePath(`/admin/baskets/${basketId}`);
}

export async function advanceDeliveryStatusAction(deliveryId: string, currentStatus: DeliveryStatus) {
  const { supabase } = await requireAdmin();

  const currentIndex = DELIVERY_PIPELINE.indexOf(currentStatus);
  const next = DELIVERY_PIPELINE[currentIndex + 1];
  if (!next) return;

  await supabase
    .from("deliveries")
    .update({ status: next, delivered_at: next === "delivered" ? new Date().toISOString() : null })
    .eq("id", deliveryId);

  revalidatePath("/admin/deliveries");
}

export async function markDeliveryFailedAction(deliveryId: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("deliveries").update({ status: "failed" }).eq("id", deliveryId);
  revalidatePath("/admin/deliveries");
}
