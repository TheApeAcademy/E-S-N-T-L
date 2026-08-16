import { createClient } from "@/lib/supabase/server";
import { getAllCustomers } from "@/lib/data/admin";
import { formatShortDate } from "@/lib/utils";

export default async function AdminCustomersPage() {
  const supabase = await createClient();
  const customers = await getAllCustomers(supabase);

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold text-ink">Customers</h1>
      <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 text-left text-xs text-neutral-500">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-b border-neutral-50 last:border-0">
                <td className="px-4 py-3 font-medium text-ink">
                  {customer.full_name ?? "—"}
                </td>
                <td className="px-4 py-3 text-neutral-500">{customer.phone ?? "—"}</td>
                <td className="px-4 py-3 text-neutral-500">
                  {formatShortDate(customer.created_at)}
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-neutral-400">
                  No customers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
