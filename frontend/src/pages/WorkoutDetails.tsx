import { useEffect, useState } from "react";
import {
  AppShell,
  Card,
  PageHeader,
  LoadingSkeleton,
  EmptyState,
} from "../components";
import { api } from "../api/client";
import MuscleFocus from "../components/MuscleFocus";
import type { WeeklyPlan } from "../types/api";

export default function WorkoutDetails() {
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const focusedMuscles = Array.from(
    new Set(
      (plan?.workoutPlan ?? [])
        .flatMap((day) => day.exercises ?? [])
        .map((exercise) => exercise.targetMuscle)
        .filter(
          (muscle): muscle is NonNullable<typeof muscle> =>
            muscle !== null
        )
    )
  );

  useEffect(() => {
    async function loadPlan() {
      try {
        setIsLoading(true);
        setError("");
        const response = await api.getPlan();
        setPlan(response.plan);
      } catch (err) {
        console.error("Failed to load workout plan:", err);
        setError("Unable to load your workout plan.");
      } finally {
        setIsLoading(false);
      }
    }

    loadPlan();
  }, []);

  if (isLoading) {
    return (
      <AppShell active="/workout">
        <PageHeader
          title="Workout Plan"
          subtitle="Your personalised weekly training schedule"
        />
        <Card>
          <LoadingSkeleton lines={8} />
        </Card>
      </AppShell>
    );
  }

  if (error || !plan) {
    return (
      <AppShell active="/workout">
        <PageHeader title="Workout Plan" />
        <Card>
          <EmptyState
            title="No workout plan available"
            message={error || "Generate a plan from your dashboard first."}
          />
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell active="/workout">
      <PageHeader
        title="Workout Plan"
        subtitle="Your personalised weekly training schedule"
      />

      {plan.generationSource === "fallback" && (
        <Card>
          <p style={{ color: "var(--c-warning)" }}>
            This plan is currently using the static fallback because AI
            generation is still pending AWS account verification.
          </p>
        </Card>
      )}

      {plan.coachNote && (
        <Card title="Coach Note">
          <p>{plan.coachNote}</p>
        </Card>
      )}

              <Card title="Muscle Focus">
          <MuscleFocus muscles={focusedMuscles} />
        </Card>
        <Card title="Weekly Workout">
        <div style={{ display: "grid", gap: "var(--sp-4)" }}>
          {(plan.workoutPlan ?? []).map((day) => (
            <div
              key={day.day}
              style={{
                border: "1px solid var(--c-border)",
                borderRadius: "var(--r-md)",
                padding: "var(--sp-4)",
              }}
            >
              <h2
                style={{
                  fontSize: "var(--fs-xl)",
                  marginBottom: "var(--sp-2)",
                }}
              >
                Day {day.day}: {day.title}
              </h2>

              <p
                style={{
                  color: "var(--c-text-secondary)",
                  fontSize: "var(--fs-sm)",
                  marginBottom: "var(--sp-3)",
                }}
              >
                {day.isRestDay
                  ? "Rest day"
                  : `${day.durationMin} min • approximately ${day.estCalories} kcal`}
              </p>

              {day.isRestDay ? (
                <p style={{ color: "var(--c-text-secondary)" }}>
                  Recovery day. No workout scheduled.
                </p>
              ) : (
                <div style={{ display: "grid", gap: "var(--sp-3)" }}>
                  {(day.exercises ?? []).map((exercise, index) => (
                    <div
                      key={`${exercise.name}-${index}`}
                      style={{
                        padding: "var(--sp-3)",
                        border: "1px solid var(--c-border)",
                        borderRadius: "var(--r-md)",
                      }}
                    >
                      <strong>{exercise.name}</strong>

                      <p
                        style={{
                          marginTop: "var(--sp-1)",
                          color: "var(--c-text-secondary)",
                        }}
                      >
                        {exercise.sets} sets × {exercise.reps} reps •{" "}
                        {exercise.restSeconds}s rest
                      </p>

                      {exercise.notes && (
                        <p
                          style={{
                            marginTop: "var(--sp-1)",
                            color: "var(--c-text-secondary)",
                            fontSize: "var(--fs-sm)",
                          }}
                        >
                          {exercise.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
