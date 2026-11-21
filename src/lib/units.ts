export const UNITS = [
  {
    label: "Gewicht",
    options: [
      { value: "g", label: "Gramm (g)" },
      { value: "kg", label: "Kilogramm (kg)" },
    ],
  },
  {
    label: "Volumen",
    options: [
      { value: "ml", label: "Milliliter (ml)" },
      { value: "l", label: "Liter (l)" },
    ],
  },
  {
    label: "Löffel",
    options: [
      { value: "TL", label: "Teelöffel (TL)" },
      { value: "EL", label: "Esslöffel (EL)" },
    ],
  },
  {
    label: "Stück und Verpackungen",
    options: [
      { value: "Stück", label: "Stück" },
      { value: "Packung", label: "Packung" },
      { value: "Dose", label: "Dose" },
      { value: "Flasche", label: "Flasche" },
      { value: "Bund", label: "Bund" },
      { value: "Zehe", label: "Zehe" },
      { value: "Scheibe", label: "Scheibe" },
    ],
  },
  {
    label: "Sonstiges",
    options: [{ value: "Prise", label: "Prise" }],
  },
] as const;

export type Unit = (typeof UNITS)[number]["options"][number]["value"];

type UnitOption = {
  value: Unit;
  label: string;
};

export const UNIT_OPTIONS: UnitOption[] = UNITS.flatMap((group) =>
  group.options.map(
    (unit): UnitOption => ({
      value: unit.value,
      label: unit.label,
    }),
  ),
);

export function isValidUnit(value: string): value is Unit {
  return UNIT_OPTIONS.some((unit) => unit.value === value);
}

type UnitConversion = {
  dimension: "weight" | "volume" | "spoon";
  factor: number;
};

const UNIT_CONVERSIONS: Partial<Record<Unit, UnitConversion>> = {
  g: { dimension: "weight", factor: 1 },
  kg: { dimension: "weight", factor: 1000 },

  ml: { dimension: "volume", factor: 1 },
  l: { dimension: "volume", factor: 1000 },

  TL: { dimension: "spoon", factor: 1 },
  EL: { dimension: "spoon", factor: 3 },
};

export function convertQuantity(
  quantity: number,
  from: Unit,
  to: Unit,
): number | null {
  if (from === to) return quantity;

  const source = UNIT_CONVERSIONS[from];
  const target = UNIT_CONVERSIONS[to];

  if (!source || !target) return null;
  if (source.dimension !== target.dimension) return null;

  return (quantity * source.factor) / target.factor;
}
