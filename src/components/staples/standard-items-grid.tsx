"use client";

import { useTransition } from "react";
import { ImageOff, Plus, Loader2, ShoppingBasket } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  addStandardItemToShoppingList,
  type StandardItem,
} from "@/app/(app)/staples/actions";

type StandardItemsGridProps = {
  items: StandardItem[];
};

export function StandardItemsGrid({ items }: StandardItemsGridProps) {
  const [isPending, startTransition] = useTransition();

  function handleAdd(item: StandardItem) {
    startTransition(async () => {
      const result = await addStandardItemToShoppingList(item.id);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      if (!result.added) {
        toast.info(`${item.name} ist bereits ausreichend vorhanden.`);
        return;
      }

      const quantity = new Intl.NumberFormat("de-DE", {
        maximumFractionDigits: 2,
      }).format(result.quantity ?? 0);

      toast.success(
        `${item.name}: ${quantity} ${result.unit ?? ""} hinzugefügt.`,
      );
    });
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#dce5d8] bg-[#f8faf7] px-6 py-16 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#eaf1e6] text-[#638c5b]">
          <ShoppingBasket size={26} />
        </div>

        <h3 className="font-semibold text-[#20251f]">
          Noch keine Standardprodukte
        </h3>

        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Hier erscheinen deine wichtigsten Lebensmittel, damit du sie jederzeit
          schnell auf die Einkaufsliste setzen kannst.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((item) => (
        <div
          key={item.id}
          className="group overflow-hidden rounded-2xl border border-[#e8ece5] bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="aspect-[5/4] overflow-hidden bg-[#f5f7f3]">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.name}
                className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-[#9aaa93]">
                <ImageOff size={30} strokeWidth={1.5} />
              </div>
            )}
          </div>

          <div className="space-y-3 p-3">
            <div>
              <h3 className="truncate font-semibold text-[#20251f]">
                {item.name}
              </h3>

              <p className="mt-0.5 text-xs text-muted-foreground">
                Mindestbestand: {item.min_quantity} {item.unit ?? ""}
              </p>
            </div>

            <Button
              onClick={() => handleAdd(item)}
              disabled={isPending}
              className="h-9 w-full rounded-xl bg-[#638c5b] text-sm text-white hover:bg-[#52794c]"
            >
              {isPending ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              Hinzufügen
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
