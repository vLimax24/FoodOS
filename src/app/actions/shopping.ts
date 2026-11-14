"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getHousehold } from "@/lib/supabase/household";
import { SHOPPING_CATEGORIES } from "@/lib/shopping/categories";

type AddShoppingItemResult = {
  success: boolean;
  error?: string;
};

export async function addShoppingItem(
  formData: FormData,
): Promise<AddShoppingItemResult> {
  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    return { success: false, error: "Bitte gib einen Artikelnamen ein." };
  }

  if (name.length > 100) {
    return { success: false, error: "Der Name ist zu lang." };
  }

  const category = String(formData.get("category") ?? "sonstiges");

  const validCategory = SHOPPING_CATEGORIES.some(
    (item) => item.value === category,
  );

  if (!validCategory) {
    return {
      success: false,
      error: "Ungültige Kategorie.",
    };
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

  const { error } = await supabase.from("shopping_items").insert({
    household_id: household.id,
    name: name.trim(),
    category,
    created_by: user.id,
  });

  if (error) {
    console.error("Shopping item could not be added:", error.message);
    return {
      success: false,
      error: "Artikel konnte nicht hinzugefügt werden.",
    };
  }

  revalidatePath("/");
  revalidatePath("/shopping");

  return { success: true };
}

export async function toggleShoppingItem(
  itemId: string,
  isCompleted: boolean,
): Promise<AddShoppingItemResult> {
  const supabase = await createClient();
  const household = await getHousehold();

  if (!household) {
    return { success: false, error: "Kein Haushalt gefunden." };
  }

  if (isCompleted) {
    const { error } = await supabase.rpc("complete_shopping_item", {
      p_item_id: itemId,
    });

    if (error) {
      console.error("Shopping completion error:", error);
      return {
        success: false,
        error: "Artikel konnte nicht in den Vorrat übernommen werden.",
      };
    }
  } else {
    const { error } = await supabase
      .from("shopping_items")
      .update({ is_completed: false })
      .eq("id", itemId)
      .eq("household_id", household.id);

    if (error) {
      return {
        success: false,
        error: "Artikel konnte nicht aktualisiert werden.",
      };
    }
  }

  revalidatePath("/");
  revalidatePath("/shopping");
  revalidatePath("/pantry");

  return { success: true };
}

export async function deleteShoppingItem(
  itemId: string,
): Promise<AddShoppingItemResult> {
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
    .from("shopping_items")
    .delete()
    .eq("id", itemId)
    .eq("household_id", household.id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Shopping item could not be deleted:", error.message);
    return { success: false, error: "Artikel konnte nicht gelöscht werden." };
  }

  if (!data) {
    return { success: false, error: "Artikel wurde nicht gefunden." };
  }

  revalidatePath("/");
  revalidatePath("/shopping");

  return { success: true };
}
