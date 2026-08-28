import { useEffect, useState } from "react";
import {
  Card,
  PageHeader,
  LoadingSkeleton,
  EmptyState,
} from "../components";
import { api } from "../api/client";
import type { DailyLog, WeeklyPlan } from "../types/api";

const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function Calendar() {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCalendar() {
      try {
        setIsLoading(true);
        setError(null);

        const [logsResponse, planResponse] =
          await Promise.all([
            api.getLogs("30d"),
            api.getPlan(),
          ]);

        if (cancelled) return;

        setLogs(logsResponse.logs ?? []);
        setPlan(planResponse.plan);
      } catch (err) {
        console.error("Failed to load calendar:", err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your calendar.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadCalendar();

    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <>
        <PageHeader
          title="Calendar"
          subtitle="Track your workouts and daily check-ins"
        />

        <Card>
          <LoadingSkeleton lines={8} />
        </Card>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader title="Calendar" />

        <Card>
          <EmptyState
            title="Unable to load calendar"
            message={error}
          />
        </Card>
      </>
    );
  }

  const logMap = new Map(
    logs.map((log) => [log.date, log]),
  );

  return (
    <>
      <PageHeader
        title="Calendar"
        subtitle="Track your workouts and daily check-ins"
      />

      <Card title="Recent Activity">
        {logs.length === 0 ? (
          <EmptyState
            title="No activity yet"
            message="Your daily check-ins will appear here."
          />
        ) : (
          <div
            style={{
              display: "grid",
              gap: "var(--space-3)",
            }}
          >
            {logs.map((log) => (
              <div
                key={log.date}
                style={{
                  display: "grid",
                  gridTemplateColumns: "140px 1fr",
                  gap: "var(--space-4)",
                  padding: "var(--space-3)",
                  border:
                    "1px solid var(--color-border)",
                  borderRadius: "var(--r-md)",
                }}
              >
                <strong>{log.date}</strong>

                <div
                  style={{
                    color:
                      "var(--color-text-muted)",
                    fontSize: "var(--text-sm)",
                  }}
                >
                  {log.workoutText
                    ? "Workout logged"
                    : "No workout logged"}{" "}
                  ·{" "}
                  {log.mealsText
                    ? "Meals logged"
                    : "No meals logged"}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {plan && (
        <Card title="This Week's Schedule">
          <div
            style={{
              display: "grid",
              gap: "var(--space-3)",
            }}
          >
            {plan.workoutPlan.map((day) => {
              const date = new Date(
                `${plan.weekStartDate}T00:00:00`,
              );

              date.setDate(
                date.getDate() + day.day - 1,
              );

              const dateString = date
                .toISOString()
                .split("T")[0];

              const isLogged = logMap.has(dateString);

              return (
                <div
                  key={day.day}
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                    padding:
                      "var(--space-3)",
                    border:
                      "1px solid var(--color-border)",
                    borderRadius:
                      "var(--r-md)",
                  }}
                >
                  <div>
                    <strong>
                      {DAY_NAMES[day.day - 1]}
                    </strong>

                    <div
                      style={{
                        marginTop:
                          "var(--space-1)",
                        color:
                          "var(--color-text-muted)",
                        fontSize:
                          "var(--text-sm)",
                      }}
                    >
                      {day.title}
                    </div>
                  </div>

                  <span
                    style={{
                      color: isLogged
                        ? "var(--c-success)"
                        : "var(--color-text-muted)",
                    }}
                  >
                    {isLogged
                      ? "Completed"
                      : day.isRestDay
                        ? "Rest"
                        : `${day.durationMin} min`}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </>
  );
}
