import { formatNaira } from "@/lib/utils";
import { AddToBasketButton } from "@/components/basket/AddToBasketButton";
import type { ProductWithCategory } from "@/lib/data/products";

// No product photography exists yet, so tiles use a tinted color block with
// the category icon instead — heights are deterministically varied per
// product (not randomized on every render) so the columns actually stagger
// like a real masonry layout rather than lining up into a uniform grid.
const TILE_HEIGHTS = ["h-28", "h-36", "h-44", "h-40", "h-32"] as const;
const TILE_TINTS = [
  "bg-brand-50",
  "bg-amber-50",
  "bg-rose-50",
  "bg-emerald-50",
  "bg-sky-50",
] as const;

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function ProductGridCard({ product }: { product: ProductWithCategory }) {
  const hash = hashString(product.id);
  const tileHeight = TILE_HEIGHTS[hash % TILE_HEIGHTS.length];
  const tileTint = TILE_TINTS[hash % TILE_TINTS.length];

  return (
    <div className="mb-3 break-inside-avoid overflow-hidden rounded-2xl border border-neutral-200/70 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div
        className={`flex items-center justify-center ${tileHeight} ${tileTint} text-5xl`}
      >
        {product.category?.icon ?? "🛒"}
      </div>
      <div className="flex flex-col gap-1 p-3">
        <p className="line-clamp-2 text-sm font-medium leading-snug text-ink">
          {product.name}
        </p>
        <p className="truncate text-xs text-neutral-500">
          {product.business?.name ?? "ESNTL Marketplace"}
        </p>
        <p className="text-sm font-semibold text-brand-600">
          {formatNaira(product.price)}
        </p>
        <div className="mt-1.5">
          <AddToBasketButton product={product} fullWidth />
        </div>
      </div>
    </div>
  );
}
