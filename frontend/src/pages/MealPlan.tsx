import { useEffect, useState } from "react";
import { Card, PageHeader, LoadingSkeleton, EmptyState } from "../components";
import { api } from "../api/client";
import type { WeeklyPlan } from "../types/api";

export default function MealPlan() {
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPlan()
      .then((r) => setPlan(r.plan))
      .catch(() => setPlan(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <PageHeader title="Meal Plan" subtitle="Your personalised nutrition plan" />
        <Card><LoadingSkeleton lines={8} /></Card>
      </>
    );
  }

  if (!plan) {
    return (
      <>
        <PageHeader title="Meal Plan" />
        <Card>
          <EmptyState
            title="No meal plan yet"
            message="Generate your plan from the Dashboard first."
          />
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Meal Plan"
        subtitle="Your personalised nutrition plan"
      />

      {plan.mealPlan?.map((day) => (
        <Card key={day.day} title={`Day ${day.day}`}>
          <p
            style={{
              color: "var(--color-text-muted)",
              marginBottom: "var(--space-4)",
            }}
          >
            {day.totalCalories} kcal · {day.totalProteinG}g protein
          </p>

          <div style={{ display: "grid", gap: "var(--space-3)" }}>
            {(day.meals ?? []).map((meal, index) => (
              <div
                key={`${meal.name}-${index}`}
                style={{
                  padding: "var(--space-4)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--r-md)",
                }}
              >
                <strong>{meal.slot}</strong>
                <div style={{ marginTop: "var(--space-1)" }}>
                  {meal.name}
                </div>
                <div
                  style={{
                    marginTop: "var(--space-1)",
                    color: "var(--color-text-muted)",
                    fontSize: "var(--text-sm)",
                  }}
                >
                  {meal.calories} kcal · {meal.proteinG}g protein
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </>
  );
}
