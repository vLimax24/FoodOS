export const SHOPPING_CATEGORIES = [
  { value: "obst-gemuese", label: "Obst & Gemüse", emoji: "🥦" },
  { value: "milchprodukte", label: "Milchprodukte", emoji: "🥛" },
  { value: "fleisch-fisch", label: "Fleisch & Fisch", emoji: "🥩" },
  { value: "backwaren", label: "Backwaren", emoji: "🥖" },
  { value: "getraenke", label: "Getränke", emoji: "🥤" },
  { value: "tiefkuehl", label: "Tiefkühlprodukte", emoji: "🧊" },
  { value: "haushalt", label: "Haushalt", emoji: "🧽" },
  { value: "sonstiges", label: "Sonstiges", emoji: "📦" },
] as const;

export type ShoppingCategory = (typeof SHOPPING_CATEGORIES)[number]["value"];
