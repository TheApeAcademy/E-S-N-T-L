"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createPaymentMethodAction } from "@/lib/actions/payment-methods";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function NewPaymentMethodForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-2xl border-2 border-dashed border-neutral-300 py-3 text-sm font-semibold text-neutral-500 hover:border-brand-400 hover:text-brand-600"
      >
        + Add payment method
      </button>
    );
  }

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await createPaymentMethodAction({ label: String(formData.get("label")) });
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <form
      action={handleSubmit}
      className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4"
    >
      <div>
        <Label htmlFor="label">Card / account label</Label>
        <Input id="label" name="label" placeholder="Visa •••• 4242" required />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save payment method"}
      </Button>
    </form>
  );
}
