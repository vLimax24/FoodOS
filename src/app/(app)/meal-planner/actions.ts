"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getHousehold } from "@/lib/supabase/household";
import {
  buildShoppingListPreviewFromData,
  type ShoppingPreviewItem,
} from "@/lib/shopping/generation";

export type { ShoppingPreviewItem } from "@/lib/shopping/generation";

import {
  getWeekStart,
  isMealTypeAllowed,
  isValidDate,
  isValidWeekStart,
  type MealType,
} from "@/lib/meal-planner/date-utils";

type ActionResult = {
  success: boolean;
  error?: string;
};

export async function addPlannedMeal(
  date: string,
  mealType: MealType,
  recipeId: string,
): Promise<ActionResult> {
  if (!isValidDate(date)) {
    return { success: false, error: "Ungültiges Datum." };
  }

  if (!["lunch", "dinner"].includes(mealType)) {
    return { success: false, error: "Ungültige Mahlzeit." };
  }

  if (!isMealTypeAllowed(date, mealType)) {
    return {
      success: false,
      error: "An diesem Wochentag ist diese Mahlzeit nicht erlaubt.",
    };
  }

  if (!recipeId) {
    return { success: false, error: "Bitte wähle ein Rezept aus." };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "Du bist nicht angemeldet." };
  }

  const household = await getHousehold();

  if (!household) {
    return { success: false, error: "Kein Haushalt gefunden." };
  }

  // Prüfen, ob das Rezept zum eigenen Haushalt gehört
  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .select("id")
    .eq("id", recipeId)
    .eq("household_id", household.id)
    .maybeSingle();

  if (recipeError || !recipe) {
    return { success: false, error: "Rezept nicht gefunden." };
  }

  const weekStart = getWeekStart(date);

  // Wochenplan erstellen oder vorhandenen Plan verwenden
  const { data: mealPlan, error: planError } = await supabase
    .from("meal_plans")
    .upsert(
      {
        household_id: household.id,
        week_start: weekStart,
      },
      {
        onConflict: "household_id,week_start",
        ignoreDuplicates: true,
      },
    )
    .select("id")
    .maybeSingle();

  if (planError) {
    console.error("Meal plan creation failed:", planError.message);
    return {
      success: false,
      error: "Wochenplan konnte nicht erstellt werden.",
    };
  }

  let mealPlanId = mealPlan?.id;

  // Bei ignoreDuplicates liefert Supabase möglicherweise keine Zeile zurück
  if (!mealPlanId) {
    const { data: existingPlan, error: existingPlanError } = await supabase
      .from("meal_plans")
      .select("id")
      .eq("household_id", household.id)
      .eq("week_start", weekStart)
      .single();

    if (existingPlanError || !existingPlan) {
      return {
        success: false,
        error: "Wochenplan konnte nicht geladen werden.",
      };
    }

    mealPlanId = existingPlan.id;
  }

  const { error: mealError } = await supabase.from("planned_meals").upsert(
    {
      meal_plan_id: mealPlanId,
      recipe_id: recipeId,
      date,
      meal_type: mealType,
    },
    {
      onConflict: "meal_plan_id,date,meal_type",
    },
  );

  if (mealError) {
    console.error("Planned meal creation failed:", mealError.message);
    return {
      success: false,
      error: "Mahlzeit konnte nicht gespeichert werden.",
    };
  }

  revalidatePath("/meal-planner");

  return { success: true };
}

export async function deletePlannedMeal(mealId: string): Promise<ActionResult> {
  if (!mealId) {
    return { success: false, error: "Ungültige Mahlzeit." };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "Du bist nicht angemeldet." };
  }

  const household = await getHousehold();

  if (!household) {
    return { success: false, error: "Kein Haushalt gefunden." };
  }

  const { data: plans, error: plansError } = await supabase
    .from("meal_plans")
    .select("id")
    .eq("household_id", household.id);

  if (plansError) {
    return {
      success: false,
      error: "Wochenpläne konnten nicht geladen werden.",
    };
  }

  const planIds = plans?.map((plan) => plan.id) ?? [];

  if (planIds.length === 0) {
    return { success: false, error: "Mahlzeit nicht gefunden." };
  }

  const { data: deletedMeal, error: deleteError } = await supabase
    .from("planned_meals")
    .delete()
    .eq("id", mealId)
    .in("meal_plan_id", planIds)
    .select("id")
    .maybeSingle();

  if (deleteError || !deletedMeal) {
    return { success: false, error: "Mahlzeit konnte nicht gelöscht werden." };
  }

  revalidatePath("/meal-planner");

  return { success: true };
}

async function buildShoppingListPreview(
  supabase: Awaited<ReturnType<typeof createClient>>,
  householdId: string,
  weekStart: string,
): Promise<ShoppingPreviewItem[]> {
  const { data: mealPlan, error: planError } = await supabase
    .from("meal_plans")
    .select("id")
    .eq("household_id", householdId)
    .eq("week_start", weekStart)
    .maybeSingle();

  if (planError) {
    throw new Error("Wochenplan konnte nicht geladen werden.");
  }

  if (!mealPlan) return [];

  const { data: plannedMeals, error: mealsError } = await supabase
    .from("planned_meals")
    .select("recipe_id")
    .eq("meal_plan_id", mealPlan.id);

  if (mealsError) {
    throw new Error("Geplante Mahlzeiten konnten nicht geladen werden.");
  }

  const recipeIds = [
    ...new Set((plannedMeals ?? []).map((meal) => meal.recipe_id)),
  ];

  if (recipeIds.length === 0) return [];

  const [ingredientsResult, pantryResult, shoppingResult] = await Promise.all([
    supabase
      .from("recipe_ingredients")
      .select("name, quantity, unit, is_optional")
      .in("recipe_id", recipeIds),

    supabase
      .from("pantry_items")
      .select("name, quantity, unit")
      .eq("household_id", householdId),

    supabase
      .from("shopping_items")
      .select("name, quantity, unit")
      .eq("household_id", householdId)
      .eq("is_completed", false),
  ]);

  if (ingredientsResult.error) {
    throw new Error("Rezeptzutaten konnten nicht geladen werden.");
  }

  if (pantryResult.error) {
    throw new Error("Vorrat konnte nicht geladen werden.");
  }

  if (shoppingResult.error) {
    throw new Error("Einkaufsliste konnte nicht geladen werden.");
  }

  // Die eigentliche Berechnung liegt in einer separat testbaren Funktion.
  return buildShoppingListPreviewFromData(
    ingredientsResult.data ?? [],
    pantryResult.data ?? [],
    shoppingResult.data ?? [],
  );
}

export async function getShoppingListPreview(weekStart: string): Promise<{
  success: boolean;
  items?: ShoppingPreviewItem[];
  error?: string;
}> {
  if (!isValidWeekStart(weekStart)) {
    return { success: false, error: "Ungültige Kalenderwoche." };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Du bist nicht angemeldet." };
  }

  const household = await getHousehold();

  if (!household) {
    return { success: false, error: "Kein Haushalt gefunden." };
  }

  try {
    const items = await buildShoppingListPreview(
      supabase,
      household.id,
      weekStart,
    );

    return { success: true, items };
  } catch (error) {
    console.error("Shopping preview error:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Einkaufsliste konnte nicht berechnet werden.",
    };
  }
}

export async function addGeneratedShoppingItems(
  weekStart: string,
  selectedKeys: string[],
): Promise<ActionResult & { addedCount?: number }> {
  if (!isValidWeekStart(weekStart)) {
    return { success: false, error: "Ungültige Kalenderwoche." };
  }

  if (
    !Array.isArray(selectedKeys) ||
    selectedKeys.length === 0 ||
    selectedKeys.length > 200 ||
    selectedKeys.some((key) => typeof key !== "string")
  ) {
    return { success: false, error: "Keine gültigen Artikel ausgewählt." };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Du bist nicht angemeldet." };
  }

  const household = await getHousehold();

  if (!household) {
    return { success: false, error: "Kein Haushalt gefunden." };
  }

  try {
    // Vor dem Speichern wird der Bedarf erneut berechnet.
    const currentPreview = await buildShoppingListPreview(
      supabase,
      household.id,
      weekStart,
    );

    const selectedSet = new Set(selectedKeys);

    const itemsToInsert = currentPreview
      .filter((item) => selectedSet.has(item.key))
      .map((item) => ({
        household_id: household.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        category: item.category,
        created_by: user.id,
      }));

    if (itemsToInsert.length === 0) {
      return {
        success: true,
        addedCount: 0,
      };
    }

    const { error } = await supabase
      .from("shopping_items")
      .insert(itemsToInsert);

    if (error) {
      console.error("Generated shopping items could not be saved:", error);
      return {
        success: false,
        error: "Artikel konnten nicht zur Einkaufsliste hinzugefügt werden.",
      };
    }

    revalidatePath("/");
    revalidatePath("/shopping");
    revalidatePath("/pantry");

    return {
      success: true,
      addedCount: itemsToInsert.length,
    };
  } catch (error) {
    console.error("Shopping list generation error:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Einkaufsliste konnte nicht erstellt werden.",
    };
  }
}
