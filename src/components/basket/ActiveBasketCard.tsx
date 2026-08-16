import Link from "next/link";
import { formatNaira, formatShortDate, FREQUENCY_LABELS } from "@/lib/utils";

interface ActiveBasketCardProps {
  subscriptionId: string;
  name: string;
  itemCount: number;
  amount: number;
  frequency: string;
  nextDeliveryAt: string;
  emoji?: string;
}

export function ActiveBasketCard({
  subscriptionId,
  name,
  itemCount,
  amount,
  frequency,
  nextDeliveryAt,
  emoji = "🧺",
}: ActiveBasketCardProps) {
  return (
    <Link
      href={`/subscriptions/${subscriptionId}`}
      className="flex w-64 shrink-0 flex-col gap-2 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-center gap-2">
        <span className="text-2xl">{emoji}</span>
        <span className="font-semibold text-ink">{name}</span>
      </div>
      <p className="text-xs text-neutral-500">
        {itemCount} items · {formatNaira(amount)} / {FREQUENCY_LABELS[frequency] ?? frequency}
      </p>
      <p className="mt-1 text-xs font-medium text-brand-600">
        Next: {formatShortDate(nextDeliveryAt)}
      </p>
    </Link>
  );
}
