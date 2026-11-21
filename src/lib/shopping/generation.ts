import { SHOPPING_CATEGORIES } from "@/lib/shopping/categories";
import { convertQuantity, isValidUnit, type Unit } from "@/lib/units";

type ShoppingCategory = (typeof SHOPPING_CATEGORIES)[number]["value"];

export type ShoppingPreviewItem = {
  key: string;
  name: string;
  quantity: number | null;
  unit: Unit | null;
  category: ShoppingCategory;
};

type IngredientBucket = ShoppingPreviewItem;

type IngredientInput = {
  name: string;
  quantity: number | string | null;
  unit: string | null;
  is_optional?: boolean | null;
};

type StockInput = {
  name: string;
  quantity: number | string | null;
  unit: string | null;
};

function normalizeIngredientName(name: string) {
  return name.trim().toLocaleLowerCase("de-DE").replace(/\s+/g, " ");
}

function getCanonicalUnit(unit: Unit): Unit {
  if (unit === "kg") return "g";
  if (unit === "l") return "ml";
  if (unit === "EL") return "TL";

  return unit;
}

function getCategoryForIngredient(name: string): ShoppingCategory {
  const value = normalizeIngredientName(name);

  const categories: {
    category: ShoppingCategory;
    keywords: string[];
  }[] = [
    {
      category: "obst-gemuese",
      keywords: [
        "tomate",
        "gurke",
        "paprika",
        "zwiebel",
        "knoblauch",
        "kartoffel",
        "karotte",
        "möhre",
        "salat",
        "apfel",
        "banane",
        "zitrone",
        "limette",
        "brokkoli",
        "zucchini",
        "pilz",
        "champignon",
        "spinat",
        "petersilie",
        "basilikum",
      ],
    },
    {
      category: "milchprodukte",
      keywords: [
        "milch",
        "käse",
        "butter",
        "sahne",
        "joghurt",
        "quark",
        "frischkäse",
        "mozzarella",
        "parmesan",
      ],
    },
    {
      category: "fleisch-fisch",
      keywords: [
        "fleisch",
        "hähnchen",
        "hühnchen",
        "pute",
        "rind",
        "schwein",
        "hackfleisch",
        "lachs",
        "fisch",
        "thunfisch",
      ],
    },
    {
      category: "backwaren",
      keywords: [
        "brot",
        "brötchen",
        "toast",
        "mehl",
        "hefe",
        "croissant",
        "baguette",
      ],
    },
    {
      category: "getraenke",
      keywords: ["wasser", "saft", "limonade"],
    },
    {
      category: "tiefkuehl",
      keywords: ["tiefkühl", "tk-"],
    },
  ];

  for (const entry of categories) {
    if (entry.keywords.some((keyword) => value.includes(keyword))) {
      return entry.category;
    }
  }

  return "sonstiges";
}

function addToBucketMap(
  map: Map<string, IngredientBucket>,
  name: string,
  rawQuantity: number | string | null,
  rawUnit: string | null,
  category: ShoppingCategory,
) {
  const normalizedName = normalizeIngredientName(name);

  if (!normalizedName) return;

  // Unbekannte Einheiten dürfen nicht versehentlich verrechnet werden.
  if (rawUnit && !isValidUnit(rawUnit)) return;

  const originalUnit = rawUnit && isValidUnit(rawUnit) ? rawUnit : null;
  const unit = originalUnit ? getCanonicalUnit(originalUnit) : null;

  let quantity: number | null = null;

  if (rawQuantity !== null) {
    const parsedQuantity = Number(rawQuantity);

    if (Number.isFinite(parsedQuantity) && parsedQuantity >= 0) {
      quantity = parsedQuantity;

      if (originalUnit && unit) {
        const converted = convertQuantity(quantity, originalUnit, unit);

        if (converted === null) return;

        quantity = converted;
      }
    }
  }

  const key = `${normalizedName}::${unit ?? ""}`;
  const existing = map.get(key);

  if (!existing) {
    map.set(key, {
      key,
      name: name.trim(),
      quantity,
      unit,
      category,
    });

    return;
  }

  // Sobald eine Menge unbekannt ist, bleibt auch die Gesamtmenge unbekannt.
  if (existing.quantity === null || quantity === null) {
    existing.quantity = null;
  } else {
    existing.quantity += quantity;
  }
}

export function buildShoppingListPreviewFromData(
  ingredients: readonly IngredientInput[],
  pantryItems: readonly StockInput[],
  shoppingItems: readonly StockInput[],
): ShoppingPreviewItem[] {
  const required = new Map<string, IngredientBucket>();
  const pantry = new Map<string, IngredientBucket>();
  const shopping = new Map<string, IngredientBucket>();

  for (const ingredient of ingredients) {
    if (ingredient.is_optional) continue;

    addToBucketMap(
      required,
      ingredient.name,
      ingredient.quantity,
      ingredient.unit,
      getCategoryForIngredient(ingredient.name),
    );
  }

  for (const item of pantryItems) {
    addToBucketMap(pantry, item.name, item.quantity, item.unit, "sonstiges");
  }

  for (const item of shoppingItems) {
    addToBucketMap(shopping, item.name, item.quantity, item.unit, "sonstiges");
  }

  const preview: ShoppingPreviewItem[] = [];

  for (const ingredient of required.values()) {
    const pantryItem = pantry.get(ingredient.key);
    const shoppingItem = shopping.get(ingredient.key);

    // Ein bereits vorhandener Einkaufsartikel ohne Menge wird nicht dupliziert.
    if (shoppingItem?.quantity === null) continue;

    if (ingredient.quantity === null) {
      if (shoppingItem) continue;

      preview.push(ingredient);
      continue;
    }

    const pantryQuantity = pantryItem?.quantity ?? 0;
    const shoppingQuantity = shoppingItem?.quantity ?? 0;

    const remaining = ingredient.quantity - pantryQuantity - shoppingQuantity;

    if (remaining <= 0.000001) continue;

    preview.push({
      ...ingredient,
      quantity: Number(remaining.toFixed(3)),
    });
  }

  return preview;
}
