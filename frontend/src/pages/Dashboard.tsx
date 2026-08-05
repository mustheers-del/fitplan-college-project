import { useEffect, useState } from "react";
import { api } from "@/api/client";
import Card from "@/components/Card";
import StatTile from "@/components/StatTile";
import type { WeeklyPlan } from "@/types/api";

/**
 * OWNER: [D] — the big one from the mockup.
 *
 * Sprint 2: build against src/fixtures/dashboard.json (you're ahead of the backend).
 * Sprint 4: swap the fixture for this real call.
 *
 * TODO [D]: stat tiles row, Today's Focus with the completion ring,
 * Weekly Progress line chart, Macronutrient donut, AI Coach card,
 * Upcoming Workout, Hydration, Achievements.
 */
export default function Dashboard() {
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getPlan()
      .then((r) => setPlan(r.plan))
      .catch(() => setPlan(null));   // 404 = no plan yet, that's a valid state
  }, []);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const r = await api.generatePlan();
      setPlan(r.plan);
    } catch (e) {
      // Never leave a silent spinner. Real message + retry.
      setError(e instanceof Error ? e.message : "Could not generate your plan");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: "var(--sp-6)" }}>
      <h1 style={{ fontSize: "var(--fs-3xl)" }}>Good Morning 👋</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--sp-4)" }}>
        <StatTile label="Calories" value="1,890" unit="/ 2,300 kcal" delta={12} />
        <StatTile label="Workout" value="45" unit="/ 60 min" delta={8} />
        <StatTile label="Water" value="6" unit="/ 8 glasses" delta={-2} />
        <StatTile label="Weight" value="72.5" unit="kg" delta={-1.2} deltaLabel="vs last week" />
      </div>

      <Card title="This week's plan">
        {error && <p style={{ color: "var(--c-danger)" }}>{error}</p>}

        {plan ? (
          <>
            {plan.generationSource === "fallback" && (
              <p style={{ color: "var(--c-warning)", fontSize: "var(--fs-sm)" }}>
                This is a template plan — AI generation didn't complete. Try regenerating.
              </p>
            )}
            <p>{plan.coachNote}</p>
          </>
        ) : (
          <p style={{ color: "var(--c-text-secondary)" }}>
            No plan yet — generate your first one.
          </p>
        )}

        <button
          onClick={handleGenerate}
          disabled={generating}
          style={{
            marginTop: "var(--sp-4)",
            padding: "var(--sp-3) var(--sp-5)",
            background: "var(--c-primary)",
            color: "#fff",
            border: "none",
            borderRadius: "var(--r-md)",
            fontWeight: "var(--fw-semibold)",
          }}
        >
          {generating ? "Generating…" : "Generate New Plan →"}
        </button>
      </Card>
    </div>
  );
}
