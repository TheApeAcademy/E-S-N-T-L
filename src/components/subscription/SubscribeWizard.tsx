"use client";

import { useMemo, useState, useTransition } from "react";
import { unstable_rethrow } from "next/navigation";
import { ProgressSteps } from "@/components/ui/ProgressSteps";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { formatNaira, FREQUENCY_LABELS } from "@/lib/utils";
import { toDateInputValue } from "@/lib/data/frequency";
import { createAddressAction } from "@/lib/actions/addresses";
import { createPaymentMethodAction } from "@/lib/actions/payment-methods";
import { createSubscriptionAction } from "@/lib/actions/subscriptions";
import type { Address, BasketSummary, BasketWithItems, PaymentMethod } from "@/lib/data/types";
import type { AddressLabel, SubscriptionFrequency } from "@/lib/database.types";

const STEPS = ["Frequency", "Date", "Address", "Payment", "Review"];
const FREQUENCIES: SubscriptionFrequency[] = [
  "weekly",
  "biweekly",
  "monthly",
  "bimonthly",
  "semester",
];

interface SubscribeWizardProps {
  basket: BasketWithItems;
  summary: BasketSummary;
  addresses: Address[];
  paymentMethods: PaymentMethod[];
}

export function SubscribeWizard({
  basket,
  summary,
  addresses: initialAddresses,
  paymentMethods: initialPaymentMethods,
}: SubscribeWizardProps) {
  const [step, setStep] = useState(0);
  const [frequency, setFrequency] = useState<SubscriptionFrequency>("monthly");
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return toDateInputValue(d);
  });

  const [addresses, setAddresses] = useState(initialAddresses);
  const [addressId, setAddressId] = useState<string | null>(addresses[0]?.id ?? null);
  const [showNewAddress, setShowNewAddress] = useState(addresses.length === 0);

  const [paymentMethods, setPaymentMethods] = useState(initialPaymentMethods);
  const [paymentMethodId, setPaymentMethodId] = useState<string | null>(
    paymentMethods[0]?.id ?? null,
  );
  const [showNewPayment, setShowNewPayment] = useState(paymentMethods.length === 0);

  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const selectedAddress = useMemo(
    () => addresses.find((a) => a.id === addressId),
    [addresses, addressId],
  );
  const selectedPayment = useMemo(
    () => paymentMethods.find((p) => p.id === paymentMethodId),
    [paymentMethods, paymentMethodId],
  );

  function goNext() {
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleAddAddress(formData: FormData) {
    const address = await createAddressAction({
      label: String(formData.get("label")) as AddressLabel,
      line1: String(formData.get("line1")),
      city: String(formData.get("city")),
      state: String(formData.get("state")),
      isDefault: addresses.length === 0,
    });
    setAddresses((prev) => [...prev, address]);
    setAddressId(address.id);
    setShowNewAddress(false);
  }

  async function handleAddPayment(formData: FormData) {
    const method = await createPaymentMethodAction({
      label: String(formData.get("label")),
    });
    setPaymentMethods((prev) => [...prev, method]);
    setPaymentMethodId(method.id);
    setShowNewPayment(false);
  }

  function confirm() {
    if (!addressId || !paymentMethodId) {
      setError("Please choose an address and payment method.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await createSubscriptionAction({
          basketId: basket.id,
          frequency,
          deliveryDate,
          addressId,
          paymentMethodId,
        });
      } catch (err) {
        unstable_rethrow(err);
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="px-4 pt-4">
        <ProgressSteps steps={STEPS} currentIndex={step} />
      </div>

      <div className="flex-1 px-4 py-6">
        {step === 0 && (
          <div>
            <h2 className="mb-1 text-lg font-semibold text-ink">Choose frequency</h2>
            <p className="mb-4 text-sm text-neutral-500">
              How often should ESNTL deliver your {basket.name}?
            </p>
            <div className="flex flex-wrap gap-2">
              {FREQUENCIES.map((f) => (
                <Chip
                  key={f}
                  label={FREQUENCY_LABELS[f]}
                  active={frequency === f}
                  onClick={() => setFrequency(f)}
                />
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="mb-1 text-lg font-semibold text-ink">Choose delivery date</h2>
            <p className="mb-4 text-sm text-neutral-500">When should the first delivery arrive?</p>
            <Input
              type="date"
              value={deliveryDate}
              min={toDateInputValue(new Date())}
              onChange={(event) => setDeliveryDate(event.target.value)}
            />
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="mb-1 text-lg font-semibold text-ink">Delivery address</h2>
            <p className="mb-4 text-sm text-neutral-500">Where should ESNTL deliver to?</p>
            <div className="flex flex-col gap-2">
              {addresses.map((address) => (
                <button
                  key={address.id}
                  type="button"
                  onClick={() => setAddressId(address.id)}
                  className={`rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                    addressId === address.id
                      ? "border-brand-500 bg-brand-50"
                      : "border-neutral-200 bg-white"
                  }`}
                >
                  <span className="font-medium capitalize text-ink">{address.label}</span>
                  <p className="text-neutral-500">
                    {address.line1}, {address.city}, {address.state}
                  </p>
                </button>
              ))}
            </div>

            {!showNewAddress && (
              <button
                type="button"
                onClick={() => setShowNewAddress(true)}
                className="mt-3 text-sm font-medium text-brand-600"
              >
                + Add new address
              </button>
            )}

            {showNewAddress && (
              <form
                action={handleAddAddress}
                className="mt-3 flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4"
              >
                <div>
                  <Label htmlFor="label">Label</Label>
                  <Select id="label" name="label" defaultValue="home">
                    <option value="home">Home</option>
                    <option value="school">School</option>
                    <option value="office">Office</option>
                    <option value="other">Other</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="line1">Street address</Label>
                  <Input id="line1" name="line1" required />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" name="city" required />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" name="state" required />
                  </div>
                </div>
                <Button type="submit" size="sm">
                  Save address
                </Button>
              </form>
            )}
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="mb-1 text-lg font-semibold text-ink">Payment method</h2>
            <p className="mb-4 text-sm text-neutral-500">How should ESNTL charge you?</p>
            <div className="flex flex-col gap-2">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethodId(method.id)}
                  className={`rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                    paymentMethodId === method.id
                      ? "border-brand-500 bg-brand-50"
                      : "border-neutral-200 bg-white"
                  }`}
                >
                  <span className="font-medium text-ink">{method.label}</span>
                </button>
              ))}
            </div>

            {!showNewPayment && (
              <button
                type="button"
                onClick={() => setShowNewPayment(true)}
                className="mt-3 text-sm font-medium text-brand-600"
              >
                + Add payment method
              </button>
            )}

            {showNewPayment && (
              <form
                action={handleAddPayment}
                className="mt-3 flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4"
              >
                <div>
                  <Label htmlFor="pm-label">Card / account label</Label>
                  <Input id="pm-label" name="label" placeholder="Visa •••• 4242" required />
                </div>
                <Button type="submit" size="sm">
                  Save payment method
                </Button>
              </form>
            )}
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="mb-1 text-lg font-semibold text-ink">Review subscription</h2>
            <p className="mb-4 text-sm text-neutral-500">
              Confirm the details before you subscribe.
            </p>
            <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 text-sm">
              <Row label="Basket" value={`${basket.name} (${summary.itemCount} items)`} />
              <Row label="Frequency" value={FREQUENCY_LABELS[frequency]} />
              <Row label="Next delivery" value={deliveryDate} />
              <Row
                label="Address"
                value={
                  selectedAddress
                    ? `${selectedAddress.line1}, ${selectedAddress.city}`
                    : "—"
                }
              />
              <Row label="Payment method" value={selectedPayment?.label ?? "—"} />
              <div className="border-t border-neutral-100 pt-3">
                <Row label="Basket total" value={formatNaira(summary.productTotal)} />
                <Row label="Delivery" value={formatNaira(summary.estimatedDelivery)} />
                <Row
                  label="Total per delivery"
                  value={formatNaira(summary.estimatedTotal)}
                  emphasize
                />
              </div>
            </div>
            {error && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>
            )}
          </div>
        )}
      </div>

      <div className="sticky bottom-0 flex gap-2 border-t border-neutral-200 bg-white p-4">
        {step > 0 && (
          <Button variant="outline" onClick={goBack} disabled={pending}>
            Back
          </Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button fullWidth onClick={goNext}>
            Continue
          </Button>
        ) : (
          <Button fullWidth onClick={confirm} disabled={pending}>
            {pending ? "Confirming…" : "Confirm Subscription"}
          </Button>
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-neutral-500">{label}</span>
      <span className={emphasize ? "font-semibold text-brand-600" : "font-medium text-ink"}>
        {value}
      </span>
    </div>
  );
}
