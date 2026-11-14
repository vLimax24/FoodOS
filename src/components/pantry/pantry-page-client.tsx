"use client";

import Link from "next/link";
import { ArrowLeft, Archive, AlertTriangle, PackageX } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { SHOPPING_CATEGORIES } from "@/lib/shopping/categories";
import { AddPantryItemDialog } from "@/components/pantry/add-pantry-item-dialog";
import { PantryItemRow } from "@/components/pantry/pantry-item-row";

type PantryItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string | null;
  category: string;
  min_quantity: number;
  created_at: string;
};

type PantryPageClientProps = {
  householdName: string;
  items: PantryItem[];
};

export function PantryPageClient({
  householdName,
  items,
}: PantryPageClientProps) {
  const lowItems = items.filter(
    (item) => item.quantity > 0 && item.quantity <= item.min_quantity,
  );

  const emptyItems = items.filter((item) => item.quantity === 0);

  const groupedItems = SHOPPING_CATEGORIES.map((category) => ({
    ...category,
    items: items.filter((item) => item.category === category.value),
  })).filter((category) => category.items.length > 0);

  return (
    <main className="min-h-screen bg-[#f7f8f6]">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
        <Link
          href="/"
          className="-ml-3 mb-5 inline-flex h-9 items-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zur Übersicht
        </Link>

        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-sm font-medium text-green-700">
              {householdName}
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-[#202820]">
              Eure Vorräte
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Behalte den Überblick über eure Lebensmittel.
            </p>
          </div>

          <AddPantryItemDialog />
        </div>

        <div className="mb-8 grid grid-cols-3 gap-3">
          <Card className="border-[#e8ece5] bg-white shadow-none">
            <CardContent className="p-4">
              <Archive className="mb-3 h-5 w-5 text-green-700" />
              <p className="text-2xl font-bold text-[#202820]">
                {items.length}
              </p>
              <p className="text-xs text-muted-foreground">Lebensmittel</p>
            </CardContent>
          </Card>

          <Card className="border-[#e8ece5] bg-white shadow-none">
            <CardContent className="p-4">
              <AlertTriangle className="mb-3 h-5 w-5 text-amber-600" />
              <p className="text-2xl font-bold text-[#202820]">
                {lowItems.length}
              </p>
              <p className="text-xs text-muted-foreground">Wenig Bestand</p>
            </CardContent>
          </Card>

          <Card className="border-[#e8ece5] bg-white shadow-none">
            <CardContent className="p-4">
              <PackageX className="mb-3 h-5 w-5 text-red-600" />
              <p className="text-2xl font-bold text-[#202820]">
                {emptyItems.length}
              </p>
              <p className="text-xs text-muted-foreground">Aufgebraucht</p>
            </CardContent>
          </Card>
        </div>

        {items.length === 0 ? (
          <Card className="border-[#e8ece5] bg-white shadow-none">
            <CardContent className="flex flex-col items-center px-6 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50">
                <Archive className="h-7 w-7 text-green-700" />
              </div>

              <h2 className="font-semibold text-[#202820]">
                Euer Vorrat ist noch leer
              </h2>

              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Fügt eure ersten Lebensmittel hinzu oder erledigt einen Einkauf.
              </p>

              <Link href="/shopping" className="mt-5">
                Zur Einkaufsliste
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-7">
            {groupedItems.map((category) => (
              <section key={category.value}>
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-xl">{category.emoji}</span>

                  <h2 className="font-semibold text-[#202820]">
                    {category.label}
                  </h2>

                  <span className="text-xs text-muted-foreground">
                    {category.items.length}
                  </span>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  {category.items.map((item) => (
                    <PantryItemRow
                      key={item.id}
                      id={item.id}
                      name={item.name}
                      quantity={Number(item.quantity)}
                      unit={item.unit}
                      minQuantity={Number(item.min_quantity)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
