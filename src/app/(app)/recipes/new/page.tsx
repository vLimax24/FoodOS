import RecipeForm from "@/components/recipes/recipe-form";
import { getHousehold } from "@/lib/supabase/household";
import { connection } from "next/server";

export default async function NewRecipePage() {
  await connection();
  const household = await getHousehold();

  if (!household) return null;
  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <div>
        <p className="mb-2 text-sm font-medium tracking-wide text-[#7d8979]">
          FOODOS · KOCHBUCH
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Neues Rezept
        </h1>
        <p className="mt-2 text-sm text-[#81897f]">
          Fügt eurem Familienkochbuch ein neues Lieblingsgericht hinzu.
        </p>
      </div>

      <RecipeForm householdId={household.id} />
    </div>
  );
}
