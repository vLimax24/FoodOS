"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShoppingBasket } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { AddShoppingItemDialog } from "@/components/shopping/add-shopping-item-dialog";
import { ShoppingItemRow } from "@/components/shopping/shopping-item-row";
import { SHOPPING_CATEGORIES } from "@/lib/shopping/categories";

type ShoppingItem = {
  id: string;
  name: string;
  quantity: number | string | null;
  unit: string | null;
  category: string | null;
  is_completed: boolean;
  created_at: string;
};

type ShoppingPageClientProps = {
  householdName: string;
  items: ShoppingItem[];
};

export function ShoppingPageClient({
  householdName,
  items,
}: ShoppingPageClientProps) {
  const openItems = items.filter((item) => !item.is_completed);
  const completedItems = items.filter((item) => item.is_completed);

  const groupedItems = SHOPPING_CATEGORIES.map((category) => ({
    ...category,
    items: openItems.filter((item) => item.category === category.value),
  })).filter((category) => category.items.length > 0);

  return (
    <main className="min-h-screen bg-[#f7f8f6]">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="-ml-3 mb-5 inline-flex h-9 items-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück zur Übersicht
          </Link>

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-sm font-medium text-green-700">
                {householdName}
              </p>

              <h1 className="text-3xl font-bold tracking-tight text-[#202820]">
                Einkaufsliste
              </h1>

              <p className="mt-2 text-sm text-muted-foreground">
                Alles, was ihr noch besorgen müsst.
              </p>
            </div>

            <AddShoppingItemDialog />
          </div>
        </div>

        {/* Overview */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <Card className="border-[#e8ece5] bg-white shadow-none">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-700">
                <ShoppingBasket className="h-5 w-5" />
              </div>

              <div>
                <p className="text-2xl font-bold text-[#202820]">
                  {openItems.length}
                </p>
                <p className="text-sm text-muted-foreground">
                  Noch zu erledigen
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#e8ece5] bg-white shadow-none">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>

              <div>
                <p className="text-2xl font-bold text-[#202820]">
                  {completedItems.length}
                </p>
                <p className="text-sm text-muted-foreground">
                  Bereits erledigt
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Open items */}
        <Card className="border-[#e8ece5] bg-white shadow-none">
          <CardContent className="p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-[#202820]">Offen</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Diese Artikel fehlen noch.
                </p>
              </div>

              <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
                {openItems.length}
              </span>
            </div>

            {openItems.length > 0 ? (
              <div className="space-y-6">
                {groupedItems.map((category) => (
                  <div key={category.value}>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-lg">{category.emoji}</span>

                      <h3 className="text-sm font-semibold text-[#202820]">
                        {category.label}
                      </h3>

                      <span className="text-xs text-muted-foreground">
                        {category.items.length}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {category.items.map((item) => (
                        <ShoppingItemRow
                          key={`${item.id}-${item.is_completed}`}
                          id={item.id}
                          name={item.name}
                          quantity={item.quantity}
                          unit={item.unit}
                          isCompleted={item.is_completed}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#dfe6dc] px-4 py-10 text-center">
                <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-green-600" />
                <p className="font-medium text-[#202820]">Alles erledigt!</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Eure Einkaufsliste ist momentan leer.
                </p>
              </div>
            )}

            <Separator className="my-6" />

            {/* Completed items */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-[#202820]">Erledigt</h2>

              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
                {completedItems.length}
              </span>
            </div>

            {completedItems.length > 0 ? (
              <div className="space-y-1">
                {completedItems.map((item) => (
                  <ShoppingItemRow
                    key={`${item.id}-${item.is_completed}`}
                    id={item.id}
                    name={item.name}
                    quantity={item.quantity}
                    unit={item.unit}
                    isCompleted={item.is_completed}
                  />
                ))}
              </div>
            ) : (
              <p className="py-3 text-sm text-muted-foreground">
                Noch keine Artikel erledigt.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
