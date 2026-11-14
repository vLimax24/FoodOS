import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getHousehold } from "@/lib/supabase/household";
import RecipesPageClient from "@/components/recipes/recipes-page-client";

export default async function RecipesPage() {
  await connection();
  const supabase = await createClient();
  const household = await getHousehold();

  if (!household) {
    return null;
  }

  const { data: recipes, error } = await supabase
    .from("recipes")
    .select(
      "id, title, description, image_url, category, servings, prep_time_minutes, cook_time_minutes, difficulty, created_at",
    )
    .eq("household_id", household.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Recipes could not be loaded:", error.message);
  }

  return <RecipesPageClient recipes={recipes ?? []} />;
}
