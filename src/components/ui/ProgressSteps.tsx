import { cn } from "@/lib/utils";

interface ProgressStepsProps {
  steps: string[];
  currentIndex: number;
}

export function ProgressSteps({ steps, currentIndex }: ProgressStepsProps) {
  return (
    <ol className="flex items-center gap-2">
      {steps.map((step, index) => (
        <li key={step} className="flex flex-1 flex-col gap-1.5">
          <div
            className={cn(
              "h-1.5 rounded-full",
              index <= currentIndex ? "bg-brand-500" : "bg-neutral-200",
            )}
          />
          <span
            className={cn(
              "text-[11px] font-medium",
              index === currentIndex ? "text-brand-600" : "text-neutral-400",
            )}
          >
            {step}
          </span>
        </li>
      ))}
    </ol>
  );
}
