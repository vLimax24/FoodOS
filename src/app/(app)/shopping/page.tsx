import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getHousehold } from "@/lib/supabase/household";
import { ShoppingPageClient } from "@/components/shopping/shopping-page-client";

async function ShoppingPageContent() {
  await connection();

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const household = await getHousehold();

  if (!household) {
    redirect("/onboarding");
  }

  const { data: items, error } = await supabase
    .from("shopping_items")
    .select("id, name, quantity, unit, category, is_completed, created_at")
    .eq("household_id", household.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fehler beim Laden der Einkaufsliste:", error);
  }

  return (
    <ShoppingPageClient householdName={household.name} items={items ?? []} />
  );
}

export default function ShoppingPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-sm text-muted-foreground">
          Einkaufsliste wird geladen...
        </div>
      }
    >
      <ShoppingPageContent />
    </Suspense>
  );
}
