"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  ShoppingBasket,
  ShoppingCart,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
  const [isShoppingMode, setIsShoppingMode] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const openItems = items.filter((item) => !item.is_completed);
  const completedItems = items.filter((item) => item.is_completed);

  const progress =
    items.length > 0
      ? Math.round((completedItems.length / items.length) * 100)
      : 0;

  const groupedItems = SHOPPING_CATEGORIES.map((category) => ({
    ...category,
    items: openItems.filter((item) => item.category === category.value),
  })).filter((category) => category.items.length > 0);

  const uncategorizedItems = openItems.filter(
    (item) =>
      !SHOPPING_CATEGORIES.some((category) => category.value === item.category),
  );

  return (
    <main className="min-h-screen bg-[#f6f8f4]">
      <div className="mx-auto max-w-3xl px-4 pb-12 pt-6 sm:px-6 sm:pt-10">
        {/* Navigation */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#788275] transition-colors hover:text-[#638c5b]"
        >
          <ArrowLeft className="h-4 w-4" />
          Übersicht
        </Link>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="mb-2 text-sm font-semibold text-[#638c5b]">
                {householdName}
              </p>

              <h1 className="text-3xl font-bold tracking-tight text-[#202820] sm:text-4xl">
                Einkaufsliste
              </h1>

              <p className="mt-2 text-sm text-[#818a7e]">
                Alles, was ihr für Zuhause braucht.
              </p>
            </div>

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e6eee2] text-[#638c5b] sm:h-14 sm:w-14">
              <ShoppingBasket className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            {isShoppingMode ? (
              <Button
                variant="outline"
                onClick={() => setIsShoppingMode(false)}
                className="h-11 gap-2 rounded-xl border-[#dce5d7] bg-white px-5 text-[#52664d] hover:bg-[#edf3e9]"
              >
                <X className="h-4 w-4" />
                Einkauf beenden
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => setIsShoppingMode(true)}
                  disabled={openItems.length === 0}
                  className="h-11 gap-2 rounded-xl bg-[#638c5b] px-5 text-white shadow-sm hover:bg-[#52764b]"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Einkauf starten
                </Button>

                <AddShoppingItemDialog />
              </>
            )}
          </div>
        </header>

        {/* Overview */}
        {!isShoppingMode && (
          <section className="mb-8 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-[#e8ede4] bg-white p-4 sm:p-5">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#eaf1e6] text-[#638c5b]">
                <ShoppingBasket className="h-4 w-4" />
              </div>

              <p className="text-3xl font-bold tracking-tight text-[#202820]">
                {openItems.length}
              </p>
              <p className="mt-1 text-xs font-medium text-[#818a7e] sm:text-sm">
                Noch zu kaufen
              </p>
            </div>

            <div className="rounded-2xl border border-[#e8ede4] bg-white p-4 sm:p-5">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#f0f2ee] text-[#71806b]">
                <CheckCircle2 className="h-4 w-4" />
              </div>

              <p className="text-3xl font-bold tracking-tight text-[#202820]">
                {completedItems.length}
              </p>
              <p className="mt-1 text-xs font-medium text-[#818a7e] sm:text-sm">
                Bereits erledigt
              </p>
            </div>
          </section>
        )}

        {/* Shopping progress */}
        {isShoppingMode && (
          <section className="mb-8 rounded-2xl border border-[#dce8d6] bg-[#edf3e9] p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-[#30442d]">Dein Einkauf</p>
                <p className="mt-1 text-sm text-[#70816a]">
                  {completedItems.length} von {items.length} erledigt
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-[#638c5b] bg-white text-sm font-bold text-[#52764b]">
                {progress}%
              </div>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-[#d9e5d3]">
              <div
                className="h-full rounded-full bg-[#638c5b] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </section>
        )}

        {/* Open items */}
        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-[#202820]">
                {isShoppingMode ? "Noch einzukaufen" : "Deine Produkte"}
              </h2>
              <p className="mt-1 text-sm text-[#818a7e]">
                {openItems.length === 1
                  ? "1 Produkt wartet auf dich"
                  : `${openItems.length} Produkte warten auf dich`}
              </p>
            </div>

            <span className="rounded-full bg-[#e6eee2] px-3 py-1 text-sm font-semibold text-[#52764b]">
              {openItems.length}
            </span>
          </div>

          {openItems.length > 0 ? (
            <div className="space-y-4">
              {groupedItems.map((category) => (
                <div
                  key={category.value}
                  className="overflow-hidden rounded-2xl border border-[#e8ede4] bg-white"
                >
                  <div className="flex items-center justify-between border-b border-[#f0f2ed] px-4 py-3.5 sm:px-5">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f2f5ef] text-lg">
                        {category.emoji}
                      </span>

                      <h3 className="text-sm font-semibold text-[#303c2e]">
                        {category.label}
                      </h3>
                    </div>

                    <span className="text-xs font-medium text-[#929b8e]">
                      {category.items.length} Artikel
                    </span>
                  </div>

                  <div className="divide-y divide-[#f1f3ef] px-2 sm:px-3">
                    {category.items.map((item) => (
                      <ShoppingItemRow
                        key={`${item.id}-${item.is_completed}`}
                        id={item.id}
                        name={item.name}
                        quantity={item.quantity}
                        unit={item.unit}
                        category={item.category}
                        isCompleted={item.is_completed}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {uncategorizedItems.length > 0 && (
                <div className="overflow-hidden rounded-2xl border border-[#e8ede4] bg-white">
                  <div className="flex items-center justify-between border-b border-[#f0f2ed] px-4 py-3.5 sm:px-5">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f2f5ef] text-lg">
                        🛒
                      </span>
                      <h3 className="text-sm font-semibold text-[#303c2e]">
                        Sonstiges
                      </h3>
                    </div>
                    <span className="text-xs font-medium text-[#929b8e]">
                      {uncategorizedItems.length} Artikel
                    </span>
                  </div>

                  <div className="divide-y divide-[#f1f3ef] px-2 sm:px-3">
                    {uncategorizedItems.map((item) => (
                      <ShoppingItemRow
                        key={`${item.id}-${item.is_completed}`}
                        id={item.id}
                        name={item.name}
                        quantity={item.quantity}
                        unit={item.unit}
                        category={item.category}
                        isCompleted={item.is_completed}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#dce5d7] bg-white px-5 py-12 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eaf1e6] text-[#638c5b]">
                <Check className="h-7 w-7" />
              </div>

              <h3 className="font-semibold text-[#303c2e]">Alles erledigt!</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm text-[#818a7e]">
                Ihr habt alle Produkte besorgt. Zeit, den Einkauf zu genießen!
              </p>
            </div>
          )}
        </section>

        {/* Completed items */}
        {completedItems.length > 0 && (
          <section className="mt-8">
            <button
              type="button"
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex w-full items-center justify-between rounded-2xl border border-[#e8ede4] bg-white px-4 py-4 text-left transition-colors hover:bg-[#fbfcfa] sm:px-5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eaf1e6] text-[#638c5b]">
                  <CheckCircle2 className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#303c2e]">
                    Erledigte Produkte
                  </p>
                  <p className="mt-0.5 text-xs text-[#929b8e]">
                    {completedItems.length} Produkte
                  </p>
                </div>
              </div>

              <ChevronDown
                className={`h-5 w-5 text-[#929b8e] transition-transform ${
                  showCompleted ? "rotate-180" : ""
                }`}
              />
            </button>

            {showCompleted && (
              <div className="mt-2 overflow-hidden rounded-2xl border border-[#e8ede4] bg-white px-2 sm:px-3">
                <div className="divide-y divide-[#f1f3ef]">
                  {completedItems.map((item) => (
                    <ShoppingItemRow
                      key={`${item.id}-${item.is_completed}`}
                      id={item.id}
                      name={item.name}
                      quantity={item.quantity}
                      unit={item.unit}
                      category={item.category}
                      isCompleted={item.is_completed}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Shopping mode finish */}
        {isShoppingMode && openItems.length === 0 && (
          <div className="mt-6">
            <Button
              onClick={() => setIsShoppingMode(false)}
              className="h-12 w-full rounded-xl bg-[#638c5b] font-semibold text-white hover:bg-[#52764b]"
            >
              Einkauf abschließen
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
