import { connection } from "next/server";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getHousehold } from "@/lib/supabase/household";
import RecipeDetail from "@/components/recipes/recipe-detail";

type RecipePageProps = {
  params: Promise<{ id: string }>;
};

export default async function RecipePage({ params }: RecipePageProps) {
  await connection();

  const { id } = await params;
  const household = await getHousehold();

  if (!household) notFound();

  const supabase = await createClient();

  const { data: recipe, error } = await supabase
    .from("recipes")
    .select(
      `
      id,
      title,
      description,
      image_url,
      category,
      servings,
      prep_time_minutes,
      cook_time_minutes,
      difficulty,
      recipe_ingredients (
        id,
        name,
        quantity,
        unit,
        notes,
        is_optional,
        sort_order
      ),
      recipe_steps (
        id,
        instruction,
        sort_order
      )
    `,
    )
    .eq("id", id)
    .eq("household_id", household.id)
    .single();

  if (error || !recipe) {
    notFound();
  }

  console.log("Recipe image URL:", recipe.image_url);

  return <RecipeDetail recipe={recipe} />;
}
