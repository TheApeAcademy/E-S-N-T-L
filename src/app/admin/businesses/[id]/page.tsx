import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBusinessById } from "@/lib/data/admin";
import { formatNaira } from "@/lib/utils";

export default async function AdminBusinessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const business = await getBusinessById(supabase, id).catch(() => null);
  if (!business) notFound();

  return (
    <div>
      <h1 className="mb-1 text-lg font-semibold text-ink">{business.name}</h1>
      <p className="mb-4 text-sm text-neutral-500">{business.description}</p>

      <h2 className="mb-2 text-sm font-semibold text-ink">Products</h2>
      <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 text-left text-xs text-neutral-500">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Available</th>
            </tr>
          </thead>
          <tbody>
            {business.products.map((product) => (
              <tr key={product.id} className="border-b border-neutral-50 last:border-0">
                <td className="px-4 py-3 font-medium text-ink">{product.name}</td>
                <td className="px-4 py-3 text-neutral-500">{formatNaira(product.price)}</td>
                <td className="px-4 py-3 text-neutral-500">{product.stock_qty}</td>
                <td className="px-4 py-3 text-neutral-500">
                  {product.is_available ? "Yes" : "No"}
                </td>
              </tr>
            ))}
            {business.products.length === 0 && (
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
  );
}
