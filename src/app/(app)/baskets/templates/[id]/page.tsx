import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBasketById } from "@/lib/data/baskets";
import { summarizeBasket } from "@/lib/data/types";
import { TopBar } from "@/components/nav/TopBar";
import { formatNaira } from "@/lib/utils";
import { cloneTemplateAction } from "@/lib/actions/baskets";
import { Button } from "@/components/ui/Button";

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const template = await getBasketById(supabase, id).catch(() => null);
  if (!template || template.kind !== "template") notFound();

  const summary = summarizeBasket(template.items);

  return (
    <div className="flex flex-col">
      <TopBar title={template.name} backHref="/baskets" />

      <div className="flex flex-1 flex-col gap-5 px-4 pt-4">
        <div className="rounded-2xl bg-brand-50 p-4">
          <div className="mb-1 text-3xl">{template.category?.icon ?? "🧺"}</div>
          <p className="text-sm text-neutral-700">
            {template.description ??
              "We selected these based on what people commonly buy."}
          </p>
        </div>

        <section>
          <h2 className="mb-1 text-sm font-semibold text-ink">
            {template.items.length} items
          </h2>
          <div className="divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-white px-4">
            {template.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{item.product.name}</p>
                  <p className="text-xs text-neutral-500">
                    {item.product.business?.name}
                  </p>
                </div>
                <span className="text-sm font-semibold text-neutral-600">
                  {item.quantity}× {formatNaira(item.product.price)}
                </span>
              </div>
            ))}
          </div>
        </section>

        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-neutral-500">Basket total</span>
            <span className="font-medium text-ink">{formatNaira(summary.productTotal)}</span>
          </div>
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-neutral-500">Estimated delivery</span>
            <span className="font-medium text-ink">
              {formatNaira(summary.estimatedDelivery)}
            </span>
          </div>
          <div className="flex justify-between border-t border-neutral-100 pt-2 text-sm font-semibold">
            <span>Estimated total</span>
            <span className="text-brand-600">{formatNaira(summary.estimatedTotal)}</span>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 border-t border-neutral-200 bg-white p-4">
        <form action={cloneTemplateAction.bind(null, template.id)}>
          <Button type="submit" fullWidth size="lg">
            Customize this Basket
          </Button>
        </form>
      </div>
    </div>
  );
}
