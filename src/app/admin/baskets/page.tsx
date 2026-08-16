import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getBasketTemplates } from "@/lib/data/baskets";
import { getCategories } from "@/lib/data/products";
import { createBasketTemplateAction } from "@/lib/actions/admin";
import { Input, Label, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default async function AdminBasketsPage() {
  const supabase = await createClient();
  const [templates, categories] = await Promise.all([
    getBasketTemplates(supabase),
    getCategories(supabase),
  ]);

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div>
        <h1 className="mb-4 text-lg font-semibold text-ink">Basket Templates</h1>
        <div className="flex flex-col gap-2">
          {templates.map((template) => (
            <Link
              key={template.id}
              href={`/admin/baskets/${template.id}`}
              className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-4"
            >
              <div>
                <p className="font-medium text-ink">{template.name}</p>
                <p className="text-xs text-neutral-500">{template.items.length} items</p>
              </div>
              <span className="text-2xl">{template.category?.icon ?? "🧺"}</span>
            </Link>
          ))}
          {templates.length === 0 && (
            <p className="py-8 text-center text-sm text-neutral-400">No templates yet.</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-sm font-semibold text-ink">New template</h2>
        <form
          action={createBasketTemplateAction}
          className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4"
        >
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" />
          </div>
          <div>
            <Label htmlFor="category_id">Category</Label>
            <Select id="category_id" name="category_id">
              <option value="">—</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <Button type="submit">Create template</Button>
        </form>
      </div>
    </div>
  );
}
