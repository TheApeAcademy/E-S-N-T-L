"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import {
  pauseSubscriptionAction,
  resumeSubscriptionAction,
  cancelSubscriptionAction,
  skipNextDeliveryAction,
  changeFrequencyAction,
  changeDeliveryDateAction,
} from "@/lib/actions/subscriptions";
import { FREQUENCY_LABELS } from "@/lib/utils";
import { toDateInputValue } from "@/lib/data/frequency";
import type { SubscriptionFrequency, SubscriptionStatus } from "@/lib/database.types";

const FREQUENCIES: SubscriptionFrequency[] = [
  "weekly",
  "biweekly",
  "monthly",
  "bimonthly",
  "semester",
];

interface SubscriptionActionsProps {
  subscriptionId: string;
  basketId: string;
  status: SubscriptionStatus;
  frequency: SubscriptionFrequency;
  nextDeliveryAt: string;
}

export function SubscriptionActions({
  subscriptionId,
  basketId,
  status,
  frequency,
  nextDeliveryAt,
}: SubscriptionActionsProps) {
  const [pending, startTransition] = useTransition();
  const [showFrequency, setShowFrequency] = useState(false);
  const [showDate, setShowDate] = useState(false);

  if (status === "cancelled") {
    return null;
  }

  function run(action: () => Promise<void>) {
    startTransition(action);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <Link
          href={`/baskets/${basketId}`}
          className="flex h-11 items-center justify-center rounded-xl border border-neutral-300 text-sm font-semibold text-ink hover:border-brand-500 hover:text-brand-600"
        >
          Edit Basket
        </Link>
        <button
          type="button"
          onClick={() => setShowFrequency((v) => !v)}
          className="flex h-11 items-center justify-center rounded-xl border border-neutral-300 text-sm font-semibold text-ink hover:border-brand-500 hover:text-brand-600"
        >
          Change Frequency
        </button>
        <button
          type="button"
          onClick={() => setShowDate((v) => !v)}
          className="flex h-11 items-center justify-center rounded-xl border border-neutral-300 text-sm font-semibold text-ink hover:border-brand-500 hover:text-brand-600"
        >
          Change Delivery Date
        </button>
        {status === "active" && (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => skipNextDeliveryAction(subscriptionId))}
            className="flex h-11 items-center justify-center rounded-xl border border-neutral-300 text-sm font-semibold text-ink hover:border-brand-500 hover:text-brand-600 disabled:opacity-50"
          >
            Skip Next Delivery
          </button>
        )}
      </div>

      {showFrequency && (
        <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white p-3">
          <Select
            defaultValue={frequency}
            disabled={pending}
            onChange={(event) =>
              run(() =>
                changeFrequencyAction(
                  subscriptionId,
                  event.target.value as SubscriptionFrequency,
                ),
              )
            }
          >
            {FREQUENCIES.map((f) => (
              <option key={f} value={f}>
                {FREQUENCY_LABELS[f]}
              </option>
            ))}
          </Select>
        </div>
      )}

      {showDate && (
        <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white p-3">
          <input
            type="date"
            defaultValue={nextDeliveryAt}
            min={toDateInputValue(new Date())}
            disabled={pending}
            onChange={(event) => run(() => changeDeliveryDateAction(subscriptionId, event.target.value))}
            className="h-9 w-full rounded-lg border border-neutral-300 px-2 text-sm"
          />
        </div>
      )}

      <div className="flex gap-2">
        {status === "active" && (
          <Button
            variant="outline"
            fullWidth
            disabled={pending}
            onClick={() => run(() => pauseSubscriptionAction(subscriptionId))}
          >
            Pause Subscription
          </Button>
        )}
        {status === "paused" && (
          <Button
            fullWidth
            disabled={pending}
            onClick={() => run(() => resumeSubscriptionAction(subscriptionId))}
          >
            Resume Subscription
          </Button>
        )}
        <Button
          variant="danger"
          fullWidth
          disabled={pending}
          onClick={() => {
            if (confirm("Cancel this subscription? This can't be undone.")) {
              run(() => cancelSubscriptionAction(subscriptionId));
            }
          }}
        >
          Cancel Subscription
        </Button>
      </div>
    </div>
  );
}
