import Link from "next/link";
import { Logo } from "@/components/branding/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-6 py-12">
      <Link href="/" className="mb-8">
        <Logo size="xl" animated variant="full" />
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
