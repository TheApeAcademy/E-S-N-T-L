import Image from "next/image";
import { cn } from "@/lib/utils";

// Source assets: public/logo-full.png (378x206) and public/logo-mark.png (157x106).
const FULL_ASPECT = 206 / 378;
const MARK_ASPECT = 106 / 157;

const FULL_WIDTHS = { sm: 160, md: 220, lg: 320, xl: 420 } as const;
const MARK_HEIGHTS = { sm: 22, md: 32, lg: 56, xl: 88 } as const;

type Size = keyof typeof FULL_WIDTHS;

interface LogoProps {
  size?: Size;
  animated?: boolean;
  /** "full" = icon + ESNTL wordmark + tagline (needs a dark backdrop). "mark" = icon only, transparent, works anywhere. */
  variant?: "full" | "mark";
  className?: string;
}

export function Logo({ size = "md", animated = false, variant = "mark", className }: LogoProps) {
  if (variant === "full") {
    const width = FULL_WIDTHS[size];
    const height = Math.round(width * FULL_ASPECT);
    return (
      <div
        className={cn(
          "inline-flex items-center justify-center rounded-3xl bg-ink px-8 py-6 shadow-lg",
          animated && "animate-jiggle",
          className,
        )}
      >
        <Image
          src="/logo-full.png"
          alt="ESNTL — Everything in one Basket"
          width={width}
          height={height}
          priority
        />
      </div>
    );
  }

  const height = MARK_HEIGHTS[size];
  const width = Math.round(height / MARK_ASPECT);
  return (
    <Image
      src="/logo-mark.png"
      alt="ESNTL"
      width={width}
      height={height}
      priority
      className={cn(animated && "animate-jiggle", className)}
    />
  );
}
