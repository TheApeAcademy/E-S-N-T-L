import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBasketById } from "@/lib/data/baskets";
import { AdminTemplateItemsEditor } from "@/components/admin/AdminTemplateItemsEditor";

export default async function AdminBasketTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const template = await getBasketById(supabase, id).catch(() => null);
  if (!template || template.kind !== "template") notFound();

  return (
    <div className="max-w-xl">
      <h1 className="mb-1 text-lg font-semibold text-ink">{template.name}</h1>
      <p className="mb-4 text-sm text-neutral-500">{template.description}</p>
      <AdminTemplateItemsEditor
        basketId={template.id}
        items={template.items.map((item) => ({
          productId: item.product_id,
          name: item.product.name,
          quantity: item.quantity,
        }))}
      />
    </div>
  );
}
