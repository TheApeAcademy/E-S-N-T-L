import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { browseProducts, getCategories } from "@/lib/data/products";
import { TopBar } from "@/components/nav/TopBar";
import { ProductCard } from "@/components/basket/ProductCard";
import { cn } from "@/lib/utils";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const supabase = await createClient();

  const [products, categories] = await Promise.all([
    browseProducts(supabase, category),
    getCategories(supabase),
  ]);

  return (
    <div>
      <TopBar title="Discover Products" backHref="/" />
      <div className="px-4 pt-4">
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          <Link
            href="/products"
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              !category
                ? "bg-ink text-white"
                : "border border-neutral-200 bg-white text-neutral-500",
            )}
          >
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.id}`}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                category === cat.id
                  ? "bg-ink text-white"
                  : "border border-neutral-200 bg-white text-neutral-500",
              )}
            >
              {cat.icon} {cat.name}
            </Link>
          ))}
        </div>

        <p className="mb-3 text-xs text-neutral-500">
          {products.length} product{products.length === 1 ? "" : "s"}
        </p>

        <div className="flex flex-col gap-2 pb-8">
          {products.length === 0 && (
            <p className="py-8 text-center text-sm text-neutral-400">
              No products in this category yet.
            </p>
          )}
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
