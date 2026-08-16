"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type PreferenceKey =
  | "subscription_reminders"
  | "payment_notifications"
  | "delivery_updates"
  | "promotions";

export async function updateNotificationPreferenceAction(
  key: PreferenceKey,
  value: boolean,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const update =
    key === "subscription_reminders"
      ? { subscription_reminders: value }
      : key === "payment_notifications"
        ? { payment_notifications: value }
        : key === "delivery_updates"
          ? { delivery_updates: value }
          : { promotions: value };

  await supabase.from("notification_preferences").update(update).eq("profile_id", user.id);

  revalidatePath("/profile/notifications");
}
