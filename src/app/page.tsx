import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getHousehold } from "@/lib/supabase/household";
import HomeDashboard from "@/components/home/home-dashboard";

async function HomePageContent() {
  // Rendering bis zu einem echten Request aufschieben
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

  const {
    data: shoppingItems,
    count,
    error: shoppingError,
  } = await supabase
    .from("shopping_items")
    .select("id, name, quantity, unit, is_completed", { count: "exact" })
    .eq("household_id", household.id)
    .eq("is_completed", false)
    .order("created_at", { ascending: false })
    .limit(3);

  if (shoppingError) {
    console.error("Shopping items could not be loaded:", shoppingError.message);
  }

  const metadataName =
    user.user_metadata?.full_name ?? user.user_metadata?.name;

  const userName =
    typeof metadataName === "string" && metadataName.trim()
      ? metadataName.trim()
      : (user.email?.split("@")[0] ?? "FoodOS");

  return (
    <HomeDashboard
      householdName={household.name}
      userName={userName}
      shoppingItemCount={count ?? 0}
      shoppingItems={shoppingItems ?? []}
    />
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="p-8">FoodOS wird geladen...</div>}>
      <HomePageContent />
    </Suspense>
  );
}
