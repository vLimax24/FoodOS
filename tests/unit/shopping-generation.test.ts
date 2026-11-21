import { describe, expect, it } from "vitest";
import { buildShoppingListPreviewFromData } from "@/lib/shopping/generation";

describe("buildShoppingListPreviewFromData", () => {
  it("combines ingredients with the same name and unit", () => {
    const result = buildShoppingListPreviewFromData(
      [
        { name: "Tomaten", quantity: 200, unit: "g" },
        { name: "Tomaten", quantity: 300, unit: "g" },
      ],
      [],
      [],
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      name: "Tomaten",
      quantity: 500,
      unit: "g",
    });
  });

  it("combines quantities with convertible units", () => {
    const result = buildShoppingListPreviewFromData(
      [
        { name: "Mehl", quantity: 1, unit: "kg" },
        { name: "Mehl", quantity: 500, unit: "g" },
      ],
      [],
      [],
    );

    expect(result).toHaveLength(1);
    expect(result[0].quantity).toBe(1500);
    expect(result[0].unit).toBe("g");
  });

  it("ignores optional ingredients", () => {
    const result = buildShoppingListPreviewFromData(
      [
        { name: "Salz", quantity: 1, unit: "Prise", is_optional: true },
        { name: "Pfeffer", quantity: 2, unit: "Prise", is_optional: false },
      ],
      [],
      [],
    );

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Pfeffer");
  });

  it("subtracts pantry and existing shopping list quantities", () => {
    const result = buildShoppingListPreviewFromData(
      [{ name: "Nudeln", quantity: 1000, unit: "g" }],
      [{ name: "Nudeln", quantity: 200, unit: "g" }],
      [{ name: "Nudeln", quantity: 300, unit: "g" }],
    );

    expect(result).toHaveLength(1);
    expect(result[0].quantity).toBe(500);
  });

  it("does not include ingredients that are already sufficiently available", () => {
    const result = buildShoppingListPreviewFromData(
      [{ name: "Milch", quantity: 1, unit: "l" }],
      [{ name: "Milch", quantity: 500, unit: "ml" }],
      [{ name: "Milch", quantity: 500, unit: "ml" }],
    );

    expect(result).toHaveLength(0);
  });

  it("does not combine incompatible units", () => {
    const result = buildShoppingListPreviewFromData(
      [
        { name: "Milch", quantity: 1, unit: "l" },
        { name: "Milch", quantity: 200, unit: "g" },
      ],
      [],
      [],
    );

    expect(result).toHaveLength(2);
  });

  it("does not add an ingredient that is already on the shopping list without a quantity", () => {
    const result = buildShoppingListPreviewFromData(
      [{ name: "Eier", quantity: 10, unit: "Stück" }],
      [],
      [{ name: "Eier", quantity: null, unit: "Stück" }],
    );

    expect(result).toHaveLength(0);
  });

  it("keeps ingredients without a quantity when they are not already on the list", () => {
    const result = buildShoppingListPreviewFromData(
      [{ name: "Salz", quantity: null, unit: null }],
      [],
      [],
    );

    expect(result).toHaveLength(1);
    expect(result[0].quantity).toBeNull();
  });

  it("normalizes names regardless of capitalization and whitespace", () => {
    const result = buildShoppingListPreviewFromData(
      [{ name: "  TOMATEN  ", quantity: 500, unit: "g" }],
      [{ name: "tomaten", quantity: 200, unit: "g" }],
      [],
    );

    expect(result).toHaveLength(1);
    expect(result[0].quantity).toBe(300);
  });

  it("does not include ingredients with unknown units", () => {
    const result = buildShoppingListPreviewFromData(
      [{ name: "Mehl", quantity: 500, unit: "Schaufel" }],
      [],
      [],
    );

    expect(result).toHaveLength(0);
  });
});
