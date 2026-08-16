"use client";

import { useTransition } from "react";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { updateItemQuantityAction } from "@/lib/actions/baskets";
import { formatNaira } from "@/lib/utils";

interface BasketItemRowProps {
  basketId: string;
  productId: string;
  name: string;
  unit: string;
  price: number;
  quantity: number;
  vendor?: string | null;
  readOnly?: boolean;
}

export function BasketItemRow({
  basketId,
  productId,
  name,
  unit,
  price,
  quantity,
  vendor,
  readOnly,
}: BasketItemRowProps) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-ink">{name}</p>
        <p className="text-xs text-neutral-500">
          {vendor ? `${vendor} · ` : ""}
          {formatNaira(price)} / {unit}
        </p>
      </div>
      {readOnly ? (
        <span className="text-sm font-semibold text-neutral-600">{quantity}×</span>
      ) : (
        <div className={pending ? "opacity-60" : undefined}>
          <QuantityStepper
            quantity={quantity}
            onChange={(next) =>
              startTransition(() => updateItemQuantityAction(basketId, productId, next))
            }
          />
        </div>
      )}
    </div>
  );
}
