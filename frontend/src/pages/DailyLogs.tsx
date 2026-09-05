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
      // Without this, a failed request left logs empty and the page said
      // "No check-ins yet" — telling the user their data doesn't exist when
      // in fact the request broke.
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

  const fieldStyle = {
    display: "block",
    width: "100%",
    padding: "var(--space-3)",
    margin: "var(--space-2) 0 var(--space-5)",
  };

  if (loading) {
    return (
      <>
        {header}
        <Card>
          <LoadingSkeleton lines={8} />
        </Card>
      </>
    );
  }

  return (
    <>
      {header}

      <Card title="Today's Activity">
        <label htmlFor="log-date">Date</label>
        <input
          id="log-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={fieldStyle}
        />

        <label htmlFor="log-workout">Workout</label>
        <textarea
          id="log-workout"
          value={workout}
          onChange={(e) => setWorkout(e.target.value)}
          placeholder="What workout did you complete today?"
          rows={4}
          style={fieldStyle}
        />

        <label htmlFor="log-meals">Meals</label>
        <textarea
          id="log-meals"
          value={meals}
          onChange={(e) => setMeals(e.target.value)}
          placeholder="What did you eat today?"
          rows={4}
          style={fieldStyle}
        />

        {message && (
          <p
            style={{
              color: messageIsError
                ? "var(--color-danger, var(--color-text))"
                : "var(--color-text-muted)",
              marginBottom: "var(--space-4)",
            }}
          >
            {message}
          </p>
        )}

        <Button onClick={save} loading={saving}>
          Save Check-in
        </Button>
      </Card>

      <Card title="Recent Check-ins">
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
                <p>{log.workoutText || "No workout logged"}</p>
                <p>{log.mealsText || "No meals logged"}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}