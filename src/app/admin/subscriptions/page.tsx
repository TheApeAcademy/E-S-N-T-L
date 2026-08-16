import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAllSubscriptions } from "@/lib/data/admin";
import { Badge, statusTone } from "@/components/ui/Badge";
import { cn, formatShortDate, FREQUENCY_LABELS } from "@/lib/utils";
import type { SubscriptionStatus } from "@/lib/database.types";

const TABS: { key: SubscriptionStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "paused", label: "Paused" },
  { key: "cancelled", label: "Cancelled" },
];

export default async function AdminSubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = "all" } = await searchParams;
  const supabase = await createClient();
  const subscriptions = await getAllSubscriptions(
    supabase,
    tab === "all" ? undefined : (tab as SubscriptionStatus),
  );

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold text-ink">Subscriptions</h1>
      <div className="mb-4 flex gap-2">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/subscriptions?tab=${t.key}`}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium",
              tab === t.key ? "bg-ink text-white" : "bg-white border border-neutral-200 text-neutral-500",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>
      <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 text-left text-xs text-neutral-500">
              <th className="px-4 py-3 font-medium">Basket</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Frequency</th>
              <th className="px-4 py-3 font-medium">Next delivery</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub) => (
              <tr key={sub.id} className="border-b border-neutral-50 last:border-0">
                <td className="px-4 py-3 font-medium text-ink">{sub.basket?.name}</td>
                <td className="px-4 py-3 text-neutral-500">{sub.owner?.full_name ?? "—"}</td>
                <td className="px-4 py-3 text-neutral-500">
                  {FREQUENCY_LABELS[sub.frequency]}
                </td>
                <td className="px-4 py-3 text-neutral-500">
                  {formatShortDate(sub.next_delivery_at)}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={statusTone(sub.status)}>{sub.status}</Badge>
                </td>
              </tr>
            ))}
            {subscriptions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-400">
                  No subscriptions.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
