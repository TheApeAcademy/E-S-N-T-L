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
        "sticky top-0 z-30 flex h-14 items-center justify-between border-b border-neutral-200/60 bg-white/80 px-4 backdrop-blur-xl",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        {backHref && (
          <Link
            href={backHref}
            aria-label="Back"
            className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-ink hover:bg-neutral-100"
          >
            <ChevronLeft size={20} />
          </Link>
        )}
        {title && <h1 className="text-base font-semibold text-ink">{title}</h1>}
      </div>
      {right}
    </header>
  );
}
