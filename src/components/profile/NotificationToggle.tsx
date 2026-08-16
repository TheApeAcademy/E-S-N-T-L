"use client";

import { useTransition } from "react";
import { updateNotificationPreferenceAction } from "@/lib/actions/notifications";

interface NotificationToggleProps {
  prefKey: "subscription_reminders" | "payment_notifications" | "delivery_updates" | "promotions";
  label: string;
  description: string;
  defaultChecked: boolean;
}

export function NotificationToggle({
  prefKey,
  label,
  description,
  defaultChecked,
}: NotificationToggleProps) {
  const [pending, startTransition] = useTransition();

  return (
    <label className="flex items-center justify-between gap-4 py-3.5">
      <div>
        <p className="text-sm font-medium text-ink">{label}</p>
        <p className="text-xs text-neutral-500">{description}</p>
      </div>
      <input
        type="checkbox"
        defaultChecked={defaultChecked}
        disabled={pending}
        onChange={(event) =>
          startTransition(() =>
            updateNotificationPreferenceAction(prefKey, event.target.checked),
          )
        }
        className="h-5 w-9 shrink-0 appearance-none rounded-full bg-neutral-200 transition-colors checked:bg-brand-500 relative before:absolute before:left-0.5 before:top-0.5 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-transform checked:before:translate-x-4"
      />
    </label>
  );
}
