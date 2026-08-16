"use server";

import { createClient } from "@/lib/supabase/server";
import type { AddressLabel } from "@/lib/database.types";

export async function createAddressAction(params: {
  label: AddressLabel;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  isDefault?: boolean;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("addresses")
    .insert({
      profile_id: user.id,
      label: params.label,
      line1: params.line1,
      line2: params.line2 || null,
      city: params.city,
      state: params.state,
      is_default: params.isDefault ?? false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
