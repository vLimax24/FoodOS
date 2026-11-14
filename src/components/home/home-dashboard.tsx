"use client";

import {
  Archive,
  CalendarDays,
  ChefHat,
  ChevronRight,
  Clock3,
  Plus,
  ShoppingBasket,
  Utensils,
} from "lucide-react";
import Link from "next/link";
import { AddShoppingItemDialog } from "@/components/shopping/add-shopping-item-dialog";
import { ShoppingItemRow } from "@/components/shopping/shopping-item-row";

type ShoppingItem = {
  id: string;
  name: string;
  quantity: number | string | null;
  unit: string | null;
  is_completed: boolean;
};

type PantryItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string | null;
  min_quantity: number | null;
  category: string | null;
};

type LatestRecipe = {
  id: string;
  title: string;
  image_url: string | null;
  category: string | null;
  servings: number;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  difficulty: string | null;
  created_at: string;
};

type HomeDashboardProps = {
  householdName: string;
  userName: string;
  shoppingItemCount: number;
  shoppingItems: ShoppingItem[];
  pantryItemCount: number;
  lowStockCount: number;
  pantryItems: PantryItem[];
  recipeCount: number;
  latestRecipe: LatestRecipe | null;
};

function getPantryStatus(item: PantryItem) {
  if (item.quantity <= 0) {
    return {
      label: "Leer",
      className: "bg-[#fceceb] text-[#b75b50]",
    };
  }

  if (item.min_quantity !== null && item.quantity <= item.min_quantity) {
    return {
      label: "Wenig",
      className: "bg-[#fbf1df] text-[#a47b36]",
    };
  }

  return {
    label: "Vorhanden",
    className: "bg-[#edf4ed] text-[#56815c]",
  };
}

function formatDifficulty(difficulty: string | null) {
  switch (difficulty) {
    case "einfach":
      return "Einfach";
    case "mittel":
      return "Mittel";
    case "anspruchsvoll":
      return "Anspruchsvoll";
    default:
      return null;
  }
}

export default function HomeDashboard({
  householdName,
  userName,
  shoppingItemCount,
  shoppingItems,
  pantryItemCount,
  lowStockCount,
  pantryItems,
  recipeCount,
  latestRecipe,
}: HomeDashboardProps) {
  const firstName = userName.split(" ")[0];

  const totalRecipeTime = latestRecipe
    ? (latestRecipe.prep_time_minutes ?? 0) +
      (latestRecipe.cook_time_minutes ?? 0)
    : 0;

  return (
    <div className="min-w-0 space-y-8">
      {/* Greeting */}
      <section>
        <p className="mb-2 text-sm font-medium tracking-wide text-[#7d8979]">
          FOODOS · ÜBERSICHT
        </p>

        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Hallo, {firstName}!
        </h1>

        <p className="mt-2 text-sm text-[#81897f] sm:text-base">
          Was steht heute bei euch an?
        </p>
      </section>

      {/* Latest recipe */}
      <section className="overflow-hidden rounded-2xl border border-[#e8ece5] bg-white md:flex">
        {latestRecipe ? (
          <>
            <div
              className="min-h-48 flex-1 bg-[#edf2eb] bg-cover bg-center sm:min-h-64 md:min-h-72"
              style={
                latestRecipe.image_url
                  ? { backgroundImage: `url("${latestRecipe.image_url}")` }
                  : undefined
              }
            >
              {!latestRecipe.image_url && (
                <div className="flex h-full min-h-48 items-center justify-center sm:min-h-64 md:min-h-72">
                  <ChefHat
                    size={64}
                    strokeWidth={1}
                    className="text-[#9aaf96]"
                  />
                </div>
              )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col justify-center p-5 sm:p-7 md:p-9">
              <p className="text-xs font-semibold tracking-[0.13em] text-[#739276]">
                EUER KOCHBUCH
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                {latestRecipe.title}
              </h2>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-[#858d82]">
                {totalRecipeTime > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Clock3 size={15} />
                    {totalRecipeTime} Min.
                  </span>
                )}

                {formatDifficulty(latestRecipe.difficulty) && (
                  <span>{formatDifficulty(latestRecipe.difficulty)}</span>
                )}

                <span>{latestRecipe.servings} Portionen</span>
              </div>

              {latestRecipe.category && (
                <p className="mt-3 text-xs text-[#92998f]">
                  {latestRecipe.category}
                </p>
              )}

              <Link
                href={`/recipes/${latestRecipe.id}`}
                className="mt-6 flex w-fit items-center gap-2 rounded-xl bg-[#edf4ed] px-4 py-2.5 text-sm font-semibold text-[#39734a] transition-colors hover:bg-[#e1ede1]"
              >
                Rezept ansehen
                <ChevronRight size={16} />
              </Link>
            </div>
          </>
        ) : (
          <div className="flex min-h-64 flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#edf4ed] text-[#56815c]">
              <ChefHat size={28} />
            </div>

            <h2 className="text-xl font-semibold">Euer Kochbuch wartet!</h2>

            <p className="mt-2 max-w-sm text-sm text-[#81897f]">
              Speichert euer erstes Rezept und habt eure Lieblingsgerichte immer
              griffbereit.
            </p>

            <Link
              href="/recipes/new"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#56815c] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#456e4b]"
            >
              <Plus size={16} />
              Rezept erstellen
            </Link>
          </div>
        )}
      </section>

      {/* Statistics */}
      <section className="grid min-w-0 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#e8ece5] bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-[#81897f]">Einkaufsliste</p>
            <ShoppingBasket size={19} className="text-[#56815c]" />
          </div>

          <p className="mt-3 text-3xl font-semibold tabular-nums">
            {shoppingItemCount}
          </p>

          <p className="mt-1 text-xs text-[#92998f]">Offene Lebensmittel</p>
        </div>

        <div className="rounded-2xl border border-[#e8ece5] bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-[#81897f]">Vorräte</p>
            <Archive size={19} className="text-[#b68a3c]" />
          </div>

          <p className="mt-3 text-3xl font-semibold tabular-nums">
            {pantryItemCount}
          </p>

          <p className="mt-1 text-xs text-[#92998f]">
            {lowStockCount > 0
              ? `${lowStockCount} bald nachkaufen`
              : "Alles im Blick"}
          </p>
        </div>

        <div className="rounded-2xl border border-[#e8ece5] bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-[#81897f]">Rezepte</p>
            <ChefHat size={19} className="text-[#56815c]" />
          </div>

          <p className="mt-3 text-3xl font-semibold tabular-nums">
            {recipeCount}
          </p>

          <p className="mt-1 text-xs text-[#92998f]">In eurem Kochbuch</p>
        </div>
      </section>

      {/* Shopping and pantry */}
      <div className="grid min-w-0 gap-5 lg:grid-cols-2">
        {/* Shopping list */}
        <section className="min-w-0 rounded-2xl border border-[#e8ece5] bg-white p-4 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#edf4ed] text-[#56815c]">
                <ShoppingBasket size={20} />
              </div>

              <div className="min-w-0">
                <h3 className="font-semibold">Einkaufsliste</h3>
                <p className="text-xs text-[#92998f]">
                  Euer gemeinsamer Einkauf
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <AddShoppingItemDialog />

              <Link
                href="/shopping"
                className="text-sm font-medium text-[#56815c] hover:underline"
              >
                Öffnen
              </Link>
            </div>
          </div>

          <p className="mb-4 text-2xl font-semibold">
            {shoppingItemCount} Lebensmittel
          </p>

          <div className="space-y-3 text-sm text-[#697166]">
            {shoppingItems.length > 0 ? (
              shoppingItems.map((item) => (
                <ShoppingItemRow
                  key={`${item.id}-${item.is_completed}`}
                  id={item.id}
                  name={item.name}
                  quantity={item.quantity}
                  unit={item.unit}
                  isCompleted={item.is_completed}
                />
              ))
            ) : (
              <div className="rounded-xl bg-[#f7f9f6] px-4 py-5 text-center">
                <ShoppingBasket
                  size={24}
                  className="mx-auto mb-2 text-[#a5b3a1]"
                />

                <p className="text-sm font-medium text-[#697166]">
                  Eure Einkaufsliste ist noch leer
                </p>

                <p className="mt-1 text-xs text-[#92998f]">
                  Fügt euren ersten Artikel hinzu!
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Pantry preview */}
        <section className="min-w-0 rounded-2xl border border-[#e8ece5] bg-white p-4 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#fbf1df] text-[#b68a3c]">
                <Archive size={20} />
              </div>

              <div>
                <h3 className="font-semibold">Vorräte</h3>
                <p className="text-xs text-[#92998f]">
                  {lowStockCount > 0
                    ? `${lowStockCount} Artikel mit niedrigem Bestand`
                    : "Euer Vorrat im Überblick"}
                </p>
              </div>
            </div>

            {lowStockCount > 0 && (
              <span className="rounded-full bg-[#fbf1df] px-3 py-1 text-xs font-medium text-[#a47b36]">
                Nachkaufen
              </span>
            )}
          </div>

          {pantryItems.length > 0 ? (
            <div className="space-y-4">
              {pantryItems.map((item) => {
                const status = getPantryStatus(item);

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {item.name}
                      </p>

                      <p className="text-xs text-[#92998f]">
                        {item.quantity} {item.unit ?? ""}
                        {item.category ? ` · ${item.category}` : ""}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl bg-[#f7f9f6] px-4 py-5 text-center">
              <Archive size={24} className="mx-auto mb-2 text-[#a5b3a1]" />

              <p className="text-sm font-medium text-[#697166]">
                Noch keine Vorräte vorhanden
              </p>

              <p className="mt-1 text-xs text-[#92998f]">
                Fügt eure ersten Lebensmittel hinzu!
              </p>
            </div>
          )}

          <Link
            href="/pantry"
            className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-[#56815c] hover:underline"
          >
            Vorräte verwalten
            <ChevronRight size={15} />
          </Link>
        </section>
      </div>

      {/* Quick actions */}
      <section>
        <h3 className="mb-4 text-lg font-semibold">Schnellzugriff</h3>

        <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/shopping"
            className="flex min-w-0 items-center gap-3 rounded-xl border border-[#e8ece5] bg-white p-4 transition-colors hover:border-[#c8d9c8] hover:bg-[#fbfdfb]"
          >
            <Plus className="shrink-0 text-[#56815c]" />

            <span className="min-w-0">
              <span className="block text-sm font-semibold">
                Lebensmittel hinzufügen
              </span>
              <span className="text-xs text-[#92998f]">Zur Einkaufsliste</span>
            </span>
          </Link>

          <Link
            href="/recipes"
            className="flex min-w-0 items-center gap-3 rounded-xl border border-[#e8ece5] bg-white p-4 transition-colors hover:border-[#c8d9c8] hover:bg-[#fbfdfb]"
          >
            <ChefHat className="shrink-0 text-[#56815c]" />

            <span className="min-w-0">
              <span className="block text-sm font-semibold">
                Rezept entdecken
              </span>
              <span className="text-xs text-[#92998f]">
                {recipeCount} Rezepte im Kochbuch
              </span>
            </span>
          </Link>

          <Link
            href="/household"
            className="flex min-w-0 items-center gap-3 rounded-xl border border-[#e8ece5] bg-white p-4 transition-colors hover:border-[#c8d9c8] hover:bg-[#fbfdfb] sm:col-span-2 lg:col-span-1"
          >
            <CalendarDays className="shrink-0 text-[#56815c]" />

            <span className="min-w-0">
              <span className="block text-sm font-semibold">
                Haushalt verwalten
              </span>
              <span className="truncate text-xs text-[#92998f]">
                {householdName}
              </span>
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
