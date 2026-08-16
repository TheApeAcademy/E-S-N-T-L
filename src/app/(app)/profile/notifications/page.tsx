import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { TopBar } from "@/components/nav/TopBar";
import { NotificationToggle } from "@/components/profile/NotificationToggle";

export default async function NotificationsPage() {
  const { user } = await requireUser();
  const supabase = await createClient();

  const { data: prefs } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("profile_id", user.id)
    .single();

  return (
    <div>
      <TopBar title="Notifications" backHref="/profile" />
      <div className="px-4 pt-4 pb-8">
        <div className="divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-white px-4">
          <NotificationToggle
            prefKey="subscription_reminders"
            label="Subscription reminders"
            description="Upcoming deliveries and renewals"
            defaultChecked={prefs?.subscription_reminders ?? true}
          />
          <NotificationToggle
            prefKey="payment_notifications"
            label="Payment notifications"
            description="Successful and failed charges"
            defaultChecked={prefs?.payment_notifications ?? true}
          />
          <NotificationToggle
            prefKey="delivery_updates"
            label="Delivery updates"
            description="Fulfillment and delivery status"
            defaultChecked={prefs?.delivery_updates ?? true}
          />
          <NotificationToggle
            prefKey="promotions"
            label="Promotions"
            description="Offers and new Basket templates"
            defaultChecked={prefs?.promotions ?? false}
          />
        </div>
      </div>
    </div>
  );
}
