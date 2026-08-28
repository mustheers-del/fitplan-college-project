import { useEffect, useMemo, useState } from "react";
import {
  AppShell,
  Card,
  PageHeader,
  LoadingSkeleton,
  EmptyState,
} from "../components";
import { api } from "../api/client";
import type { DailyLog } from "../types/api";

export default function Achievements() {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAchievements() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await api.getLogs("30d");
        setLogs(response.logs ?? []);
      } catch (err) {
        console.error("Failed to load achievements:", err);
        setError("Unable to load your achievements.");
      } finally {
        setIsLoading(false);
      }
    }

    loadAchievements();
  }, []);

  const workoutDays = useMemo(
    () => logs.filter((log) => log.workoutText?.trim()).length,
    [logs],
  );

  const nutritionDays = useMemo(
    () => logs.filter((log) => log.mealsText?.trim()).length,
    [logs],
  );

  const checkIns = logs.length;

  const achievements = [
    {
      title: "First Check-in",
      description: "Complete your first daily check-in.",
      unlocked: checkIns >= 1,
    },
    {
      title: "Workout Starter",
      description: "Log your first workout.",
      unlocked: workoutDays >= 1,
    },
    {
      title: "Nutrition Tracker",
      description: "Log your first meal entry.",
      unlocked: nutritionDays >= 1,
    },
    {
      title: "3 Check-ins",
      description: "Complete 3 daily check-ins.",
      unlocked: checkIns >= 3,
    },
    {
      title: "7 Check-ins",
      description: "Complete 7 daily check-ins.",
      unlocked: checkIns >= 7,
    },
    {
      title: "5 Workouts",
      description: "Log 5 workouts.",
      unlocked: workoutDays >= 5,
    },
  ];

  if (isLoading) {
    return (
      <AppShell active="/achievements" userName="Test User">
        <PageHeader
          title="Achievements"
          subtitle="Milestones from your fitness journey"
        />
        <Card>
          <LoadingSkeleton lines={8} />
        </Card>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell active="/achievements" userName="Test User">
        <PageHeader title="Achievements" />
        <Card>
          <EmptyState
            title="Unable to load achievements"
            message={error}
          />
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell active="/achievements" userName="Test User">
      <PageHeader
        title="Achievements"
        subtitle="Milestones from your fitness journey"
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
            {checkIns}
          </strong>
          <p
            style={{
              color: "var(--color-text-muted)",
              marginTop: "var(--space-1)",
            }}
          >
            completed
          </p>
        </Card>

        <Card title="Workouts">
          <strong style={{ fontSize: "var(--fs-2xl)" }}>
            {workoutDays}
          </strong>
          <p
            style={{
              color: "var(--color-text-muted)",
              marginTop: "var(--space-1)",
            }}
          >
            logged
          </p>
        </Card>

        <Card title="Nutrition">
          <strong style={{ fontSize: "var(--fs-2xl)" }}>
            {nutritionDays}
          </strong>
          <p
            style={{
              color: "var(--color-text-muted)",
              marginTop: "var(--space-1)",
            }}
          >
            days logged
          </p>
        </Card>
      </div>

      <Card title="Milestones">
        <div style={{ display: "grid", gap: "var(--space-3)" }}>
          {achievements.map((achievement) => (
            <div
              key={achievement.title}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "var(--space-4)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--r-md)",
                opacity: achievement.unlocked ? 1 : 0.55,
              }}
            >
              <div>
                <strong>{achievement.title}</strong>
                <p
                  style={{
                    marginTop: "var(--space-1)",
                    color: "var(--color-text-muted)",
                    fontSize: "var(--text-sm)",
                  }}
                >
                  {achievement.description}
                </p>
              </div>

              <span>
                {achievement.unlocked ? "Unlocked" : "Locked"}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
