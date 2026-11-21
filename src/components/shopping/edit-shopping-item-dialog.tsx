"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, ShoppingBasket } from "lucide-react";
import { toast } from "sonner";

import { updateShoppingItem } from "@/app/actions/shopping";
import { SHOPPING_CATEGORIES } from "@/lib/shopping/categories";
import { UNITS } from "@/lib/units";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type EditShoppingItemDialogProps = {
  id: string;
  name: string;
  quantity: number | string | null;
  unit: string | null;
  category: string;
};

export function EditShoppingItemDialog({
  id,
  name,
  quantity,
  unit,
  category,
}: EditShoppingItemDialogProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [editedName, setEditedName] = useState(name);
  const [editedQuantity, setEditedQuantity] = useState(
    quantity == null ? "" : String(quantity),
  );
  const [editedUnit, setEditedUnit] = useState(unit ?? "");
  const [editedCategory, setEditedCategory] = useState(category);
  const [isPending, startTransition] = useTransition();

  function resetForm() {
    setEditedName(name);
    setEditedQuantity(quantity == null ? "" : String(quantity));
    setEditedUnit(unit ?? "");
    setEditedCategory(category);
  }

  function handleSubmit() {
    const trimmedName = editedName.trim();

    if (!trimmedName) {
      toast.error("Bitte gib einen Artikelnamen ein.");
      return;
    }

    if (
      editedQuantity &&
      (!Number.isFinite(Number(editedQuantity)) || Number(editedQuantity) <= 0)
    ) {
      toast.error("Bitte gib eine gültige Menge ein.");
      return;
    }

    if (editedUnit && !editedQuantity) {
      toast.error("Bitte gib auch eine Menge für die Einheit an.");
      return;
    }

    const formData = new FormData();
    formData.set("name", trimmedName);
    formData.set("quantity", editedQuantity);
    formData.set("unit", editedUnit);
    formData.set("category", editedCategory);

    startTransition(async () => {
      const result = await updateShoppingItem(id, formData);

      if (!result.success) {
        toast.error(result.error ?? "Artikel konnte nicht gespeichert werden.");
        return;
      }

      toast.success("Artikel aktualisiert");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (isPending) return;

        setOpen(nextOpen);

        if (!nextOpen) {
          resetForm();
        }
      }}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label={`${name} bearbeiten`}
        className="h-10 w-10 shrink-0 rounded-xl text-[#a0a99c] transition-colors hover:bg-[#edf3e9] hover:text-[#52764b] sm:opacity-0 sm:group-hover:opacity-100"
      >
        <Pencil className="h-4 w-4" />
      </Button>

      <DialogContent className="rounded-2xl border-[#e8ede4] bg-[#fbfcfa] p-6 sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf3e9] text-[#638c5b]">
            <ShoppingBasket className="h-5 w-5" />
          </div>

          <DialogTitle className="text-xl font-semibold text-[#303c2e]">
            Artikel bearbeiten
          </DialogTitle>

          <DialogDescription className="text-[#929b8e]">
            Passe die Angaben deines Einkaufsartikels an.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor={`edit-name-${id}`} className="text-[#465342]">
              Artikelname
            </Label>
            <Input
              id={`edit-name-${id}`}
              value={editedName}
              onChange={(event) => setEditedName(event.target.value)}
              maxLength={100}
              disabled={isPending}
              className="h-11 rounded-xl border-[#dfe7da] bg-white focus-visible:ring-[#638c5b]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor={`edit-quantity-${id}`} className="text-[#465342]">
                Menge
              </Label>
              <Input
                id={`edit-quantity-${id}`}
                type="number"
                min="0"
                step="any"
                placeholder="z. B. 2"
                value={editedQuantity}
                onChange={(event) => setEditedQuantity(event.target.value)}
                disabled={isPending}
                className="h-11 rounded-xl border-[#dfe7da] bg-white focus-visible:ring-[#638c5b]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`edit-unit-${id}`} className="text-[#465342]">
                Einheit
              </Label>
              <select
                id={`edit-unit-${id}`}
                value={editedUnit}
                onChange={(event) => setEditedUnit(event.target.value)}
                disabled={isPending}
                className="h-11 w-full rounded-xl border border-[#dfe7da] bg-white px-3 text-sm text-[#303c2e] outline-none focus:ring-2 focus:ring-[#638c5b]"
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
            <Label htmlFor={`edit-category-${id}`} className="text-[#465342]">
              Kategorie
            </Label>
            <select
              id={`edit-category-${id}`}
              value={editedCategory}
              onChange={(event) => setEditedCategory(event.target.value)}
              disabled={isPending}
              className="h-11 w-full rounded-xl border border-[#dfe7da] bg-white px-3 text-sm text-[#303c2e] outline-none focus:ring-2 focus:ring-[#638c5b]"
            >
              {SHOPPING_CATEGORIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.emoji} {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="h-11 flex-1 rounded-xl border-[#dfe7da] text-[#52604d]"
            >
              Abbrechen
            </Button>

            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              className="h-11 flex-1 rounded-xl bg-[#638c5b] text-white hover:bg-[#52764b]"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Speichern...
                </>
              ) : (
                "Änderungen speichern"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
