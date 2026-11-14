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

export const instant = false;

type Props = {
  searchParams: Promise<{
    error?: string;
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

  if (household) redirect("/");

  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8f6] p-6">
      <div className="w-full max-w-2xl space-y-8">
        <div className="space-y-2 text-center">
          <p className="text-sm font-semibold text-primary">FoodOS</p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Willkommen bei FoodOS!
          </h1>
          <p className="text-muted-foreground">
            Erstelle einen Haushalt oder tritt einem bestehenden bei.
          </p>
        </div>

        {error && (
          <p className="rounded-lg bg-destructive/10 p-3 text-center text-sm text-destructive">
            {errorMessages[error] ?? "Es ist ein Fehler aufgetreten."}
          </p>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          <Card className="border-[#e8ece5] bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Haushalt erstellen</CardTitle>
              <CardDescription>
                Erstelle einen neuen gemeinsamen Bereich für deine Familie.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form action={createHousehold} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name des Haushalts</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="z. B. Familie Müller"
                    minLength={2}
                    maxLength={50}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  Haushalt erstellen
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-[#e8ece5] bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Haushalt beitreten</CardTitle>
              <CardDescription>
                Du hast bereits einen Einladungscode? Dann tritt deiner Familie
                bei.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form action={joinHousehold} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="inviteCode">Einladungscode</Label>
                  <Input
                    id="inviteCode"
                    name="inviteCode"
                    placeholder="AB42F891"
                    minLength={8}
                    maxLength={8}
                    required
                    className="uppercase tracking-widest"
                  />
                </div>

                <Button type="submit" variant="outline" className="w-full">
                  Haushalt beitreten
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Angemeldet als {user.email}
        </p>
      </div>
    </main>
  );
}
