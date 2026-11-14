import Link from "next/link";
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

export const instant = false;

type Props = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function RegisterPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">FoodOS beitreten</CardTitle>
          <CardDescription>Erstelle dein persönliches Konto.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <p className="text-sm text-destructive">
              {error === "weak-password"
                ? "Dein Passwort muss mindestens 8 Zeichen lang sein."
                : error === "missing-fields"
                  ? "Bitte fülle alle Felder aus."
                  : "Die Registrierung ist fehlgeschlagen."}
            </p>
          )}

          <form action={register} className="space-y-4">
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
                placeholder="Mindestens 8 Zeichen"
                minLength={8}
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Konto erstellen
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Bereits registriert?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Anmelden
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
