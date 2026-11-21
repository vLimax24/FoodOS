"use client";

import { useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { ImagePlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { createStandardItem } from "@/app/(app)/staples/actions";
import { SHOPPING_CATEGORIES } from "@/lib/shopping/categories";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UNITS } from "@/lib/units";

export function CreateStandardItemDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("sonstiges");
  const [unit, setUnit] = useState("");
  const [minQuantity, setMinQuantity] = useState("1");

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function resetForm() {
    setName("");
    setCategory("sonstiges");
    setUnit("");
    setMinQuantity("1");
    removeImage();
  }

  function handleSubmit() {
    if (!name.trim()) {
      toast.error("Bitte gib einen Produktnamen ein.");
      return;
    }

    const quantity = Number(minQuantity);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      toast.error("Bitte gib einen gültigen Mindestbestand ein.");
      return;
    }

    startTransition(async () => {
      const supabase = createClient();

      let uploadedFilePath: string | null = null;
      let uploadedImageUrl = "";

      if (selectedImage) {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          toast.error("Du bist nicht angemeldet.");
          return;
        }

        const extension = selectedImage.type.split("/")[1];
        const filePath = `${user.id}/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("standard-item-images")
          .upload(filePath, selectedImage, {
            contentType: selectedImage.type,
            upsert: false,
          });

        if (uploadError) {
          toast.error("Bild konnte nicht hochgeladen werden.");
          return;
        }

        uploadedFilePath = filePath;

        const { data } = supabase.storage
          .from("standard-item-images")
          .getPublicUrl(filePath);

        uploadedImageUrl = data.publicUrl;
      }

      const formData = new FormData();

      formData.set("name", name);
      formData.set("image_url", uploadedImageUrl);
      formData.set("category", category);
      formData.set("unit", unit);
      formData.set("min_quantity", String(quantity));

      const result = await createStandardItem(formData);

      if (!result.success) {
        if (uploadedFilePath) {
          await supabase.storage
            .from("standard-item-images")
            .remove([uploadedFilePath]);
        }

        toast.error(result.error);
        return;
      }

      toast.success("Standardprodukt hinzugefügt.");
      resetForm();
      setOpen(false);
      router.refresh();
    });
  }

  function handleImageChange(file: File | undefined) {
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Bitte wähle ein JPG-, PNG- oder WebP-Bild.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Das Bild darf maximal 2 MB groß sein.");
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function removeImage() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setSelectedImage(null);
    setPreviewUrl(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isPending) setOpen(nextOpen);
      }}
    >
      <DialogTrigger className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#638c5b] px-4 text-sm font-medium text-white transition-colors hover:bg-[#52794c]">
        <Plus size={17} />
        Produkt hinzufügen
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Standardprodukt hinzufügen</DialogTitle>
          <DialogDescription>
            Füge ein Lebensmittel zu eurer persönlichen Standardliste hinzu.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label htmlFor="standard-name" className="text-sm font-medium">
              Produktname
            </label>
            <Input
              id="standard-name"
              placeholder="z. B. Milch"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={100}
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Produktbild</label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(event) => handleImageChange(event.target.files?.[0])}
              disabled={isPending}
            />

            {previewUrl ? (
              <div className="relative overflow-hidden rounded-xl border border-[#e8ece5]">
                <img
                  src={previewUrl}
                  alt="Produktvorschau"
                  className="h-40 w-full object-cover"
                />

                <button
                  type="button"
                  onClick={removeImage}
                  disabled={isPending}
                  className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-sm hover:bg-white"
                  aria-label="Bild entfernen"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isPending}
                className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#dce5d8] bg-[#f8faf7] text-[#638c5b] transition-colors hover:bg-[#edf4e9]"
              >
                <ImagePlus size={25} />
                <span className="text-sm font-medium">Bild auswählen</span>
                <span className="text-xs text-muted-foreground">
                  JPG, PNG oder WebP · max. 2 MB
                </span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label
                htmlFor="standard-category"
                className="text-sm font-medium"
              >
                Kategorie
              </label>
              <select
                id="standard-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                disabled={isPending}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {SHOPPING_CATEGORIES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="standard-unit" className="text-sm font-medium">
                Einheit
              </label>

              <select
                id="standard-unit"
                value={unit}
                onChange={(event) => setUnit(event.target.value)}
                disabled={isPending}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Keine Einheit</option>

                {UNITS.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="standard-quantity" className="text-sm font-medium">
              Mindestbestand
            </label>
            <Input
              id="standard-quantity"
              type="number"
              min="0.01"
              step="any"
              value={minQuantity}
              onChange={(event) => setMinQuantity(event.target.value)}
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">
              So viel sollte mindestens im Vorrat vorhanden sein.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Abbrechen
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={isPending || !name.trim()}
            className="bg-[#638c5b] text-white hover:bg-[#52794c]"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Speichern...
              </>
            ) : (
              "Produkt speichern"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
