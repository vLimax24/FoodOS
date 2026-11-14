import { redirect } from "next/navigation";
import { getHousehold } from "@/lib/supabase/household";
import { CopyInviteCode } from "@/components/household/copy-invite-code";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Users, House, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const instant = false;

export default async function HouseholdPage() {
  const household = await getHousehold();

  if (!household) {
    redirect("/onboarding");
  }

  return (
    <div className="min-w-0 space-y-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-[#638c5b]">FOODOS</p>
            <h1 className="text-3xl font-semibold tracking-tight">
              Haushalt verwalten
            </h1>
            <p className="mt-1 text-muted-foreground">
              Verwalte deinen Haushalt und lade weitere Mitglieder ein.
            </p>
          </div>
        </div>

        <Card className="border-[#e8ece5] bg-white shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf4e9] text-[#638c5b]">
                <House className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>{household.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Dein gemeinsamer Haushalt
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <Separator />

            <div className="space-y-3">
              <div>
                <h2 className="font-medium">Einladungscode</h2>
                <p className="text-sm text-muted-foreground">
                  Teile diesen Code mit deiner Familie, damit sie deinem
                  Haushalt beitreten kann.
                </p>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-[#e8ece5] bg-[#f7f8f6] p-4">
                <span className="font-mono text-2xl font-semibold tracking-[0.2em]">
                  {household.invite_code}
                </span>
                <CopyInviteCode inviteCode={household.invite_code} />
              </div>
            </div>

            <Separator />

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf4e9] text-[#638c5b]">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-medium">Mitglieder</h2>
                <p className="text-sm text-muted-foreground">
                  Die Mitgliederverwaltung bauen wir als Nächstes aus.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
