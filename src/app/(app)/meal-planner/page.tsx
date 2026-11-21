import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getHousehold } from "@/lib/supabase/household";
import MealPlanner from "@/components/meal-planner/meal-planner";

type Props = {
  searchParams: Promise<{
    week?: string;
  }>;
};

function getMonday(date: Date) {
  const monday = new Date(date);
  const day = monday.getUTCDay();

  monday.setUTCDate(monday.getUTCDate() - (day === 0 ? 6 : day - 1));

  return monday.toISOString().slice(0, 10);
}

function isValidMonday(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;

  const parsed = new Date(`${date}T00:00:00.000Z`);

  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === date &&
    parsed.getUTCDay() === 1
  );
}

export default async function MealPlannerPage({ searchParams }: Props) {
  await connection();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const household = await getHousehold();

  if (!household) redirect("/onboarding");

  const { week } = await searchParams;

  const weekStart = week && isValidMonday(week) ? week : getMonday(new Date());

  const [planResult, recipesResult] = await Promise.all([
    supabase
      .from("meal_plans")
      .select("id")
      .eq("household_id", household.id)
      .eq("week_start", weekStart)
      .maybeSingle(),

    supabase
      .from("recipes")
      .select("id, title, image_url, prep_time_minutes, cook_time_minutes")
      .eq("household_id", household.id)
      .order("title", { ascending: true }),
  ]);

  if (planResult.error) {
    console.error("Meal plan could not be loaded:", planResult.error.message);
  }

  if (recipesResult.error) {
    console.error("Recipes could not be loaded:", recipesResult.error.message);
  }

  let plannedMeals: {
    id: string;
    date: string;
    meal_type: "lunch" | "dinner";
    recipe: {
      id: string;
      title: string;
      image_url: string | null;
      prep_time_minutes: number | null;
      cook_time_minutes: number | null;
    } | null;
  }[] = [];

  if (planResult.data) {
    const { data, error } = await supabase
      .from("planned_meals")
      .select(
        `
        id,
        date,
        meal_type,
        recipe:recipes (
          id,
          title,
          image_url,
          prep_time_minutes,
          cook_time_minutes
        )
      `,
      )
      .eq("meal_plan_id", planResult.data.id)
      .order("date");

    if (error) {
      console.error("Planned meals could not be loaded:", error.message);
    } else {
      plannedMeals = (data ?? []).map((meal) => {
        const recipeData: unknown = meal.recipe;

        const recipe = Array.isArray(recipeData) ? recipeData[0] : recipeData;

        return {
          id: meal.id,
          date: meal.date,
          meal_type: meal.meal_type as "lunch" | "dinner",
          recipe:
            recipe && typeof recipe === "object" && "id" in recipe
              ? (recipe as {
                  id: string;
                  title: string;
                  image_url: string | null;
                  prep_time_minutes: number | null;
                  cook_time_minutes: number | null;
                })
              : null,
        };
      });
    }
  }

  return (
    <MealPlanner
      weekStart={weekStart}
      plannedMeals={plannedMeals}
      recipes={recipesResult.data ?? []}
    />
  );
}
