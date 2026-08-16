import { formatNaira } from "@/lib/utils";
import { AddToBasketButton } from "@/components/basket/AddToBasketButton";
import type { Product, Business } from "@/lib/data/types";

interface ProductCardProps {
  product: Product & { business: Business | null };
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white p-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-ink">{product.name}</p>
        <p className="truncate text-xs text-neutral-500">
          {product.business?.name ?? "ESNTL Marketplace"}
        </p>
        <p className="text-sm font-medium text-brand-600">
          {formatNaira(product.price)}
          <span className="text-xs font-normal text-neutral-400"> / {product.unit}</span>
        </p>
      </div>
      <AddToBasketButton product={product} />
    </div>
  );
}
