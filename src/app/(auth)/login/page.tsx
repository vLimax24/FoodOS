import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { login } from "../actions";

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
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">Willkommen zurück!</CardTitle>
          <CardDescription>Melde dich an, um FoodOS zu nutzen.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <p className="text-sm text-destructive">
              {error === "missing-fields"
                ? "Bitte fülle alle Felder aus."
                : "E-Mail oder Passwort sind nicht korrekt."}
            </p>
          )}

          {message === "confirm-email" && (
            <p className="text-sm text-green-700">
              Bitte bestätige zuerst deine E-Mail-Adresse.
            </p>
          )}

          <form action={login} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Dein Passwort"
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Anmelden
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Noch kein Konto?{" "}
            <Link
              href="/register"
              className="font-medium text-primary hover:underline"
            >
              Registrieren
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
