import { Badge, statusTone } from "@/components/ui/Badge";
import { formatNaira, formatShortDate } from "@/lib/utils";
import type { Delivery } from "@/lib/data/types";

export function DeliveryList({ deliveries }: { deliveries: Delivery[] }) {
  if (deliveries.length === 0) {
    return <p className="text-sm text-neutral-400">No deliveries yet.</p>;
  }

  return (
    <div className="flex flex-col divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-white px-4">
      {deliveries.map((delivery) => (
        <div key={delivery.id} className="flex items-center justify-between py-3">
          <div>
            <p className="text-sm font-medium text-ink">
              {formatShortDate(delivery.scheduled_at)}
            </p>
            <p className="text-xs text-neutral-500">{formatNaira(delivery.total)}</p>
          </div>
          <Badge tone={statusTone(delivery.status)}>
            {delivery.status.replace(/_/g, " ")}
          </Badge>
        </div>
      ))}
    </div>
  );
}
