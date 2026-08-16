import { formatDateTime } from "@/lib/utils";
import type { ActivityEvent } from "@/lib/data/types";

export function ActivityItem({
  event,
  isLast,
}: {
  event: ActivityEvent;
  isLast?: boolean;
}) {
  return (
    <div className="relative flex gap-3 pb-6 pl-1 last:pb-0">
      {!isLast && (
        <div className="absolute bottom-0 left-[7px] top-2 w-px bg-neutral-200" />
      )}
      <div className="relative z-10 mt-1.5 h-3 w-3 shrink-0 rounded-full border-2 border-brand-500 bg-white" />
      <div>
        <p className="text-xs text-neutral-400">{formatDateTime(event.occurred_at)}</p>
        <p className="text-sm font-medium text-ink">{event.title}</p>
        {event.description && (
          <p className="text-xs text-neutral-500">{event.description}</p>
        )}
      </div>
    </div>
  );
}
