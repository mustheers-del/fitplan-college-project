import { useEffect, useState } from "react";
import {
  Card,
  PageHeader,
  LoadingSkeleton,
  EmptyState,
  StatTile,
} from "../components";
import { api } from "../api/client";
import type { WeeklyPlan, Meal } from "../types/api";

type Recipe = {
  name: string;
  ingredients: string[];
  steps: string[];
  prepMinutes: number;
};

export default function MealPlan() {
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [recipeLoading, setRecipeLoading] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<Record<string, Recipe>>({});

  useEffect(() => {
    api
      .getPlan()
      .then((r) => setPlan(r.plan))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const header = (
    <PageHeader title="Meal Plan" subtitle="Your personalised nutrition plan" />
  );

  if (loading) {
    return (
      <>
        {header}
        <Card>
          <LoadingSkeleton lines={8} />
        </Card>
      </>
    );
  }

  if (error) {
    return (
      <>
        {header}
        <Card>
          <EmptyState
            title="Couldn't load your meal plan"
            message="Something went wrong fetching your plan. Please refresh and try again."
          />
        </Card>
      </>
    );
  }

  if (!plan?.mealPlan?.length) {
    return (
      <>
        {header}
        <Card>
          <EmptyState
            title="No meal plan yet"
            message="Generate your plan from Dashboard first."
          />
        </Card>
      </>
    );
  }

  const days = plan.mealPlan;
  const avg = (total: number) => Math.round(total / days.length);

  const avgCalories = avg(days.reduce((sum, d) => sum + d.totalCalories, 0));
  const avgProtein = avg(days.reduce((sum, d) => sum + d.totalProteinG, 0));
  const avgMeals = avg(
    days.reduce((sum, d) => sum + (d.meals?.length ?? 0), 0),
  );

  const handleRecipe = async (meal: Meal, key: string) => {
    setRecipeLoading(key);

    try {
      const recipe = await api.generateRecipe(meal.name, meal.ingredients);
      setRecipes((current) => ({ ...current, [key]: recipe }));
    } catch {
      alert("Could not generate recipe. Please try again.");
    } finally {
      setRecipeLoading(null);
    }
  };

  return (
    <>
      {header}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: "var(--space-4)",
          marginBottom: "var(--space-6)",
        }}
      >
        <StatTile label="Avg daily calories" value={avgCalories} unit="kcal" />
        <StatTile label="Avg daily protein" value={avgProtein} unit="g" />
        <StatTile label="Meals per day" value={avgMeals} />
      </div>

      <div style={{ display: "grid", gap: "var(--space-5)" }}>
        {days.map((day) => (
          <Card key={day.day} title={`Day ${day.day}`}>
            <p
              style={{
                color: "var(--color-text-muted)",
                marginBottom: "var(--space-4)",
              }}
            >
              {day.totalCalories} kcal · {day.totalProteinG}g protein
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: "var(--space-4)",
              }}
            >
              {(day.meals ?? []).map((meal) => {
                const key = `${day.day}-${meal.slot}-${meal.name}`;
                const recipe = recipes[key];
                const isLoading = recipeLoading === key;

                return (
                  <div
                    key={key}
                    style={{
                      padding: "var(--space-4)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--r-md)",
                    }}
                  >
                    <small
                      style={{
                        color: "var(--color-text-muted)",
                        textTransform: "capitalize",
                      }}
                    >
                      {meal.slot}
                    </small>

                    <h3 style={{ margin: "var(--space-2) 0" }}>
                      {meal.name}
                    </h3>

                    <p style={{ color: "var(--color-text-muted)" }}>
                      {meal.calories} kcal · {meal.proteinG}g protein
                    </p>

                    <button
                      onClick={() => handleRecipe(meal, key)}
                      disabled={isLoading}
                      style={{
                        marginTop: "var(--space-3)",
                        padding: "8px 12px",
                        border: "none",
                        borderRadius: "var(--r-md)",
                        cursor: isLoading ? "default" : "pointer",
                      }}
                    >
                      {isLoading ? "Generating..." : "Get Recipe"}
                    </button>

                    {recipe && (
                      <div style={{ marginTop: "var(--space-4)" }}>
                        <h4>{recipe.name}</h4>

                        <p>
                          <strong>Prep time:</strong> {recipe.prepMinutes} min
                        </p>

                        <strong>Ingredients</strong>
                        <ul>
                          {recipe.ingredients.map((item, index) => (
                            <li key={`${item}-${index}`}>{item}</li>
                          ))}
                        </ul>

                        <strong>Steps</strong>
                        <ol>
                          {recipe.steps.map((step, index) => (
                            <li key={`${step}-${index}`}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
