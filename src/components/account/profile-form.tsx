"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Camera, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

type ProfileFormProps = {
  userId: string;
  initialName: string;
  initialAvatarUrl: string | null;
  nextStep?: string;
};

export default function ProfileForm({
  userId,
  initialName,
  initialAvatarUrl,
  nextStep,
}: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(initialName);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const router = useRouter();

  const supabase = createClient();

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Bitte wähle ein JPG-, PNG- oder WebP-Bild.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Das Bild darf maximal 2 MB groß sein.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);

    setPreviewUrl(objectUrl);
    setAvatarFile(file);
  }

  async function handleSave() {
    const trimmedName = displayName.trim();

    if (!trimmedName) {
      toast.error("Bitte gib einen Namen ein.");
      return;
    }

    setIsSaving(true);

    try {
      let newAvatarUrl = avatarUrl;

      if (avatarFile) {
        const extension = {
          "image/jpeg": "jpg",
          "image/png": "png",
          "image/webp": "webp",
        }[avatarFile.type];

        if (!extension) {
          toast.error("Ungültiges Bildformat.");
          return;
        }

        const filePath = `${userId}/avatar.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, avatarFile, {
            upsert: true,
            contentType: avatarFile.type,
            cacheControl: "3600",
          });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);

        newAvatarUrl = `${data.publicUrl}?t=${Date.now()}`;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          display_name: trimmedName,
          avatar_url: newAvatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (updateError) throw updateError;

      setAvatarUrl(newAvatarUrl);
      setAvatarFile(null);
      setPreviewUrl(null);
      router.refresh();
      toast.success("Profil erfolgreich gespeichert!");

      if (nextStep) {
        router.push(nextStep);
        router.refresh();
      }
    } catch (error) {
      console.error("Fehler beim Speichern des Profils:", error);
      toast.error("Dein Profil konnte nicht gespeichert werden.");
    } finally {
      setIsSaving(false);
    }
  }

  const currentAvatar = previewUrl ?? avatarUrl;
  const initials = displayName.trim().slice(0, 2).toUpperCase() || "?";

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-[#edf4e9] text-3xl font-semibold text-[#638c5b]">
          {currentAvatar ? (
            <img
              src={currentAvatar}
              alt="Profilbild"
              className="h-full w-full object-cover"
            />
          ) : (
            initials
          )}
        </div>

        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted">
          <Camera className="h-4 w-4" />
          Profilbild ändern
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </label>

        <p className="text-xs text-muted-foreground">
          JPG, PNG oder WebP · maximal 2 MB
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="display-name" className="text-sm font-medium">
          Anzeigename
        </label>

        <input
          id="display-name"
          type="text"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          maxLength={50}
          placeholder="Dein Name"
          className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-[#638c5b]"
        />
      </div>

      <Button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="w-full bg-[#638c5b] hover:bg-[#52764b]"
      >
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Wird gespeichert...
          </>
        ) : nextStep ? (
          "Weiter"
        ) : (
          "Änderungen speichern"
        )}
      </Button>
    </div>
  );
}
