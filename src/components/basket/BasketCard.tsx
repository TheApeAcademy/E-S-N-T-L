import Link from "next/link";
import Image from "next/image";
import { formatNaira } from "@/lib/utils";

interface BasketCardProps {
  href: string;
  name: string;
  itemCount: number;
  imageUrl?: string | null;
  emoji?: string;
  total?: number;
  subtitle?: string;
}

export function BasketCard({
  href,
  name,
  itemCount,
  imageUrl,
  emoji = "🧺",
  total,
  subtitle,
}: BasketCardProps) {
  return (
    <Link
      href={href}
      className="flex w-40 shrink-0 flex-col gap-2 rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex h-20 w-full items-center justify-center rounded-xl bg-brand-50 text-3xl">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            width={80}
            height={80}
            className="h-full w-full rounded-xl object-cover"
          />
        ) : (
          emoji
        )}
      </div>
      <div>
        <p className="line-clamp-2 text-sm font-semibold text-ink">{name}</p>
        <p className="text-xs text-neutral-500">
          {subtitle ?? `${itemCount} items`}
        </p>
        {total !== undefined && (
          <p className="text-xs font-medium text-brand-600">{formatNaira(total)}</p>
        )}
      </div>
    </Link>
  );
}
