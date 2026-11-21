"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getHousehold } from "@/lib/supabase/household";

type UpdateHouseholdNameResult =
  | { success: true; name: string }
  | { success: false; error: string };

export async function updateHouseholdName(
  formData: FormData,
): Promise<UpdateHouseholdNameResult> {
  const name = String(formData.get("name") ?? "").trim();

  if (name.length < 2 || name.length > 50) {
    return {
      success: false,
      error: "Der Name muss zwischen 2 und 50 Zeichen lang sein.",
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "Du musst angemeldet sein.",
    };
  }

  const household = await getHousehold();

  if (!household) {
    return {
      success: false,
      error: "Es wurde kein Haushalt gefunden.",
    };
  }

  if (household.role !== "owner") {
    return {
      success: false,
      error: "Nur der Haushaltsbesitzer darf den Namen ändern.",
    };
  }

  const { data, error } = await supabase
    .from("households")
    .update({ name })
    .eq("id", household.id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    console.error("Fehler beim Aktualisieren des Haushaltsnamens:", error);

    return {
      success: false,
      error: "Der Haushaltsname konnte nicht geändert werden.",
    };
  }

  revalidatePath("/", "layout");

  return {
    success: true,
    name,
  };
}
