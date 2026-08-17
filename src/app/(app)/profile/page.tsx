import Link from "next/link";
import {
  MapPin,
  CreditCard,
  Bell,
  ShieldCheck,
  ShoppingBasket,
  RotateCcw,
  ChevronRight,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { TopBar } from "@/components/nav/TopBar";
import { signOut } from "@/lib/auth/actions";

const LINKS = [
  { href: "/baskets", label: "My Baskets", icon: ShoppingBasket, description: "Active, saved & past" },
  { href: "/subscriptions", label: "Subscriptions", icon: RotateCcw, description: "Active, paused & cancelled" },
  { href: "/profile/addresses", label: "Addresses", icon: MapPin, description: "Home, School, Office" },
  { href: "/profile/payment-methods", label: "Payment Methods", icon: CreditCard, description: "Manage how you pay" },
  { href: "/profile/notifications", label: "Notifications", icon: Bell, description: "Reminders & updates" },
  { href: "/profile/security", label: "Security", icon: ShieldCheck, description: "Password & sessions" },
] as const;

export default async function ProfilePage() {
  const { user, profile } = await requireUser();

  return (
    <div>
      <TopBar title="Profile" />
      <div className="flex flex-col gap-6 px-4 pt-4 pb-8">
        <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-lg font-semibold text-white">
            {(profile?.full_name ?? user.email ?? "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-ink">{profile?.full_name ?? "ESNTL customer"}</p>
            <p className="text-sm text-neutral-500">{user.email}</p>
            {profile?.phone && <p className="text-sm text-neutral-500">{profile.phone}</p>}
          </div>
        </div>

        {profile?.role === "admin" && (
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-2xl bg-ink px-4 py-3.5 text-white"
          >
            <LayoutDashboard size={18} />
            <div>
              <p className="text-sm font-medium">Admin Dashboard</p>
              <p className="text-xs text-neutral-400">
                Manage businesses, customers, orders & more
              </p>
            </div>
            <ChevronRight size={16} className="ml-auto text-neutral-500" />
          </Link>
        )}

        <div className="flex flex-col divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-white">
          {LINKS.map(({ href, label, icon: Icon, description }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center justify-between gap-3 px-4 py-3.5"
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className="text-neutral-400" />
                <div>
                  <p className="text-sm font-medium text-ink">{label}</p>
                  <p className="text-xs text-neutral-500">{description}</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-neutral-300" />
            </Link>
          ))}
        </div>

        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 py-3 text-sm font-semibold text-danger"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
