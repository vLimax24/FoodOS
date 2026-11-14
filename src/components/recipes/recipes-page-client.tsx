"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ChefHat,
  Clock3,
  Plus,
  Search,
  UtensilsCrossed,
  Users,
} from "lucide-react";

type Recipe = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  category: string | null;
  servings: number;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  difficulty: string | null;
  created_at: string;
};

type RecipesPageClientProps = {
  recipes: Recipe[];
};

export default function RecipesPageClient({ recipes }: RecipesPageClientProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Alle");

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(
        recipes
          .map((recipe) => recipe.category)
          .filter((category): category is string => Boolean(category)),
      ),
    );

    return ["Alle", ...uniqueCategories];
  }, [recipes]);

  const filteredRecipes = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return recipes.filter((recipe) => {
      const matchesSearch =
        !normalizedSearch ||
        recipe.title.toLowerCase().includes(normalizedSearch) ||
        recipe.description?.toLowerCase().includes(normalizedSearch) ||
        recipe.category?.toLowerCase().includes(normalizedSearch);

      const matchesCategory =
        activeCategory === "Alle" || recipe.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [recipes, search, activeCategory]);

  return (
    <div className="min-w-0 space-y-8">
      {/* Header */}
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-sm font-medium tracking-wide text-[#7d8979]">
            FOODOS · KOCHBUCH
          </p>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Eure Rezepte
          </h1>

          <p className="mt-2 text-sm text-[#81897f] sm:text-base">
            Eure Lieblingsgerichte an einem Ort.
          </p>
        </div>

        <Link
          href="/recipes/new"
          className="inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-[#39734a] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#2f623e]"
        >
          <Plus size={18} />
          Rezept erstellen
        </Link>
      </section>

      {/* Search */}
      <section className="space-y-4">
        <div className="relative">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#92998f]"
          />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rezepte durchsuchen..."
            className="h-12 w-full rounded-xl border border-[#e8ece5] bg-white pl-12 pr-4 text-sm outline-none transition-colors placeholder:text-[#a0a69d] focus:border-[#8eaf91] focus:ring-2 focus:ring-[#56815c]/10"
          />
        </div>

        {/* Categories */}
        {categories.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((category) => {
              const active = activeCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-[#39734a] text-white"
                      : "border border-[#e8ece5] bg-white text-[#697166] hover:bg-[#f4f7f2]"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Recipe count */}
      <section>
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">
            {search || activeCategory !== "Alle"
              ? "Suchergebnisse"
              : "Alle Rezepte"}
          </h2>

          <span className="text-sm text-[#92998f]">
            {filteredRecipes.length}{" "}
            {filteredRecipes.length === 1 ? "Rezept" : "Rezepte"}
          </span>
        </div>

        {/* Recipe Grid */}
        {filteredRecipes.length > 0 ? (
          <div className="grid min-w-0 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredRecipes.map((recipe) => {
              const totalTime =
                (recipe.prep_time_minutes ?? 0) +
                (recipe.cook_time_minutes ?? 0);

              return (
                <Link
                  key={recipe.id}
                  href={`/recipes/${recipe.id}`}
                  className="group min-w-0 overflow-hidden rounded-2xl border border-[#e8ece5] bg-white transition-all hover:-translate-y-1 hover:border-[#cbdcc9] hover:shadow-lg hover:shadow-[#20251f]/5"
                >
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#edf4ed]">
                    {recipe.image_url ? (
                      <img
                        src={recipe.image_url}
                        alt={recipe.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#edf4ed] to-[#dce9da]">
                        <ChefHat
                          size={48}
                          strokeWidth={1.2}
                          className="text-[#719477]"
                        />
                      </div>
                    )}

                    {recipe.category && (
                      <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-[#39734a] shadow-sm backdrop-blur">
                        {recipe.category}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="space-y-3 p-4">
                    <div>
                      <h3 className="truncate text-base font-semibold transition-colors group-hover:text-[#39734a]">
                        {recipe.title}
                      </h3>

                      <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-relaxed text-[#81897f]">
                        {recipe.description || "Ein leckeres Familienrezept."}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#edf0eb] pt-3 text-xs text-[#81897f]">
                      {totalTime > 0 && (
                        <span className="flex items-center gap-1.5">
                          <Clock3 size={14} />
                          {totalTime} Min.
                        </span>
                      )}

                      <span className="flex items-center gap-1.5">
                        <Users size={14} />
                        {recipe.servings} Portionen
                      </span>

                      {recipe.difficulty && (
                        <span className="flex items-center gap-1.5">
                          <UtensilsCrossed size={14} />
                          {recipe.difficulty}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#dce4d9] bg-white px-5 py-16 text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#edf4ed] text-[#56815c]">
              <ChefHat size={27} />
            </div>

            <h3 className="text-base font-semibold">
              {recipes.length === 0
                ? "Euer Kochbuch ist noch leer"
                : "Keine Rezepte gefunden"}
            </h3>

            <p className="mt-2 max-w-sm text-sm text-[#81897f]">
              {recipes.length === 0
                ? "Legt euer erstes Rezept an und sammelt eure Lieblingsgerichte an einem Ort."
                : "Versucht einen anderen Suchbegriff oder wählt eine andere Kategorie."}
            </p>

            {recipes.length === 0 && (
              <Link
                href="/recipes/new"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#39734a] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2f623e]"
              >
                <Plus size={17} />
                Erstes Rezept erstellen
              </Link>
            )}

            {recipes.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setActiveCategory("Alle");
                }}
                className="mt-5 text-sm font-semibold text-[#39734a] hover:underline"
              >
                Filter zurücksetzen
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
