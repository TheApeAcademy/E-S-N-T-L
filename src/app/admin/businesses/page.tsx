import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAllBusinesses } from "@/lib/data/admin";
import { createBusinessAction } from "@/lib/actions/admin";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default async function AdminBusinessesPage() {
  const supabase = await createClient();
  const businesses = await getAllBusinesses(supabase);

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div>
        <h1 className="mb-4 text-lg font-semibold text-ink">Businesses</h1>
        <div className="flex flex-col gap-2">
          {businesses.map((business) => (
            <Link
              key={business.id}
              href={`/admin/businesses/${business.id}`}
              className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-4"
            >
              <div>
                <p className="font-medium text-ink">{business.name}</p>
                <p className="text-xs text-neutral-500">{business.description}</p>
              </div>
              <Badge tone={business.status === "active" ? "success" : "neutral"}>
                {business.status}
              </Badge>
            </Link>
          ))}
          {businesses.length === 0 && (
            <p className="py-8 text-center text-sm text-neutral-400">No businesses yet.</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-sm font-semibold text-ink">Add business</h2>
        <form
          action={createBusinessAction}
          className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4"
        >
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" />
          </div>
          <Button type="submit">Add business</Button>
        </form>
      </div>
    </div>
  );
}
