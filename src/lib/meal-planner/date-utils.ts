export type MealType = "lunch" | "dinner";

export function isValidDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;

  const parsed = new Date(`${date}T00:00:00.000Z`);

  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === date
  );
}

export function getWeekStart(date: string): string {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  const day = parsed.getUTCDay();

  parsed.setUTCDate(parsed.getUTCDate() - (day === 0 ? 6 : day - 1));

  return parsed.toISOString().slice(0, 10);
}

export function isMealTypeAllowed(date: string, mealType: MealType): boolean {
  const day = new Date(`${date}T00:00:00.000Z`).getUTCDay();

  // Montag bis Freitag: nur Abendessen
  if (day >= 1 && day <= 5) {
    return mealType === "dinner";
  }

  // Samstag und Sonntag: Mittag- und Abendessen
  return mealType === "lunch" || mealType === "dinner";
}

export function isValidWeekStart(date: string): boolean {
  return (
    isValidDate(date) && new Date(`${date}T00:00:00.000Z`).getUTCDay() === 1
  );
}
