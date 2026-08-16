"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * MVP: records a labeled payment method reference (no card data touches
 * ESNTL — see docs/ARCHITECTURE.md section on payments). A real provider
 * integration would tokenize here and store only the returned token_ref.
 */
export async function createPaymentMethodAction(params: {
  label: string;
  type?: "card" | "bank_transfer" | "wallet";
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("payment_methods")
    .insert({
      owner_id: user.id,
      label: params.label,
      type: params.type ?? "card",
      provider: "mock",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
