import { useEffect, useMemo, useState } from "react";
import {
  Card,
  PageHeader,
  LoadingSkeleton,
  EmptyState,
} from "../components";
import { api } from "../api/client";
import type { DailyLog } from "../types/api";
import "./Achievements.css";

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

  const unlockedCount = achievements.filter(
    (achievement) => achievement.unlocked,
  ).length;

  const completionPercent = Math.round(
    (unlockedCount / achievements.length) * 100,
  );

  if (isLoading) {
    return (
      <>
        <PageHeader
          title="Achievements"
          subtitle="Milestones from your fitness journey"
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
        <PageHeader title="Achievements" />
        <Card>
          <EmptyState
            title="Unable to load achievements"
            message={error}
          />
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Achievements"
        subtitle="Milestones from your fitness journey"
      />

      <section className="fp-achievements-stats">
        <Card>
          <div className="fp-achievements-stat">
            <div className="fp-achievements-stat-icon fp-achievements-stat-icon--primary">
              C
            </div>
            <div>
              <span className="fp-achievements-stat-label">Check-ins</span>
              <strong className="fp-achievements-stat-value">{checkIns}</strong>
              <span className="fp-achievements-stat-meta">completed</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="fp-achievements-stat">
            <div className="fp-achievements-stat-icon fp-achievements-stat-icon--workout">
              W
            </div>
            <div>
              <span className="fp-achievements-stat-label">Workouts</span>
              <strong className="fp-achievements-stat-value">
                {workoutDays}
              </strong>
              <span className="fp-achievements-stat-meta">logged</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="fp-achievements-stat">
            <div className="fp-achievements-stat-icon fp-achievements-stat-icon--nutrition">
              N
            </div>
            <div>
              <span className="fp-achievements-stat-label">Nutrition</span>
              <strong className="fp-achievements-stat-value">
                {nutritionDays}
              </strong>
              <span className="fp-achievements-stat-meta">days logged</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="fp-achievements-stat">
            <div className="fp-achievements-stat-icon fp-achievements-stat-icon--progress">
              %
            </div>
            <div>
              <span className="fp-achievements-stat-label">Milestones</span>
              <strong className="fp-achievements-stat-value">
                {unlockedCount}/{achievements.length}
              </strong>
              <span className="fp-achievements-stat-meta">
                {completionPercent}% unlocked
              </span>
            </div>
          </div>
        </Card>
      </section>

      <section className="fp-achievements-layout">
        <Card title="Achievement Progress">
          <div className="fp-achievements-progress">
            <div className="fp-achievements-progress-heading">
              <div>
                <strong>Overall progress</strong>
                <p>
                  Keep logging workouts and meals to unlock more milestones.
                </p>
              </div>

              <strong className="fp-achievements-progress-value">
                {completionPercent}%
              </strong>
            </div>

            <div
              className="fp-achievements-progress-track"
              role="progressbar"
              aria-label="Achievement completion"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={completionPercent}
            >
              <div
                className="fp-achievements-progress-fill"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>
        </Card>

        <Card title="Milestones">
          <div className="fp-achievements-grid">
            {achievements.map((achievement, index) => (
              <article
                key={achievement.title}
                className={`fp-achievement-card ${
                  achievement.unlocked
                    ? "fp-achievement-card--unlocked"
                    : "fp-achievement-card--locked"
                }`}
              >
                <div className="fp-achievement-card-top">
                  <div className="fp-achievement-badge">
                    {achievement.unlocked ? "?" : index + 1}
                  </div>

                  <span
                    className={`fp-achievement-status ${
                      achievement.unlocked
                        ? "fp-achievement-status--unlocked"
                        : "fp-achievement-status--locked"
                    }`}
                  >
                    {achievement.unlocked ? "Unlocked" : "Locked"}
                  </span>
                </div>

                <div className="fp-achievement-card-copy">
                  <strong>{achievement.title}</strong>
                  <p>{achievement.description}</p>
                </div>
              </article>
            ))}
          </div>
        </Card>
      </section>
    </>
  );
}

