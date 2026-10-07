import { useEffect, useMemo, useState } from "react";
import {
  EmptyState, LoadingSkeleton } from "../components";
import { api } from "../api/client";
import MuscleFocus from "../components/MuscleFocus";
import type { WorkoutDay, WeeklyPlan } from "../types/api";
import "./WorkoutDetails.css";

function getTodayIndex(): number {
  const day = new Date().getDay();
  return day === 0 ? 7 : day;
}

function getMuscles(workout: WorkoutDay | undefined): string {
  const muscles = Array.from(
    new Set(
      (workout?.exercises ?? [])
        .map((exercise) => exercise.targetMuscle)
        .filter(Boolean),
    ),
  );

  if (muscles.length === 0) {
    return "Full body training";
  }

  return muscles
    .map(
      (muscle) =>
        muscle!.charAt(0).toUpperCase() + muscle!.slice(1),
    )
    .join(", ");
}

export default function WorkoutDetails() {
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDay, setSelectedDay] = useState(getTodayIndex());

  useEffect(() => {
    async function loadPlan() {
      try {
        setIsLoading(true);
        setError("");

        const response = await api.getPlan();
        setPlan(response.plan);
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

  const selectedWorkout = useMemo(() => {
    return (
      workoutDays.find((day) => day.day === selectedDay) ??
      workoutDays[0]
    );
  }, [workoutDays, selectedDay]);

  const trainingDays = workoutDays.filter(
    (day) => !day.isRestDay,
  ).length;

  const totalExercises = workoutDays.reduce(
    (total, day) => total + (day.exercises?.length ?? 0),
    0,
  );

  const estimatedCalories = workoutDays.reduce(
    (total, day) =>
      total + (day.isRestDay ? 0 : day.estCalories ?? 0),
    0,
  );

  const selectedExercises = selectedWorkout?.exercises ?? [];

  const muscleGroups = getMuscles(selectedWorkout);

  if (isLoading) {
    return (
      <>
        <div className="workout-page">
          <section className="workout-loading">
            <div className="workout-loading-header">
              <LoadingSkeleton lines={4} />
            </div>

            <div className="workout-loading-grid">
              <LoadingSkeleton lines={5} />
              <LoadingSkeleton lines={5} />
              <LoadingSkeleton lines={5} />
            </div>
          </section>
        </div>
      </>
    );
  }

  if (error || !plan) {
    return (
      <>
        <div className="workout-page">
          <div className="workout-empty">
            <EmptyState
              title="No workout plan available"
              message={
                error ||
                "Generate a plan from your dashboard first."
              }
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="workout-page">
        {/* Page header */}
        <header className="workout-header">
          <div>
            <span className="workout-eyebrow">
              YOUR TRAINING PLAN
            </span>

            <h1>Train with purpose.</h1>

            <p>
              Your personalized weekly training schedule is ready.
              Choose a day below to view the complete workout.
            </p>
          </div>

          <div className="workout-header-summary">
            <div className="workout-header-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M6 9v6M4 10.5v3M8 7.5v9M18 9v6M20 10.5v3M16 7.5v9M8 12h8"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div>
              <strong>{trainingDays} training days</strong>
              <span>This week&apos;s schedule</span>
            </div>
          </div>
        </header>

        {/* Fallback notice */}
        {plan.generationSource === "fallback" && (
          <div className="workout-alert">
            <div className="workout-alert-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M12 8v4M12 16h.01"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M10.3 4.8 3.6 16.2c-.8 1.4.2 3.2 1.8 3.2h13.2c1.6 0 2.6-1.8 1.8-3.2L13.7 4.8c-.8-1.4-2.6-1.4-3.4 0Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div>
              <strong>Starter workout plan active</strong>
              <p>
                AI generation is currently unavailable, so FitPlan
                is using the available starter plan.
              </p>
            </div>
          </div>
        )}

        {/* Coach note */}
        {plan.coachNote && (
          <section className="coach-note">
            <div className="coach-note-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M8 18.5 4.5 20l1.2-3.5A7.5 7.5 0 1 1 8 18.5Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
                <path
                  d="M8.5 10.5h7M8.5 13.5h4.5"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div>
              <span>COACH NOTE</span>
              <p>{plan.coachNote}</p>
            </div>
          </section>
        )}

        {/* Overview stats */}
        <section className="workout-stats">
          <div className="workout-stat-card">
            <div className="workout-stat-icon blue">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M7 5v14M17 5v14M4 8v8M20 8v8M7 12h10"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div>
              <span>Training days</span>
              <strong>{trainingDays}</strong>
              <small>This week</small>
            </div>
          </div>

          <div className="workout-stat-card">
            <div className="workout-stat-icon purple">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="8"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M12 8v4l2.5 2"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div>
              <span>Current session</span>
              <strong>
                {selectedWorkout?.isRestDay
                  ? "Rest"
                  : `${selectedWorkout?.durationMin ?? 0} min`}
              </strong>
              <small>{selectedWorkout?.title ?? "Workout"}</small>
            </div>
          </div>

          <div className="workout-stat-card">
            <div className="workout-stat-icon green">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M12 4c2.5 3.2 5.5 6.2 5.5 10A5.5 5.5 0 1 1 6.5 14C6.5 10.2 9.5 7.2 12 4Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div>
              <span>Total exercises</span>
              <strong>{totalExercises}</strong>
              <small>Across this week</small>
            </div>
          </div>

          <div className="workout-stat-card">
            <div className="workout-stat-icon orange">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M12 3c1.5 3.2 5.5 5.3 5.5 10a5.5 5.5 0 1 1-11 0c0-2.7 1.4-4.7 3.2-6.3.1 2 1.1 3.1 2.3 3.8.2-2.4-.2-4.4 0-7.5Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div>
              <span>Estimated burn</span>
              <strong>{estimatedCalories}</strong>
              <small>kcal this week</small>
            </div>
          </div>
        </section>

        {/* Week selector */}
        <section className="week-section">
          <div className="section-heading">
            <div>
              <span className="section-label">YOUR WEEK</span>
              <h2>Choose a workout day</h2>
            </div>

            <span className="section-count">
              {workoutDays.length} days
            </span>
          </div>

          <div className="week-selector">
            {workoutDays.map((day) => {
              const isSelected = day.day === selectedDay;

              return (
                <button
                  key={day.day}
                  type="button"
                  className={`week-day ${
                    isSelected ? "selected" : ""
                  } ${day.isRestDay ? "rest" : ""}`}
                  onClick={() => setSelectedDay(day.day)}
                >
                  <span>DAY {day.day}</span>

                  <strong>
                    {day.isRestDay
                      ? "Rest"
                      : day.title}
                  </strong>

                  <small>
                    {day.isRestDay
                      ? "Recovery"
                      : `${day.durationMin ?? 0} min`}
                  </small>
                </button>
              );
            })}
          </div>
        </section>

        {/* Main workout area */}
        <section className="workout-layout">
          <div className="workout-main-card">
            <div className="active-workout-header">
              <div className="active-day-number">
                <span>DAY</span>
                <strong>{selectedWorkout?.day}</strong>
              </div>

              <div className="active-workout-title">
                <span className="section-label">
                  TODAY&apos;S WORKOUT
                </span>

                <h2>
                  {selectedWorkout?.title ??
                    "Workout session"}
                </h2>

                <div className="active-workout-meta">
                  {!selectedWorkout?.isRestDay && (
                    <>
                      <span>
                        {selectedWorkout?.durationMin ?? 0} min
                      </span>
                      <span>
                        {selectedWorkout?.estCalories ?? 0} kcal
                      </span>
                      <span>
                        {selectedExercises.length} exercises
                      </span>
                    </>
                  )}

                  {selectedWorkout?.isRestDay && (
                    <span>Recovery day</span>
                  )}
                </div>
              </div>

              {!selectedWorkout?.isRestDay && (
                <div className="muscle-summary">
                  <span>Training focus</span>
                  <strong>{muscleGroups}</strong>
                </div>
              )}
            </div>

            {selectedWorkout?.isRestDay ? (
              <div className="rest-day-card">
                <div className="rest-day-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M8 6.5h8M7 10h10M8.5 13.5h7M10 17h4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <rect
                      x="5"
                      y="3"
                      width="14"
                      height="18"
                      rx="3"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                  </svg>
                </div>

                <div>
                  <h3>Recovery day</h3>
                  <p>
                    No workout is scheduled today. Use this day
                    to recover, stay hydrated, and prepare for
                    your next training session.
                  </p>
                </div>
              </div>
            ) : (
              <div className="exercise-list">
                {selectedExercises.map((exercise, index) => (
                  <article
                    key={`${exercise.name}-${index}`}
                    className="exercise-card"
                  >
                    <div className="exercise-number">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="exercise-content">
                      <div className="exercise-top">
                        <div>
                          <h3>{exercise.name}</h3>

                          {exercise.targetMuscle && (
                            <span className="exercise-muscle">
                              {exercise.targetMuscle}
                            </span>
                          )}
                        </div>

                        <div className="exercise-metrics">
                          <div>
                            <strong>
                              {exercise.sets}
                            </strong>
                            <span>sets</span>
                          </div>

                          <div>
                            <strong>
                              {exercise.reps}
                            </strong>
                            <span>reps</span>
                          </div>

                          <div>
                            <strong>
                              {exercise.restSeconds}s
                            </strong>
                            <span>rest</span>
                          </div>
                        </div>
                      </div>

                      {exercise.notes && (
                        <div className="exercise-note">
                          <span>TIP</span>
                          <p>{exercise.notes}</p>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Right side */}
          <aside className="workout-sidebar-content">
            <section className="workout-side-card">
              <div className="side-card-header">
                <div>
                  <span className="section-label">
                    TRAINING FOCUS
                  </span>
                  <h3>Muscle groups</h3>
                </div>
              </div>

              <div className="muscle-focus-wrapper">
                <MuscleFocus
                  muscles={Array.from(
                    new Set(
                      selectedExercises
                        .map(
                          (exercise) =>
                            exercise.targetMuscle,
                        )
                        .filter(
                          (
                            muscle,
                          ): muscle is NonNullable<
                            typeof muscle
                          > => muscle !== null,
                        ),
                    ),
                  )}
                />
              </div>
            </section>

            <section className="workout-side-card session-guide">
              <div className="side-card-header">
                <div>
                  <span className="section-label">
                    SESSION GUIDE
                  </span>
                  <h3>How to train</h3>
                </div>
              </div>

              <div className="guide-list">
                <div className="guide-item">
                  <div className="guide-number">01</div>
                  <div>
                    <strong>Warm up</strong>
                    <p>
                      Prepare your body before starting the
                      session.
                    </p>
                  </div>
                </div>

                <div className="guide-item">
                  <div className="guide-number">02</div>
                  <div>
                    <strong>Follow the order</strong>
                    <p>
                      Complete exercises in the sequence shown.
                    </p>
                  </div>
                </div>

                <div className="guide-item">
                  <div className="guide-number">03</div>
                  <div>
                    <strong>Rest properly</strong>
                    <p>
                      Use the recommended rest between sets.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </section>

        {/* Week overview */}
        <section className="week-overview">
          <div className="section-heading">
            <div>
              <span className="section-label">OVERVIEW</span>
              <h2>Week at a glance</h2>
            </div>
          </div>

          <div className="overview-grid">
            {workoutDays.map((day) => (
              <button
                type="button"
                key={day.day}
                className={`overview-day ${
                  day.day === selectedDay ? "active" : ""
                }`}
                onClick={() => setSelectedDay(day.day)}
              >
                <div className="overview-day-top">
                  <span>Day {day.day}</span>

                  {day.isRestDay ? (
                    <span className="overview-status rest">
                      Rest
                    </span>
                  ) : (
                    <span className="overview-status">
                      Training
                    </span>
                  )}
                </div>

                <strong>{day.title}</strong>

                <small>
                  {day.isRestDay
                    ? "Recovery"
                    : `${day.durationMin ?? 0} min - ${
                        day.exercises?.length ?? 0
                      } exercises`}
                </small>
              </button>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
