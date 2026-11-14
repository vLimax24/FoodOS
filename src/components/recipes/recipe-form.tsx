"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Clock3,
  ImagePlus,
  Plus,
  Trash2,
  Users,
  X,
} from "lucide-react";
import {
  saveRecipe,
  type RecipeDifficulty,
  type RecipeIngredientInput,
  type RecipeStepInput,
} from "@/app/actions/recipes";

const categories = [
  "Frühstück",
  "Mittagessen",
  "Abendessen",
  "Dessert",
  "Snack",
  "Backen",
  "Getränke",
  "Sonstiges",
];

type Ingredient = RecipeIngredientInput & { localId: number };
type Step = RecipeStepInput & { localId: number };

type RecipeFormInitialData = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  category: string | null;
  servings: number;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  difficulty: RecipeDifficulty | null;
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

const createIngredient = (localId: number): Ingredient => ({
  localId,
  name: "",
  quantity: null,
  unit: "",
  notes: "",
  is_optional: false,
});

const createStep = (localId: number): Step => ({
  localId,
  instruction: "",
});

type RecipeFormProps = {
  householdId: string;
  initialRecipe?: RecipeFormInitialData;
};

export default function RecipeForm({
  householdId,
  initialRecipe,
}: RecipeFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(initialRecipe?.title ?? "");
  const [description, setDescription] = useState(
    initialRecipe?.description ?? "",
  );
  const [imageUrl, setImageUrl] = useState(initialRecipe?.image_url ?? "");
  const [category, setCategory] = useState(
    initialRecipe?.category ?? "Abendessen",
  );
  const [servings, setServings] = useState(initialRecipe?.servings ?? 4);
  const [prepTime, setPrepTime] = useState(
    initialRecipe?.prep_time_minutes?.toString() ?? "",
  );
  const [cookTime, setCookTime] = useState(
    initialRecipe?.cook_time_minutes?.toString() ?? "",
  );
  const [difficulty, setDifficulty] = useState<RecipeDifficulty | "">(
    initialRecipe ? (initialRecipe.difficulty ?? "") : "mittel",
  );
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    if (!initialRecipe) return [createIngredient(0)];

    return [...initialRecipe.recipe_ingredients]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((ingredient, index) => ({
        localId: index,
        name: ingredient.name,
        quantity:
          ingredient.quantity === null ? null : Number(ingredient.quantity),
        unit: ingredient.unit ?? "",
        notes: ingredient.notes ?? "",
        is_optional: ingredient.is_optional,
      }));
  });

  const [steps, setSteps] = useState<Step[]>(() => {
    if (!initialRecipe) return [createStep(0)];

    return [...initialRecipe.recipe_steps]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((step, index) => ({
        localId: index,
        instruction: step.instruction,
      }));
  });

  const [nextId, setNextId] = useState(
    Math.max(
      initialRecipe?.recipe_ingredients.length ?? 0,
      initialRecipe?.recipe_steps.length ?? 0,
    ),
  );

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Bitte wähle ein JPG-, PNG- oder WebP-Bild aus.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Das Bild darf maximal 5 MB groß sein.");
      event.target.value = "";
      return;
    }

    setError(null);
    setImageUrl("");

    setPreviewUrl(URL.createObjectURL(file));
    setSelectedImage(file);
  }

  function removeImage() {
    setSelectedImage(null);
    setPreviewUrl(null);
    setImageUrl("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function updateIngredient(
    localId: number,
    field: keyof RecipeIngredientInput,
    value: string | number | boolean | null,
  ) {
    setIngredients((current) =>
      current.map((ingredient) =>
        ingredient.localId === localId
          ? { ...ingredient, [field]: value }
          : ingredient,
      ),
    );
  }

  function addIngredient() {
    setIngredients((current) => [...current, createIngredient(nextId)]);
    setNextId((current) => current + 1);
  }

  function removeIngredient(localId: number) {
    setIngredients((current) =>
      current.filter((ingredient) => ingredient.localId !== localId),
    );
  }

  function updateStep(localId: number, instruction: string) {
    setSteps((current) =>
      current.map((step) =>
        step.localId === localId ? { ...step, instruction } : step,
      ),
    );
  }

  function addStep() {
    setSteps((current) => [...current, createStep(nextId)]);
    setNextId((current) => current + 1);
  }

  function removeStep(localId: number) {
    setSteps((current) => current.filter((step) => step.localId !== localId));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const recipeIngredients = ingredients.map(
      ({ localId: _localId, ...ingredient }) => ingredient,
    );

    const recipeSteps = steps.map(({ localId: _localId, ...step }) => step);

    startTransition(async () => {
      try {
        let finalImageUrl = imageUrl.trim();

        // Bild zuerst zu Supabase Storage hochladen
        if (selectedImage) {
          const supabase = createClient();

          const extensionByType: Record<string, string> = {
            "image/jpeg": "jpg",
            "image/png": "png",
            "image/webp": "webp",
          };

          const extension = extensionByType[selectedImage.type];

          if (!extension) {
            setError("Dieses Bildformat wird nicht unterstützt.");
            return;
          }

          const imagePath = `${householdId}/${crypto.randomUUID()}.${extension}`;

          const { error: uploadError } = await supabase.storage
            .from("recipe-images")
            .upload(imagePath, selectedImage, {
              contentType: selectedImage.type,
              upsert: false,
            });

          if (uploadError) {
            setError(`Bild-Upload fehlgeschlagen: ${uploadError.message}`);
            return;
          }

          const { data } = supabase.storage
            .from("recipe-images")
            .getPublicUrl(imagePath);

          finalImageUrl = data.publicUrl;
        }

        // Rezept inklusive Bild-URL speichern
        const result = await saveRecipe({
          id: initialRecipe?.id,
          title,
          description,
          imageUrl: finalImageUrl,
          category,
          servings,
          prepTimeMinutes: prepTime === "" ? null : Number(prepTime),
          cookTimeMinutes: cookTime === "" ? null : Number(cookTime),
          difficulty: difficulty || null,
          ingredients: recipeIngredients,
          steps: recipeSteps,
        });

        if (!result.success) {
          setError(result.error ?? "Rezept konnte nicht gespeichert werden.");
          return;
        }

        router.push(`/recipes/${result.recipeId}`);
        router.refresh();
      } catch (error) {
        console.error("Recipe saving failed:", error);
        setError(
          "Beim Speichern des Rezepts ist ein unerwarteter Fehler aufgetreten.",
        );
      }
    });
  }

  const inputClass =
    "h-11 w-full rounded-xl border border-[#e8ece5] bg-white px-3.5 text-sm outline-none transition-colors placeholder:text-[#a0a69d] focus:border-[#8eaf91] focus:ring-2 focus:ring-[#56815c]/10";

  const labelClass = "mb-2 block text-sm font-medium text-[#424a40]";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic information */}
      <section className="space-y-5 rounded-2xl border border-[#e8ece5] bg-white p-5 sm:p-7">
        <div>
          <h2 className="text-lg font-semibold">Grundinformationen</h2>
          <p className="mt-1 text-sm text-[#81897f]">Wie heißt euer Rezept?</p>
        </div>

        <div>
          <label htmlFor="title" className={labelClass}>
            Rezeptname *
          </label>
          <input
            id="title"
            required
            maxLength={120}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="z. B. Cremige Gemüse-Lasagne"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="description" className={labelClass}>
            Beschreibung
          </label>
          <textarea
            id="description"
            maxLength={2000}
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Beschreibt euer Gericht..."
            className="w-full rounded-xl border border-[#e8ece5] bg-white px-3.5 py-3 text-sm outline-none transition-colors placeholder:text-[#a0a69d] focus:border-[#8eaf91] focus:ring-2 focus:ring-[#56815c]/10"
          />
        </div>

        <div className="space-y-3">
          <label className={labelClass}>
            <span className="flex items-center gap-2">
              <ImagePlus size={16} />
              Rezeptbild
            </span>
          </label>

          <div className="rounded-xl border border-dashed border-[#cbdcc9] bg-[#f8faf7] p-5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="hidden"
              id="recipe-image"
            />

            <label
              htmlFor="recipe-image"
              className="flex cursor-pointer flex-col items-center justify-center gap-2 text-center"
            >
              <div className="flex size-12 items-center justify-center rounded-xl bg-[#edf4ed] text-[#39734a]">
                <ImagePlus size={22} />
              </div>

              <span className="text-sm font-semibold text-[#424a40]">
                Bild auswählen
              </span>

              <span className="text-xs text-[#81897f]">
                JPG, PNG oder WebP · Maximal 5 MB
              </span>
            </label>
          </div>

          {(previewUrl || imageUrl) && (
            <div className="relative overflow-hidden rounded-xl bg-[#f4f7f2]">
              <img
                src={previewUrl ?? imageUrl}
                alt="Rezeptvorschau"
                className="max-h-64 w-full object-cover"
              />

              <button
                type="button"
                onClick={removeImage}
                className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-white/90 text-[#697166] shadow-sm hover:bg-white"
                aria-label="Bild entfernen"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="imageUrl"
              className="block text-xs font-medium text-[#81897f]"
            >
              Oder externe Bild-URL verwenden
            </label>

            <input
              id="imageUrl"
              type="url"
              value={imageUrl}
              onChange={(event) => {
                setImageUrl(event.target.value);
                setSelectedImage(null);
                setPreviewUrl(null);

                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              placeholder="https://..."
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="category" className={labelClass}>
              Kategorie
            </label>
            <select
              id="category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className={inputClass}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="difficulty" className={labelClass}>
              Schwierigkeit
            </label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(event) =>
                setDifficulty(event.target.value as RecipeDifficulty | "")
              }
              className={inputClass}
            >
              <option value="">Nicht angegeben</option>
              <option value="einfach">Einfach</option>
              <option value="mittel">Mittel</option>
              <option value="anspruchsvoll">Anspruchsvoll</option>
            </select>
          </div>
        </div>
      </section>

      {/* Time and servings */}
      <section className="space-y-5 rounded-2xl border border-[#e8ece5] bg-white p-5 sm:p-7">
        <div>
          <h2 className="text-lg font-semibold">Zeit & Portionen</h2>
          <p className="mt-1 text-sm text-[#81897f]">
            Wie viel Zeit und für wie viele Personen?
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="prepTime" className={labelClass}>
              Vorbereitung (Min.)
            </label>
            <div className="relative">
              <Clock3
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#92998f]"
              />
              <input
                id="prepTime"
                type="number"
                min="0"
                max="1440"
                value={prepTime}
                onChange={(event) => setPrepTime(event.target.value)}
                placeholder="15"
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>

          <div>
            <label htmlFor="cookTime" className={labelClass}>
              Kochzeit (Min.)
            </label>
            <div className="relative">
              <Clock3
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#92998f]"
              />
              <input
                id="cookTime"
                type="number"
                min="0"
                max="1440"
                value={cookTime}
                onChange={(event) => setCookTime(event.target.value)}
                placeholder="30"
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>

          <div>
            <label htmlFor="servings" className={labelClass}>
              Portionen
            </label>
            <div className="relative">
              <Users
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#92998f]"
              />
              <input
                id="servings"
                type="number"
                required
                min="1"
                max="100"
                value={servings}
                onChange={(event) => setServings(Number(event.target.value))}
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Ingredients */}
      <section className="space-y-5 rounded-2xl border border-[#e8ece5] bg-white p-5 sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Zutaten</h2>
            <p className="mt-1 text-sm text-[#81897f]">
              Was benötigt ihr für dieses Rezept?
            </p>
          </div>
          <span className="rounded-full bg-[#edf4ed] px-3 py-1 text-xs font-medium text-[#39734a]">
            {ingredients.length}
          </span>
        </div>

        <div className="space-y-3">
          {ingredients.map((ingredient, index) => (
            <div
              key={ingredient.localId}
              className="rounded-xl border border-[#edf0eb] bg-[#fcfdfb] p-3 sm:p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-[#81897f]">
                  ZUTAT {index + 1}
                </span>

                <button
                  type="button"
                  onClick={() => removeIngredient(ingredient.localId)}
                  className="flex size-8 items-center justify-center rounded-lg text-[#92998f] transition-colors hover:bg-[#fceceb] hover:text-[#b75b50]"
                  aria-label={`Zutat ${index + 1} entfernen`}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
                <input
                  required
                  value={ingredient.name}
                  onChange={(event) =>
                    updateIngredient(
                      ingredient.localId,
                      "name",
                      event.target.value,
                    )
                  }
                  placeholder="Zutat, z. B. Mehl"
                  aria-label={`Name der Zutat ${index + 1}`}
                  className={inputClass}
                />

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={ingredient.quantity ?? ""}
                  onChange={(event) =>
                    updateIngredient(
                      ingredient.localId,
                      "quantity",
                      event.target.value === ""
                        ? null
                        : Number(event.target.value),
                    )
                  }
                  placeholder="Menge"
                  aria-label={`Menge der Zutat ${index + 1}`}
                  className={inputClass}
                />

                <input
                  value={ingredient.unit}
                  onChange={(event) =>
                    updateIngredient(
                      ingredient.localId,
                      "unit",
                      event.target.value,
                    )
                  }
                  placeholder="Einheit"
                  aria-label={`Einheit der Zutat ${index + 1}`}
                  className={inputClass}
                />
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                <input
                  value={ingredient.notes}
                  onChange={(event) =>
                    updateIngredient(
                      ingredient.localId,
                      "notes",
                      event.target.value,
                    )
                  }
                  placeholder="Hinweis, z. B. fein gehackt"
                  aria-label={`Hinweis zur Zutat ${index + 1}`}
                  className={inputClass}
                />

                <label className="flex items-center gap-2 text-sm text-[#697166]">
                  <input
                    type="checkbox"
                    checked={ingredient.is_optional}
                    onChange={(event) =>
                      updateIngredient(
                        ingredient.localId,
                        "is_optional",
                        event.target.checked,
                      )
                    }
                    className="size-4 accent-[#39734a]"
                  />
                  Optional
                </label>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addIngredient}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#cbdcc9] py-3 text-sm font-semibold text-[#56815c] transition-colors hover:bg-[#f5f9f4]"
        >
          <Plus size={17} />
          Zutat hinzufügen
        </button>
      </section>

      {/* Preparation steps */}
      <section className="space-y-5 rounded-2xl border border-[#e8ece5] bg-white p-5 sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Zubereitung</h2>
            <p className="mt-1 text-sm text-[#81897f]">
              Beschreibt Schritt für Schritt die Zubereitung.
            </p>
          </div>
          <span className="rounded-full bg-[#edf4ed] px-3 py-1 text-xs font-medium text-[#39734a]">
            {steps.length}
          </span>
        </div>

        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={step.localId}
              className="flex gap-3 rounded-xl border border-[#edf0eb] bg-[#fcfdfb] p-3 sm:p-4"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#edf4ed] text-sm font-semibold text-[#39734a]">
                {index + 1}
              </div>

              <textarea
                required
                rows={2}
                value={step.instruction}
                onChange={(event) =>
                  updateStep(step.localId, event.target.value)
                }
                placeholder="Beschreibt diesen Zubereitungsschritt..."
                aria-label={`Zubereitungsschritt ${index + 1}`}
                className="min-w-0 flex-1 resize-y rounded-lg border border-[#e8ece5] bg-white px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-[#a0a69d] focus:border-[#8eaf91] focus:ring-2 focus:ring-[#56815c]/10"
              />

              <button
                type="button"
                onClick={() => removeStep(step.localId)}
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-[#92998f] transition-colors hover:bg-[#fceceb] hover:text-[#b75b50]"
                aria-label={`Schritt ${index + 1} entfernen`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addStep}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#cbdcc9] py-3 text-sm font-semibold text-[#56815c] transition-colors hover:bg-[#f5f9f4]"
        >
          <Plus size={17} />
          Schritt hinzufügen
        </button>
      </section>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-[#f0d2cf] bg-[#fdf2f1] px-4 py-3 text-sm text-[#a94e45]"
        >
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 pb-6 sm:flex-row sm:justify-between">
        <Link
          href={initialRecipe ? `/recipes/${initialRecipe.id}` : "/recipes"}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e8ece5] bg-white px-5 py-3 text-sm font-semibold text-[#697166] transition-colors hover:bg-[#f7f9f6]"
        >
          <ArrowLeft size={16} />
          Abbrechen
        </Link>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#39734a] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#2f623e] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending
            ? "Rezept wird gespeichert..."
            : initialRecipe
              ? "Änderungen speichern"
              : "Rezept speichern"}
        </button>
      </div>
    </form>
  );
}
