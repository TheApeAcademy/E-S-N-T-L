"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBasket, RotateCcw, Activity, User, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/baskets", label: "Baskets", icon: ShoppingBasket },
  { href: "/subscriptions", label: "Subs", icon: RotateCcw },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200/60 bg-white/80 backdrop-blur-xl">
      <div className="relative mx-auto flex max-w-lg items-center justify-between px-2">
        {NAV_ITEMS.slice(0, 2).map((item) => (
          <NavItem key={item.href} item={item} pathname={pathname} />
        ))}

        <Link
          href="/baskets/new"
          aria-label="Build a Basket"
          className="-mt-6 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white shadow-lg shadow-brand-500/30 transition-transform hover:scale-105 active:scale-95"
        >
          <Plus size={26} />
        </Link>

        {NAV_ITEMS.slice(2).map((item) => (
          <NavItem key={item.href} item={item} pathname={pathname} />
        ))}
      </div>
    </nav>
  );
}

function NavItem({
  item,
  pathname,
}: {
  item: (typeof NAV_ITEMS)[number];
  pathname: string;
}) {
  const isActive =
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors",
        isActive ? "text-brand-600" : "text-neutral-400 hover:text-neutral-600",
      )}
    >
      <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
      {item.label}
    </Link>
  );
}
