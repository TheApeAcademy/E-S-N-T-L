import { Card } from "@/components/ui/Card";
import { ResetPasswordForm } from "./ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <Card>
      <h1 className="mb-1 text-lg font-semibold text-ink">Reset your password</h1>
      <p className="mb-6 text-sm text-neutral-500">
        We&apos;ll email you a link to choose a new password.
      </p>
      <ResetPasswordForm />
    </Card>
  );
}
