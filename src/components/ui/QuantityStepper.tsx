"use client";

import { Minus, Plus } from "lucide-react";

interface QuantityStepperProps {
  quantity: number;
  onChange: (next: number) => void;
  min?: number;
}

export function QuantityStepper({
  quantity,
  onChange,
  min = 0,
}: QuantityStepperProps) {
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-neutral-200 bg-white px-1 py-1">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(min, quantity - 1))}
        className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100 disabled:opacity-30"
        disabled={quantity <= min}
      >
        <Minus size={14} />
      </button>
      <span className="w-4 text-center text-sm font-semibold tabular-nums">
        {quantity}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(quantity + 1)}
        className="flex h-7 w-7 items-center justify-center rounded-full text-brand-600 hover:bg-brand-50"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
