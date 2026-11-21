"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Mail, LockKeyhole, LogOut, Loader2 } from "lucide-react";

type AccountSecurityProps = {
  initialEmail: string;
};

type LoadingAction = "email" | "password" | "logout" | null;

export default function AccountSecurity({
  initialEmail,
}: AccountSecurityProps) {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingAction, setLoadingAction] = useState<LoadingAction>(null);

  const supabase = createClient();
  const router = useRouter();

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      toast.error("Bitte gib eine gültige E-Mail-Adresse ein.");
      return;
    }

    if (trimmedEmail === initialEmail) {
      toast.error("Das ist bereits deine aktuelle E-Mail-Adresse.");
      return;
    }

    setLoadingAction("email");

    try {
      const { error } = await supabase.auth.updateUser({
        email: trimmedEmail,
      });

      if (error) throw error;

      toast.success(
        "Änderungsanfrage gesendet. Bitte bestätige deine neue E-Mail-Adresse.",
      );
    } catch (error) {
      console.error("Fehler beim Ändern der E-Mail:", error);
      toast.error("Die E-Mail-Adresse konnte nicht geändert werden.");
    } finally {
      setLoadingAction(null);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password.length < 8) {
      toast.error("Dein Passwort muss mindestens 8 Zeichen lang sein.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Die Passwörter stimmen nicht überein.");
      return;
    }

    setLoadingAction("password");

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      setPassword("");
      setConfirmPassword("");
      toast.success("Dein Passwort wurde erfolgreich geändert.");
    } catch (error) {
      console.error("Fehler beim Ändern des Passworts:", error);
      toast.error("Das Passwort konnte nicht geändert werden.");
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleLogout() {
    setLoadingAction("logout");

    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Fehler beim Abmelden:", error);
      toast.error("Du konntest nicht abgemeldet werden.");
      setLoadingAction(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Email */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf4e9] text-[#638c5b]">
            <Mail className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-medium">E-Mail-Adresse</h2>
            <p className="text-sm text-muted-foreground">
              Ändere die E-Mail-Adresse deines Accounts.
            </p>
          </div>
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            maxLength={254}
            autoComplete="email"
            placeholder="name@example.com"
            className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-[#638c5b]"
          />

          <Button
            type="submit"
            variant="outline"
            disabled={loadingAction !== null}
            className="w-full"
          >
            {loadingAction === "email" && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            E-Mail-Adresse ändern
          </Button>
        </form>
      </section>

      <div className="border-t border-[#e8ece5]" />

      {/* Password */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf4e9] text-[#638c5b]">
            <LockKeyhole className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-medium">Passwort ändern</h2>
            <p className="text-sm text-muted-foreground">
              Lege ein neues Passwort für deinen Account fest.
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-3">
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Neues Passwort"
            className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-[#638c5b]"
          />

          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Neues Passwort bestätigen"
            className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-[#638c5b]"
          />

          <Button
            type="submit"
            variant="outline"
            disabled={loadingAction !== null}
            className="w-full"
          >
            {loadingAction === "password" && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Passwort ändern
          </Button>
        </form>
      </section>

      <div className="border-t border-[#e8ece5]" />

      {/* Logout */}
      <section className="space-y-3">
        <div>
          <h2 className="font-medium">Abmelden</h2>
          <p className="text-sm text-muted-foreground">
            Melde dich von deinem FoodOS-Account ab.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleLogout}
          disabled={loadingAction !== null}
          className="w-full text-destructive hover:text-destructive"
        >
          {loadingAction === "logout" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          Abmelden
        </Button>
      </section>
    </div>
  );
}
