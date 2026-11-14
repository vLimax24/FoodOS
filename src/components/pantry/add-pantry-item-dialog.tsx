"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { SHOPPING_CATEGORIES } from "@/lib/shopping/categories";
import { addPantryItem } from "@/app/actions/pantry";

export function AddPantryItemDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("");
  const [category, setCategory] = useState("sonstiges");
  const [minQuantity, setMinQuantity] = useState("1");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) return;

    setIsLoading(true);

    try {
      const formData = new FormData();

      formData.set("name", name);
      formData.set("quantity", quantity);
      formData.set("unit", unit);
      formData.set("category", category);
      formData.set("min_quantity", minQuantity);

      const result = await addPantryItem(formData);

      if (!result.success) {
        toast.error(result.error ?? "Vorrat konnte nicht hinzugefügt werden.");
        return;
      }

      toast.success(`${name.trim()} wurde hinzugefügt`);

      setName("");
      setQuantity("1");
      setUnit("");
      setCategory("sonstiges");
      setMinQuantity("1");
      setOpen(false);

      router.refresh();
    } catch {
      toast.error("Es ist ein unerwarteter Fehler aufgetreten.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Vorrat hinzufügen
          </Button>
        }
      />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Neuer Vorrat</DialogTitle>
          <DialogDescription>
            Füge ein Lebensmittel zu eurem Vorrat hinzu.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pantry-name">Lebensmittel</Label>
            <Input
              id="pantry-name"
              placeholder="z. B. Milch"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={100}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="pantry-quantity">Menge</Label>
              <Input
                id="pantry-quantity"
                type="number"
                min="0"
                step="0.1"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pantry-unit">Einheit</Label>
              <Input
                id="pantry-unit"
                placeholder="z. B. Packungen"
                value={unit}
                onChange={(event) => setUnit(event.target.value)}
                maxLength={30}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pantry-category">Kategorie</Label>
            <select
              id="pantry-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {SHOPPING_CATEGORIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.emoji} {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pantry-min">Mindestbestand</Label>
            <Input
              id="pantry-min"
              type="number"
              min="0"
              step="0.1"
              value={minQuantity}
              onChange={(event) => setMinQuantity(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Bei diesem Bestand wird das Lebensmittel als knapp markiert.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={
              isLoading || !name.trim() || quantity === "" || minQuantity === ""
            }
          >
            {isLoading ? "Wird gespeichert..." : "Vorrat hinzufügen"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
