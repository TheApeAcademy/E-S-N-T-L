"use client";

import { useState, useTransition } from "react";
import { Search, Plus, Check } from "lucide-react";
import { searchProductsAction } from "@/lib/actions/products";
import { addItemDirectAction } from "@/lib/actions/baskets";
import { formatNaira } from "@/lib/utils";
import type { Product, Business } from "@/lib/data/types";

export function BasketBuilderSearch({ basketId }: { basketId: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<(Product & { business: Business | null })[]>(
    [],
  );
  const [addedId, setAddedId] = useState<string | null>(null);
  const [searching, startSearch] = useTransition();
  const [adding, startAdd] = useTransition();

  function handleChange(value: string) {
    setQuery(value);
    if (!value.trim()) {
      setResults([]);
      return;
    }
    startSearch(async () => {
      const data = await searchProductsAction(value);
      setResults(data as (Product & { business: Business | null })[]);
    });
  }

  function add(productId: string) {
    startAdd(async () => {
      await addItemDirectAction(basketId, productId);
      setAddedId(productId);
      setTimeout(() => setAddedId(null), 1200);
    });
  }

  return (
    <div>
      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
        />
        <input
          value={query}
          onChange={(event) => handleChange(event.target.value)}
          placeholder="Search products to add…"
          className="h-11 w-full rounded-full border border-neutral-200 bg-white pl-10 pr-4 text-sm text-ink placeholder:text-neutral-400 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </div>

      {query.trim() && (
        <div className="mt-2 flex flex-col divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-white">
          {searching && (
            <p className="p-3 text-sm text-neutral-400">Searching…</p>
          )}
          {!searching && results.length === 0 && (
            <p className="p-3 text-sm text-neutral-400">No matches.</p>
          )}
          {!searching &&
            results.map((product) => (
              <div key={product.id} className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{product.name}</p>
                  <p className="truncate text-xs text-neutral-500">
                    {product.business?.name} · {formatNaira(product.price)}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={adding}
                  onClick={() => add(product.id)}
                  className="flex shrink-0 items-center gap-1 rounded-full bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
                >
                  {addedId === product.id ? <Check size={13} /> : <Plus size={13} />}
                  {addedId === product.id ? "Added" : "Add"}
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
