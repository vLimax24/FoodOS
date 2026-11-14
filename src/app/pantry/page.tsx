import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getHousehold } from "@/lib/supabase/household";
import { PantryPageClient } from "@/components/pantry/pantry-page-client";

async function PantryPageContent() {
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
    .from("pantry_items")
    .select("id, name, quantity, unit, category, min_quantity, created_at")
    .eq("household_id", household.id)
    .order("name", { ascending: true });

  if (error) {
    console.error("Fehler beim Laden der Vorräte:", error);
  }

  return (
    <PantryPageClient householdName={household.name} items={items ?? []} />
  );
}

export default function PantryPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-sm text-muted-foreground">
          Vorräte werden geladen...
        </div>
      }
    >
      <PantryPageContent />
    </Suspense>
  );
}
