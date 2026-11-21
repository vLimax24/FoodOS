import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { register } from "../actions";

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
import AuthLayout from "@/components/auth/auth-layout";
import { UtensilsCrossed, ArrowRight } from "lucide-react";

export const instant = false;

type Props = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function RegisterPage({ searchParams }: Props) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  const { error } = await searchParams;

  return (
    <AuthLayout>
      <div className="mb-8 space-y-3">
        <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf4e9] text-[#638c5b]">
          <UtensilsCrossed className="h-6 w-6" />
        </div>

        <p className="text-sm font-medium text-[#638c5b]">
          DEIN START MIT FOODOS
        </p>

        <h2 className="text-3xl font-semibold tracking-tight text-[#263526]">
          Schön, dass du da bist!
        </h2>

        <p className="text-muted-foreground">
          Erstelle dein Konto und organisiere euren Küchenalltag gemeinsam.
        </p>
      </div>

      <div className="space-y-5">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error === "weak-password"
              ? "Dein Passwort muss mindestens 8 Zeichen lang sein."
              : error === "missing-fields"
                ? "Bitte fülle alle Felder aus."
                : "Die Registrierung ist fehlgeschlagen."}
          </div>
        )}

        <form action={register} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail-Adresse</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              required
              className="h-12 rounded-xl bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Passwort</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Mindestens 8 Zeichen"
              minLength={8}
              autoComplete="new-password"
              required
              className="h-12 rounded-xl bg-white"
            />
            <p className="text-xs text-muted-foreground">
              Verwende mindestens 8 Zeichen.
            </p>
          </div>

          <Button
            type="submit"
            className="h-12 w-full rounded-xl bg-[#638c5b] text-base font-medium hover:bg-[#527a4d]"
          >
            Konto erstellen
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#e8ece5]" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[#f7f8f5] px-3 text-xs text-muted-foreground">
              SCHON EIN KONTO?
            </span>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Bereits registriert?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#638c5b] hover:text-[#527a4d] hover:underline"
          >
            Jetzt anmelden
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
