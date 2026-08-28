import { useEffect, useMemo, useState } from "react";
import { Card, PageHeader, LoadingSkeleton, EmptyState } from "../components";
import { api } from "../api/client";
import type { DailyLog } from "../types/api";

export default function Progress() {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getLogs("30d")
      .then((r) => setLogs(r.logs ?? []))
      .finally(() => setLoading(false));
  }, []);

  const workoutDays = useMemo(
    () => logs.filter((log) => log.workoutText?.trim()).length,
    [logs],
  );

  const nutritionDays = useMemo(
    () => logs.filter((log) => log.mealsText?.trim()).length,
    [logs],
  );

  if (loading) {
    return (
      <>
        <PageHeader title="Progress" subtitle="Track your fitness consistency" />
        <Card><LoadingSkeleton lines={8} /></Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Progress"
        subtitle="Track your fitness consistency"
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "var(--space-4)",
        }}
      >
        <Card title="Check-ins">
          <strong style={{ fontSize: "var(--fs-2xl)" }}>
            {logs.length}
          </strong>
          <p style={{ color: "var(--color-text-muted)" }}>
            last 30 days
          </p>
        </Card>

        <Card title="Workouts">
          <strong style={{ fontSize: "var(--fs-2xl)" }}>
            {workoutDays}
          </strong>
          <p style={{ color: "var(--color-text-muted)" }}>
            days completed
          </p>
        </Card>

        <Card title="Nutrition">
          <strong style={{ fontSize: "var(--fs-2xl)" }}>
            {nutritionDays}
          </strong>
          <p style={{ color: "var(--color-text-muted)" }}>
            days logged
          </p>
        </Card>
      </div>

      <Card title="Recent Progress">
        {logs.length === 0 ? (
          <EmptyState
            title="No progress data yet"
            message="Complete daily check-ins to start tracking your progress."
          />
        ) : (
          <div style={{ display: "grid", gap: "var(--space-3)" }}>
            {logs.map((log) => (
              <div
                key={log.date}
                style={{
                  padding: "var(--space-4)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--r-md)",
                }}
              >
                <strong>{log.date}</strong>
                <p
                  style={{
                    marginTop: "var(--space-2)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  {log.workoutText
                    ? "Workout completed"
                    : "No workout logged"}
                  {" · "}
                  {log.mealsText
                    ? "Nutrition logged"
                    : "No meals logged"}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
