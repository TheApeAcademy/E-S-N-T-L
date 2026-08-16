import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { getBasketById } from "@/lib/data/baskets";
import { getSuggestedProducts } from "@/lib/data/products";
import { summarizeBasket } from "@/lib/data/types";
import { TopBar } from "@/components/nav/TopBar";
import { BasketItemRow } from "@/components/basket/BasketItemRow";
import { BasketBuilderSearch } from "@/components/basket/BasketBuilderSearch";
import { BasketSummaryBar } from "@/components/basket/BasketSummaryBar";
import { AddSuggestedButton } from "@/components/basket/AddSuggestedButton";
import { Badge, statusTone } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";

export default async function BasketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user } = await requireUser();
  const supabase = await createClient();

  const basket = await getBasketById(supabase, id).catch(() => null);
  if (!basket || basket.owner_id !== user.id) notFound();

  const summary = summarizeBasket(basket.items);
  const isEditable = basket.status === "draft" || basket.status === "saved";

  let subscriptionId: string | null = null;
  if (basket.status === "subscribed") {
    const { data } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("basket_id", basket.id)
      .in("status", ["active", "paused"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    subscriptionId = data?.id ?? null;
  }

  const suggested = isEditable
    ? await getSuggestedProducts(
        supabase,
        basket.category_id,
        basket.items.map((item) => item.product_id),
      )
    : [];

  return (
    <div className="flex flex-col">
      <TopBar
        title={basket.name}
        backHref="/baskets"
        right={<Badge tone={statusTone(basket.status)}>{basket.status}</Badge>}
      />

      <div className="flex flex-1 flex-col gap-5 px-4 pt-4">
        {basket.status === "subscribed" && subscriptionId && (
          <div className="rounded-2xl bg-brand-50 p-3">
            <LinkButton href={`/subscriptions/${subscriptionId}`} variant="secondary" fullWidth>
              Manage Subscription
            </LinkButton>
          </div>
        )}

        {isEditable && <BasketBuilderSearch basketId={basket.id} />}

        <section>
          <h2 className="mb-1 text-sm font-semibold text-ink">
            {basket.items.length} items
          </h2>
          <div className="divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-white px-4">
            {basket.items.length === 0 && (
              <p className="py-6 text-center text-sm text-neutral-400">
                No products yet. Search above to start building.
              </p>
            )}
            {basket.items.map((item) => (
              <BasketItemRow
                key={item.id}
                basketId={basket.id}
                productId={item.product_id}
                name={item.product.name}
                unit={item.product.unit}
                price={item.product.price}
                quantity={item.quantity}
                vendor={item.product.business?.name}
                readOnly={!isEditable}
              />
            ))}
          </div>
        </section>

        {isEditable && suggested.length > 0 && (
          <section className="pb-4">
            <h2 className="mb-2 text-sm font-semibold text-ink">Suggested for you</h2>
            <div className="flex flex-col divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-white px-4">
              {suggested.map((product) => (
                <div key={product.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{product.name}</p>
                    <p className="text-xs text-neutral-500">{product.business?.name}</p>
                  </div>
                  <AddSuggestedButton basketId={basket.id} productId={product.id} />
                </div>
              ))}
            </div>
          </section>
        )}

        {!isEditable && basket.status !== "subscribed" && (
          <p className="pb-6 text-center text-xs text-neutral-400">
            This basket is {basket.status} and can no longer be edited.
          </p>
        )}
      </div>

      {isEditable && (
        <BasketSummaryBar
          basketId={basket.id}
          summary={summary}
          isSaved={basket.status === "saved"}
        />
      )}
    </div>
  );
}
