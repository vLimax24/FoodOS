"use client";

import { Clock3, Plus, Trash2, Utensils } from "lucide-react";

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
  meal_type: "lunch" | "dinner";
  recipe: Recipe | null;
};

type MealCardProps = {
  label: string;
  meal?: PlannedMeal;
  onAdd: () => void;
  onDelete: () => void;
  disabled: boolean;
};

export default function MealCard({
  label,
  meal,
  onAdd,
  onDelete,
  disabled,
}: MealCardProps) {
  const recipe = meal?.recipe;

  const totalTime = recipe
    ? (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0)
    : 0;

  return (
    <div className="min-w-0 rounded-xl border border-[#edf0eb] bg-[#fafbf9] p-3">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold text-[#697166]">{label}</span>

        {meal && (
          <button
            type="button"
            onClick={onDelete}
            disabled={disabled}
            aria-label="Mahlzeit entfernen"
            className="rounded-lg p-1.5 text-[#92998f] transition-colors hover:bg-[#fdf2f1] hover:text-[#b75b50] disabled:opacity-50"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>

      {recipe ? (
        <div className="flex gap-3">
          <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-[#edf4ed]">
            {recipe.image_url ? (
              <img
                src={recipe.image_url}
                alt={recipe.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[#56815c]">
                <Utensils size={23} />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-sm font-semibold text-[#424a40]">
              {recipe.title}
            </p>

            {totalTime > 0 && (
              <p className="mt-2 flex items-center gap-1 text-xs text-[#81897f]">
                <Clock3 size={13} />
                {totalTime} Min.
              </p>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={onAdd}
          disabled={disabled}
          className="flex min-h-16 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#d5dfd2] text-sm font-medium text-[#56815c] transition-colors hover:border-[#8eae8d] hover:bg-[#edf4ed] disabled:opacity-50"
        >
          <Plus size={17} />
          {meal ? "Rezept auswählen" : "Rezept hinzufügen"}
        </button>
      )}
    </div>
  );
}
