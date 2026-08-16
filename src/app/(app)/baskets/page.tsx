import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { getBasketsForOwner, getBasketTemplates } from "@/lib/data/baskets";
import { TopBar } from "@/components/nav/TopBar";
import { BasketCard } from "@/components/basket/BasketCard";
import { cn, formatNaira } from "@/lib/utils";
import type { BasketStatus } from "@/lib/database.types";

const TABS: { key: BasketStatus | "saved_draft"; label: string }[] = [
  { key: "subscribed", label: "Active" },
  { key: "saved_draft", label: "Saved" },
  { key: "archived", label: "Past" },
];

export default async function BasketsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = "subscribed" } = await searchParams;
  const { user } = await requireUser();
  const supabase = await createClient();

  const [allBaskets, templates] = await Promise.all([
    getBasketsForOwner(supabase, user.id),
    getBasketTemplates(supabase),
  ]);

  const filtered = allBaskets.filter((basket) => {
    if (tab === "saved_draft") return basket.status === "saved" || basket.status === "draft";
    return basket.status === tab;
  });

  return (
    <div>
      <TopBar title="My Baskets" />
      <div className="px-4 pt-4">
        <Link
          href="/baskets/new"
          className="mb-4 flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50 py-4 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-100"
        >
          <Plus size={18} />
          Build a Basket
        </Link>

        <div className="mb-4 flex gap-2">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={`/baskets?tab=${t.key}`}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                tab === t.key
                  ? "bg-ink text-white"
                  : "bg-white text-neutral-500 border border-neutral-200",
              )}
            >
              {t.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-3 pb-4">
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-neutral-400">
              No baskets here yet.
            </p>
          )}
          {filtered.map((basket) => {
            const total = basket.items.reduce(
              (sum, item) => sum + item.quantity * item.product.price,
              0,
            );
            return (
              <Link
                key={basket.id}
                href={`/baskets/${basket.id}`}
                className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-4"
              >
                <div>
                  <p className="font-semibold text-ink">{basket.name}</p>
                  <p className="text-xs text-neutral-500">
                    {basket.items.length} items
                    {basket.status === "draft" && " · Draft"}
                  </p>
                </div>
                <p className="text-sm font-semibold text-brand-600">
                  {formatNaira(total)}
                </p>
              </Link>
            );
          })}
        </div>

        <section className="pb-8">
          <h2 className="mb-3 text-sm font-semibold text-ink">ESNTL Basket Templates</h2>
          <div className="grid grid-cols-2 gap-3">
            {templates.map((template) => (
              <BasketCard
                key={template.id}
                href={`/baskets/templates/${template.id}`}
                name={template.name}
                itemCount={template.items.length}
                emoji={template.category?.icon ?? "🧺"}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
