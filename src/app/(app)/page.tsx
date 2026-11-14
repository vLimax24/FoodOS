import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getHousehold } from "@/lib/supabase/household";
import HomeDashboard from "@/components/home/home-dashboard";

async function HomePageContent() {
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

  const [shoppingResult, pantryResult, recipesResult] = await Promise.all([
    supabase
      .from("shopping_items")
      .select("id, name, quantity, unit, is_completed", { count: "exact" })
      .eq("household_id", household.id)
      .eq("is_completed", false)
      .order("created_at", { ascending: false })
      .limit(3),

    supabase
      .from("pantry_items")
      .select("id, name, quantity, unit, min_quantity, category")
      .eq("household_id", household.id)
      .order("updated_at", { ascending: false }),

    supabase
      .from("recipes")
      .select(
        "id, title, image_url, category, servings, prep_time_minutes, cook_time_minutes, difficulty, created_at",
        { count: "exact" },
      )
      .eq("household_id", household.id)
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  if (shoppingResult.error) {
    console.error(
      "Shopping items could not be loaded:",
      shoppingResult.error.message,
    );
  }

  if (pantryResult.error) {
    console.error(
      "Pantry items could not be loaded:",
      pantryResult.error.message,
    );
  }

  if (recipesResult.error) {
    console.error("Recipes could not be loaded:", recipesResult.error.message);
  }

  const pantryItems = pantryResult.data ?? [];

  const lowStockCount = pantryItems.filter((item) => {
    if (item.min_quantity === null) return false;
    return item.quantity <= item.min_quantity;
  }).length;

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
      shoppingItemCount={shoppingResult.count ?? 0}
      shoppingItems={shoppingResult.data ?? []}
      pantryItemCount={pantryItems.length}
      lowStockCount={lowStockCount}
      pantryItems={pantryItems.slice(0, 4)}
      recipeCount={recipesResult.count ?? 0}
      latestRecipe={recipesResult.data?.[0] ?? null}
    />
  );
}

export default function HomePage() {
  return <HomePageContent />;
}
