"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getHousehold } from "@/lib/supabase/household";

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

  redirect("/onboarding?step=profile");
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

  redirect("/onboarding?step=profile");
}

export async function finishOnboarding() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const household = await getHousehold();

  if (!household) {
    redirect("/onboarding");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile?.display_name?.trim()) {
    redirect("/onboarding?step=profile");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (error) {
    console.error("Finish onboarding failed:", error.message);
    redirect("/onboarding?step=complete&error=finish-failed");
  }

  redirect("/");
}
