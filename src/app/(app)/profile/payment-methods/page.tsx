import { CreditCard } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { getPaymentMethodsForUser } from "@/lib/data/payment-methods";
import { TopBar } from "@/components/nav/TopBar";
import { NewPaymentMethodForm } from "@/components/profile/NewPaymentMethodForm";

export default async function PaymentMethodsPage() {
  const { user } = await requireUser();
  const supabase = await createClient();
  const methods = await getPaymentMethodsForUser(supabase, user.id);

  return (
    <div>
      <TopBar title="Payment Methods" backHref="/profile" />
      <div className="flex flex-col gap-4 px-4 pt-4 pb-8">
        <div className="flex flex-col gap-2">
          {methods.length === 0 && (
            <p className="py-4 text-center text-sm text-neutral-400">
              No payment methods saved yet.
            </p>
          )}
          {methods.map((method) => (
            <div
              key={method.id}
              className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4"
            >
              <CreditCard size={18} className="text-neutral-400" />
              <p className="text-sm font-medium text-ink">{method.label}</p>
            </div>
          ))}
        </div>

        <NewPaymentMethodForm />
      </div>
    </div>
  );
}
