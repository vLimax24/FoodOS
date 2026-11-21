import { connection } from "next/server";
import { ShoppingBasket } from "lucide-react";

import { getStandardItems } from "./actions";
import { StandardItemsGrid } from "@/components/staples/standard-items-grid";
import { CreateStandardItemDialog } from "@/components/staples/create-standard-item-dialog";

export default async function StaplesPage() {
  await connection();

  const items = await getStandardItems();

  return (
    <main className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-[#eaf1e6] text-[#638c5b]">
            <ShoppingBasket size={24} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#20251f]">
              Standardprodukte
            </h1>
            <p className="text-sm text-muted-foreground">
              Deine wichtigsten Lebensmittel auf einen Blick.
            </p>
          </div>
        </div>

        <CreateStandardItemDialog />
      </div>

      <StandardItemsGrid items={items} />
    </main>
  );
}
