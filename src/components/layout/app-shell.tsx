import { getHousehold } from "@/lib/supabase/household";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { AppNavigation } from "@/components/layout/app-navigation";

export default async function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const household = await getHousehold();

  if (!household) redirect("/onboarding");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url, onboarding_completed_at")
    .eq("user_id", user.id)
    .single();

  if (!profile?.onboarding_completed_at) {
    redirect("/onboarding?step=profile");
  }

  const userName =
    profile.display_name?.trim() || user.email?.split("@")[0] || "FoodOS";

  return (
    <div className="min-h-dvh bg-[#f7f8f6] text-[#20251f]">
      <AppNavigation
        householdName={household.name}
        userName={userName}
        avatarUrl={profile?.avatar_url ?? null}
      />

      <main className="min-w-0 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:ml-64 md:pb-8">
        <div className="w-full min-w-0 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 xl:px-10">
          {children}
        </div>
      </main>
    </div>
  );
}
