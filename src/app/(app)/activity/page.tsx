import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { getActivityForUser } from "@/lib/data/activity";
import { TopBar } from "@/components/nav/TopBar";
import { ActivityItem } from "@/components/activity/ActivityItem";

export default async function ActivityPage() {
  const { user } = await requireUser();
  const supabase = await createClient();
  const events = await getActivityForUser(supabase, user.id);

  return (
    <div>
      <TopBar title="Activity" />
      <div className="px-4 pt-4 pb-8">
        {events.length === 0 ? (
          <p className="py-8 text-center text-sm text-neutral-400">
            Nothing here yet. Your Basket and Subscription activity will show up here.
          </p>
        ) : (
          <div className="rounded-2xl border border-neutral-200 bg-white p-4">
            {events.map((event, index) => (
              <ActivityItem
                key={event.id}
                event={event}
                isLast={index === events.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
