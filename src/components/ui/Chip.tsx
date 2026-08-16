import { cn } from "@/lib/utils";

interface ChipProps {
  label: string;
  icon?: string;
  active?: boolean;
  onClick?: () => void;
}

export function Chip({ label, icon, active, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "border-brand-500 bg-brand-500 text-white"
          : "border-neutral-200 bg-white text-neutral-700 hover:border-brand-300",
      )}
    >
      {icon && <span>{icon}</span>}
      {label}
    </button>
  );
}
