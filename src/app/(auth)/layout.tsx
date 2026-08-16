import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-6 py-12">
      <div className="mb-8 flex flex-col items-center gap-2">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-lg font-bold text-white">
            +
          </span>
          <span className="text-xl font-bold tracking-tight text-ink">ESNTL</span>
        </Link>
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
          Everything in one Basket
        </p>
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
