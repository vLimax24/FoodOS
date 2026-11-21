import { describe, expect, it } from "vitest";
import {
  getWeekStart,
  isMealTypeAllowed,
  isValidDate,
  isValidWeekStart,
} from "@/lib/meal-planner/date-utils";

describe("isValidDate", () => {
  it("accepts valid dates", () => {
    expect(isValidDate("2026-11-21")).toBe(true);
    expect(isValidDate("2024-02-29")).toBe(true);
  });

  it("rejects invalid dates", () => {
    expect(isValidDate("2025-02-29")).toBe(false);
    expect(isValidDate("2026-13-01")).toBe(false);
    expect(isValidDate("2026-04-31")).toBe(false);
    expect(isValidDate("21.11.2026")).toBe(false);
    expect(isValidDate("")).toBe(false);
  });
});

describe("getWeekStart", () => {
  it("returns the Monday of the given week", () => {
    expect(getWeekStart("2026-11-16")).toBe("2026-11-16");
    expect(getWeekStart("2026-11-18")).toBe("2026-11-16");
    expect(getWeekStart("2026-11-21")).toBe("2026-11-16");
    expect(getWeekStart("2026-11-22")).toBe("2026-11-16");
  });

  it("handles month and year boundaries", () => {
    expect(getWeekStart("2027-01-01")).toBe("2026-12-28");
  });
});

describe("isMealTypeAllowed", () => {
  it("allows only dinner from Monday to Friday", () => {
    expect(isMealTypeAllowed("2026-11-16", "dinner")).toBe(true);
    expect(isMealTypeAllowed("2026-11-16", "lunch")).toBe(false);
    expect(isMealTypeAllowed("2026-11-20", "dinner")).toBe(true);
    expect(isMealTypeAllowed("2026-11-20", "lunch")).toBe(false);
  });

  it("allows lunch and dinner on weekends", () => {
    expect(isMealTypeAllowed("2026-11-21", "lunch")).toBe(true);
    expect(isMealTypeAllowed("2026-11-21", "dinner")).toBe(true);
    expect(isMealTypeAllowed("2026-11-22", "lunch")).toBe(true);
    expect(isMealTypeAllowed("2026-11-22", "dinner")).toBe(true);
  });
});

describe("isValidWeekStart", () => {
  it("accepts valid Mondays", () => {
    expect(isValidWeekStart("2026-11-16")).toBe(true);
    expect(isValidWeekStart("2026-11-23")).toBe(true);
  });

  it("rejects dates that are not Mondays", () => {
    expect(isValidWeekStart("2026-11-17")).toBe(false);
    expect(isValidWeekStart("2026-11-21")).toBe(false);
  });

  it("rejects invalid dates", () => {
    expect(isValidWeekStart("2026-02-30")).toBe(false);
  });
});
