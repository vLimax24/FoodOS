"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ChefHat,
  Clock3,
  Plus,
  ShoppingBasket,
  Trash2,
  Utensils,
  X,
} from "lucide-react";
import {
  addPlannedMeal,
  deletePlannedMeal,
} from "@/app/(app)/meal-planner/actions";
import MealCard from "@/components/meal-planner/meal-card";

import {
  addGeneratedShoppingItems,
  getShoppingListPreview,
  type ShoppingPreviewItem,
} from "@/app/(app)/meal-planner/actions";

import { UNIT_OPTIONS } from "@/lib/units";
import { SHOPPING_CATEGORIES } from "@/lib/shopping/categories";

type MealType = "lunch" | "dinner";

type Recipe = {
  id: string;
  title: string;
  image_url: string | null;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
};

type PlannedMeal = {
  id: string;
  date: string;
  meal_type: MealType;
  recipe: Recipe | null;
};

type MealPlannerProps = {
  weekStart: string;
  plannedMeals: PlannedMeal[];
  recipes: Recipe[];
};

const weekdays = [
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
  "Sonntag",
];

function addDays(date: string, days: number) {
  const result = new Date(`${date}T00:00:00.000Z`);
  result.setUTCDate(result.getUTCDate() + days);

  return result.toISOString().slice(0, 10);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00.000Z`));
}

function formatWeek(start: string) {
  const end = addDays(start, 6);

  const startDate = new Date(`${start}T00:00:00.000Z`);
  const endDate = new Date(`${end}T00:00:00.000Z`);

  const formatter = new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });

  return `${formatter.format(startDate)} – ${formatter.format(endDate)}`;
}

export default function MealPlanner({
  weekStart,
  plannedMeals,
  recipes,
}: MealPlannerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [selectedSlot, setSelectedSlot] = useState<{
    date: string;
    mealType: MealType;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [shoppingPreview, setShoppingPreview] = useState<
    ShoppingPreviewItem[] | null
  >(null);

  const [selectedShoppingKeys, setSelectedShoppingKeys] = useState<string[]>(
    [],
  );
  const [shoppingError, setShoppingError] = useState<string | null>(null);
  const [shoppingSuccess, setShoppingSuccess] = useState<string | null>(null);

  const days = weekdays.map((day, index) => ({
    name: day,
    date: addDays(weekStart, index),
    meals:
      index >= 5
        ? [
            { type: "lunch" as const, label: "Mittagessen" },
            { type: "dinner" as const, label: "Abendessen" },
          ]
        : [{ type: "dinner" as const, label: "Abendessen" }],
  }));

  function navigateWeek(offset: number) {
    const nextWeek = addDays(weekStart, offset * 7);

    router.push(`/meal-planner?week=${nextWeek}`);
  }

  function handleAddRecipe(recipeId: string) {
    if (!selectedSlot) return;

    setError(null);

    startTransition(async () => {
      const result = await addPlannedMeal(
        selectedSlot.date,
        selectedSlot.mealType,
        recipeId,
      );

      if (!result.success) {
        setError(result.error ?? "Mahlzeit konnte nicht gespeichert werden.");
        return;
      }

      setSelectedSlot(null);
      router.refresh();
    });
  }

  function handleDelete(mealId: string) {
    if (!window.confirm("Möchtest du diese Mahlzeit entfernen?")) return;

    startTransition(async () => {
      const result = await deletePlannedMeal(mealId);

      if (!result.success) {
        window.alert(result.error ?? "Mahlzeit konnte nicht gelöscht werden.");
        return;
      }

      router.refresh();
    });
  }

  function handleGenerateShoppingList() {
    setShoppingError(null);
    setShoppingSuccess(null);

    startTransition(async () => {
      const result = await getShoppingListPreview(weekStart);

      if (!result.success) {
        setShoppingError(
          result.error ?? "Einkaufsliste konnte nicht berechnet werden.",
        );
        return;
      }

      const items = result.items ?? [];

      setShoppingPreview(items);
      setSelectedShoppingKeys(items.map((item) => item.key));
    });
  }

  function toggleShoppingSelection(key: string) {
    setSelectedShoppingKeys((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    );
  }

  function handleSaveShoppingList() {
    if (selectedShoppingKeys.length === 0) return;

    setShoppingError(null);

    startTransition(async () => {
      const result = await addGeneratedShoppingItems(
        weekStart,
        selectedShoppingKeys,
      );

      if (!result.success) {
        setShoppingError(
          result.error ?? "Einkaufsliste konnte nicht gespeichert werden.",
        );
        return;
      }

      setShoppingSuccess(
        `${result.addedCount ?? 0} Artikel wurden zur Einkaufsliste hinzugefügt.`,
      );

      setShoppingPreview(null);
      setSelectedShoppingKeys([]);
      router.refresh();
    });
  }

  function formatShoppingQuantity(item: ShoppingPreviewItem) {
    if (item.quantity === null) return "Menge offen";

    const quantity = new Intl.NumberFormat("de-DE", {
      maximumFractionDigits: 3,
    }).format(item.quantity);

    const unitLabel = item.unit
      ? (UNIT_OPTIONS.find((unit) => unit.value === item.unit)?.label ??
        item.unit)
      : "";

    return [quantity, unitLabel].filter(Boolean).join(" ");
  }

  return (
    <div className="mx-auto max-w-6xl space-y-7 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#56815c]">
            <CalendarDays size={17} />
            Euer Essensplan
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[#20251f]">
            Wochenplan
          </h1>

          <p className="mt-2 text-sm text-[#81897f]">
            Plant eure Mahlzeiten für die kommende Woche.
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-xl border border-[#e8ece5] bg-white p-2">
          <button
            type="button"
            onClick={() => navigateWeek(-1)}
            disabled={isPending}
            aria-label="Vorherige Woche"
            className="rounded-lg p-2 text-[#697166] transition-colors hover:bg-[#f1f4ef]"
          >
            <ArrowLeft size={19} />
          </button>

          <span className="min-w-36 text-center text-sm font-semibold text-[#424a40]">
            {formatWeek(weekStart)}
          </span>

          <button
            type="button"
            onClick={() => navigateWeek(1)}
            disabled={isPending}
            aria-label="Nächste Woche"
            className="rounded-lg p-2 text-[#697166] transition-colors hover:bg-[#f1f4ef]"
          >
            <ArrowRight size={19} />
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-h-5 text-sm">
          {shoppingError && !shoppingPreview && (
            <span className="text-[#b75b50]">{shoppingError}</span>
          )}

          {shoppingSuccess && (
            <span className="text-[#39734a]">{shoppingSuccess}</span>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/meal-planner")}
            className="text-sm font-medium text-[#39734a] hover:underline"
          >
            Zur aktuellen Woche
          </button>

          <button
            type="button"
            onClick={handleGenerateShoppingList}
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#56815c] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#466e4c] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShoppingBasket size={17} />
            Einkaufsliste generieren
          </button>
        </div>
      </div>

      {/* Week */}
      <div className="space-y-4">
        {days.map((day) => (
          <section
            key={day.date}
            className="overflow-hidden rounded-2xl border border-[#e8ece5] bg-white"
          >
            <div className="flex items-center justify-between border-b border-[#edf0eb] px-5 py-4">
              <div>
                <h2 className="font-bold text-[#20251f]">{day.name}</h2>
                <p className="mt-0.5 text-xs text-[#92998f]">
                  {formatDate(day.date)}
                </p>
              </div>

              <span className="text-xs font-medium text-[#92998f]">
                {day.meals.length}{" "}
                {day.meals.length === 1 ? "Mahlzeit" : "Mahlzeiten"}
              </span>
            </div>

            <div className="grid gap-3 p-4 sm:grid-cols-2">
              {day.meals.map((slot) => {
                const meal = plannedMeals.find(
                  (item) =>
                    item.date === day.date && item.meal_type === slot.type,
                );

                return (
                  <MealCard
                    key={slot.type}
                    label={slot.label}
                    meal={meal}
                    disabled={isPending}
                    onAdd={() => {
                      setError(null);
                      setSelectedSlot({
                        date: day.date,
                        mealType: slot.type,
                      });
                    }}
                    onDelete={() => handleDelete(meal!.id)}
                  />
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Empty recipes */}
      {recipes.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#d5dfd2] bg-white p-8 text-center">
          <ChefHat className="mx-auto mb-3 text-[#56815c]" size={32} />

          <h3 className="font-semibold text-[#424a40]">
            Noch keine Rezepte vorhanden
          </h3>

          <p className="mt-1 text-sm text-[#81897f]">
            Erstellt ein Rezept, um es hier einzuplanen.
          </p>
        </div>
      )}

      {/* Recipe picker */}
      {selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <div className="max-h-[85dvh] w-full max-w-lg overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-[#edf0eb] p-5">
              <div>
                <h2 className="text-lg font-bold text-[#20251f]">
                  Rezept auswählen
                </h2>

                <p className="mt-1 text-xs text-[#81897f]">
                  {formatDate(selectedSlot.date)} ·{" "}
                  {selectedSlot.mealType === "lunch"
                    ? "Mittagessen"
                    : "Abendessen"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSlot(null)}
                aria-label="Schließen"
                className="rounded-lg p-2 text-[#697166] hover:bg-[#f1f4ef]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[60dvh] space-y-2 overflow-y-auto p-4">
              {error && (
                <p className="rounded-lg bg-[#fdf2f1] p-3 text-sm text-[#b75b50]">
                  {error}
                </p>
              )}

              {recipes.map((recipe) => {
                const totalTime =
                  (recipe.prep_time_minutes ?? 0) +
                  (recipe.cook_time_minutes ?? 0);

                return (
                  <button
                    key={recipe.id}
                    type="button"
                    onClick={() => handleAddRecipe(recipe.id)}
                    disabled={isPending}
                    className="flex w-full items-center gap-3 rounded-xl border border-[#edf0eb] p-3 text-left transition-colors hover:border-[#b9ceb7] hover:bg-[#f8faf7] disabled:opacity-50"
                  >
                    <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-[#edf4ed]">
                      {recipe.image_url ? (
                        <img
                          src={recipe.image_url}
                          alt={recipe.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[#56815c]">
                          <Utensils size={21} />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#424a40]">
                        {recipe.title}
                      </p>

                      {totalTime > 0 && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-[#81897f]">
                          <Clock3 size={13} />
                          {totalTime} Min.
                        </p>
                      )}
                    </div>

                    <Plus size={18} className="shrink-0 text-[#56815c]" />
                  </button>
                );
              })}
            </div>

            {isPending && (
              <div className="border-t border-[#edf0eb] px-5 py-3 text-center text-sm text-[#81897f]">
                Wird gespeichert...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Shopping list preview */}
      {shoppingPreview !== null && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <div className="flex max-h-[90dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-[#edf0eb] p-5">
              <div>
                <div className="mb-1 flex items-center gap-2 text-sm font-medium text-[#56815c]">
                  <ShoppingBasket size={17} />
                  Einkaufsliste
                </div>

                <h2 className="text-lg font-bold text-[#20251f]">
                  Zutaten überprüfen
                </h2>

                <p className="mt-1 text-xs text-[#81897f]">
                  Fehlende Zutaten für die Woche vom {formatWeek(weekStart)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShoppingPreview(null);
                  setShoppingError(null);
                }}
                aria-label="Schließen"
                className="rounded-lg p-2 text-[#697166] hover:bg-[#f1f4ef]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto p-5">
              {shoppingError && (
                <p className="mb-4 rounded-lg bg-[#fdf2f1] p-3 text-sm text-[#b75b50]">
                  {shoppingError}
                </p>
              )}

              {shoppingPreview.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-[#edf4ed] text-[#56815c]">
                    <ShoppingBasket size={25} />
                  </div>

                  <h3 className="font-semibold text-[#424a40]">
                    Alles ist bereits vorhanden!
                  </h3>

                  <p className="mx-auto mt-2 max-w-sm text-sm text-[#81897f]">
                    Es wurden keine fehlenden Zutaten gefunden. Entweder sind
                    noch keine Mahlzeiten geplant oder die benötigten Zutaten
                    sind bereits im Vorrat oder auf eurer Einkaufsliste.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-[#697166]">
                      {shoppingPreview.length} fehlende{" "}
                      {shoppingPreview.length === 1 ? "Zutat" : "Zutaten"}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedShoppingKeys(
                          selectedShoppingKeys.length === shoppingPreview.length
                            ? []
                            : shoppingPreview.map((item) => item.key),
                        )
                      }
                      className="text-xs font-semibold text-[#39734a] hover:underline"
                    >
                      {selectedShoppingKeys.length === shoppingPreview.length
                        ? "Alle abwählen"
                        : "Alle auswählen"}
                    </button>
                  </div>

                  <div className="space-y-2">
                    {shoppingPreview.map((item) => {
                      const category = SHOPPING_CATEGORIES.find(
                        (entry) => entry.value === item.category,
                      );

                      const isSelected = selectedShoppingKeys.includes(
                        item.key,
                      );

                      return (
                        <label
                          key={item.key}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${
                            isSelected
                              ? "border-[#b9ceb7] bg-[#f8faf7]"
                              : "border-[#edf0eb] bg-white"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleShoppingSelection(item.key)}
                            className="size-4 shrink-0 accent-[#56815c]"
                          />

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-[#424a40]">
                              {item.name}
                            </p>

                            <p className="mt-0.5 text-xs text-[#92998f]">
                              {category?.label ?? "Sonstiges"}
                            </p>
                          </div>

                          <span className="shrink-0 text-sm font-medium text-[#56815c]">
                            {formatShoppingQuantity(item)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {shoppingPreview.length > 0 && (
              <div className="border-t border-[#edf0eb] bg-white p-5">
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="text-[#81897f]">Ausgewählt</span>
                  <span className="font-semibold text-[#424a40]">
                    {selectedShoppingKeys.length} von {shoppingPreview.length}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleSaveShoppingList}
                  disabled={isPending || selectedShoppingKeys.length === 0}
                  className="w-full rounded-xl bg-[#56815c] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#466e4c] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPending
                    ? "Wird hinzugefügt..."
                    : `${selectedShoppingKeys.length} Artikel hinzufügen`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
