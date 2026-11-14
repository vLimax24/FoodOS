"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getHousehold } from "@/lib/supabase/household";

export type RecipeDifficulty = "einfach" | "mittel" | "anspruchsvoll";

export type RecipeIngredientInput = {
  name: string;
  quantity: number | null;
  unit: string;
  notes: string;
  is_optional: boolean;
};

export type RecipeStepInput = {
  instruction: string;
};

export type SaveRecipeInput = {
  id?: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  servings: number;
  prepTimeMinutes: number | null;
  cookTimeMinutes: number | null;
  difficulty: RecipeDifficulty | null;
  ingredients: RecipeIngredientInput[];
  steps: RecipeStepInput[];
};

type RecipeActionResult = {
  success: boolean;
  error?: string;
  recipeId?: string;
};

function isValidOptionalNumber(value: number | null): boolean {
  return (
    value === null || (Number.isInteger(value) && value >= 0 && value <= 1440)
  );
}

function getRecipeImagePath(imageUrl: string | null): string | null {
  if (!imageUrl) return null;

  try {
    const image = new URL(imageUrl);
    const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!projectUrl || image.origin !== new URL(projectUrl).origin) {
      return null;
    }

    const prefix = "/storage/v1/object/public/recipe-images/";

    if (!image.pathname.startsWith(prefix)) {
      return null;
    }

    const path = decodeURIComponent(image.pathname.slice(prefix.length));

    if (!path || path.split("/").some((part) => part === ".." || !part)) {
      return null;
    }

    return path;
  } catch {
    return null;
  }
}

function validateRecipe(input: SaveRecipeInput): string | null {
  if (!input.title.trim()) {
    return "Bitte gib einen Rezeptnamen ein.";
  }

  if (input.title.trim().length > 120) {
    return "Der Rezeptname darf maximal 120 Zeichen lang sein.";
  }

  if (input.description.length > 2000) {
    return "Die Beschreibung ist zu lang.";
  }

  if (input.category.length > 50) {
    return "Die Kategorie ist zu lang.";
  }

  if (
    !Number.isInteger(input.servings) ||
    input.servings < 1 ||
    input.servings > 100
  ) {
    return "Bitte gib eine gültige Portionsanzahl ein.";
  }

  if (!isValidOptionalNumber(input.prepTimeMinutes)) {
    return "Die Vorbereitungszeit ist ungültig.";
  }

  if (!isValidOptionalNumber(input.cookTimeMinutes)) {
    return "Die Kochzeit ist ungültig.";
  }

  if (
    input.difficulty !== null &&
    !["einfach", "mittel", "anspruchsvoll"].includes(input.difficulty)
  ) {
    return "Ungültiger Schwierigkeitsgrad.";
  }

  if (input.imageUrl.trim()) {
    try {
      const url = new URL(input.imageUrl);

      if (!["http:", "https:"].includes(url.protocol)) {
        return "Die Bild-URL ist ungültig.";
      }
    } catch {
      return "Die Bild-URL ist ungültig.";
    }
  }

  if (input.ingredients.length > 100) {
    return "Ein Rezept darf maximal 100 Zutaten enthalten.";
  }

  if (input.steps.length > 100) {
    return "Ein Rezept darf maximal 100 Zubereitungsschritte enthalten.";
  }

  for (const ingredient of input.ingredients) {
    if (!ingredient.name.trim()) {
      return "Alle Zutaten benötigen einen Namen.";
    }

    if (ingredient.name.trim().length > 120) {
      return "Ein Zutatenname ist zu lang.";
    }

    if (
      ingredient.quantity !== null &&
      (!Number.isFinite(ingredient.quantity) ||
        ingredient.quantity < 0 ||
        ingredient.quantity > 1000000)
    ) {
      return "Eine Zutatenmenge ist ungültig.";
    }

    if (ingredient.unit.length > 30 || ingredient.notes.length > 200) {
      return "Die Angaben einer Zutat sind zu lang.";
    }
  }

  for (const step of input.steps) {
    if (!step.instruction.trim()) {
      return "Alle Zubereitungsschritte benötigen eine Beschreibung.";
    }

    if (step.instruction.trim().length > 2000) {
      return "Ein Zubereitungsschritt ist zu lang.";
    }
  }

  return null;
}

export async function saveRecipe(
  input: SaveRecipeInput,
): Promise<RecipeActionResult> {
  const validationError = validateRecipe(input);

  if (validationError) {
    return { success: false, error: validationError };
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

  // Bei einer Bearbeitung die bisherige Bild-URL auslesen.
  let previousImageUrl: string | null = null;

  if (input.id) {
    const { data: existingRecipe, error: fetchError } = await supabase
      .from("recipes")
      .select("image_url")
      .eq("id", input.id)
      .eq("household_id", household.id)
      .maybeSingle();

    if (fetchError) {
      console.error("Recipe could not be loaded:", fetchError.message);

      return {
        success: false,
        error: "Das bestehende Rezept konnte nicht geladen werden.",
      };
    }

    if (!existingRecipe) {
      return {
        success: false,
        error: "Rezept wurde nicht gefunden.",
      };
    }

    previousImageUrl = existingRecipe.image_url;
  }

  const newImageUrl = input.imageUrl.trim();

  const { data: recipeId, error } = await supabase.rpc("save_recipe", {
    p_household_id: household.id,
    p_recipe_id: input.id ?? null,
    p_title: input.title.trim(),
    p_description: input.description.trim(),
    p_image_url: newImageUrl,
    p_category: input.category.trim(),
    p_servings: input.servings,
    p_prep_time_minutes: input.prepTimeMinutes,
    p_cook_time_minutes: input.cookTimeMinutes,
    p_difficulty: input.difficulty,
    p_ingredients: input.ingredients.map((ingredient, index) => ({
      name: ingredient.name.trim(),
      quantity: ingredient.quantity,
      unit: ingredient.unit.trim(),
      notes: ingredient.notes.trim(),
      is_optional: ingredient.is_optional,
      sort_order: index,
    })),
    p_steps: input.steps.map((step, index) => ({
      instruction: step.instruction.trim(),
      sort_order: index,
    })),
  });

  if (error || !recipeId) {
    console.error("Recipe could not be saved:", error?.message);

    return {
      success: false,
      error: "Rezept konnte nicht gespeichert werden.",
    };
  }

  // Altes Bild erst nach erfolgreichem Speichern entfernen.
  if (previousImageUrl && previousImageUrl !== newImageUrl) {
    const oldImagePath = getRecipeImagePath(previousImageUrl);

    if (oldImagePath) {
      const { error: storageError } = await supabase.storage
        .from("recipe-images")
        .remove([oldImagePath]);

      if (storageError) {
        console.error(
          "Old recipe image could not be deleted:",
          storageError.message,
        );
      }
    }
  }

  revalidatePath("/");
  revalidatePath("/recipes");
  revalidatePath(`/recipes/${recipeId}`);
  revalidatePath(`/recipes/${recipeId}/edit`);

  return {
    success: true,
    recipeId,
  };
}

export async function deleteRecipe(
  recipeId: string,
): Promise<RecipeActionResult> {
  if (!recipeId) {
    return { success: false, error: "Ungültige Rezept-ID." };
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

  const { data, error } = await supabase
    .from("recipes")
    .delete()
    .eq("id", recipeId)
    .eq("household_id", household.id)
    .select("id, image_url")
    .maybeSingle();

  if (error) {
    console.error("Recipe could not be deleted:", error.message);

    return {
      success: false,
      error: "Rezept konnte nicht gelöscht werden.",
    };
  }

  if (!data) {
    return {
      success: false,
      error: "Rezept wurde nicht gefunden.",
    };
  }

  // Zugehöriges Bild ebenfalls aus Storage entfernen.
  const imagePath = getRecipeImagePath(data.image_url);

  if (imagePath) {
    const { error: storageError } = await supabase.storage
      .from("recipe-images")
      .remove([imagePath]);

    if (storageError) {
      console.error("Recipe image could not be deleted:", storageError.message);
    }
  }

  revalidatePath("/");
  revalidatePath("/recipes");
  revalidatePath(`/recipes/${recipeId}`);

  return { success: true };
}
