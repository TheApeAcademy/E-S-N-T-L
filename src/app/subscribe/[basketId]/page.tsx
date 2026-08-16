import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { getBasketById } from "@/lib/data/baskets";
import { getAddressesForUser } from "@/lib/data/addresses";
import { getPaymentMethodsForUser } from "@/lib/data/payment-methods";
import { summarizeBasket } from "@/lib/data/types";
import { TopBar } from "@/components/nav/TopBar";
import { SubscribeWizard } from "@/components/subscription/SubscribeWizard";

export default async function SubscribePage({
  params,
}: {
  params: Promise<{ basketId: string }>;
}) {
  const { basketId } = await params;
  const { user } = await requireUser();
  const supabase = await createClient();

  const basket = await getBasketById(supabase, basketId).catch(() => null);
  if (!basket || basket.owner_id !== user.id || basket.items.length === 0) notFound();

  const [addresses, paymentMethods] = await Promise.all([
    getAddressesForUser(supabase, user.id),
    getPaymentMethodsForUser(supabase, user.id),
  ]);

  const summary = summarizeBasket(basket.items);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col bg-neutral-50">
      <TopBar title={`Subscribe · ${basket.name}`} backHref={`/baskets/${basket.id}`} />
      <SubscribeWizard
        basket={basket}
        summary={summary}
        addresses={addresses}
        paymentMethods={paymentMethods}
      />
    </div>
  );
}
