import { createClient } from "@/lib/supabase/server";
import { getOverviewStats } from "@/lib/data/admin";
import { formatNaira } from "@/lib/utils";
import { Logo } from "@/components/branding/Logo";

export default async function AdminOverviewPage() {
  const supabase = await createClient();
  const stats = await getOverviewStats(supabase);

  const cards = [
    { label: "Revenue (successful payments)", value: formatNaira(stats.revenue) },
    { label: "Active subscriptions", value: stats.activeSubscriptionCount },
    { label: "Customers", value: stats.customerCount },
    { label: "Businesses", value: stats.businessCount },
    { label: "Products", value: stats.productCount },
    { label: "Failed payments", value: stats.failedPaymentCount },
  ];

  return (
    <div>
      <div className="mb-8 flex justify-center">
        <Logo size="xl" animated variant="full" />
      </div>
      <h1 className="mb-4 text-lg font-semibold text-ink">Overview</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-neutral-200 bg-white p-4">
            <p className="text-xs text-neutral-500">{card.label}</p>
            <p className="mt-1 text-2xl font-semibold text-ink">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
