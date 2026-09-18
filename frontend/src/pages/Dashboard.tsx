import { useEffect, useState } from "react";
import { api, ApiRequestError } from "@/api/client";
import Card from "@/components/Card";
import { Button } from "@/components/Button";
import StatTile from "@/components/StatTile";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import type { WeeklyPlan } from "@/types/api";

export default function Dashboard() {
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadPlan() {
    try { setLoading(true); setError(null); const response = await api.getPlan(); setPlan(response.plan); }
    catch (err) { console.error(err); if (err instanceof ApiRequestError && err.status === 404) { setPlan(null); setError(null); } else setError(err instanceof Error ? err.message : "Unable to load your plan."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void loadPlan(); }, []);
  async function handleGenerate() {
    try { setGenerating(true); setError(null); const response = await api.generatePlan({ force: true }); setPlan(response.plan); }
    catch (err) { console.error(err); setError(err instanceof Error ? err.message : "Unable to generate your plan."); }
    finally { setGenerating(false); }
  }
  if (loading) return <div className="fp-dashboard"><div className="fp-dashboard__hero"><div><div className="fp-dashboard__eyebrow">Your week at a glance</div><h1>Good morning</h1><p>Loading your personalised fitness plan...</p></div></div><Card><LoadingSkeleton height={18} width="35%" /><LoadingSkeleton height={42} width="55%" /><LoadingSkeleton height={18} width="80%" /></Card></div>;

  const workoutDays = plan?.workoutPlan?.filter((day) => !day.isRestDay).length ?? 0;
  const totalMeals = plan?.mealPlan?.reduce((total, day) => total + (day.meals?.length ?? 0), 0) ?? 0;

  return <div className="fp-dashboard">
    <section className="fp-dashboard__hero"><div><div className="fp-dashboard__eyebrow">Your week at a glance</div><h1>Good morning</h1><p>Here is your personalised FitPlan for this week.</p></div>{plan && <Button variant="secondary" loading={generating} onClick={handleGenerate}>{generating ? "Generating..." : "Regenerate plan"}</Button>}</section>
    {error && <div className="fp-notice" role="alert">{error}</div>}
    {plan && <>
      {plan.generationSource === "fallback" && <div className="fp-notice"><strong>Using starter plan</strong><p>AI plan generation is temporarily unavailable because the OpenRouter usage/rate limit has been reached. Your current FitPlan is still available and can be regenerated when the limit resets.</p></div>}
      {plan.coachNote && <Card title="Coach note"><p style={{ margin: 0 }}>{plan.coachNote}</p></Card>}
      <div className="fp-dashboard__stats"><StatTile label="Workout days" value={workoutDays} hint="training days this week" /><StatTile label="Daily calories" value={plan.mealPlan?.[0]?.totalCalories ?? "—"} unit="kcal" hint="nutrition target" /><StatTile label="Meals planned" value={totalMeals} hint="meals planned this week" /></div>
      <Card title="This week's workout plan"><div className="fp-plan-list">{(plan.workoutPlan ?? []).map((day) => <div className="fp-plan-day" key={day.day}><div className="fp-plan-day__head"><div><strong>Day {day.day} · {day.title}</strong>{!day.isRestDay && <p className="fp-plan-day__meta">{day.durationMin} min · approximately {day.estCalories} kcal</p>}</div><span className={`fp-plan-day__status ${day.isRestDay ? "fp-plan-day__status--rest" : ""}`}>{day.isRestDay ? "Rest" : "Workout"}</span></div>{!day.isRestDay && <div className="fp-exercises">{(day.exercises ?? []).map((exercise, index) => <div className="fp-exercise" key={`${exercise.name}-${index}`}><strong>{exercise.name}</strong><span> · {exercise.sets} · {exercise.reps} · {exercise.restSeconds}s rest</span></div>)}</div>}</div>)}</div></Card>
      <Card title="This week's meal plan"><div className="fp-plan-list">{(plan.mealPlan ?? []).map((day) => <div className="fp-plan-day" key={day.day}><strong>Day {day.day}</strong><p className="fp-plan-day__meta">{day.totalCalories} kcal · {day.totalProteinG}g protein</p><div className="fp-meal-grid">{(day.meals ?? []).map((meal, index) => <div className="fp-meal" key={`${meal.name}-${index}`}><small>{meal.slot}</small><strong>{meal.name}</strong><div className="fp-meal__meta">{meal.calories} kcal · {meal.proteinG}g protein</div></div>)}</div></div>)}</div></Card>
      <Button onClick={handleGenerate} loading={generating}>{generating ? "Generating..." : "Regenerate plan"}</Button>
    </>}
    {!plan && !error && <Card title="No plan available"><p>Your personalised plan has not been generated yet.</p><Button onClick={handleGenerate} loading={generating}>{generating ? "Generating..." : "Generate my plan"}</Button></Card>}
  </div>;
}
