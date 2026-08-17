import { type InputHTMLAttributes, type SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

// iOS-style filled fields: quiet gray fill, no visible border until focus.
const FIELD_BASE =
  "h-11 w-full rounded-xl border border-transparent bg-neutral-100 px-3.5 text-sm text-ink placeholder:text-neutral-400 outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return <input ref={ref} className={cn(FIELD_BASE, className)} {...props} />;
});
Input.displayName = "Input";

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => {
  return <select ref={ref} className={cn(FIELD_BASE, className)} {...props} />;
});
Select.displayName = "Select";

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-1.5 block text-sm font-medium text-neutral-700", className)}
      {...props}
    />
  );
}
