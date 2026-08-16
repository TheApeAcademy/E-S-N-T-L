import { BottomNav } from "@/components/nav/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col bg-neutral-50 pb-24">
      {children}
      <BottomNav />
    </div>
  );
}
