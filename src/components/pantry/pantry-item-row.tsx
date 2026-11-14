"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { updatePantryQuantity, deletePantryItem } from "@/app/actions/pantry";

type PantryItemRowProps = {
  id: string;
  name: string;
  quantity: number;
  unit: string | null;
  minQuantity: number;
};

export function PantryItemRow({
  id,
  name,
  quantity,
  unit,
  minQuantity,
}: PantryItemRowProps) {
  const [currentQuantity, setCurrentQuantity] = useState(quantity);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const isEmpty = currentQuantity === 0;
  const isLow = currentQuantity > 0 && currentQuantity <= minQuantity;

  async function changeQuantity(amount: number) {
    const nextQuantity = Math.max(0, currentQuantity + amount);

    setIsLoading(true);

    const result = await updatePantryQuantity(id, nextQuantity);

    if (!result.success) {
      toast.error(result.error ?? "Menge konnte nicht geändert werden.");
      setIsLoading(false);
      return;
    }

    setCurrentQuantity(nextQuantity);
    router.refresh();
    setIsLoading(false);
  }

  async function handleDelete() {
    setIsLoading(true);

    const result = await deletePantryItem(id);

    if (!result.success) {
      toast.error(result.error ?? "Artikel konnte nicht gelöscht werden.");
      setIsLoading(false);
      return;
    }

    toast.success(`${name} wurde entfernt`);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#e8ece5] bg-white p-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[#202820]">{name}</p>

        <p className="mt-1 text-xs text-muted-foreground">
          {currentQuantity} {unit ?? "Stück"}
        </p>

        <p
          className={`mt-1 text-xs font-medium ${
            isEmpty
              ? "text-red-600"
              : isLow
                ? "text-amber-600"
                : "text-green-700"
          }`}
        >
          {isEmpty
            ? "Aufgebraucht"
            : isLow
              ? "Wenig Bestand"
              : "Ausreichend vorhanden"}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={isLoading || currentQuantity <= 0}
          onClick={() => changeQuantity(-1)}
          aria-label={`${name} Menge verringern`}
        >
          <Minus className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={isLoading}
          onClick={() => changeQuantity(1)}
          aria-label={`${name} Menge erhöhen`}
        >
          <Plus className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={isLoading}
          onClick={handleDelete}
          aria-label={`${name} löschen`}
          className="text-muted-foreground hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
