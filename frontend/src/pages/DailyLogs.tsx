import { useEffect, useState } from "react";
import {
  Button,
  Card,
  PageHeader,
  LoadingSkeleton,
  EmptyState,
} from "../components";
import { api } from "../api/client";
import type { DailyLog } from "../types/api";
import "./DailyLogs.css";

/**
 * Today's date in the user's OWN timezone.
 * `new Date().toISOString()` returns UTC, so between midnight and 5:30am IST
 * it gives yesterday's date and files the check-in against the wrong day.
 */
function todayLocal(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function DailyLogs() {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [date, setDate] = useState(todayLocal());
  const [workout, setWorkout] = useState("");
  const [meals, setMeals] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);

  async function load() {
    try {
      setLoadFailed(false);
      const r = await api.getLogs("30d");
      setLogs(r.logs ?? []);
    } catch {
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function save() {
    try {
      setSaving(true);
      setMessage("");
      await api.logDaily({ date, workoutText: workout, mealsText: meals });
      setMessage("Check-in saved.");
      setMessageIsError(false);
      await load();
      setWorkout("");
      setMeals("");
    } catch {
      setMessage("Couldn't save your check-in. Please try again.");
      setMessageIsError(true);
    } finally {
      setSaving(false);
    }
  }

  const header = (
    <PageHeader
      title="Daily Check-in"
      subtitle="Track your daily fitness activity"
    />
  );

  if (loading) {
    return (
      <div className="fp-logs-page">
        {header}
        <Card>
          <LoadingSkeleton lines={8} />
        </Card>
      </div>
    );
  }

  return (
    <div className="fp-logs-page">
      {header}

      <div className="fp-logs-grid">
        {/* Main Check-in Form */}
        <section className="fp-logs-card">
          <div className="fp-logs-card-header">
            <div className="fp-logs-card-title">
              <span className="fp-logs-icon-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </span>
              <h2>Log Today&apos;s Activity</h2>
            </div>
          </div>

          <form
            className="fp-logs-form"
            onSubmit={(e) => {
              e.preventDefault();
              void save();
            }}
          >
            <div className="fp-logs-field">
              <label htmlFor="log-date">
                <span className="fp-logs-field-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </span>
                Check-in Date
              </label>
              <input
                id="log-date"
                type="date"
                className="fp-logs-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="fp-logs-field">
              <label htmlFor="log-workout">
                <span className="fp-logs-field-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 18h12M6 6h12M9 12h6M3 9v6M21 9v6" />
                  </svg>
                </span>
                Workout & Activity
              </label>
              <textarea
                id="log-workout"
                className="fp-logs-textarea"
                value={workout}
                onChange={(e) => setWorkout(e.target.value)}
                placeholder="What workout did you complete today? Log your exercises, sets, or cardio..."
                rows={4}
              />
            </div>

            <div className="fp-logs-field">
              <label htmlFor="log-meals">
                <span className="fp-logs-field-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10M17 3v18M14 3v7h6" />
                  </svg>
                </span>
                Meals & Nutrition
              </label>
              <textarea
                id="log-meals"
                className="fp-logs-textarea"
                value={meals}
                onChange={(e) => setMeals(e.target.value)}
                placeholder="What did you eat today? Log your meals, snacks, or caloric estimate..."
                rows={4}
              />
            </div>

            {message && (
              <div
                className={`fp-logs-banner ${
                  messageIsError ? "error" : "success"
                }`}
                role="alert"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {messageIsError ? (
                    <>
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </>
                  ) : (
                    <>
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </>
                  )}
                </svg>
                <span>{message}</span>
              </div>
            )}

            <div className="fp-logs-actions">
              <Button type="submit" loading={saving} block>
                Save Check-in
              </Button>
            </div>
          </form>
        </section>

        {/* History Column */}
        <section className="fp-logs-card">
          <div className="fp-logs-card-header">
            <div className="fp-logs-card-title">
              <span className="fp-logs-icon-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                </svg>
              </span>
              <h2>Recent Check-ins</h2>
            </div>
            <span className="fp-logs-count-pill">
              {logs.length} Logged
            </span>
          </div>

          {loadFailed ? (
            <EmptyState
              title="Couldn't load your check-ins"
              message="Something went wrong fetching your history. Please refresh and try again."
            />
          ) : logs.length === 0 ? (
            <EmptyState
              title="No check-ins yet"
              message="Your activity will appear here."
            />
          ) : (
            <div className="fp-logs-history-list">
              {logs.map((log) => (
                <article className="fp-log-item" key={log.date}>
                  <div className="fp-log-item-header">
                    <span className="fp-log-item-date">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      {log.date}
                    </span>
                  </div>

                  <div className="fp-log-item-section">
                    <span className="fp-log-item-section-title">Workout</span>
                    <p className={!log.workoutText ? "empty" : ""}>
                      {log.workoutText || "No workout logged"}
                    </p>
                  </div>

                  <div className="fp-log-item-section">
                    <span className="fp-log-item-section-title">Meals</span>
                    <p className={!log.mealsText ? "empty" : ""}>
                      {log.mealsText || "No meals logged"}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}