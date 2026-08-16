"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createAddressAction } from "@/lib/actions/addresses";
import { Input, Label, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { AddressLabel } from "@/lib/database.types";

export function NewAddressForm() {
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
        + Add new address
      </button>
    );
  }

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await createAddressAction({
        label: String(formData.get("label")) as AddressLabel,
        line1: String(formData.get("line1")),
        line2: String(formData.get("line2") ?? ""),
        city: String(formData.get("city")),
        state: String(formData.get("state")),
      });
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
      <div>
        <Label htmlFor="line2">Apartment, suite, etc. (optional)</Label>
        <Input id="line2" name="line2" />
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
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save address"}
      </Button>
    </form>
  );
}
