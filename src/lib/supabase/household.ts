import { createClient } from "@/lib/supabase/server";

export async function getHousehold() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: membership, error: membershipError } = await supabase
    .from("household_members")
    .select("household_id, role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipError || !membership) return null;

  const { data: household, error: householdError } = await supabase
    .from("households")
    .select("id, name, invite_code")
    .eq("id", membership.household_id)
    .single();

  if (householdError || !household) return null;

  return {
    ...household,
    role: membership.role,
  };
}
