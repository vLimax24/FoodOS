"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function createHousehold(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();

  if (name.length < 2 || name.length > 50) {
    redirect("/onboarding?error=invalid-name");
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { error } = await supabase.rpc("create_household", {
    household_name: name,
  });

  if (error) {
    console.error("Create household failed:", error.message);
    redirect("/onboarding?error=create-failed");
  }

  redirect("/");
}

export async function joinHousehold(formData: FormData) {
  const inviteCode = String(formData.get("inviteCode") ?? "")
    .trim()
    .toUpperCase();

  if (!/^[A-Z0-9]{8}$/.test(inviteCode)) {
    redirect("/onboarding?error=invalid-code");
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { error } = await supabase.rpc("join_household", {
    p_invite_code: inviteCode,
  });

  if (error) {
    console.error("Join household failed:", error.message);

    if (error.message.includes("Invalid invitation code")) {
      redirect("/onboarding?error=code-not-found");
    }

    redirect("/onboarding?error=join-failed");
  }

  redirect("/");
}
