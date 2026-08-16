"use client";

import { useState, useTransition } from "react";
import { Search } from "lucide-react";
import { searchProductsAction } from "@/lib/actions/products";
import { ProductCard } from "@/components/basket/ProductCard";
import type { Product, Business } from "@/lib/data/types";

export function ProductSearch({ placeholder }: { placeholder?: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<(Product & { business: Business | null })[]>(
    [],
  );
  const [pending, startTransition] = useTransition();
  const [searched, setSearched] = useState(false);

  function handleChange(value: string) {
    setQuery(value);
    if (!value.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    startTransition(async () => {
      const data = await searchProductsAction(value);
      setResults(data as (Product & { business: Business | null })[]);
      setSearched(true);
    });
  }

  return (
    <div>
      <div className="relative">
        <Search
          size={18}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
        />
        <input
          value={query}
          onChange={(event) => handleChange(event.target.value)}
          placeholder={placeholder ?? "Search products, businesses or Baskets…"}
          className="h-12 w-full rounded-full border border-neutral-200 bg-white pl-11 pr-4 text-sm text-ink placeholder:text-neutral-400 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </div>

      {query.trim() && (
        <div className="mt-3 flex flex-col gap-2">
          {pending && <p className="text-sm text-neutral-400">Searching…</p>}
          {!pending && searched && results.length === 0 && (
            <p className="text-sm text-neutral-400">
              No products found for &ldquo;{query}&rdquo;.
            </p>
          )}
          {!pending &&
            results.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
        </div>
      )}
    </div>
  );
}
