import { connection } from "next/server";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getHousehold } from "@/lib/supabase/household";
import RecipeForm from "@/components/recipes/recipe-form";

type EditRecipePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditRecipePage({ params }: EditRecipePageProps) {
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

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#20251f]">
          Rezept bearbeiten
        </h1>
        <p className="mt-1 text-sm text-[#81897f]">
          Aktualisiert euer Rezept und speichert die Änderungen.
        </p>
      </div>

      <RecipeForm householdId={household.id} initialRecipe={recipe} />
    </div>
  );
}
