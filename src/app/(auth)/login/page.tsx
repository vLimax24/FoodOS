import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { login } from "../actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, UtensilsCrossed } from "lucide-react";
import AuthLayout from "@/components/auth/auth-layout";

type Props = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export const instant = false;

export default async function LoginPage({ searchParams }: Props) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  const { error, message } = await searchParams;

  return (
    <AuthLayout>
      <div className="mb-8 space-y-3">
        <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf4e9] text-[#638c5b]">
          <UtensilsCrossed className="h-6 w-6" />
        </div>

        <p className="text-sm font-medium text-[#638c5b]">
          SCHÖN, DASS DU WIEDER DA BIST
        </p>

        <h2 className="text-3xl font-semibold tracking-tight text-[#263526]">
          Willkommen zurück!
        </h2>

        <p className="text-muted-foreground">
          Melde dich an und mach dort weiter, wo du aufgehört hast.
        </p>
      </div>

      <div className="space-y-5">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error === "missing-fields"
              ? "Bitte fülle alle Felder aus."
              : "E-Mail oder Passwort sind nicht korrekt."}
          </div>
        )}

        {message === "confirm-email" && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            Bitte bestätige zuerst deine E-Mail-Adresse.
          </div>
        )}

        <form action={login} className="space-y-5">
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Passwort</Label>
            </div>

            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Dein Passwort"
              autoComplete="current-password"
              required
              className="h-12 rounded-xl bg-white"
            />
          </div>

          <Button
            type="submit"
            className="h-12 w-full rounded-xl bg-[#638c5b] text-base font-medium hover:bg-[#527a4d]"
          >
            Anmelden
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#e8ece5]" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[#f7f8f5] px-3 text-xs text-muted-foreground">
              NEU BEI FOODOS?
            </span>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Noch kein Konto?{" "}
          <Link
            href="/register"
            className="font-semibold text-[#638c5b] hover:text-[#527a4d] hover:underline"
          >
            Jetzt registrieren
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
