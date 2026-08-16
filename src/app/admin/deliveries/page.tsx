import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAllDeliveries } from "@/lib/data/admin";
import { Badge, statusTone } from "@/components/ui/Badge";
import { DeliveryStatusControls } from "@/components/admin/DeliveryStatusControls";
import { cn, formatNaira, formatShortDate } from "@/lib/utils";
import type { DeliveryStatus } from "@/lib/database.types";

const TABS: { key: DeliveryStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "processing", label: "Processing" },
  { key: "vendor_confirmed", label: "Vendor confirmed" },
  { key: "out_for_delivery", label: "Out for delivery" },
  { key: "delivered", label: "Delivered" },
  { key: "failed", label: "Failed" },
];

export default async function AdminDeliveriesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = "all" } = await searchParams;
  const supabase = await createClient();
  const deliveries = await getAllDeliveries(
    supabase,
    tab === "all" ? undefined : (tab as DeliveryStatus),
  );

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold text-ink">Deliveries</h1>
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/deliveries?tab=${t.key}`}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium",
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
              <th className="px-4 py-3 font-medium">Scheduled</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map((delivery) => (
              <tr key={delivery.id} className="border-b border-neutral-50 last:border-0">
                <td className="px-4 py-3 font-medium text-ink">
                  {delivery.subscription?.basket?.name}
                </td>
                <td className="px-4 py-3 text-neutral-500">
                  {delivery.subscription?.owner?.full_name ?? "—"}
                </td>
                <td className="px-4 py-3 text-neutral-500">
                  {formatShortDate(delivery.scheduled_at)}
                </td>
                <td className="px-4 py-3 font-medium text-ink">
                  {formatNaira(delivery.total)}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={statusTone(delivery.status)}>
                    {delivery.status.replace(/_/g, " ")}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <DeliveryStatusControls deliveryId={delivery.id} status={delivery.status} />
                </td>
              </tr>
            ))}
            {deliveries.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-400">
                  No deliveries.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
