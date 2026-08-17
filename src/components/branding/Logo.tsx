import { cn } from "@/lib/utils";

const MARK_SIZES = {
  md: "h-10 w-10 rounded-xl text-lg",
  lg: "h-20 w-20 rounded-2xl text-4xl",
  xl: "h-28 w-28 rounded-3xl text-6xl",
} as const;

const WORDMARK_SIZES = {
  md: "text-xl",
  lg: "text-3xl",
  xl: "text-4xl",
} as const;

interface LogoProps {
  size?: keyof typeof MARK_SIZES;
  animated?: boolean;
  withWordmark?: boolean;
  withTagline?: boolean;
  className?: string;
}

export function Logo({
  size = "md",
  animated = false,
  withWordmark = true,
  withTagline = false,
  className,
}: LogoProps) {
  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex shrink-0 items-center justify-center bg-brand-500 font-bold text-white shadow-lg shadow-brand-500/30",
            MARK_SIZES[size],
            animated && "animate-jiggle",
          )}
        >
          +
        </span>
        {withWordmark && (
          <span
            className={cn(
              "font-bold tracking-tight text-ink",
              WORDMARK_SIZES[size],
            )}
          >
            ESNTL
          </span>
        )}
      </div>
      {withTagline && (
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
          Everything in one Basket
        </p>
      )}
    </div>
  );
}
