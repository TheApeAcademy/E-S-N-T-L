import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { signOut } from "@/lib/auth/actions";
import { Logo } from "@/components/branding/Logo";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/businesses", label: "Businesses" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/baskets", label: "Baskets" },
  { href: "/admin/subscriptions", label: "Subscriptions" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/deliveries", label: "Deliveries" },
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireUser();

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="sticky top-0 z-30 border-b border-neutral-800 bg-ink">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/admin" className="flex items-center gap-2">
            <Logo size="md" withWordmark={false} />
            <span className="text-sm font-bold tracking-wide text-white">
              ESNTL Admin
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-neutral-400 sm:inline">
              {profile?.full_name}
            </span>
            <form action={signOut}>
              <button className="rounded-lg border border-neutral-700 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:border-neutral-500">
                Sign out
              </button>
            </form>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
