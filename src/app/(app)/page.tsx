import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getBasketTemplates } from "@/lib/data/baskets";
import { getSubscriptionsForUser, subscriptionAmount } from "@/lib/data/subscriptions";
import { ActiveBasketCard } from "@/components/basket/ActiveBasketCard";
import { BasketCard } from "@/components/basket/BasketCard";
import { ProductSearch } from "@/components/basket/ProductSearch";
import { Logo } from "@/components/branding/Logo";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function HomePage() {
  const session = await getCurrentUser();
  const supabase = await createClient();

  const [templates, activeSubscriptions] = await Promise.all([
    getBasketTemplates(supabase),
    session ? getSubscriptionsForUser(supabase, session.user.id, "active") : [],
  ]);

  const firstName = session?.profile?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="flex flex-col gap-6 px-4 pt-6">
      <div className="flex items-center gap-2">
        <Logo size="sm" animated />
        <span className="font-wordmark text-lg font-bold uppercase tracking-[0.3em] text-ink">
          ESNTL
        </span>
      </div>

      <div>
        <h1 className="text-xl font-semibold text-ink">
          {greeting()}, {firstName} 👋
        </h1>
        <p className="text-sm text-neutral-500">What are you looking for?</p>
      </div>

      <ProductSearch />

      {activeSubscriptions.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">Your Active Baskets</h2>
            <Link href="/subscriptions" className="text-xs font-medium text-brand-600">
              See all
            </Link>
          </div>
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
            {activeSubscriptions.map((sub) => (
              <ActiveBasketCard
                key={sub.id}
                subscriptionId={sub.id}
                name={sub.basket?.name ?? "Basket"}
                itemCount={sub.items.reduce((n, i) => n + i.quantity, 0)}
                amount={subscriptionAmount(sub.items, sub.delivery_fee)}
                frequency={sub.frequency}
                nextDeliveryAt={sub.next_delivery_at}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">Discover Baskets</h2>
          <Link href="/baskets" className="text-xs font-medium text-brand-600">
            See all
          </Link>
        </div>
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
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

      <section className="pb-4">
        <h2 className="mb-3 text-sm font-semibold text-ink">Discover Products</h2>
        <p className="text-xs text-neutral-500">
          Search above to compare prices across ESNTL businesses and add items
          straight to a Basket.
        </p>
      </section>
    </div>
  );
}
