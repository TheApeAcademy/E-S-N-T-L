import { createClient } from "@/lib/supabase/server";
import { getAllProducts } from "@/lib/data/admin";
import { getCategories } from "@/lib/data/products";
import { createProductAction } from "@/lib/actions/admin";
import { Input, Label, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatNaira } from "@/lib/utils";

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const [products, categories, { data: businesses }] = await Promise.all([
    getAllProducts(supabase),
    getCategories(supabase),
    supabase.from("businesses").select("id, name").order("name"),
  ]);

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div>
        <h1 className="mb-4 text-lg font-semibold text-ink">Products</h1>
        <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 text-left text-xs text-neutral-500">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Business</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-neutral-50 last:border-0">
                  <td className="px-4 py-3 font-medium text-ink">{product.name}</td>
                  <td className="px-4 py-3 text-neutral-500">{product.business?.name}</td>
                  <td className="px-4 py-3 text-neutral-500">{formatNaira(product.price)}</td>
                  <td className="px-4 py-3 text-neutral-500">{product.stock_qty}</td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-neutral-400">
                    No products yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-sm font-semibold text-ink">Add product</h2>
        <form
          action={createProductAction}
          className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4"
        >
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required />
          </div>
          <div>
            <Label htmlFor="business_id">Business</Label>
            <Select id="business_id" name="business_id" required>
              {businesses?.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
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
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="price">Price (₦)</Label>
              <Input id="price" name="price" type="number" min={0} required />
            </div>
            <div className="flex-1">
              <Label htmlFor="stock_qty">Stock</Label>
              <Input id="stock_qty" name="stock_qty" type="number" min={0} defaultValue={0} />
            </div>
          </div>
          <div>
            <Label htmlFor="unit">Unit</Label>
            <Input id="unit" name="unit" placeholder="bag, pack, bottle…" defaultValue="unit" />
          </div>
          <Button type="submit">Add product</Button>
        </form>
      </div>
    </div>
  );
}
