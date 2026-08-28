import { useEffect, useState } from "react";
import { api, ApiRequestError } from "@/api/client";
import Card from "@/components/Card";
import type { WeeklyPlan } from "@/types/api";

export default function Dashboard() {
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadPlan() {
    try {
      setLoading(true);
      setError(null);

      const response = await api.getPlan();
      setPlan(response.plan);
    } catch (err) {
      console.error(err);

      // A 404 means the user does not have a plan yet.
      // This is not a real error, so show the Generate My Plan button.
      if (err instanceof ApiRequestError && err.status === 404) {
        setPlan(null);
        setError(null);
      } else {
        setError(
          err instanceof Error ? err.message : "Unable to load your plan.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPlan();
  }, []);

  async function handleGenerate() {
    try {
      setGenerating(true);
      setError(null);

      const response = await api.generatePlan({ force: true });
      setPlan(response.plan);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to generate your plan.",
      );
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <div style={{ display: "grid", gap: "24px" }}>
        <div>
          <h1 style={{ margin: 0 }}>Good morning</h1>
          <p style={{ color: "var(--c-text-secondary)" }}>
            Loading your personalised fitness plan...
          </p>
        </div>

        <Card>
          <p>Loading plan...</p>
        </Card>
      </div>
    );
  }

  const workoutDays =
    plan?.workoutPlan?.filter((day) => !day.isRestDay).length ?? 0;

  const totalMeals =
    plan?.mealPlan?.reduce(
      (total, day) => total + (day.meals?.length ?? 0),
      0,
    ) ?? 0;

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      <div>
        <h1
          style={{
            margin: 0,
            fontSize: "32px",
            fontWeight: 700,
          }}
        >
          Good morning
        </h1>

        <p
          style={{
            marginTop: "8px",
            color: "var(--c-text-secondary)",
          }}
        >
          Here is your personalised FitPlan for this week.
        </p>
      </div>

      {error && (
        <Card>
          <div
            style={{
              padding: "4px",
              color: "var(--c-danger, #dc2626)",
            }}
          >
            {error}
          </div>
        </Card>
      )}

      {plan && (
        <>
          {plan.generationSource === "fallback" && (
            <Card>
              <div
                style={{
                  padding: "4px",
                  color: "var(--c-warning, #b45309)",
                }}
              >
                <strong>Using starter plan</strong>
                <p style={{ marginBottom: 0 }}>
                  AI plan generation is temporarily unavailable because the
                  OpenRouter usage/rate limit has been reached. Your current
                  FitPlan is still available and can be regenerated when the
                  limit resets.
                </p>
              </div>
            </Card>
          )}

          {plan.coachNote && (
            <Card title="Coach Note">
              <p style={{ margin: 0 }}>{plan.coachNote}</p>
            </Card>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "16px",
            }}
          >
            <Card title="Workout Days">
              <div style={{ fontSize: "30px", fontWeight: 700 }}>
                {workoutDays}
              </div>
              <p style={{ color: "var(--c-text-secondary)" }}>
                training days this week
              </p>
            </Card>

            <Card title="Nutrition">
              <div style={{ fontSize: "30px", fontWeight: 700 }}>
                {plan.mealPlan?.[0]?.totalCalories ?? "—"}
              </div>
              <p style={{ color: "var(--c-text-secondary)" }}>
                daily calories
              </p>
            </Card>

            <Card title="Meals">
              <div style={{ fontSize: "30px", fontWeight: 700 }}>
                {totalMeals}
              </div>
              <p style={{ color: "var(--c-text-secondary)" }}>
                meals planned this week
              </p>
            </Card>
          </div>

          <Card title="This Week's Workout Plan">
            <div style={{ display: "grid", gap: "12px" }}>
              {(plan.workoutPlan ?? []).map((day) => (
                <div
                  key={day.day}
                  style={{
                    padding: "18px",
                    border: "1px solid var(--c-border)",
                    borderRadius: "10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "16px",
                    }}
                  >
                    <div>
                      <strong>
                        Day {day.day} · {day.title}
                      </strong>

                      {!day.isRestDay && (
                        <p
                          style={{
                            margin: "6px 0 0",
                            color: "var(--c-text-secondary)",
                          }}
                        >
                          {day.durationMin} min · approximately{" "}
                          {day.estCalories} kcal
                        </p>
                      )}
                    </div>

                    <span
                      style={{
                        color: day.isRestDay
                          ? "var(--c-text-secondary)"
                          : "var(--c-primary)",
                        fontWeight: 600,
                      }}
                    >
                      {day.isRestDay ? "Rest" : "Workout"}
                    </span>
                  </div>

                  {!day.isRestDay && (
                    <div style={{ marginTop: "14px" }}>
                      {(day.exercises ?? []).map((exercise, index) => (
                        <div
                          key={`${exercise.name}-${index}`}
                          style={{
                            padding: "10px 0",
                            borderTop:
                              index === 0
                                ? "1px solid var(--c-border)"
                                : "0",
                          }}
                        >
                          <strong>{exercise.name}</strong>
                          <span style={{ color: "var(--c-text-secondary)" }}>
                            {" "}
                            · {exercise.sets} × {exercise.reps} ·{" "}
                            {exercise.restSeconds}s rest
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card title="This Week's Meal Plan">
            <div style={{ display: "grid", gap: "12px" }}>
              {(plan.mealPlan ?? []).map((day) => (
                <div
                  key={day.day}
                  style={{
                    padding: "18px",
                    border: "1px solid var(--c-border)",
                    borderRadius: "10px",
                  }}
                >
                  <strong>Day {day.day}</strong>

                  <p
                    style={{
                      color: "var(--c-text-secondary)",
                      margin: "6px 0 14px",
                    }}
                  >
                    {day.totalCalories} kcal · {day.totalProteinG}g protein
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                      gap: "12px",
                    }}
                  >
                    {(day.meals ?? []).map((meal, index) => (
                      <div
                        key={`${meal.name}-${index}`}
                        style={{
                          padding: "14px",
                          background: "var(--c-surface, #f8fafc)",
                          borderRadius: "8px",
                        }}
                      >
                        <small
                          style={{
                            color: "var(--c-text-secondary)",
                            textTransform: "capitalize",
                          }}
                        >
                          {meal.slot}
                        </small>

                        <div
                          style={{
                            fontWeight: 600,
                            marginTop: "5px",
                          }}
                        >
                          {meal.name}
                        </div>

                        <small
                          style={{
                            color: "var(--c-text-secondary)",
                          }}
                        >
                          {meal.calories} kcal · {meal.proteinG}g protein
                        </small>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <button
            onClick={handleGenerate}
            disabled={generating}
            style={{
              justifySelf: "start",
              padding: "12px 20px",
              border: 0,
              borderRadius: "8px",
              background: "var(--c-primary)",
              color: "#fff",
              fontWeight: 600,
              cursor: generating ? "not-allowed" : "pointer",
              opacity: generating ? 0.7 : 1,
            }}
          >
            {generating ? "Generating..." : "Regenerate Plan"}
          </button>
        </>
      )}

      {!plan && !error && (
        <Card title="No plan available">
          <p>Your personalised plan has not been generated yet.</p>

          <button
            onClick={handleGenerate}
            disabled={generating}
            style={{
              padding: "12px 20px",
              border: 0,
              borderRadius: "8px",
              background: "var(--c-primary)",
              color: "#fff",
              fontWeight: 600,
              cursor: generating ? "not-allowed" : "pointer",
              opacity: generating ? 0.7 : 1,
            }}
          >
            {generating ? "Generating..." : "Generate My Plan"}
          </button>
        </Card>
      )}
    </div>
  );
}
