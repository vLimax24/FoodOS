"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

import { toggleShoppingItem, deleteShoppingItem } from "@/app/actions/shopping";

type ShoppingItemRowProps = {
  id: string;
  name: string;
  quantity: number | string | null;
  unit: string | null;
  isCompleted: boolean;
};

export function ShoppingItemRow({
  id,
  name,
  quantity,
  unit,
  isCompleted: initialIsCompleted,
}: ShoppingItemRowProps) {
  const [isCompleted, setIsCompleted] = useState(initialIsCompleted);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  async function handleToggle(checked: boolean | "indeterminate") {
    const nextValue = checked === true;

    setIsCompleted(nextValue);
    setIsLoading(true);

    const result = await toggleShoppingItem(id, nextValue);

    if (!result.success) {
      setIsCompleted(!nextValue);
      toast.error(result.error ?? "Artikel konnte nicht aktualisiert werden.");
      setIsLoading(false);
      return;
    }

    router.refresh();
    setIsLoading(false);
  }

  async function handleDelete() {
    setIsLoading(true);

    const result = await deleteShoppingItem(id);

    if (!result.success) {
      toast.error(result.error ?? "Artikel konnte nicht gelöscht werden.");
      setIsLoading(false);
      return;
    }

    toast.success("Artikel gelöscht");
    router.refresh();
  }

  return (
    <div className="group flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-[#f7f8f6]">
      <Checkbox
        checked={isCompleted}
        onCheckedChange={handleToggle}
        disabled={isLoading}
        aria-label={`${name} ${isCompleted ? "als offen markieren" : "als erledigt markieren"}`}
      />

      <div className="min-w-0 flex-1">
        <p
          className={
            isCompleted
              ? "truncate text-sm text-muted-foreground line-through"
              : "truncate text-sm font-medium text-[#202820]"
          }
        >
          {name}
        </p>

        {quantity != null && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {quantity} {unit ?? ""}
          </p>
        )}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        disabled={isLoading}
        aria-label={`${name} löschen`}
        className="text-muted-foreground opacity-100 transition-opacity hover:text-red-600 sm:opacity-0 sm:group-hover:opacity-100"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
