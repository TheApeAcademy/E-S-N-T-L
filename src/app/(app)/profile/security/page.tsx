import { TopBar } from "@/components/nav/TopBar";
import { UpdatePasswordForm } from "@/components/profile/UpdatePasswordForm";

export default function SecurityPage() {
  return (
    <div>
      <TopBar title="Security" backHref="/profile" />
      <div className="flex flex-col gap-4 px-4 pt-4 pb-8">
        <h2 className="text-sm font-semibold text-ink">Password</h2>
        <UpdatePasswordForm />

        <div className="mt-2 rounded-2xl border border-neutral-200 bg-white p-4">
          <h2 className="mb-1 text-sm font-semibold text-ink">
            Two-factor authentication
          </h2>
          <p className="text-sm text-neutral-500">Coming soon.</p>
        </div>
      </div>
    </div>
  );
}
