import { useEffect, useState } from "react";
import { Card, PageHeader, LoadingSkeleton, EmptyState, Button } from "../components";
import { api } from "../api/client";
import type { DailyLog } from "../types/api";

export default function DailyLogs() {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [workoutText, setWorkoutText] = useState("");
  const [mealsText, setMealsText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadLogs() {
    try {
      const response = await api.getLogs("30d");
      setLogs(response.logs ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadLogs();
  }, []);

  async function handleSave() {
    try {
      setSaving(true);
      setMessage("");

      await api.logDaily({
        date,
        workoutText,
        mealsText,
      });

      setMessage("Daily check-in saved successfully.");
      await loadLogs();
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Could not save check-in.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <>
        <PageHeader title="Daily Check-in" />
        <Card><LoadingSkeleton lines={6} /></Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Daily Check-in"
        subtitle="Record your workout and meals"
      />

      <Card title="Today's Check-in">
        <label>
          Date
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ display: "block", width: "100%", marginTop: "var(--space-2)" }}
          />
        </label>

        <label style={{ display: "block", marginTop: "var(--space-4)" }}>
          Workout
          <textarea
            value={workoutText}
            onChange={(e) => setWorkoutText(e.target.value)}
            placeholder="Example: Completed chest and shoulders workout"
            rows={4}
            style={{ display: "block", width: "100%", marginTop: "var(--space-2)" }}
          />
        </label>

        <label style={{ display: "block", marginTop: "var(--space-4)" }}>
          Meals
          <textarea
            value={mealsText}
            onChange={(e) => setMealsText(e.target.value)}
            placeholder="Example: Breakfast, lunch and dinner completed"
            rows={4}
            style={{ display: "block", width: "100%", marginTop: "var(--space-2)" }}
          />
        </label>

        {message && (
          <p style={{ marginTop: "var(--space-4)" }}>{message}</p>
        )}

        <div style={{ marginTop: "var(--space-4)" }}>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Check-in"}
          </Button>
        </div>
      </Card>

      <Card title="Recent Check-ins">
        {logs.length === 0 ? (
          <EmptyState
            title="No check-ins yet"
            message="Your saved daily check-ins will appear here."
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

                {log.workoutText && (
                  <p style={{ marginTop: "var(--space-2)" }}>
                    <strong>Workout:</strong> {log.workoutText}
                  </p>
                )}

                {log.mealsText && (
                  <p style={{ marginTop: "var(--space-2)" }}>
                    <strong>Meals:</strong> {log.mealsText}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
