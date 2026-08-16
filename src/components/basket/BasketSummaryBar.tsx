import Link from "next/link";
import { formatNaira } from "@/lib/utils";
import type { BasketSummary } from "@/lib/data/types";
import { SaveBasketButton } from "@/components/basket/SaveBasketButton";

interface BasketSummaryBarProps {
  basketId: string;
  summary: BasketSummary;
  isSaved: boolean;
}

export function BasketSummaryBar({ basketId, summary, isSaved }: BasketSummaryBarProps) {
  return (
    <div className="sticky bottom-0 border-t border-neutral-200 bg-white p-4">
      <div className="mb-3 flex items-baseline justify-between text-sm">
        <span className="text-neutral-500">
          {summary.itemCount} items · Delivery {formatNaira(summary.estimatedDelivery)}
        </span>
        <span className="text-base font-semibold text-ink">
          {formatNaira(summary.estimatedTotal)}
        </span>
      </div>
      <div className="flex gap-2">
        <SaveBasketButton basketId={basketId} isSaved={isSaved} disabled={summary.itemCount === 0} />
        <Link
          href={`/subscribe/${basketId}`}
          aria-disabled={summary.itemCount === 0}
          className="flex h-11 flex-1 items-center justify-center rounded-xl bg-brand-500 text-sm font-semibold text-white transition-colors hover:bg-brand-600 aria-disabled:pointer-events-none aria-disabled:opacity-50"
        >
          Subscribe
        </Link>
      </div>
    </div>
  );
}
