import { describe, expect, it } from "vitest";
import { UNITS, UNIT_OPTIONS, isValidUnit, convertQuantity } from "@/lib/units";

describe("isValidUnit", () => {
  it("accepts all defined units", () => {
    for (const group of UNITS) {
      for (const unit of group.options) {
        expect(isValidUnit(unit.value)).toBe(true);
      }
    }
  });

  it("rejects unknown units", () => {
    expect(isValidUnit("Liter")).toBe(false);
    expect(isValidUnit("invalid")).toBe(false);
    expect(isValidUnit("")).toBe(false);
  });
});

describe("UNIT_OPTIONS", () => {
  it("contains all units from UNITS", () => {
    const expectedCount = UNITS.reduce(
      (count, group) => count + group.options.length,
      0,
    );

    expect(UNIT_OPTIONS).toHaveLength(expectedCount);
  });
});

describe("convertQuantity", () => {
  it("converts between weight units", () => {
    expect(convertQuantity(2, "kg", "g")).toBe(2000);
    expect(convertQuantity(500, "g", "kg")).toBe(0.5);
  });

  it("converts between volume units", () => {
    expect(convertQuantity(2, "l", "ml")).toBe(2000);
    expect(convertQuantity(500, "ml", "l")).toBe(0.5);
  });

  it("converts between spoon units", () => {
    expect(convertQuantity(1, "EL", "TL")).toBe(3);
    expect(convertQuantity(3, "TL", "EL")).toBe(1);
  });

  it("returns the same quantity for identical units", () => {
    expect(convertQuantity(250, "g", "g")).toBe(250);
    expect(convertQuantity(2, "Stück", "Stück")).toBe(2);
  });

  it("does not convert incompatible dimensions", () => {
    expect(convertQuantity(1, "kg", "l")).toBeNull();
    expect(convertQuantity(1, "g", "Stück")).toBeNull();
    expect(convertQuantity(1, "EL", "ml")).toBeNull();
  });

  it("does not convert units without a defined conversion", () => {
    expect(convertQuantity(2, "Stück", "Packung")).toBeNull();
    expect(convertQuantity(2, "Dose", "Flasche")).toBeNull();
  });
});
