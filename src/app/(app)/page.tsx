import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getHousehold } from "@/lib/supabase/household";
import HomeDashboard from "@/components/home/home-dashboard";
import { getWeekStart } from "@/lib/meal-planner/date-utils";

function getTodayInBerlin() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

async function HomePageContent() {
  await connection();

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const household = await getHousehold();

  if (!household) {
    redirect("/onboarding");
  }

  const [shoppingResult, pantryResult, recipesResult] = await Promise.all([
    supabase
      .from("shopping_items")
      .select("id, name, quantity, unit, is_completed", { count: "exact" })
      .eq("household_id", household.id)
      .eq("is_completed", false)
      .order("created_at", { ascending: false })
      .limit(3),

    supabase
      .from("pantry_items")
      .select("id, name, quantity, unit, min_quantity, category")
      .eq("household_id", household.id)
      .order("updated_at", { ascending: false }),

    supabase
      .from("recipes")
      .select(
        "id, title, image_url, category, servings, prep_time_minutes, cook_time_minutes, difficulty, created_at",
        { count: "exact" },
      )
      .eq("household_id", household.id)
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  const today = getTodayInBerlin();
  const weekStart = getWeekStart(today);

  const mealPlanResult = await supabase
    .from("meal_plans")
    .select("id")
    .eq("household_id", household.id)
    .eq("week_start", weekStart)
    .maybeSingle();

  let todayMeals: {
    id: string;
    mealType: "lunch" | "dinner";
    recipe: {
      id: string;
      title: string;
      image_url: string | null;
      prep_time_minutes: number | null;
      cook_time_minutes: number | null;
    };
  }[] = [];

  if (mealPlanResult.error) {
    console.error(
      "Meal plan could not be loaded:",
      mealPlanResult.error.message,
    );
  } else if (mealPlanResult.data) {
    const plannedMealsResult = await supabase
      .from("planned_meals")
      .select("id, meal_type, recipe_id")
      .eq("meal_plan_id", mealPlanResult.data.id)
      .eq("date", today);

    if (plannedMealsResult.error) {
      console.error(
        "Today's meals could not be loaded:",
        plannedMealsResult.error.message,
      );
    } else if (plannedMealsResult.data.length > 0) {
      const recipeIds = plannedMealsResult.data.map((meal) => meal.recipe_id);

      const recipesForTodayResult = await supabase
        .from("recipes")
        .select("id, title, image_url, prep_time_minutes, cook_time_minutes")
        .eq("household_id", household.id)
        .in("id", recipeIds);

      if (recipesForTodayResult.error) {
        console.error(
          "Today's recipes could not be loaded:",
          recipesForTodayResult.error.message,
        );
      } else {
        const recipesById = new Map(
          recipesForTodayResult.data.map((recipe) => [recipe.id, recipe]),
        );

        todayMeals = plannedMealsResult.data.flatMap((meal) => {
          const recipe = recipesById.get(meal.recipe_id);

          if (!recipe) return [];

          return [
            {
              id: meal.id,
              mealType: meal.meal_type,
              recipe,
            },
          ];
        });
      }
    }
  }

  if (shoppingResult.error) {
    console.error(
      "Shopping items could not be loaded:",
      shoppingResult.error.message,
    );
  }

  if (pantryResult.error) {
    console.error(
      "Pantry items could not be loaded:",
      pantryResult.error.message,
    );
  }

  if (recipesResult.error) {
    console.error("Recipes could not be loaded:", recipesResult.error.message);
  }

  const pantryItems = pantryResult.data ?? [];

  const lowStockCount = pantryItems.filter((item) => {
    if (item.min_quantity === null) return false;
    return item.quantity <= item.min_quantity;
  }).length;

  const metadataName =
    user.user_metadata?.full_name ?? user.user_metadata?.name;

  const userName =
    typeof metadataName === "string" && metadataName.trim()
      ? metadataName.trim()
      : (user.email?.split("@")[0] ?? "FoodOS");

  return (
    <HomeDashboard
      householdName={household.name}
      userName={userName}
      shoppingItemCount={shoppingResult.count ?? 0}
      shoppingItems={shoppingResult.data ?? []}
      pantryItemCount={pantryItems.length}
      lowStockCount={lowStockCount}
      pantryItems={pantryItems.slice(0, 4)}
      recipeCount={recipesResult.count ?? 0}
      latestRecipe={recipesResult.data?.[0] ?? null}
      todayMeals={todayMeals}
    />
  );
}

export default function HomePage() {
  return <HomePageContent />;
}
