"use client";

import { useActionState } from "react";
import { updatePasswordAction } from "@/lib/actions/security";
import type { ActionState } from "@/lib/auth/actions";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: ActionState = {};

export function UpdatePasswordForm() {
  const [state, formAction, pending] = useActionState(updatePasswordAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4">
      <div>
        <Label htmlFor="password">New password</Label>
        <Input id="password" name="password" type="password" minLength={6} required />
      </div>
      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{state.error}</p>
      )}
      {state.success && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-success">
          Password updated.
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
