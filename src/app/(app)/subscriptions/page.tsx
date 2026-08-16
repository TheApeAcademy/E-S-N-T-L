import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { getSubscriptionsForUser, subscriptionAmount } from "@/lib/data/subscriptions";
import { TopBar } from "@/components/nav/TopBar";
import { Badge, statusTone } from "@/components/ui/Badge";
import { cn, formatNaira, formatShortDate, FREQUENCY_LABELS } from "@/lib/utils";
import type { SubscriptionStatus } from "@/lib/database.types";

const TABS: { key: SubscriptionStatus; label: string }[] = [
  { key: "active", label: "Active" },
  { key: "paused", label: "Paused" },
  { key: "cancelled", label: "Cancelled" },
];

export default async function SubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = "active" } = await searchParams;
  const { user } = await requireUser();
  const supabase = await createClient();

  const subscriptions = await getSubscriptionsForUser(
    supabase,
    user.id,
    tab as SubscriptionStatus,
  );

  return (
    <div>
      <TopBar title="Subscriptions" />
      <div className="px-4 pt-4">
        <div className="mb-4 flex gap-2">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={`/subscriptions?tab=${t.key}`}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                tab === t.key
                  ? "bg-ink text-white"
                  : "bg-white text-neutral-500 border border-neutral-200",
              )}
            >
              {t.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-3 pb-6">
          {subscriptions.length === 0 && (
            <p className="py-8 text-center text-sm text-neutral-400">
              No {tab} subscriptions.
            </p>
          )}
          {subscriptions.map((sub) => (
            <Link
              key={sub.id}
              href={`/subscriptions/${sub.id}`}
              className="flex flex-col gap-1 rounded-2xl border border-neutral-200 bg-white p-4"
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-ink">{sub.basket?.name}</p>
                <Badge tone={statusTone(sub.status)}>{sub.status}</Badge>
              </div>
              <p className="text-xs text-neutral-500">
                {formatNaira(subscriptionAmount(sub.items, sub.delivery_fee))} /{" "}
                {FREQUENCY_LABELS[sub.frequency]}
              </p>
              <p className="text-xs font-medium text-brand-600">
                Next: {formatShortDate(sub.next_delivery_at)}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
