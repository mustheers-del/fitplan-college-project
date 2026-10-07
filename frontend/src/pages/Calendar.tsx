import { useEffect, useState } from "react";
import {
  Card,
  PageHeader,
  LoadingSkeleton,
  EmptyState,
} from "../components";
import { api } from "../api/client";
import type { DailyLog, WeeklyPlan } from "../types/api";
import "./Calendar.css";

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

        const [logsResponse, planResponse] = await Promise.all([
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

  const header = (
    <PageHeader
      title="Calendar"
      subtitle="Track your workouts and daily check-ins"
    />
  );

  if (isLoading) {
    return (
      <div className="fp-calendar-page">
        {header}
        <Card>
          <LoadingSkeleton lines={8} />
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fp-calendar-page">
        <PageHeader title="Calendar" />
        <Card>
          <EmptyState title="Unable to load calendar" message={error} />
        </Card>
      </div>
    );
  }

  const logMap = new Map(logs.map((log) => [log.date, log]));

  return (
    <div className="fp-calendar-page">
      {header}

      {/* Weekly Schedule Section */}
      {plan && (
        <section className="fp-calendar-card">
          <div className="fp-calendar-card-header">
            <div className="fp-calendar-card-title">
              <span className="fp-calendar-icon-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </span>
              <h2>This Week&apos;s Schedule</h2>
            </div>
            <span className="fp-calendar-pill">
              Week of {plan.weekStartDate}
            </span>
          </div>

          <div className="fp-week-grid">
            {plan.workoutPlan.map((day) => {
              const date = new Date(`${plan.weekStartDate}T00:00:00`);
              date.setDate(date.getDate() + day.day - 1);
              const dateString = date.toISOString().split("T")[0];
              const isLogged = logMap.has(dateString);

              return (
                <div
                  key={day.day}
                  className={`fp-week-day-card ${
                    isLogged ? "completed" : day.isRestDay ? "rest" : ""
                  }`}
                >
                  <div className="fp-week-day-top">
                    <span className="fp-week-day-name">
                      {DAY_NAMES[day.day - 1]}
                    </span>
                    <span className="fp-week-day-num">D{day.day}</span>
                  </div>

                  <span className="fp-week-day-title">{day.title}</span>

                  <div className="fp-week-day-status-wrap">
                    {isLogged ? (
                      <span className="fp-week-day-status completed">
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Completed
                      </span>
                    ) : day.isRestDay ? (
                      <span className="fp-week-day-status rest">Rest</span>
                    ) : (
                      <span className="fp-week-day-status duration">
                        {day.durationMin} min
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Recent Activity Section */}
      <section className="fp-calendar-card">
        <div className="fp-calendar-card-header">
          <div className="fp-calendar-card-title">
            <span className="fp-calendar-icon-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
              </svg>
            </span>
            <h2>Recent Activity</h2>
          </div>
          <span className="fp-calendar-pill">{logs.length} Logged</span>
        </div>

        {logs.length === 0 ? (
          <EmptyState
            title="No activity yet"
            message="Your daily check-ins will appear here."
          />
        ) : (
          <div className="fp-calendar-history-grid">
            {logs.map((log) => {
              const hasWorkout = Boolean(log.workoutText?.trim());
              const hasMeals = Boolean(log.mealsText?.trim());

              return (
                <div key={log.date} className="fp-calendar-log-item">
                  <div className="fp-calendar-log-date">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <strong>{log.date}</strong>
                  </div>

                  <div className="fp-calendar-log-meta">
                    <span
                      className={`fp-log-pill ${
                        hasWorkout ? "workout" : "none"
                      }`}
                    >
                      {hasWorkout ? "Workout Logged" : "No Workout"}
                    </span>
                    <span
                      className={`fp-log-pill ${
                        hasMeals ? "meals" : "none"
                      }`}
                    >
                      {hasMeals ? "Meals Logged" : "No Meals"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
