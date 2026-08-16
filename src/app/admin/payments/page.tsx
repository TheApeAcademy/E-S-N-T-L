import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAllPayments } from "@/lib/data/admin";
import { Badge, statusTone } from "@/components/ui/Badge";
import { cn, formatDateTime, formatNaira } from "@/lib/utils";
import type { PaymentStatus } from "@/lib/database.types";

const TABS: { key: PaymentStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "successful", label: "Successful" },
  { key: "pending", label: "Pending" },
  { key: "failed", label: "Failed" },
  { key: "refunded", label: "Refunded" },
];

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = "all" } = await searchParams;
  const supabase = await createClient();
  const payments = await getAllPayments(
    supabase,
    tab === "all" ? undefined : (tab as PaymentStatus),
  );

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold text-ink">Payments</h1>
      <div className="mb-4 flex gap-2">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/payments?tab=${t.key}`}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium",
              tab === t.key ? "bg-ink text-white" : "bg-white border border-neutral-200 text-neutral-500",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>
      <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 text-left text-xs text-neutral-500">
              <th className="px-4 py-3 font-medium">Reference</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="border-b border-neutral-50 last:border-0">
                <td className="px-4 py-3 font-mono text-xs text-neutral-500">
                  {payment.provider_reference}
                </td>
                <td className="px-4 py-3 text-neutral-500">{payment.owner?.full_name ?? "—"}</td>
                <td className="px-4 py-3 font-medium text-ink">{formatNaira(payment.amount)}</td>
                <td className="px-4 py-3 text-neutral-500">
                  {formatDateTime(payment.created_at)}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={statusTone(payment.status)}>{payment.status}</Badge>
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-400">
                  No payments.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
