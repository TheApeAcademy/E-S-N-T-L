"use client";

import { useTransition } from "react";
import { Check } from "lucide-react";
import { saveBasketAction } from "@/lib/actions/baskets";
import { cn } from "@/lib/utils";

export function SaveBasketButton({
  basketId,
  isSaved,
  disabled,
}: {
  basketId: string;
  isSaved: boolean;
  disabled?: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={disabled || pending}
      onClick={() => startTransition(() => saveBasketAction(basketId))}
      className={cn(
        "flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border text-sm font-semibold transition-colors disabled:opacity-50",
        isSaved
          ? "border-green-200 bg-green-50 text-success"
          : "border-neutral-300 bg-white text-ink hover:border-brand-500 hover:text-brand-600",
      )}
    >
      {isSaved && <Check size={16} />}
      {isSaved ? "Saved" : "Save Basket"}
    </button>
  );
}
