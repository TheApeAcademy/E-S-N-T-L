"use client";

import { useTransition } from "react";
import { advanceDeliveryStatusAction, markDeliveryFailedAction } from "@/lib/actions/admin";
import type { DeliveryStatus } from "@/lib/database.types";

export function DeliveryStatusControls({
  deliveryId,
  status,
}: {
  deliveryId: string;
  status: DeliveryStatus;
}) {
  const [pending, startTransition] = useTransition();

  if (status === "delivered" || status === "failed" || status === "skipped") {
    return null;
  }

  return (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => advanceDeliveryStatusAction(deliveryId, status))}
        className="rounded-lg bg-brand-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
      >
        Advance
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => markDeliveryFailedAction(deliveryId))}
        className="rounded-lg border border-neutral-200 px-2.5 py-1 text-xs font-semibold text-danger hover:bg-red-50 disabled:opacity-50"
      >
        Mark failed
      </button>
    </div>
  );
}
