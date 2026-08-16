import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

type Client = SupabaseClient<Database>;

export async function logActivity(
  supabase: Client,
  params: {
    profileId: string;
    type: string;
    title: string;
    description?: string;
    metadata?: Record<string, unknown>;
  },
) {
  const { error } = await supabase.from("activity_events").insert({
    profile_id: params.profileId,
    type: params.type,
    title: params.title,
    description: params.description ?? null,
    metadata: params.metadata ?? {},
  });
  if (error) throw error;
}

export async function getActivityForUser(supabase: Client, profileId: string) {
  const { data, error } = await supabase
    .from("activity_events")
    .select("*")
    .eq("profile_id", profileId)
    .order("occurred_at", { ascending: false })
    .limit(100);

  if (error) throw error;
  return data ?? [];
}
