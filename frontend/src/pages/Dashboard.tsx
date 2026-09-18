import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiRequestError } from "@/api/client";
import type { WeeklyPlan, WorkoutDay } from "@/types/api";
import "./Dashboard.css";

function getTodayIndex(): number {
  const day = new Date().getDay();
  return day === 0 ? 7 : day;
}

function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function getMuscles(workout: WorkoutDay): string {
  const muscles = Array.from(
    new Set(
      (workout.exercises ?? [])
        .map((exercise) => exercise.targetMuscle)
        .filter(Boolean),
    ),
  );

  if (muscles.length === 0) {
    return "Full body training";
  }

  return muscles
    .map((muscle) => muscle!.charAt(0).toUpperCase() + muscle!.slice(1))
    .join(", ");
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export default function Dashboard() {
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadPlan() {
    try {
      setLoading(true);
      setError(null);

      const response = await api.getPlan();
      setPlan(response.plan);
    } catch (err) {
      console.error(err);

      if (err instanceof ApiRequestError && err.status === 404) {
        setPlan(null);
        setError(null);
      } else {
        setError(
          err instanceof Error ? err.message : "Unable to load your plan.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPlan();
  }, []);

  async function handleGenerate() {
    try {
      setGenerating(true);
      setError(null);

      const response = await api.generatePlan({ force: true });
      setPlan(response.plan);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to generate your plan.",
      );
    } finally {
      setGenerating(false);
    }
  }

  const todayIndex = getTodayIndex();

  const todayWorkout = useMemo(
    () =>
      plan?.workoutPlan?.find((day) => day.day === todayIndex) ??
      plan?.workoutPlan?.[0],
    [plan, todayIndex],
  );

  const todayMeal = useMemo(
    () =>
      plan?.mealPlan?.find((day) => day.day === todayIndex) ??
      plan?.mealPlan?.[0],
    [plan, todayIndex],
  );

  const workoutDays =
    plan?.workoutPlan?.filter((day) => !day.isRestDay).length ?? 0;

  const totalMeals =
    plan?.mealPlan?.reduce(
      (total, day) => total + (day.meals?.length ?? 0),
      0,
    ) ?? 0;

  const averageCalories =
    plan?.mealPlan && plan.mealPlan.length > 0
      ? Math.round(
          plan.mealPlan.reduce(
            (total, day) => total + (day.totalCalories ?? 0),
            0,
          ) / plan.mealPlan.length,
        )
      : 0;

  const totalProtein =
    todayMeal?.totalProteinG != null
      ? Math.round(todayMeal.totalProteinG)
      : 0;

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-skeleton-header">
          <div className="skeleton-line skeleton-eyebrow" />
          <div className="skeleton-line skeleton-title" />
          <div className="skeleton-line skeleton-copy" />
        </div>

        <div className="dashboard-skeleton-stats">
          {[1, 2, 3].map((item) => (
            <div className="dashboard-skeleton-card" key={item}>
              <div className="skeleton-circle" />
              <div className="skeleton-stack">
                <div className="skeleton-line skeleton-small" />
                <div className="skeleton-line skeleton-medium" />
              </div>
            </div>
          ))}
        </div>

        <div className="dashboard-skeleton-main">
          <div className="dashboard-skeleton-card skeleton-large" />
          <div className="dashboard-skeleton-card skeleton-large" />
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="dashboard-page">
        <section className="dashboard-empty">
          <div className="dashboard-empty-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 19V5M4 19h16M8 16v-4M12 16V8M16 16V5" />
            </svg>
          </div>

          <span className="dashboard-label">YOUR PLAN</span>

          <h1>Your fitness plan is ready to begin.</h1>

          <p>
            Create your personalized workout and nutrition plan to start
            tracking your progress with FitPlan.
          </p>

          <button
            className="primary-button large"
            type="button"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? "Creating your plan..." : "Create My Plan"}
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="dashboard-header-copy">
          <span className="dashboard-label">FITPLAN DASHBOARD</span>

          <h1>{getGreeting()}, let&apos;s get moving.</h1>

          <p>
            Your plan is ready. Stay consistent today and keep building
            momentum.
          </p>
        </div>

        <div className="dashboard-header-actions">
          <Link className="secondary-button" to="/logs">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 3v4M16 3v4M4 9h16M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
              <path d="M8 13h3M8 17h5" />
            </svg>
            Log Progress
          </Link>

          <button
            className="primary-button"
            type="button"
            onClick={handleGenerate}
            disabled={generating}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20 11a8.1 8.1 0 0 0-15.4-2M4 5v4h4M4 13a8.1 8.1 0 0 0 15.4 2M20 19v-4h-4" />
            </svg>

            {generating ? "Regenerating..." : "Regenerate Plan"}
          </button>
        </div>
      </header>

      {plan.generationSource === "fallback" && (
        <section className="starter-alert">
          <div className="starter-alert-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3 3.5 18h17L12 3Z" />
              <path d="M12 9v4M12 16v.5" />
            </svg>
          </div>

          <div>
            <strong>Starter plan currently active</strong>
            <p>
              AI generation is temporarily unavailable, but your current
              plan is ready to use.
            </p>
          </div>
        </section>
      )}

      {error && (
        <section className="dashboard-error-card">
          <div>
            <strong>Something went wrong</strong>
            <p>{error}</p>
          </div>

          <button
            className="secondary-button"
            type="button"
            onClick={() => void loadPlan()}
          >
            Try Again
          </button>
        </section>
      )}

      <section className="dashboard-stats">
        <article className="stat-card stat-blue">
          <div className="stat-card-top">
            <div className="stat-card-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 8V5M17 8V5M5 9h14M8 13h3M13 13h3M8 17h3M13 17h3" />
                <rect x="4" y="5" width="16" height="15" rx="3" />
              </svg>
            </div>

            <span className="stat-trend">THIS WEEK</span>
          </div>

          <div className="stat-value">{workoutDays}</div>

          <div className="stat-title">Workout days</div>

          <div className="stat-description">
            Planned training sessions
          </div>
        </article>

        <article className="stat-card stat-purple">
          <div className="stat-card-top">
            <div className="stat-card-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 3h10M7 21h10M8 3c0 4 8 4 8 9s-8 5-8 9M16 3c0 4-8 4-8 9s8 5 8 9" />
              </svg>
            </div>

            <span className="stat-trend">THIS WEEK</span>
          </div>

          <div className="stat-value">{totalMeals}</div>

          <div className="stat-title">Meals planned</div>

          <div className="stat-description">
            Across your weekly nutrition plan
          </div>
        </article>

        <article className="stat-card stat-green">
          <div className="stat-card-top">
            <div className="stat-card-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3v18M7 8h7a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h8" />
              </svg>
            </div>

            <span className="stat-trend">DAILY TARGET</span>
          </div>

          <div className="stat-value">{formatNumber(averageCalories)}</div>

          <div className="stat-title">Average calories</div>

          <div className="stat-description">
            Daily nutrition target
          </div>
        </article>
      </section>

      <section className="dashboard-main-grid">
        <article className="today-workout-card">
          <div className="card-header-row">
            <div>
              <span className="section-label">TODAY&apos;S FOCUS</span>
              <h2>{todayWorkout?.title ?? "Your workout"}</h2>
            </div>

            <span className="day-badge">
              DAY {todayWorkout?.day ?? todayIndex}
            </span>
          </div>

          <div className="workout-summary">
            <div className="workout-summary-item">
              <span className="summary-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="8" />
                  <path d="M12 8v4l3 2" />
                </svg>
              </span>
              <div>
                <strong>{todayWorkout?.durationMin ?? 0} min</strong>
                <span>Duration</span>
              </div>
            </div>

            <div className="workout-summary-item">
              <span className="summary-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 3c1.8 3 5 4.6 5 8.4A5 5 0 0 1 7 12c0-2.8 1.8-4.7 3.2-6.2.2 2 1.1 3.1 1.8 3.8.4-2.1.1-3.8 0-6.6Z" />
                </svg>
              </span>
              <div>
                <strong>{todayWorkout?.estCalories ?? 0} kcal</strong>
                <span>Estimated burn</span>
              </div>
            </div>

            <div className="workout-summary-item">
              <span className="summary-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="8" cy="8" r="2.5" />
                  <circle cx="16" cy="8" r="2.5" />
                  <circle cx="8" cy="16" r="2.5" />
                  <circle cx="16" cy="16" r="2.5" />
                </svg>
              </span>
              <div>
                <strong>{todayWorkout?.exercises?.length ?? 0}</strong>
                <span>Exercises</span>
              </div>
            </div>
          </div>

          <div className="muscle-target">
            <span>Target area</span>
            <strong>{todayWorkout ? getMuscles(todayWorkout) : "Full body"}</strong>
          </div>

          <div className="exercise-section">
            <div className="exercise-section-heading">
              <span>Workout plan</span>
              <span>
                {todayWorkout?.exercises?.length ?? 0} exercises
              </span>
            </div>

            <div className="exercise-list">
              {(todayWorkout?.exercises ?? []).map((exercise, index) => (
                <div className="exercise-row" key={`${exercise.name}-${index}`}>
                  <span className="exercise-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="exercise-info">
                    <strong>{exercise.name}</strong>
                    <span>
                      {exercise.sets} sets
                      {exercise.reps ? `- ${exercise.reps} reps` : ""}
                    </span>
                  </div>

                  <span className="exercise-check">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="m7 12 3 3 7-7" />
                    </svg>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Link className="workout-button" to="/workout">
            View full workout
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </article>

        <aside className="dashboard-side-column">
          <article className="coach-card">
            <div className="coach-glow coach-glow-one" />
            <div className="coach-glow coach-glow-two" />

            <div className="coach-content">
              <span className="coach-label">
                <span className="coach-status-dot" />
                PERSONALIZED FOR YOU
              </span>

              <h2>Your AI Coach</h2>

              <p>
                {plan.coachNote ??
                  "Get guidance, adjust your routine, and stay accountable with your AI fitness coach."}
              </p>

              <Link className="coach-button" to="/coach">
                Talk to AI Coach
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            </div>

            <div className="coach-decoration" aria-hidden="true">
              <svg viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="46" />
                <circle cx="60" cy="60" r="30" />
                <path d="M60 30v60M30 60h60" />
              </svg>
            </div>
          </article>

          <article className="recovery-card">
            <div className="recovery-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20 12a8 8 0 1 1-2.3-5.7" />
                <path d="M20 5v5h-5" />
              </svg>
            </div>

            <div>
              <span className="section-label">RECOVERY</span>
              <h3>Consistency beats intensity.</h3>
              <p>
                Give your body time to recover and come back stronger.
              </p>
            </div>
          </article>
        </aside>
      </section>

      <section className="weekly-section">
        <div className="section-heading-row">
          <div>
            <span className="section-label">YOUR WEEK</span>
            <h2>Weekly training schedule</h2>
          </div>

          <Link to="/calendar" className="text-link">
            Open calendar
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>

        <div className="weekly-grid">
          {(plan.workoutPlan ?? []).map((day) => {
            const isToday = day.day === todayIndex;

            return (
              <div
                className={`week-day ${isToday ? "active" : ""} ${
                  day.isRestDay ? "rest" : ""
                }`}
                key={day.day}
              >
                <div className="week-day-top">
                  <span>DAY</span>
                  <strong>{day.day}</strong>
                </div>

                <div className="week-day-indicator">
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

                <h3>{day.isRestDay ? "Recovery" : day.title}</h3>

                <span className="week-day-meta">
                  {day.isRestDay
                    ? "Rest day"
                    : `${day.durationMin ?? 0} min`}
                </span>

                {isToday && <span className="today-pill">TODAY</span>}
              </div>
            );
          })}
        </div>
      </section>

      <section className="dashboard-bottom-grid">
        <article className="nutrition-card">
          <div className="section-heading-row">
            <div>
              <span className="section-label">TODAY&apos;S NUTRITION</span>
              <h2>Fuel your training</h2>
            </div>

            <Link to="/meals" className="text-link">
              View meals
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>

          <div className="nutrition-overview">
            <div className="nutrition-calories">
              <span>Calories</span>
              <strong>
                {formatNumber(todayMeal?.totalCalories ?? 0)}
                <small> kcal</small>
              </strong>
            </div>

            <div className="nutrition-protein">
              <span>Protein</span>
              <strong>
                {totalProtein}
                <small> g</small>
              </strong>
            </div>
          </div>

          <div className="nutrition-progress">
            <div className="nutrition-progress-label">
              <span>Daily calorie target</span>
              <strong>
                {formatNumber(todayMeal?.totalCalories ?? 0)} kcal
              </strong>
            </div>

            <div className="progress-track">
              <div className="progress-fill" />
            </div>
          </div>

          <div className="meal-list">
            {(todayMeal?.meals ?? []).slice(0, 4).map((meal, index) => (
              <div className="meal-row" key={`${meal.name}-${index}`}>
                <div className="meal-dot">
                  {index + 1}
                </div>

                <div>
                  <strong>{meal.name}</strong>
                  <span>{meal.slot}</span>
                </div>

                <strong>{meal.calories} kcal</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="quick-actions-card">
          <div>
            <span className="section-label">SHORTCUTS</span>
            <h2>What do you want to do?</h2>
            <p>Jump directly into the tools you use most.</p>
          </div>

          <div className="quick-actions">
            <Link to="/logs" className="quick-action">
              <span className="quick-action-icon blue">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5" />
                </svg>
              </span>

              <span>
                <strong>Log today</strong>
                <small>Track your progress</small>
              </span>

              <svg className="quick-arrow" viewBox="0 0 24 24">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>

            <Link to="/meals" className="quick-action">
              <span className="quick-action-icon purple">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10M17 3v18M14 3v7h6" />
                </svg>
              </span>

              <span>
                <strong>Explore meals</strong>
                <small>See your nutrition plan</small>
              </span>

              <svg className="quick-arrow" viewBox="0 0 24 24">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>

            <Link to="/coach" className="quick-action">
              <span className="quick-action-icon green">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20 11.5a7 7 0 0 1-8 7 8.6 8.6 0 0 1-3-.6L5 20l1.4-3.3A7 7 0 1 1 20 11.5Z" />
                  <path d="M9 12h.01M12 12h.01M15 12h.01" />
                </svg>
              </span>

              <span>
                <strong>Ask AI Coach</strong>
                <small>Get personalized guidance</small>
              </span>

              <svg className="quick-arrow" viewBox="0 0 24 24">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}