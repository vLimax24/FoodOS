import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getHousehold } from "@/lib/supabase/household";
import { createHousehold, joinHousehold } from "./actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { connection } from "next/server";
import { House, Users, ArrowRight, Check, PartyPopper } from "lucide-react";
import ProfileForm from "@/components/account/profile-form";
import Link from "next/link";
import { CopyInviteCode } from "@/components/household/copy-invite-code";
import { finishOnboarding } from "./actions";

export const instant = false;

type Props = {
  searchParams: Promise<{
    error?: string;
    preview?: string;
    step?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  "invalid-name": "Der Name muss zwischen 2 und 50 Zeichen lang sein.",
  "create-failed": "Der Haushalt konnte nicht erstellt werden.",
  "invalid-code": "Bitte gib einen gültigen 8-stelligen Code ein.",
  "code-not-found": "Dieser Einladungscode ist nicht gültig.",
  "join-failed": "Beitreten ist fehlgeschlagen. Bitte versuche es erneut.",
};

export default async function OnboardingPage({ searchParams }: Props) {
  await connection();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const household = await getHousehold();

  const { error, preview, step } = await searchParams;

  const isPreview = process.env.NODE_ENV === "development" && preview === "1";

  const allowedSteps = ["profile", "invite", "complete"];

  if (household && !isPreview && !allowedSteps.includes(step ?? "")) {
    redirect("/");
  }

  if (!household && (step === "invite" || step === "complete")) {
    redirect("/onboarding");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url, onboarding_completed_at")
    .eq("user_id", user.id)
    .single();

  if (profile?.onboarding_completed_at && !isPreview) {
    redirect("/");
  }

  if (!household && step) {
    redirect("/onboarding");
  }

  if (
    household &&
    (step === "invite" || step === "complete") &&
    !profile?.display_name?.trim()
  ) {
    redirect("/onboarding?step=profile");
  }

  const initialName =
    profile?.display_name ??
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split("@")[0] ??
    "";

  const initialAvatarUrl = profile?.avatar_url ?? null;

  if (step === "profile") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8f5] px-5 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-3 text-center">
            <p className="text-sm font-semibold tracking-widest text-[#638c5b]">
              FOODOS
            </p>

            <h1 className="text-3xl font-semibold tracking-tight text-[#263526]">
              Das bist du!
            </h1>

            <p className="text-muted-foreground">
              Gib deinem Profil einen Namen und lade optional ein Profilbild
              hoch.
            </p>
          </div>

          <div className="rounded-2xl border border-[#e8ece5] bg-white p-6 shadow-sm">
            <ProfileForm
              userId={user.id}
              initialName={initialName}
              initialAvatarUrl={initialAvatarUrl}
              nextStep={`/onboarding?step=invite${isPreview ? "&preview=1" : ""}`}
            />
          </div>
        </div>
      </main>
    );
  }

  if (step === "invite") {
    if (!household) redirect("/onboarding");

    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f8f5] px-5 py-12">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#638c5b]/[0.06] blur-3xl" />

        <div className="relative w-full max-w-md space-y-8">
          <div className="mx-auto flex max-w-xs items-center gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-[#638c5b]" />
            <div className="h-1.5 flex-1 rounded-full bg-[#638c5b]" />
            <div className="h-1.5 flex-1 rounded-full bg-[#638c5b]" />
            <div className="h-1.5 flex-1 rounded-full bg-[#e5e9e1]" />
          </div>

          <div className="space-y-3 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#edf4e9] text-[#638c5b]">
              <Users className="h-8 w-8" />
            </div>

            <p className="text-sm font-semibold tracking-widest text-[#638c5b]">
              FOODOS
            </p>

            <h1 className="text-3xl font-semibold tracking-tight text-[#263526]">
              Gemeinsam ist es schöner!
            </h1>

            <p className="text-muted-foreground">
              Lade deine Familie ein und organisiert euren Alltag gemeinsam.
            </p>
          </div>

          <div className="rounded-2xl border border-[#e8ece5] bg-white p-6 shadow-sm">
            <div className="space-y-2 text-center">
              <p className="text-sm text-muted-foreground">
                Euer gemeinsamer Haushalt
              </p>

              <h2 className="text-xl font-semibold text-[#263526]">
                {household.name}
              </h2>
            </div>

            <div className="my-6 rounded-xl bg-[#f7f8f5] p-5 text-center">
              <p className="mb-3 text-sm font-medium text-muted-foreground">
                Euer persönlicher Einladungscode
              </p>

              <div className="flex items-center justify-center gap-3">
                <span className="font-mono text-2xl font-bold tracking-[0.2em] text-[#334b30]">
                  {household.invite_code}
                </span>

                <CopyInviteCode inviteCode={household.invite_code} />
              </div>
            </div>

            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <Check className="h-5 w-5 shrink-0 text-[#638c5b]" />
                <p>Teile den Code mit deiner Familie.</p>
              </div>

              <div className="flex gap-3">
                <Check className="h-5 w-5 shrink-0 text-[#638c5b]" />
                <p>Deine Familienmitglieder können damit beitreten.</p>
              </div>

              <div className="flex gap-3">
                <Check className="h-5 w-5 shrink-0 text-[#638c5b]" />
                <p>Ihr könnt anschließend gemeinsam einkaufen und planen.</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              href={`/onboarding?step=complete${isPreview ? "&preview=1" : ""}`}
              className="flex h-12 w-full items-center justify-center rounded-xl bg-[#638c5b] font-medium text-white transition hover:bg-[#527a4d]"
            >
              Weiter
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>

            <Link
              href={`/onboarding?step=complete${isPreview ? "&preview=1" : ""}`}
              className="block py-2 text-center text-sm text-muted-foreground transition hover:text-foreground"
            >
              Später erledigen
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (step === "complete") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8f5] px-5 py-12">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#638c5b] text-white shadow-lg shadow-[#638c5b]/20">
            <PartyPopper className="h-10 w-10" />
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold tracking-widest text-[#638c5b]">
              FOODOS
            </p>

            <h1 className="text-3xl font-semibold tracking-tight text-[#263526]">
              Alles bereit! 🎉
            </h1>

            <p className="leading-relaxed text-muted-foreground">
              Dein Haushalt ist eingerichtet. Jetzt könnt ihr gemeinsam Rezepte
              entdecken, Einkäufe organisieren und eure Mahlzeiten planen.
            </p>
          </div>

          <div className="rounded-2xl border border-[#e8ece5] bg-white p-5 text-left shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf4e9] text-[#638c5b]">
                <Check className="h-5 w-5" />
              </div>

              <div>
                <p className="font-medium text-[#263526]">
                  {household?.name ?? "Dein Haushalt"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Dein FoodOS-Haushalt ist startklar.
                </p>
              </div>
            </div>
          </div>

          <form action={finishOnboarding}>
            <Button
              type="submit"
              className="h-12 w-full rounded-xl bg-[#638c5b] hover:bg-[#527a4d]"
            >
              Zum Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <p className="text-xs text-muted-foreground">
            Schön, dass du dabei bist. 💚
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f8f5] px-5 py-12">
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#638c5b]/[0.06] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-[#638c5b]/[0.05] blur-3xl" />

      <div className="relative w-full max-w-3xl space-y-10">
        {/* Branding */}
        <div className="space-y-5 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#638c5b] text-white shadow-lg shadow-[#638c5b]/20">
            <House className="h-7 w-7" />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold tracking-widest text-[#638c5b]">
              FOODOS
            </p>

            <h1 className="text-3xl font-semibold tracking-tight text-[#263526] sm:text-4xl">
              Willkommen bei euch!
            </h1>

            <p className="mx-auto max-w-md text-muted-foreground">
              Gemeinsam einkaufen, Rezepte entdecken und euren Küchenalltag
              organisieren. Lass uns FoodOS einrichten.
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="mx-auto flex max-w-xs items-center gap-2">
          <div className="h-1.5 flex-1 rounded-full bg-[#638c5b]" />
          <div className="h-1.5 flex-1 rounded-full bg-[#e5e9e1]" />
          <div className="h-1.5 flex-1 rounded-full bg-[#e5e9e1]" />
          <div className="h-1.5 flex-1 rounded-full bg-[#e5e9e1]" />
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
            {errorMessages[error] ?? "Es ist ein Fehler aufgetreten."}
          </div>
        )}

        {/* Household options */}
        <div className="grid gap-5 md:grid-cols-2">
          <Card className="group border-[#e8ece5] bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#638c5b]/50 hover:shadow-lg">
            <CardHeader className="space-y-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#edf4e9] text-[#638c5b] transition-colors group-hover:bg-[#638c5b] group-hover:text-white">
                <House className="h-6 w-6" />
              </div>

              <div className="space-y-2">
                <CardTitle className="text-xl">
                  Neuen Haushalt erstellen
                </CardTitle>

                <CardDescription className="leading-relaxed">
                  Starte einen gemeinsamen Bereich für deine Familie und
                  verwalte alles an einem Ort.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="px-6 pb-6">
              <form action={createHousehold} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Wie soll euer Haushalt heißen?</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="z. B. Familie Müller"
                    minLength={2}
                    maxLength={50}
                    required
                    className="h-11 rounded-xl bg-[#fafbf9]"
                  />
                </div>

                <Button
                  type="submit"
                  className="h-11 w-full rounded-xl bg-[#638c5b] hover:bg-[#527a4d]"
                >
                  Haushalt erstellen
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="group border-[#e8ece5] bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#638c5b]/50 hover:shadow-lg">
            <CardHeader className="space-y-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#edf4e9] text-[#638c5b] transition-colors group-hover:bg-[#638c5b] group-hover:text-white">
                <Users className="h-6 w-6" />
              </div>

              <div className="space-y-2">
                <CardTitle className="text-xl">Haushalt beitreten</CardTitle>

                <CardDescription className="leading-relaxed">
                  Du wurdest bereits eingeladen? Verbinde dich ganz einfach mit
                  dem Haushalt deiner Familie.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="px-6 pb-6">
              <form action={joinHousehold} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="inviteCode">Euer Einladungscode</Label>
                  <Input
                    id="inviteCode"
                    name="inviteCode"
                    placeholder="AB42F891"
                    minLength={8}
                    maxLength={8}
                    required
                    className="h-11 rounded-xl bg-[#fafbf9] font-mono uppercase tracking-widest"
                  />
                </div>

                <Button
                  type="submit"
                  variant="outline"
                  className="h-11 w-full rounded-xl border-[#dce5d7] hover:bg-[#edf4e9] hover:text-[#527a4d]"
                >
                  Haushalt beitreten
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="space-y-2 text-center">
          <p className="text-sm text-muted-foreground">
            Angemeldet als{" "}
            <span className="font-medium text-foreground">{user.email}</span>
          </p>

          <p className="text-xs text-muted-foreground">
            Ein kleiner Schritt zu einem besser organisierten Alltag.
          </p>
        </div>
      </div>
    </main>
  );
}
