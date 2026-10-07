import { useEffect, useState } from "react";
import {
  Card,
  PageHeader,
  LoadingSkeleton,
  EmptyState,
} from "../components";
import { api } from "../api/client";
import type { WeeklyPlan, Meal } from "../types/api";
import "./MealPlan.css";

type Recipe = {
  name: string;
  ingredients: string[];
  steps: string[];
  prepMinutes: number;
};

function getSlotClass(slot: string): string {
  const lower = slot.toLowerCase();
  if (lower.includes("breakfast")) return "breakfast";
  if (lower.includes("lunch")) return "lunch";
  if (lower.includes("dinner")) return "dinner";
  return "snack";
}

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
    <PageHeader
      title="Meal Plan"
      subtitle="Your personalised nutrition plan"
    />
  );

  if (loading) {
    return (
      <div className="fp-meal-page">
        {header}
        <Card>
          <LoadingSkeleton lines={8} />
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fp-meal-page">
        {header}
        <Card>
          <EmptyState
            title="Couldn't load your meal plan"
            message="Something went wrong fetching your plan. Please refresh and try again."
          />
        </Card>
      </div>
    );
  }

  if (!plan?.mealPlan?.length) {
    return (
      <div className="fp-meal-page">
        {header}
        <Card>
          <EmptyState
            title="No meal plan yet"
            message="Generate your plan from Dashboard first."
          />
        </Card>
      </div>
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
    <div className="fp-meal-page">
      {header}

      {/* KPI Stats Bar */}
      <section className="fp-meal-stats">
        <article className="fp-meal-stat-tile">
          <div className="fp-meal-stat-icon orange">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 2c1.5 3.2 5.5 5.3 5.5 10a5.5 5.5 0 1 1-11 0c0-2.7 1.4-4.7 3.2-6.3.1 2 1.1 3.1 2.3 3.8.2-2.4-.2-4.4 0-7.5Z" />
            </svg>
          </div>
          <div className="fp-meal-stat-copy">
            <span>Avg Daily Calories</span>
            <strong>
              {avgCalories}
              <small>kcal</small>
            </strong>
          </div>
        </article>

        <article className="fp-meal-stat-tile">
          <div className="fp-meal-stat-icon blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="fp-meal-stat-copy">
            <span>Avg Daily Protein</span>
            <strong>
              {avgProtein}
              <small>g</small>
            </strong>
          </div>
        </article>

        <article className="fp-meal-stat-tile">
          <div className="fp-meal-stat-icon purple">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10M17 3v18M14 3v7h6" />
            </svg>
          </div>
          <div className="fp-meal-stat-copy">
            <span>Meals per Day</span>
            <strong>
              {avgMeals}
              <small>meals</small>
            </strong>
          </div>
        </article>
      </section>

      {/* Days & Meals List */}
      <section className="fp-meal-days-list">
        {days.map((day) => (
          <article className="fp-meal-day-card" key={day.day}>
            <div className="fp-meal-day-header">
              <div className="fp-meal-day-title">
                <span className="fp-meal-day-badge">D{day.day}</span>
                <h2>Day {day.day}</h2>
              </div>

              <div className="fp-meal-day-summary">
                <span className="fp-meal-macro-badge">
                  Total: <strong>{day.totalCalories} kcal</strong>
                </span>
                <span className="fp-meal-macro-badge">
                  Protein: <strong>{day.totalProteinG}g</strong>
                </span>
              </div>
            </div>

            <div className="fp-meal-grid">
              {(day.meals ?? []).map((meal) => {
                const key = `${day.day}-${meal.slot}-${meal.name}`;
                const recipe = recipes[key];
                const isLoading = recipeLoading === key;
                const slotClass = getSlotClass(meal.slot);

                return (
                  <div key={key} className="fp-meal-card">
                    <div className="fp-meal-card-top">
                      <span className={`fp-meal-slot ${slotClass}`}>
                        {meal.slot}
                      </span>
                    </div>

                    <h3>{meal.name}</h3>

                    <div className="fp-meal-macros-row">
                      <span className="fp-meal-macro-pill">
                        <strong>{meal.calories}</strong> kcal
                      </span>
                      <span className="fp-meal-macro-pill">
                        <strong>{meal.proteinG}g</strong> protein
                      </span>
                    </div>

                    <button
                      type="button"
                      className="fp-recipe-btn"
                      onClick={() => handleRecipe(meal, key)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        "Generating..."
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12h14" />
                          </svg>
                          Get Recipe
                        </>
                      )}
                    </button>

                    {recipe && (
                      <div className="fp-recipe-card">
                        <div className="fp-recipe-header">
                          <h4>{recipe.name}</h4>
                          <span className="fp-recipe-prep-time">
                            Prep: {recipe.prepMinutes} min
                          </span>
                        </div>

                        <span className="fp-recipe-section-title">Ingredients</span>
                        <ul className="fp-recipe-ingredients-list">
                          {recipe.ingredients.map((item, index) => (
                            <li key={`${item}-${index}`}>{item}</li>
                          ))}
                        </ul>

                        <span className="fp-recipe-section-title">Steps</span>
                        <ol className="fp-recipe-steps-list">
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
          </article>
        ))}
      </section>
    </div>
  );
}
