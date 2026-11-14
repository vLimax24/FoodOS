import { Suspense } from "react";
import AppShell from "@/components/layout/app-shell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-[#f7f8f6]">
          <p className="text-sm text-[#81897f]">FoodOS wird geladen...</p>
        </div>
      }
    >
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
