"use client";

import { useState, useTransition } from "react";
import { Plus, Check } from "lucide-react";
import { addItemDirectAction } from "@/lib/actions/baskets";

export function AddSuggestedButton({
  basketId,
  productId,
}: {
  basketId: string;
  productId: string;
}) {
  const [added, setAdded] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleAdd() {
    startTransition(async () => {
      await addItemDirectAction(basketId, productId);
      setAdded(true);
      setTimeout(() => setAdded(false), 1200);
    });
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={handleAdd}
      className="flex shrink-0 items-center gap-1 rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-ink hover:border-brand-500 hover:text-brand-600 disabled:opacity-50"
    >
      {added ? <Check size={13} /> : <Plus size={13} />}
      {added ? "Added" : "Add"}
    </button>
  );
}
