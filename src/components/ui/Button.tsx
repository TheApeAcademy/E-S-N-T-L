import { type ButtonHTMLAttributes, forwardRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const VARIANTS = {
  primary: "bg-brand-500 text-white hover:bg-brand-600 shadow-sm shadow-brand-500/20",
  secondary: "bg-ink text-white hover:bg-neutral-800",
  outline:
    "border border-neutral-200 bg-white text-ink hover:border-brand-500 hover:text-brand-600",
  ghost: "text-ink hover:bg-neutral-100",
  danger: "bg-danger text-white hover:bg-red-700",
} as const;

const SIZES = {
  sm: "h-9 px-4 text-sm rounded-full",
  md: "h-11 px-5 text-sm rounded-full",
  lg: "h-13 px-7 text-base rounded-full",
} as const;

type Variant = keyof typeof VARIANTS;
type Size = keyof typeof SIZES;

const BASE =
  "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 ease-out active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", fullWidth, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && "w-full", className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

interface LinkButtonProps {
  href: string;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  children,
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && "w-full", className)}
    >
      {children}
    </Link>
  );
}
