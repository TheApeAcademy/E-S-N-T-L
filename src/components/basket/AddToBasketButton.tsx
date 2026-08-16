"use client";

import { useState, useTransition } from "react";
import { Plus, X, Check } from "lucide-react";
import { addProductToBasket, getMyDraftBaskets } from "@/lib/actions/baskets";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Product } from "@/lib/data/types";

interface DraftBasket {
  id: string;
  name: string;
  status: string;
}

export function AddToBasketButton({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const [baskets, setBaskets] = useState<DraftBasket[] | null>(null);
  const [newName, setNewName] = useState("");
  const [added, setAdded] = useState(false);
  const [pending, startTransition] = useTransition();

  function openSheet() {
    setOpen(true);
    if (!baskets) {
      getMyDraftBaskets().then(setBaskets);
    }
  }

  function addTo(basketId?: string) {
    startTransition(async () => {
      await addProductToBasket({
        productId: product.id,
        basketId,
        newBasketName: basketId ? undefined : newName,
      });
      setOpen(false);
      setNewName("");
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={openSheet}
        className="flex shrink-0 items-center gap-1 rounded-full bg-brand-500 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-600"
      >
        {added ? <Check size={14} /> : <Plus size={14} />}
        {added ? "Added" : "Add to Basket"}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/40"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg mx-auto rounded-t-2xl bg-white p-4 pb-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink">
                Add &ldquo;{product.name}&rdquo; to which Basket?
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex max-h-56 flex-col gap-2 overflow-y-auto">
              {baskets === null && (
                <p className="py-4 text-center text-sm text-neutral-400">Loading…</p>
              )}
              {baskets?.length === 0 && (
                <p className="py-2 text-sm text-neutral-400">
                  You don&apos;t have any saved Baskets yet.
                </p>
              )}
              {baskets?.map((basket) => (
                <button
                  key={basket.id}
                  type="button"
                  disabled={pending}
                  onClick={() => addTo(basket.id)}
                  className="rounded-xl border border-neutral-200 px-3.5 py-2.5 text-left text-sm font-medium text-ink transition-colors hover:border-brand-500 disabled:opacity-50"
                >
                  {basket.name}
                </button>
              ))}
            </div>

            <div className="mt-3 flex gap-2">
              <Input
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                placeholder="New basket name"
              />
              <Button
                disabled={pending || !newName.trim()}
                onClick={() => addTo(undefined)}
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
