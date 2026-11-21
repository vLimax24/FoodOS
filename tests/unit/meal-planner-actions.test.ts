import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MealType } from "@/lib/meal-planner/date-utils";

const { createClientMock, getHouseholdMock, revalidatePathMock } = vi.hoisted(
  () => ({
    createClientMock: vi.fn(),
    getHouseholdMock: vi.fn(),
    revalidatePathMock: vi.fn(),
  }),
);

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));

vi.mock("@/lib/supabase/household", () => ({
  getHousehold: getHouseholdMock,
}));

import {
  addPlannedMeal,
  deletePlannedMeal,
} from "@/app/(app)/meal-planner/actions";

describe("addPlannedMeal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects an invalid date", async () => {
    const result = await addPlannedMeal("2026-02-30", "dinner", "recipe-1");

    expect(result).toEqual({
      success: false,
      error: "Ungültiges Datum.",
    });

    expect(createClientMock).not.toHaveBeenCalled();
  });

  it("rejects lunch from Monday to Friday", async () => {
    const result = await addPlannedMeal("2026-11-16", "lunch", "recipe-1");

    expect(result.success).toBe(false);
    expect(result.error).toBe(
      "An diesem Wochentag ist diese Mahlzeit nicht erlaubt.",
    );

    expect(createClientMock).not.toHaveBeenCalled();
  });

  it("rejects an invalid meal type", async () => {
    const result = await addPlannedMeal(
      "2026-11-16",
      "breakfast" as MealType,
      "recipe-1",
    );

    expect(result).toEqual({
      success: false,
      error: "Ungültige Mahlzeit.",
    });

    expect(createClientMock).not.toHaveBeenCalled();
  });

  it("rejects an empty recipe ID", async () => {
    const result = await addPlannedMeal("2026-11-16", "dinner", "");

    expect(result).toEqual({
      success: false,
      error: "Bitte wähle ein Rezept aus.",
    });

    expect(createClientMock).not.toHaveBeenCalled();
  });
});

describe("deletePlannedMeal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects an empty meal ID", async () => {
    const result = await deletePlannedMeal("");

    expect(result).toEqual({
      success: false,
      error: "Ungültige Mahlzeit.",
    });

    expect(createClientMock).not.toHaveBeenCalled();
  });
});
