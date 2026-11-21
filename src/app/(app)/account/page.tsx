import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileForm from "@/components/account/profile-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRound } from "lucide-react";
import AccountSecurity from "@/components/account/account-security";

export default async function AccountPage() {
  await connection();

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) redirect("/login");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("display_name, avatar_url")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Fehler beim Laden des Profils:", profileError);
  }

  const metadataName =
    user.user_metadata?.full_name ?? user.user_metadata?.name;

  const initialName =
    profile?.display_name ||
    (typeof metadataName === "string" ? metadataName : null) ||
    user.email?.split("@")[0] ||
    "";

  return (
    <div className="min-w-0 space-y-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <p className="text-sm font-medium text-[#638c5b]">FOODOS</p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Mein Account
          </h1>
          <p className="mt-1 text-muted-foreground">
            Verwalte deine persönlichen Informationen.
          </p>
        </div>

        <Card className="border-[#e8ece5] bg-white shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf4e9] text-[#638c5b]">
                <UserRound className="h-5 w-5" />
              </div>

              <div>
                <CardTitle>Persönliches Profil</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Deine Informationen für FoodOS
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <ProfileForm
              userId={user.id}
              initialName={initialName}
              initialAvatarUrl={profile?.avatar_url ?? null}
            />
          </CardContent>
        </Card>
        <Card className="border-[#e8ece5] bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Account-Sicherheit</CardTitle>
            <p className="text-sm text-muted-foreground">
              Verwalte deine Zugangsdaten und deine Sitzung.
            </p>
          </CardHeader>

          <CardContent>
            <AccountSecurity initialEmail={user.email ?? ""} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
