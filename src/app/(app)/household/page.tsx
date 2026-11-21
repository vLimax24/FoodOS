import { redirect } from "next/navigation";
import Link from "next/link";
import { connection } from "next/server";
import {
  ArrowLeft,
  CalendarDays,
  Crown,
  House,
  Users,
  UserRoundPlus,
} from "lucide-react";

import { HouseholdNameDialog } from "@/components/household/household-name-dialog";

import { getHousehold } from "@/lib/supabase/household";
import { createClient } from "@/lib/supabase/server";
import { CopyInviteCode } from "@/components/household/copy-invite-code";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const instant = false;

export default async function HouseholdPage() {
  await connection();

  const household = await getHousehold();

  if (!household) redirect("/onboarding");

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: members, error: membersError } = await supabase
    .from("household_members")
    .select("id, user_id, role, joined_at")
    .eq("household_id", household.id)
    .order("joined_at", { ascending: true });

  if (membersError) {
    console.error("Fehler beim Laden der Mitglieder:", membersError);
  }

  const memberUserIds = (members ?? []).map((member) => member.user_id);

  const { data: profiles, error: profilesError } = memberUserIds.length
    ? await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", memberUserIds)
    : { data: [], error: null };

  if (profilesError) {
    console.error("Fehler beim Laden der Profile:", profilesError);
  }

  const profilesByUserId = new Map(
    (profiles ?? []).map((profile) => [profile.user_id, profile]),
  );

  const memberCount = members?.length ?? 0;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#899188] transition-colors hover:text-[#39734a]"
        >
          <ArrowLeft size={16} />
          Zurück zur Übersicht
        </Link>

        <div>
          <p className="text-sm font-semibold tracking-widest text-[#638c5b]">
            FOODOS
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Dein Haushalt
          </h1>
          <p className="mt-2 text-[#81897f]">
            Alles rund um deinen gemeinsamen Haushalt an einem Ort.
          </p>
        </div>
      </div>

      {/* Household overview */}
      <Card className="gap-0 overflow-hidden border-[#e8ece5] bg-white py-0 shadow-sm">
        <div className="bg-gradient-to-br from-[#edf4e9] to-[#edf4e9] p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white text-[#638c5b] shadow-sm">
                <House size={27} />
              </div>

              <div className="min-w-0">
                <p className="text-sm text-[#638c5b]">Gemeinsamer Haushalt</p>

                <div className="flex items-center gap-2">
                  <h2 className="truncate text-2xl font-semibold tracking-tight text-[#20251f]">
                    {household.name}
                  </h2>

                  {household.role === "owner" && (
                    <HouseholdNameDialog householdName={household.name} />
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-white/80 bg-white/70 px-4 py-3">
              <Users size={20} className="text-[#638c5b]" />
              <div>
                <p className="text-xl font-semibold leading-none text-[#20251f]">
                  {memberCount}
                </p>
                <p className="mt-1 text-xs text-[#81897f]">
                  {memberCount === 1 ? "Mitglied" : "Mitglieder"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <CardContent className="space-y-6 bg-white p-6 sm:p-8">
          {/* Members */}
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold">Mitglieder</h3>
              <p className="mt-1 text-sm text-[#81897f]">
                Die Personen in deinem Haushalt.
              </p>
            </div>

            <div className="space-y-3">
              {(members ?? []).map((member) => {
                const profile = profilesByUserId.get(member.user_id);

                const isCurrentUser = member.user_id === user?.id;
                const isOwner = member.role === "owner";

                const displayName =
                  profile?.display_name?.trim() ||
                  (isCurrentUser ? "Du" : "Haushaltsmitglied");

                const initials = displayName
                  .split(/\s+/)
                  .map((part: string) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                const joinedDate = new Date(member.joined_at);

                return (
                  <div
                    key={member.id}
                    className={`flex flex-wrap items-center gap-3 rounded-2xl border p-4 transition-colors ${
                      isCurrentUser
                        ? "border-[#dce9d8] bg-[#f8fbf7]"
                        : "border-[#e8ece5] bg-white"
                    }`}
                  >
                    <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#edf4e9] font-semibold text-[#638c5b]">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={`Profilbild von ${displayName}`}
                          className="size-full object-cover"
                        />
                      ) : (
                        initials
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold text-[#20251f]">
                          {displayName}
                        </p>

                        {isCurrentUser && (
                          <span className="rounded-full bg-[#edf4e9] px-2 py-0.5 text-xs font-medium text-[#638c5b]">
                            Du
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex items-center gap-1.5 text-sm text-[#81897f]">
                        {isOwner && (
                          <Crown size={14} className="text-[#b38b43]" />
                        )}
                        <span>
                          {isOwner ? "Haushaltsbesitzer" : "Mitglied"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#92998f]">
                      <CalendarDays size={14} />
                      <span>
                        Seit{" "}
                        {joinedDate.toLocaleDateString("de-DE", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}

              {!members?.length && (
                <p className="rounded-xl border border-dashed border-[#dce4d8] p-6 text-center text-sm text-[#81897f]">
                  Es konnten keine Mitglieder gefunden werden.
                </p>
              )}
            </div>
          </div>

          <Separator className="my-8" />

          {/* Invitation */}
          <div className="rounded-2xl border border-[#dce9d8] bg-[#f8fbf7] p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#e8f1e5] text-[#638c5b]">
                <UserRoundPlus size={21} />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-[#20251f]">
                  Familie einladen
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-[#81897f]">
                  Teile deinen persönlichen Einladungscode, damit weitere
                  Personen deinem Haushalt beitreten können.
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col justify-between gap-4 rounded-xl border border-[#e8ece5] bg-white p-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-medium tracking-wide text-[#92998f]">
                  DEIN EINLADUNGSCODE
                </p>
                <p className="mt-1 break-all font-mono text-2xl font-semibold tracking-[0.18em] text-[#39734a]">
                  {household.invite_code}
                </p>
              </div>

              <CopyInviteCode inviteCode={household.invite_code} />
            </div>

            <p className="mt-3 text-xs text-[#92998f]">
              Behandle deinen Einladungscode wie einen privaten Zugang zu deinem
              Haushalt.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
