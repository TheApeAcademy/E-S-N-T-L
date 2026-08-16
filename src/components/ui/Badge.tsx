import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const TONES = {
  neutral: "bg-neutral-100 text-neutral-700",
  brand: "bg-brand-50 text-brand-700",
  success: "bg-green-50 text-success",
  warning: "bg-amber-50 text-warning",
  danger: "bg-red-50 text-danger",
} as const;

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: keyof typeof TONES;
}

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        TONES[tone],
        className,
      )}
      {...props}
    />
  );
}

export function statusTone(status: string): keyof typeof TONES {
  switch (status) {
    case "active":
    case "delivered":
    case "successful":
    case "vendor_confirmed":
      return "success";
    case "paused":
    case "pending":
    case "processing":
    case "out_for_delivery":
      return "warning";
    case "cancelled":
    case "failed":
    case "refunded":
      return "danger";
    case "subscribed":
    case "saved":
      return "brand";
    default:
      return "neutral";
  }
}
