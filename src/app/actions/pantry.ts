"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getHousehold } from "@/lib/supabase/household";
import { SHOPPING_CATEGORIES } from "@/lib/shopping/categories";
import { isValidUnit } from "@/lib/units";

type PantryResult = {
  success: boolean;
  error?: string;
};

function isValidCategory(category: string) {
  return SHOPPING_CATEGORIES.some((item) => item.value === category);
}

export async function addPantryItem(formData: FormData): Promise<PantryResult> {
  const name = String(formData.get("name") ?? "").trim();
  const quantity = Number(formData.get("quantity") ?? 1);
  const unit = String(formData.get("unit") ?? "").trim() || null;
  const category = String(formData.get("category") ?? "sonstiges");
  const minQuantity = Number(formData.get("min_quantity") ?? 1);

  if (!name || name.length > 100) {
    return { success: false, error: "Ungültiger Artikelname." };
  }

  if (!Number.isFinite(quantity) || quantity < 0) {
    return { success: false, error: "Ungültige Menge." };
  }

  if (unit && !isValidUnit(unit)) {
    return { success: false, error: "Ungültige Einheit." };
  }

  if (!Number.isFinite(minQuantity) || minQuantity < 0) {
    return { success: false, error: "Ungültiger Mindestbestand." };
  }

  if (!isValidCategory(category)) {
    return { success: false, error: "Ungültige Kategorie." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Nicht angemeldet." };
  }

  const household = await getHousehold();

  if (!household) {
    return { success: false, error: "Kein Haushalt gefunden." };
  }

  const { error } = await supabase.from("pantry_items").insert({
    household_id: household.id,
    name,
    quantity,
    unit,
    category,
    min_quantity: minQuantity,
  });

  if (error) {
    console.error("Pantry insert error:", error);
    return {
      success: false,
      error: "Artikel konnte nicht gespeichert werden.",
    };
  }

  revalidatePath("/pantry");
  revalidatePath("/");

  return { success: true };
}

export async function updatePantryQuantity(
  itemId: string,
  quantity: number,
): Promise<PantryResult> {
  if (!Number.isFinite(quantity) || quantity < 0) {
    return { success: false, error: "Ungültige Menge." };
  }

  const supabase = await createClient();
  const household = await getHousehold();

  if (!household) {
    return { success: false, error: "Kein Haushalt gefunden." };
  }

  const { data, error } = await supabase
    .from("pantry_items")
    .update({ quantity })
    .eq("id", itemId)
    .eq("household_id", household.id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { success: false, error: "Menge konnte nicht aktualisiert werden." };
  }

  revalidatePath("/pantry");
  revalidatePath("/");

  return { success: true };
}

export async function deletePantryItem(itemId: string): Promise<PantryResult> {
  const supabase = await createClient();
  const household = await getHousehold();

  if (!household) {
    return { success: false, error: "Kein Haushalt gefunden." };
  }

  const { data, error } = await supabase
    .from("pantry_items")
    .delete()
    .eq("id", itemId)
    .eq("household_id", household.id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { success: false, error: "Artikel konnte nicht gelöscht werden." };
  }

  revalidatePath("/pantry");
  revalidatePath("/");

  return { success: true };
}
