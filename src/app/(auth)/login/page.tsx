import Link from "next/link";
import { Suspense } from "react";
import { Card } from "@/components/ui/Card";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <Card>
      <h1 className="mb-1 text-lg font-semibold text-ink">Welcome back</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Sign in to manage your Baskets and Subscriptions.
      </p>
      <Suspense>
        <LoginForm />
      </Suspense>
      <p className="mt-6 text-center text-sm text-neutral-500">
        New to ESNTL?{" "}
        <Link href="/signup" className="font-medium text-brand-600">
          Create an account
        </Link>
      </p>
      <p className="mt-2 text-center text-sm">
        <Link href="/reset-password" className="font-medium text-neutral-500">
          Forgot password?
        </Link>
      </p>
    </Card>
  );
}
