import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import {
  getSubscriptionById,
  getDeliveriesForSubscription,
  getPaymentsForSubscription,
  subscriptionAmount,
} from "@/lib/data/subscriptions";
import { TopBar } from "@/components/nav/TopBar";
import { Badge, statusTone } from "@/components/ui/Badge";
import { SubscriptionActions } from "@/components/subscription/SubscriptionActions";
import { DeliveryList } from "@/components/subscription/DeliveryList";
import { formatNaira, formatShortDate, FREQUENCY_LABELS } from "@/lib/utils";

export default async function SubscriptionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ welcome?: string }>;
}) {
  const { id } = await params;
  const { welcome } = await searchParams;
  const { user } = await requireUser();
  const supabase = await createClient();

  const subscription = await getSubscriptionById(supabase, id).catch(() => null);
  if (!subscription || subscription.owner_id !== user.id) notFound();

  const [deliveries, payments] = await Promise.all([
    getDeliveriesForSubscription(supabase, subscription.id),
    getPaymentsForSubscription(supabase, subscription.id),
  ]);

  const amount = subscriptionAmount(subscription.items, subscription.delivery_fee);

  return (
    <div>
      <TopBar
        title={subscription.basket?.name ?? "Subscription"}
        backHref="/subscriptions"
        right={<Badge tone={statusTone(subscription.status)}>{subscription.status}</Badge>}
      />

      <div className="flex flex-col gap-6 px-4 pb-8 pt-4">
        {welcome === "1" && (
          <div className="flex items-start gap-2 rounded-2xl bg-green-50 p-4 text-success">
            <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">
                Your {subscription.basket?.name} is now active.
              </p>
              <p className="text-sm">
                {formatNaira(amount)} · {FREQUENCY_LABELS[subscription.frequency]} · Next
                delivery {formatShortDate(subscription.next_delivery_at)}
              </p>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
          <p className="text-2xl font-semibold text-ink">{formatNaira(amount)}</p>
          <p className="text-sm text-neutral-500">
            / {FREQUENCY_LABELS[subscription.frequency]}
          </p>
          <p className="mt-2 text-sm font-medium text-brand-600">
            Next delivery: {formatShortDate(subscription.next_delivery_at)}
          </p>
          {subscription.address && (
            <p className="mt-1 text-xs text-neutral-500">
              Delivering to {subscription.address.line1}, {subscription.address.city}
            </p>
          )}
        </div>

        <SubscriptionActions
          subscriptionId={subscription.id}
          basketId={subscription.basket_id}
          status={subscription.status}
          frequency={subscription.frequency}
          nextDeliveryAt={subscription.next_delivery_at}
        />

        <section>
          <h2 className="mb-2 text-sm font-semibold text-ink">Basket Contents</h2>
          <div className="flex flex-col divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-white px-4">
            {subscription.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3">
                <p className="text-sm font-medium text-ink">{item.product?.name}</p>
                <p className="text-sm text-neutral-500">
                  {item.quantity}× {formatNaira(item.unit_price)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-semibold text-ink">Deliveries</h2>
          <DeliveryList deliveries={deliveries} />
        </section>

        <section>
          <h2 className="mb-2 text-sm font-semibold text-ink">Payment History</h2>
          {payments.length === 0 ? (
            <p className="text-sm text-neutral-400">No payments yet.</p>
          ) : (
            <div className="flex flex-col divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-white px-4">
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {formatNaira(payment.amount)}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {formatShortDate(payment.created_at)} · {payment.provider_reference}
                    </p>
                  </div>
                  <Badge tone={statusTone(payment.status)}>{payment.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
