import { TopBar } from "@/components/nav/TopBar";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createBasketAction } from "@/lib/actions/baskets";

export default function NewBasketPage() {
  return (
    <div>
      <TopBar title="Create a Basket" backHref="/baskets" />
      <div className="px-4 pt-6">
        <p className="mb-6 text-sm text-neutral-500">
          Give your Basket a name. You can add products next.
        </p>
        <form action={createBasketAction} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="name">Basket name</Label>
            <Input
              id="name"
              name="name"
              placeholder="My Monthly Essentials"
              required
              autoFocus
            />
          </div>
          <Button type="submit" fullWidth>
            Continue
          </Button>
        </form>
      </div>
    </div>
  );
}
