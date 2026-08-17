import Image from "next/image";
import { cn } from "@/lib/utils";

// Source: public/logo-mark.png (157x106, transparent) — the icon glyph only.
// The wordmark and tagline are real text here (not baked into an image) so
// they can be recolored per background instead of needing a dark card.
const MARK_ASPECT = 106 / 157;

const MARK_HEIGHTS = { sm: 22, md: 32, lg: 56, xl: 88 } as const;
const WORDMARK_SIZES = { sm: "text-base", md: "text-xl", lg: "text-3xl", xl: "text-4xl" } as const;
const TAGLINE_SIZES = { sm: "text-[9px]", md: "text-[10px]", lg: "text-xs", xl: "text-sm" } as const;

type Size = keyof typeof MARK_HEIGHTS;

interface LogoProps {
  size?: Size;
  animated?: boolean;
  /** "full" = icon + ESNTL wordmark + tagline. "mark" = icon only. */
  variant?: "full" | "mark";
  /** "dark" = ink wordmark, for light backgrounds. "light" = white wordmark, for dark backgrounds. */
  tone?: "dark" | "light";
  className?: string;
}

export function Logo({
  size = "md",
  animated = false,
  variant = "mark",
  tone = "dark",
  className,
}: LogoProps) {
  const height = MARK_HEIGHTS[size];
  const width = Math.round(height / MARK_ASPECT);

  const mark = (
    <Image
      src="/logo-mark.png"
      alt="ESNTL"
      width={width}
      height={height}
      priority
      className={cn(animated && "animate-jiggle")}
    />
  );

  if (variant === "mark") {
    return <div className={className}>{mark}</div>;
  }

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      {mark}
      <div className="flex flex-col items-center gap-1">
        <span
          className={cn(
            "font-wordmark font-bold uppercase tracking-[0.3em]",
            WORDMARK_SIZES[size],
            tone === "dark" ? "text-ink" : "text-white",
          )}
        >
          ESNTL
        </span>
        <span
          className={cn(
            "font-medium uppercase tracking-[0.2em] text-brand-500",
            TAGLINE_SIZES[size],
          )}
        >
          Everything in one Basket
        </span>
      </div>
    </div>
  );
}
