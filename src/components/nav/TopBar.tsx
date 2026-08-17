import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopBarProps {
  title?: string;
  backHref?: string;
  right?: React.ReactNode;
  className?: string;
}

export function TopBar({ title, backHref, right, className }: TopBarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 items-center justify-between bg-brand-500 px-4 shadow-sm",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        {backHref && (
          <Link
            href={backHref}
            aria-label="Back"
            className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15"
          >
            <ChevronLeft size={20} />
          </Link>
        )}
        {title && <h1 className="text-base font-semibold text-white">{title}</h1>}
      </div>
      {right}
    </header>
  );
}
