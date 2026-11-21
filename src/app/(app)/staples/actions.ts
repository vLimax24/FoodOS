"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getHousehold } from "@/lib/supabase/household";
import { SHOPPING_CATEGORIES } from "@/lib/shopping/categories";
import { isValidUnit } from "@/lib/units";

export type StandardItem = {
  id: string;
  name: string;
  image_url: string | null;
  category: string;
  unit: string | null;
  min_quantity: number;
  sort_order: number;
};

type AddStandardItemResult =
  | {
      success: true;
      added: boolean;
      quantity?: number;
      unit?: string | null;
    }
  | {
      success: false;
      error: string;
    };

export async function getStandardItems(): Promise<StandardItem[]> {
  const supabase = await createClient();
  const household = await getHousehold();

  if (!household) return [];

  const { data, error } = await supabase
    .from("standard_items")
    .select("*")
    .eq("household_id", household.id)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("Could not load standard items:", error.message);
    return [];
  }

  return data ?? [];
}

export async function addStandardItemToShoppingList(
  itemId: string,
): Promise<AddStandardItemResult> {
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

  const { data: item, error: itemError } = await supabase
    .from("standard_items")
    .select("*")
    .eq("id", itemId)
    .eq("household_id", household.id)
    .single();

  if (itemError || !item) {
    return { success: false, error: "Produkt wurde nicht gefunden." };
  }

  const validCategory = SHOPPING_CATEGORIES.some(
    (category) => category.value === item.category,
  );

  if (!validCategory || (item.unit && !isValidUnit(item.unit))) {
    return {
      success: false,
      error: "Die Produktdaten sind ungültig.",
    };
  }

  // Aktuellen Vorrat ermitteln
  const pantryQuery = supabase
    .from("pantry_items")
    .select("quantity")
    .eq("household_id", household.id)
    .eq("name", item.name);

  const { data: pantryItems, error: pantryError } = item.unit
    ? await pantryQuery.eq("unit", item.unit)
    : await pantryQuery.is("unit", null);

  if (pantryError) {
    console.error("Could not load pantry quantity:", pantryError.message);
    return { success: false, error: "Vorrat konnte nicht geladen werden." };
  }

  const currentStock = (pantryItems ?? []).reduce(
    (total, pantryItem) => total + Number(pantryItem.quantity ?? 0),
    0,
  );

  // Bereits vorhandene offene Einkaufsposten berücksichtigen
  const shoppingQuery = supabase
    .from("shopping_items")
    .select("id, quantity")
    .eq("household_id", household.id)
    .eq("name", item.name)
    .eq("is_completed", false);

  const { data: existingItems, error: shoppingError } = item.unit
    ? await shoppingQuery.eq("unit", item.unit)
    : await shoppingQuery.is("unit", null);

  if (shoppingError) {
    console.error("Could not load shopping items:", shoppingError.message);
    return {
      success: false,
      error: "Einkaufsliste konnte nicht geladen werden.",
    };
  }

  const alreadyOrdered = (existingItems ?? []).reduce(
    (total, shoppingItem) => total + Number(shoppingItem.quantity ?? 0),
    0,
  );

  const missingQuantity =
    Number(item.min_quantity) - currentStock - alreadyOrdered;

  if (missingQuantity <= 0) {
    return { success: true, added: false };
  }

  // Vorhandenen Einkaufsposten ergänzen
  const existingItem = existingItems?.[0];

  if (existingItem) {
    const newQuantity = Number(existingItem.quantity ?? 0) + missingQuantity;

    const { error } = await supabase
      .from("shopping_items")
      .update({ quantity: newQuantity })
      .eq("id", existingItem.id)
      .eq("household_id", household.id);

    if (error) {
      console.error("Could not update shopping item:", error.message);
      return {
        success: false,
        error: "Menge konnte nicht aktualisiert werden.",
      };
    }
  } else {
    // Neuen Einkaufsposten erstellen
    const { error } = await supabase.from("shopping_items").insert({
      household_id: household.id,
      name: item.name,
      quantity: missingQuantity,
      unit: item.unit,
      category: item.category,
      created_by: user.id,
    });

    if (error) {
      console.error("Could not add shopping item:", error.message);
      return {
        success: false,
        error: "Produkt konnte nicht hinzugefügt werden.",
      };
    }
  }

  revalidatePath("/");
  revalidatePath("/shopping");
  revalidatePath("/pantry");
  revalidatePath("/staples");

  return {
    success: true,
    added: true,
    quantity: missingQuantity,
    unit: item.unit,
  };
}

type CreateStandardItemResult =
  | { success: true }
  | { success: false; error: string };

export async function createStandardItem(
  formData: FormData,
): Promise<CreateStandardItemResult> {
  const name = String(formData.get("name") ?? "").trim();
  const rawImageUrl = String(formData.get("image_url") ?? "").trim();
  const imageUrl = rawImageUrl || null;
  const category = String(formData.get("category") ?? "sonstiges");
  const rawUnit = String(formData.get("unit") ?? "").trim();
  const unit = rawUnit || null;
  const minQuantity = Number(formData.get("min_quantity"));

  if (!name || name.length > 100) {
    return {
      success: false,
      error: "Der Name muss zwischen 1 und 100 Zeichen lang sein.",
    };
  }

  if (!Number.isFinite(minQuantity) || minQuantity <= 0) {
    return {
      success: false,
      error: "Bitte gib einen gültigen Mindestbestand ein.",
    };
  }

  if (imageUrl) {
    try {
      const url = new URL(imageUrl);

      if (!["http:", "https:"].includes(url.protocol)) {
        throw new Error("Invalid protocol");
      }
    } catch {
      return {
        success: false,
        error: "Bitte gib eine gültige Bild-URL ein.",
      };
    }
  }

  const validCategory = SHOPPING_CATEGORIES.some(
    (item) => item.value === category,
  );

  if (!validCategory) {
    return { success: false, error: "Ungültige Kategorie." };
  }

  if (unit && !isValidUnit(unit)) {
    return { success: false, error: "Ungültige Einheit." };
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

  const { error } = await supabase.from("standard_items").insert({
    household_id: household.id,
    name,
    image_url: imageUrl,
    category,
    unit,
    min_quantity: minQuantity,
  });

  if (error) {
    console.error("Could not create standard item:", error.message);

    if (error.code === "23505") {
      return {
        success: false,
        error: "Dieses Standardprodukt existiert bereits.",
      };
    }

    return {
      success: false,
      error: "Produkt konnte nicht erstellt werden.",
    };
  }

  revalidatePath("/staples");

  return { success: true };
}
