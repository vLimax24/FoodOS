"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { EditShoppingItemDialog } from "@/components/shopping/edit-shopping-item-dialog";

import { toggleShoppingItem, deleteShoppingItem } from "@/app/actions/shopping";

type ShoppingItemRowProps = {
  id: string;
  name: string;
  quantity: number | string | null;
  unit: string | null;
  category: string | null;
  isCompleted: boolean;
};

export function ShoppingItemRow({
  id,
  name,
  quantity,
  unit,
  category,
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
    <div
      className={`group flex min-h-[68px] items-center gap-3 rounded-xl px-2 py-3 transition-colors sm:px-3 ${
        isCompleted ? "opacity-60" : "hover:bg-[#f7f9f5]"
      }`}
    >
      <Checkbox
        checked={isCompleted}
        onCheckedChange={handleToggle}
        disabled={isLoading}
        aria-label={`${name} ${isCompleted ? "als offen markieren" : "als erledigt markieren"}`}
        className="h-6 w-6 shrink-0 rounded-full border-[#cbd7c5] data-[state=checked]:border-[#638c5b] data-[state=checked]:bg-[#638c5b]"
      />

      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-[15px] font-medium transition-all ${
            isCompleted ? "text-[#929b8e] line-through" : "text-[#303c2e]"
          }`}
        >
          {name}
        </p>

        {quantity != null && (
          <p className="mt-1 text-xs font-medium text-[#929b8e]">
            {quantity} {unit ?? ""}
          </p>
        )}
      </div>

      {!isCompleted && (
        <EditShoppingItemDialog
          id={id}
          name={name}
          quantity={quantity}
          unit={unit}
          category={category ?? "sonstiges"}
        />
      )}

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        disabled={isLoading}
        aria-label={`${name} löschen`}
        className="h-10 w-10 shrink-0 rounded-xl text-[#a0a99c] transition-colors hover:bg-red-50 hover:text-red-600 sm:opacity-0 sm:group-hover:opacity-100"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
