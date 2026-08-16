import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { SignupForm } from "./SignupForm";

export default function SignupPage() {
  return (
    <Card>
      <h1 className="mb-1 text-lg font-semibold text-ink">Create your account</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Build a Basket, subscribe, and let ESNTL handle the rest.
      </p>
      <SignupForm />
      <p className="mt-6 text-center text-sm text-neutral-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand-600">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
