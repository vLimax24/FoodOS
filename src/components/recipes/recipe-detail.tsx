"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  ArrowLeft,
  Clock3,
  Users,
  ChefHat,
  Trash2,
  Timer,
  Utensils,
  Pencil,
} from "lucide-react";
import { deleteRecipe } from "@/app/actions/recipes";

type Recipe = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  category: string | null;
  servings: number;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  difficulty: "einfach" | "mittel" | "anspruchsvoll" | null;
  recipe_ingredients: {
    id: string;
    name: string;
    quantity: number | null;
    unit: string | null;
    notes: string | null;
    is_optional: boolean;
    sort_order: number;
  }[];
  recipe_steps: {
    id: string;
    instruction: string;
    sort_order: number;
  }[];
};

type RecipeDetailProps = {
  recipe: Recipe;
};

const difficultyLabels = {
  einfach: "Einfach",
  mittel: "Mittel",
  anspruchsvoll: "Anspruchsvoll",
};

export default function RecipeDetail({ recipe }: RecipeDetailProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const totalTime =
    (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0);

  const ingredients = [...recipe.recipe_ingredients].sort(
    (a, b) => a.sort_order - b.sort_order,
  );

  const steps = [...recipe.recipe_steps].sort(
    (a, b) => a.sort_order - b.sort_order,
  );

  function handleDelete() {
    const confirmed = window.confirm(
      `Möchtest du "${recipe.title}" wirklich löschen?`,
    );

    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteRecipe(recipe.id);

      if (!result.success) {
        window.alert(result.error ?? "Rezept konnte nicht gelöscht werden.");
        return;
      }

      router.push("/recipes");
      router.refresh();
    });
  }

  function formatQuantity(quantity: number) {
    return new Intl.NumberFormat("de-DE", {
      maximumFractionDigits: 3,
    }).format(quantity);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      {/* Navigation */}
      <Link
        href="/recipes"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#697166] transition-colors hover:text-[#39734a]"
      >
        <ArrowLeft size={17} />
        Zurück zu den Rezepten
      </Link>

      {/* Hero */}
      <section className="overflow-hidden rounded-3xl border border-[#e8ece5] bg-white">
        {recipe.image_url ? (
          <div className="relative h-64 bg-[#f1f4ef] sm:h-96">
            <img
              src={recipe.image_url}
              alt={recipe.title}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex h-56 items-center justify-center bg-[#edf4ed] text-[#39734a] sm:h-72">
            <Utensils size={64} strokeWidth={1.2} />
          </div>
        )}

        <div className="space-y-4 p-5 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            {recipe.category && (
              <span className="rounded-full bg-[#edf4ed] px-3 py-1 text-xs font-semibold text-[#39734a]">
                {recipe.category}
              </span>
            )}

            {recipe.difficulty && (
              <span className="rounded-full bg-[#f4f5f2] px-3 py-1 text-xs font-medium text-[#697166]">
                {difficultyLabels[recipe.difficulty]}
              </span>
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#20251f] sm:text-4xl">
              {recipe.title}
            </h1>

            {recipe.description && (
              <p className="mt-3 max-w-3xl text-sm leading-7 text-[#697166] sm:text-base">
                {recipe.description}
              </p>
            )}
          </div>

          {/* Recipe stats */}
          <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
            <Stat
              icon={<Clock3 size={18} />}
              label="Gesamtzeit"
              value={totalTime > 0 ? `${totalTime} Min.` : "Keine Angabe"}
            />

            <Stat
              icon={<Timer size={18} />}
              label="Vorbereitung"
              value={
                recipe.prep_time_minutes !== null
                  ? `${recipe.prep_time_minutes} Min.`
                  : "–"
              }
            />

            <Stat
              icon={<ChefHat size={18} />}
              label="Kochzeit"
              value={
                recipe.cook_time_minutes !== null
                  ? `${recipe.cook_time_minutes} Min.`
                  : "–"
              }
            />

            <Stat
              icon={<Users size={18} />}
              label="Portionen"
              value={`${recipe.servings} Personen`}
            />
          </div>
        </div>
      </section>

      {/* Ingredients and preparation */}
      <div className="grid items-start gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        {/* Ingredients */}
        <section className="rounded-2xl border border-[#e8ece5] bg-white p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#20251f]">Zutaten</h2>
              <p className="mt-1 text-sm text-[#81897f]">
                Alles, was ihr benötigt
              </p>
            </div>

            <span className="rounded-full bg-[#edf4ed] px-3 py-1 text-xs font-semibold text-[#39734a]">
              {ingredients.length}
            </span>
          </div>

          {ingredients.length > 0 ? (
            <div className="divide-y divide-[#edf0eb]">
              {ingredients.map((ingredient) => (
                <div key={ingredient.id} className="flex gap-3 py-3">
                  <div className="mt-0.5 size-5 shrink-0 rounded-md border border-[#cbdcc9]" />

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#424a40]">
                      {ingredient.name}

                      {ingredient.is_optional && (
                        <span className="ml-2 text-xs font-normal text-[#92998f]">
                          Optional
                        </span>
                      )}
                    </p>

                    {ingredient.notes && (
                      <p className="mt-1 text-xs text-[#92998f]">
                        {ingredient.notes}
                      </p>
                    )}
                  </div>

                  <span className="shrink-0 text-sm font-medium text-[#697166]">
                    {ingredient.quantity !== null
                      ? formatQuantity(ingredient.quantity)
                      : ""}
                    {ingredient.unit ? ` ${ingredient.unit}` : ""}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#81897f]">
              Für dieses Rezept wurden noch keine Zutaten eingetragen.
            </p>
          )}
        </section>

        {/* Preparation */}
        <section className="rounded-2xl border border-[#e8ece5] bg-white p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-[#20251f]">Zubereitung</h2>
            <p className="mt-1 text-sm text-[#81897f]">
              Schritt für Schritt zum fertigen Gericht
            </p>
          </div>

          {steps.length > 0 ? (
            <div className="space-y-5">
              {steps.map((step, index) => (
                <div key={step.id} className="flex gap-4">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#edf4ed] text-sm font-bold text-[#39734a]">
                    {index + 1}
                  </div>

                  <p className="pt-1 text-sm leading-7 text-[#424a40]">
                    {step.instruction}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#81897f]">
              Für dieses Rezept wurden noch keine Zubereitungsschritte
              eingetragen.
            </p>
          )}
        </section>
      </div>

      {/* Delete */}
      <div className="flex flex-col-reverse justify-between gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#f0d2cf] bg-white px-4 py-2.5 text-sm font-medium text-[#b75b50] transition-colors hover:bg-[#fdf2f1] disabled:opacity-50"
        >
          <Trash2 size={16} />
          {isPending ? "Wird gelöscht..." : "Rezept löschen"}
        </button>

        <Link
          href={`/recipes/${recipe.id}/edit`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#39734a] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2f623e]"
        >
          <Pencil size={16} />
          Rezept bearbeiten
        </Link>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-[#f8faf7] p-3 sm:p-4">
      <div className="mb-2 flex items-center gap-2 text-[#56815c]">
        {icon}
        <span className="text-xs font-medium text-[#81897f]">{label}</span>
      </div>

      <p className="text-sm font-semibold text-[#424a40]">{value}</p>
    </div>
  );
}
