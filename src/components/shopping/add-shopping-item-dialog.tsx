"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, ShoppingBasket, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { addShoppingItem } from "@/app/actions/shopping";
import { UNITS } from "@/lib/units";
import { SHOPPING_CATEGORIES } from "@/lib/shopping/categories";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function AddShoppingItemDialog() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [category, setCategory] = useState("");
  const [isPending, startTransition] = useTransition();

  function resetForm() {
    setName("");
    setQuantity("");
    setUnit("");
    setCategory("");
  }

  function handleSubmit() {
    const trimmedName = name.trim();

    if (!trimmedName) {
      toast.error("Bitte gib einen Artikelnamen ein.");
      return;
    }

    if (!category) {
      toast.error("Bitte wähle eine Kategorie aus.");
      return;
    }

    if (
      quantity &&
      (!Number.isFinite(Number(quantity)) || Number(quantity) <= 0)
    ) {
      toast.error("Bitte gib eine gültige Menge ein.");
      return;
    }

    if (unit && !quantity) {
      toast.error("Bitte gib auch eine Menge an.");
      return;
    }

    const formData = new FormData();

    formData.set("name", trimmedName);
    formData.set("category", category);

    if (quantity) {
      formData.set("quantity", quantity);
    }

    if (unit) {
      formData.set("unit", unit);
    }

    startTransition(async () => {
      const result = await addShoppingItem(formData);

      if (!result.success) {
        toast.error(result.error ?? "Artikel konnte nicht hinzugefügt werden.");
        return;
      }

      toast.success("Artikel wurde hinzugefügt.");

      resetForm();
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
      <DialogTrigger
        render={
          <Button className="h-11 gap-2 rounded-xl bg-white px-4 text-[#52764b] shadow-none border border-[#dce5d7] hover:bg-[#edf3e9]">
            <Plus className="h-4 w-4" />
            Artikel hinzufügen
          </Button>
        }
      />

      <DialogContent className="gap-6 rounded-2xl border-[#e8ede4] bg-[#fbfcfa] p-6 sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-[#eaf1e6] text-[#638c5b]">
            <ShoppingBasket className="h-5 w-5" />
          </div>

          <DialogTitle className="text-xl font-bold tracking-tight text-[#202820]">
            Artikel hinzufügen
          </DialogTitle>

          <DialogDescription className="text-[#818a7e]">
            Was fehlt euch noch für den nächsten Einkauf?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <Label
              htmlFor="shopping-item-name"
              className="text-sm font-semibold text-[#303c2e]"
            >
              Produktname
            </Label>

            <Input
              id="shopping-item-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="z. B. Milch"
              maxLength={100}
              autoFocus
              disabled={isPending}
              className="h-11 rounded-xl border-[#dce5d7] bg-white focus-visible:ring-[#638c5b]"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label
              htmlFor="shopping-item-category"
              className="text-sm font-semibold text-[#303c2e]"
            >
              Kategorie
            </Label>

            <select
              id="shopping-item-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              disabled={isPending}
              className="flex h-11 w-full rounded-xl border border-[#dce5d7] bg-white px-3 text-sm text-[#303c2e] outline-none transition-colors focus:border-[#638c5b] focus:ring-2 focus:ring-[#638c5b]/20 disabled:opacity-50"
            >
              <option value="" disabled>
                Kategorie auswählen
              </option>

              {SHOPPING_CATEGORIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.emoji} {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity and unit */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label
                htmlFor="shopping-item-quantity"
                className="text-sm font-semibold text-[#303c2e]"
              >
                Menge
                <span className="ml-1 font-normal text-[#929b8e]">
                  (optional)
                </span>
              </Label>

              <Input
                id="shopping-item-quantity"
                type="number"
                min="0.01"
                step="any"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                placeholder="z. B. 2"
                disabled={isPending}
                className="h-11 rounded-xl border-[#dce5d7] bg-white focus-visible:ring-[#638c5b]"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="shopping-item-unit"
                className="text-sm font-semibold text-[#303c2e]"
              >
                Einheit
                <span className="ml-1 font-normal text-[#929b8e]">
                  (optional)
                </span>
              </Label>

              <select
                id="shopping-item-unit"
                value={unit}
                onChange={(event) => setUnit(event.target.value)}
                disabled={isPending}
                className="flex h-11 w-full rounded-xl border border-[#dce5d7] bg-white px-3 text-sm text-[#303c2e] outline-none transition-colors focus:border-[#638c5b] focus:ring-2 focus:ring-[#638c5b]/20 disabled:opacity-50"
              >
                <option value="">Keine</option>

                {UNITS.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.options.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={isPending || !name.trim() || !category}
            className="h-12 w-full rounded-xl bg-[#638c5b] font-semibold text-white shadow-sm transition-colors hover:bg-[#52764b]"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wird hinzugefügt...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Artikel hinzufügen
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
