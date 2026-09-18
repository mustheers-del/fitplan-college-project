import { useEffect, useMemo, useState } from "react";
import { AppShell, LoadingSkeleton, EmptyState } from "../components";
import { api } from "../api/client";
import MuscleFocus from "../components/MuscleFocus";
import type { WeeklyPlan, WorkoutDay } from "../types/api";
import "./WorkoutDetails.css";

function getTodayIndex(): number {
  const day = new Date().getDay();
  return day === 0 ? 7 : day;
}

function formatMuscleName(value: string | null | undefined): string {
  if (!value) return "Full body";

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function WorkoutDetails() {
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDay, setSelectedDay] = useState<number>(getTodayIndex());

  useEffect(() => {
    async function loadPlan() {
      try {
        setIsLoading(true);
        setError("");

        const response = await api.getPlan();
        setPlan(response.plan);

        const today = getTodayIndex();
        const todayExists = response.plan.workoutPlan?.some(
          (day) => day.day === today,
        );

        if (todayExists) {
          setSelectedDay(today);
        } else if (response.plan.workoutPlan?.[0]) {
          setSelectedDay(response.plan.workoutPlan[0].day);
        }
      } catch (err) {
        console.error("Failed to load workout plan:", err);
        setError("Unable to load your workout plan.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadPlan();
  }, []);

  const workoutDays = plan?.workoutPlan ?? [];

  const focusedMuscles = useMemo(
    () =>
      Array.from(
        new Set(
          workoutDays
            .flatMap((day) => day.exercises ?? [])
            .map((exercise) => exercise.targetMuscle)
            .filter(
              (muscle): muscle is NonNullable<typeof muscle> =>
                muscle !== null && muscle !== undefined,
            ),
        ),
      ),
    [workoutDays],
  );

  const activeWorkout = useMemo<WorkoutDay | null>(
    () =>
      workoutDays.find((day) => day.day === selectedDay) ??
      workoutDays[0] ??
      null,
    [workoutDays, selectedDay],
  );

  const trainingDays = workoutDays.filter(
    (day) => !day.isRestDay,
  ).length;

  const totalExercises = workoutDays.reduce(
    (total, day) => total + (day.exercises?.length ?? 0),
    0,
  );

  const totalCalories = workoutDays.reduce(
    (total, day) => total + (day.estCalories ?? 0),
    0,
  );

  if (isLoading) {
    return (
      <AppShell active="/workout">
        <div className="workout-loading">
          <div className="workout-loading-header">
            <div className="loading-line loading-small" />
            <div className="loading-line loading-large" />
            <div className="loading-line loading-medium" />
          </div>

          <div className="workout-loading-stats">
            <div />
            <div />
            <div />
          </div>

          <div className="workout-loading-card">
            <LoadingSkeleton lines={10} />
          </div>
        </div>
      </AppShell>
    );
  }

  if (error || !plan) {
    return (
      <AppShell active="/workout">
        <div className="workout-empty-page">
          <EmptyState
            title="No workout plan available"
            message={
              error || "Generate a plan from your dashboard first."
            }
          />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell active="/workout">
      <div className="workout-page">
        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="workout-hero">
          <div className="workout-hero-main">
            <div className="workout-eyebrow">
              <span className="live-dot" />
              YOUR TRAINING PLAN
            </div>

            <h1>Train with purpose.</h1>

            <p>
              Your personalized weekly training schedule is ready.
              Choose a day below to view the complete workout.
            </p>

            <div className="workout-hero-meta">
              <span>
                <strong>{trainingDays}</strong> training days
              </span>

              <span className="hero-divider" />

              <span>
                <strong>{totalExercises}</strong> exercises
              </span>

              <span className="hero-divider" />

              <span>
                <strong>{totalCalories.toLocaleString()}</strong> kcal
              </span>
            </div>
          </div>

          <div className="workout-hero-visual">
            <div className="hero-ring hero-ring-one" />
            <div className="hero-ring hero-ring-two" />

            <svg
              className="hero-dumbbell"
              viewBox="0 0 120 120"
              aria-hidden="true"
            >
              <path d="M25 47v26M35 40v40M85 40v40M95 47v26" />
              <path d="M35 60h50" />
              <path d="M18 51v18M102 51v18" />
            </svg>

            <div className="hero-visual-label">
              <span>FITPLAN</span>
              <strong>WORKOUT</strong>
            </div>
          </div>
        </section>

        {/* =====================================================
            ALERTS
        ===================================================== */}

        {plan.generationSource === "fallback" && (
          <section className="workout-alert">
            <div className="alert-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3 3.5 18h17L12 3Z" />
                <path d="M12 9v4M12 16v.5" />
              </svg>
            </div>

            <div className="alert-content">
              <strong>Starter workout plan active</strong>
              <p>
                AI generation is currently unavailable, so you're using
                FitPlan's available starter plan.
              </p>
            </div>
          </section>
        )}

        {plan.coachNote && (
          <section className="coach-note">
            <div className="coach-note-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20 11.5a7 7 0 0 1-8 7 8.6 8.6 0 0 1-3-.6L5 20l1.4-3.3A7 7 0 1 1 20 11.5Z" />
                <path d="M9 12h.01M12 12h.01M15 12h.01" />
              </svg>
            </div>

            <div>
              <span>COACH NOTE</span>
              <p>{plan.coachNote}</p>
            </div>
          </section>
        )}

        {/* =====================================================
            SUMMARY STATS
        ===================================================== */}

        <section className="workout-stats">
          <article className="workout-stat-card blue">
            <div className="workout-stat-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 8V5M17 8V5M5 9h14M8 13h3M13 13h3M8 17h3M13 17h3" />
                <rect x="4" y="5" width="16" height="15" rx="3" />
              </svg>
            </div>

            <div>
              <strong>{trainingDays}</strong>
              <span>Training days</span>
            </div>

            <small>THIS WEEK</small>
          </article>

          <article className="workout-stat-card purple">
            <div className="workout-stat-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="8" />
                <path d="M12 8v4l3 2" />
              </svg>
            </div>

            <div>
              <strong>
                {activeWorkout?.durationMin ?? 0}
                <em> min</em>
              </strong>
              <span>Current session</span>
            </div>

            <small>SELECTED DAY</small>
          </article>

          <article className="workout-stat-card green">
            <div className="workout-stat-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 8v8M17 8v8M4 10v4M20 10v4M7 12h10" />
              </svg>
            </div>

            <div>
              <strong>{totalExercises}</strong>
              <span>Total exercises</span>
            </div>

            <small>THIS WEEK</small>
          </article>

          <article className="workout-stat-card orange">
            <div className="workout-stat-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3c1.8 3 5 4.6 5 8.4A5 5 0 0 1 7 12c0-2.8 1.8-4.7 3.2-6.2.2 2 1.1 3.1 1.8 3.8.4-2.1.1-3.8 0-6.6Z" />
              </svg>
            </div>

            <div>
              <strong>
                {(activeWorkout?.estCalories ?? 0).toLocaleString()}
                <em> kcal</em>
              </strong>
              <span>Estimated burn</span>
            </div>

            <small>SELECTED DAY</small>
          </article>
        </section>

        {/* =====================================================
            DAY SELECTOR
        ===================================================== */}

        <section className="week-selector-section">
          <div className="section-heading">
            <div>
              <span className="section-eyebrow">YOUR WEEK</span>
              <h2>Choose your workout</h2>
              <p>
                Select a day to see the exercises, sets, reps and rest time.
              </p>
            </div>
          </div>

          <div className="week-selector">
            {workoutDays.map((day) => {
              const isSelected = day.day === selectedDay;

              return (
                <button
                  className={`week-selector-day ${
                    isSelected ? "selected" : ""
                  } ${day.isRestDay ? "rest" : ""}`}
                  type="button"
                  key={day.day}
                  onClick={() => setSelectedDay(day.day)}
                >
                  <span>DAY</span>
                  <strong>{day.day}</strong>

                  <div className="selector-indicator">
                    {day.isRestDay ? (
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M7 5h10M8 5v14h8V5M5 19h14" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M7 8v8M17 8v8M4 10v4M20 10v4M7 12h10" />
                      </svg>
                    )}
                  </div>

                  <small>
                    {day.isRestDay
                      ? "Rest"
                      : `${day.durationMin ?? 0} min`}
                  </small>
                </button>
              );
            })}
          </div>
        </section>

        {/* =====================================================
            MAIN WORKOUT AREA
        ===================================================== */}

        {activeWorkout && (
          <section className="active-workout-layout">
            <div className="active-workout-card">
              <div className="active-workout-header">
                <div className="active-day-badge">
                  <span>DAY</span>
                  <strong>{activeWorkout.day}</strong>
                </div>

                <div className="active-workout-title">
                  <span className="section-eyebrow">TODAY'S SESSION</span>
                  <h2>{activeWorkout.title}</h2>

                  <div className="active-workout-meta">
                    <span>
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="12" cy="12" r="8" />
                        <path d="M12 8v4l3 2" />
                      </svg>
                      {activeWorkout.durationMin ?? 0} min
                    </span>

                    <span>
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 3c1.8 3 5 4.6 5 8.4A5 5 0 0 1 7 12c0-2.8 1.8-4.7 3.2-6.2.2 2 1.1 3.1 1.8 3.8.4-2.1.1-3.8 0-6.6Z" />
                      </svg>
                      {activeWorkout.estCalories ?? 0} kcal
                    </span>

                    <span>
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="8" cy="8" r="2.5" />
                        <circle cx="16" cy="8" r="2.5" />
                        <circle cx="8" cy="16" r="2.5" />
                        <circle cx="16" cy="16" r="2.5" />
                      </svg>
                      {activeWorkout.exercises?.length ?? 0} exercises
                    </span>
                  </div>
                </div>
              </div>

              {activeWorkout.isRestDay ? (
                <div className="recovery-panel">
                  <div className="recovery-illustration">
                    <svg viewBox="0 0 80 80" aria-hidden="true">
                      <circle cx="40" cy="40" r="30" />
                      <path d="M27 40h26M40 27v26" />
                    </svg>
                  </div>

                  <div>
                    <span className="section-eyebrow">RECOVERY DAY</span>
                    <h3>Give your body time to recover.</h3>
                    <p>
                      No workout is scheduled today. Focus on hydration,
                      quality nutrition, sleep and getting ready for your
                      next training session.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="exercise-area">
                  <div className="exercise-area-header">
                    <div>
                      <span className="section-eyebrow">
                        WORKOUT EXERCISES
                      </span>
                      <h3>Today's movements</h3>
                    </div>

                    <span className="exercise-count">
                      {activeWorkout.exercises?.length ?? 0} exercises
                    </span>
                  </div>

                  <div className="exercise-grid">
                    {(activeWorkout.exercises ?? []).map(
                      (exercise, index) => (
                        <article
                          className="premium-exercise-card"
                          key={`${exercise.name}-${index}`}
                        >
                          <div className="exercise-card-top">
                            <span className="exercise-number">
                              {String(index + 1).padStart(2, "0")}
                            </span>

                            <span className="exercise-muscle">
                              {formatMuscleName(exercise.targetMuscle)}
                            </span>
                          </div>

                          <h4>{exercise.name}</h4>

                          <div className="exercise-metrics">
                            <div>
                              <strong>{exercise.sets}</strong>
                              <span>Sets</span>
                            </div>

                            <div>
                              <strong>{exercise.reps}</strong>
                              <span>Reps</span>
                            </div>

                            <div>
                              <strong>{exercise.restSeconds}s</strong>
                              <span>Rest</span>
                            </div>
                          </div>

                          {exercise.notes && (
                            <div className="exercise-note">
                              <svg
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path d="M12 20h9" />
                                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
                              </svg>

                              <span>{exercise.notes}</span>
                            </div>
                          )}
                        </article>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* SIDE PANEL */}

            <aside className="workout-side-panel">
              <div className="side-panel-card focus-card">
                <div className="side-card-header">
                  <div>
                    <span className="section-eyebrow">TRAINING FOCUS</span>
                    <h3>Muscle groups</h3>
                  </div>

                  <div className="side-card-icon blue">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M7 8v8M17 8v8M4 10v4M20 10v4M7 12h10" />
                    </svg>
                  </div>
                </div>

                <MuscleFocus muscles={focusedMuscles} />
              </div>

              <div className="side-panel-card session-card">
                <span className="section-eyebrow">SESSION GUIDE</span>

                <h3>Train with intention.</h3>

                <p>
                  Focus on controlled movement and good form rather than
                  rushing through your sets.
                </p>

                <div className="guide-item">
                  <span className="guide-number">01</span>
                  <div>
                    <strong>Warm up</strong>
                    <small>Prepare your body before training.</small>
                  </div>
                </div>

                <div className="guide-item">
                  <span className="guide-number">02</span>
                  <div>
                    <strong>Control every rep</strong>
                    <small>Prioritize technique and range of motion.</small>
                  </div>
                </div>

                <div className="guide-item">
                  <span className="guide-number">03</span>
                  <div>
                    <strong>Respect your rest</strong>
                    <small>Recover between sets before starting again.</small>
                  </div>
                </div>
              </div>
            </aside>
          </section>
        )}

        {/* =====================================================
            WEEKLY MINI OVERVIEW
        ===================================================== */}

        <section className="weekly-overview">
          <div className="section-heading">
            <div>
              <span className="section-eyebrow">WEEK AT A GLANCE</span>
              <h2>Your complete schedule</h2>
            </div>
          </div>

          <div className="weekly-overview-grid">
            {workoutDays.map((day) => {
              const isSelected = day.day === selectedDay;

              return (
                <button
                  type="button"
                  key={day.day}
                  className={`overview-day ${
                    isSelected ? "selected" : ""
                  } ${day.isRestDay ? "rest" : ""}`}
                  onClick={() => setSelectedDay(day.day)}
                >
                  <span>DAY {day.day}</span>

                  <strong>
                    {day.isRestDay ? "Recovery" : day.title}
                  </strong>

                  <small>
                    {day.isRestDay
                      ? "Rest day"
                      : `${day.durationMin ?? 0} min`}
                  </small>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </AppShell>
  );
}