import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { getAddressesForUser } from "@/lib/data/addresses";
import { TopBar } from "@/components/nav/TopBar";
import { NewAddressForm } from "@/components/profile/NewAddressForm";

export default async function AddressesPage() {
  const { user } = await requireUser();
  const supabase = await createClient();
  const addresses = await getAddressesForUser(supabase, user.id);

  return (
    <div>
      <TopBar title="Addresses" backHref="/profile" />
      <div className="flex flex-col gap-4 px-4 pt-4 pb-8">
        <div className="flex flex-col gap-2">
          {addresses.length === 0 && (
            <p className="py-4 text-center text-sm text-neutral-400">
              No addresses saved yet.
            </p>
          )}
          {addresses.map((address) => (
            <div
              key={address.id}
              className="rounded-2xl border border-neutral-200 bg-white p-4"
            >
              <p className="text-sm font-semibold capitalize text-ink">
                {address.label}
                {address.is_default && (
                  <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                    Default
                  </span>
                )}
              </p>
              <p className="text-sm text-neutral-500">
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state}
              </p>
            </div>
          ))}
        </div>

        <NewAddressForm />
      </div>
    </div>
  );
}
