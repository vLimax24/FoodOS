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
import { addShoppingItem } from "@/app/actions/shopping";

export function AddShoppingItemDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("sonstiges");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) return;

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.set("name", name);
      formData.set("category", category);

      const result = await addShoppingItem(formData);

      if (!result.success) {
        toast.error(result.error ?? "Artikel konnte nicht hinzugefügt werden.");
        return;
      }

      toast.success(`${name.trim()} wurde hinzugefügt`);
      setName("");
      setCategory("sonstiges");
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
            Artikel hinzufügen
          </Button>
        }
      />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Neuer Artikel</DialogTitle>
          <DialogDescription>
            Füge einen Artikel zu eurer Einkaufsliste hinzu.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shopping-item-name">Artikelname</Label>
            <Input
              id="shopping-item-name"
              placeholder="z. B. Milch"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={100}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shopping-item-category">Kategorie</Label>
            <select
              id="shopping-item-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {SHOPPING_CATEGORIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.emoji} {item.label}
                </option>
              ))}
            </select>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !name.trim()}
          >
            {isLoading ? "Wird hinzugefügt..." : "Hinzufügen"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
