"use client";

import { useState, useTransition } from "react";
import { Search, Plus, Minus, X } from "lucide-react";
import { searchProductsAction } from "@/lib/actions/products";
import { addTemplateItemAction } from "@/lib/actions/admin";
import { formatNaira } from "@/lib/utils";
import type { Business, Product } from "@/lib/data/types";

interface CurrentItem {
  productId: string;
  name: string;
  quantity: number;
}

export function AdminTemplateItemsEditor({
  basketId,
  items,
}: {
  basketId: string;
  items: CurrentItem[];
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<(Product & { business: Business | null })[]>(
    [],
  );
  const [pending, startTransition] = useTransition();

  function search(value: string) {
    setQuery(value);
    if (!value.trim()) {
      setResults([]);
      return;
    }
    startTransition(async () => {
      const data = await searchProductsAction(value);
      setResults(data as (Product & { business: Business | null })[]);
    });
  }

  function setQuantity(productId: string, quantity: number) {
    startTransition(() => addTemplateItemAction(basketId, productId, quantity));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-neutral-200 bg-white">
        {items.length === 0 && (
          <p className="p-4 text-sm text-neutral-400">No items yet — search below to add some.</p>
        )}
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex items-center justify-between border-b border-neutral-50 px-4 py-3 last:border-0"
          >
            <span className="text-sm font-medium text-ink">{item.name}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuantity(item.productId, item.quantity - 1)}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 hover:bg-neutral-50"
              >
                <Minus size={12} />
              </button>
              <span className="w-4 text-center text-sm">{item.quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(item.productId, item.quantity + 1)}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 hover:bg-neutral-50"
              >
                <Plus size={12} />
              </button>
              <button
                type="button"
                onClick={() => setQuantity(item.productId, 0)}
                className="ml-1 text-neutral-400 hover:text-danger"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
        />
        <input
          value={query}
          onChange={(event) => search(event.target.value)}
          placeholder="Search products to add…"
          className="h-11 w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </div>

      {query.trim() && (
        <div className="flex flex-col divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-white">
          {results.map((product) => (
            <div key={product.id} className="flex items-center justify-between p-3">
              <div>
                <p className="text-sm font-medium text-ink">{product.name}</p>
                <p className="text-xs text-neutral-500">
                  {product.business?.name} · {formatNaira(product.price)}
                </p>
              </div>
              <button
                type="button"
                disabled={pending}
                onClick={() => setQuantity(product.id, 1)}
                className="rounded-full bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
              >
                Add
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
