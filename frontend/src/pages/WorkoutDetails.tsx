// frontend/src/pages/WorkoutDetails.tsx
//
// ============================================================================
// REFERENCE PAGE — Sohail and Aayan, read this file before building any page.
//
// Every page in FitPlan follows this exact shape:
//
//   1. Imports        — components from '../components', types from '../types/api'
//   2. Types          — what data this page displays
//   3. The component  — a function that returns HTML
//   4. State          — useState for anything that changes when a user clicks
//   5. Three returns  — loading / empty / real content, in that order
//
// Copy this structure. Don't invent a new one.
// ============================================================================

import { useState } from 'react';
import {
  AppShell,
  Card,
  Button,
  PageHeader,
  EmptyState,
  LoadingSkeleton,
} from '../components';

// ---------------------------------------------------------------------------
// TYPES
//
// These describe the data the page receives. In Sprint 2 these move into
// src/types/api.ts (Aayan owns that file) and get imported instead of
// declared here — they must match Ankush's Pydantic models exactly.
// ---------------------------------------------------------------------------

interface Exercise {
  name: string;
  sets: number;
  reps: string;      // a string, not a number — plans say "8-12", not 10
  restSeconds: number;
  notes?: string;    // the "?" means this field may be missing
}

interface WorkoutDay {
  day: string;       // "Monday"
  focus: string;     // "Push — chest, shoulders, triceps"
  exercises: Exercise[];
}

// ---------------------------------------------------------------------------
// TEMPORARY MOCK DATA
//
// Hardcoded so the page can be built and reviewed before the API exists.
// Sprint 4 replaces this with a real call:
//
//   const plan = await api.get<WeeklyPlan>('/plan');
//
// Building a page against mock data first is normal and correct — it means
// you are never blocked waiting for the backend.
// ---------------------------------------------------------------------------

const MOCK_DAYS: WorkoutDay[] = [
  {
    day: 'Monday',
    focus: 'Push — chest, shoulders, triceps',
    exercises: [
      { name: 'Bench Press',       sets: 4, reps: '8-10', restSeconds: 90, notes: 'Keep shoulder blades retracted' },
      { name: 'Overhead Press',    sets: 3, reps: '10-12', restSeconds: 75 },
      { name: 'Incline Dumbbell',  sets: 3, reps: '10-12', restSeconds: 60 },
      { name: 'Tricep Pushdown',   sets: 3, reps: '12-15', restSeconds: 45 },
    ],
  },
  {
    day: 'Tuesday',
    focus: 'Pull — back, biceps',
    exercises: [
      { name: 'Deadlift',      sets: 4, reps: '5-6',   restSeconds: 150, notes: 'Stop the set if form breaks' },
      { name: 'Lat Pulldown',  sets: 3, reps: '10-12', restSeconds: 75 },
      { name: 'Barbell Row',   sets: 3, reps: '8-10',  restSeconds: 90 },
    ],
  },
  {
    day: 'Wednesday',
    focus: 'Rest',
    exercises: [],
  },
];

// ---------------------------------------------------------------------------
// THE COMPONENT
//
// A component is a function that returns HTML. That is the whole idea.
// The name starts with a capital letter — React requires this.
// ---------------------------------------------------------------------------

export default function WorkoutDetails() {
  // ---- STATE ----
  //
  // useState gives you a value plus a function that changes it. When you call
  // the setter, React redraws this component with the new value.
  //
  //   selectedDay      — which tab is open right now
  //   setSelectedDay   — call this to switch tabs
  //   0                — the starting value (first day)

  const [selectedDay, setSelectedDay] = useState(0);

  // isLoading is hardcoded false for now. In Sprint 4 it becomes real:
  //   const [isLoading, setIsLoading] = useState(true);
  // and flips to false once the API call finishes.
  const isLoading = false;

  const days = MOCK_DAYS;
  const current = days[selectedDay];

  // ---- RETURN 1: LOADING ----
  //
  // Always handle loading first. A blank screen while data arrives looks
  // broken; grey placeholder bars look like it's working.

  if (isLoading) {
    return (
      <AppShell active="/workout" userName="Test User">
        <PageHeader title="Workout Plan" />
        <Card>
          <LoadingSkeleton lines={5} />
        </Card>
      </AppShell>
    );
  }

  // ---- RETURN 2: EMPTY ----
  //
  // Handle "there is no data" second. Never show an empty page with no
  // explanation — tell the user why it's empty and what to do about it.

  if (days.length === 0) {
    return (
      <AppShell active="/workout" userName="Test User">
        <PageHeader title="Workout Plan" />
        <Card>
          <EmptyState
            icon="🏋️"
            title="No workout plan yet"
            message="Generate your first plan to see your weekly workouts here."
            action={<Button onClick={() => alert('Sprint 4 wires this up')}>Generate Plan</Button>}
          />
        </Card>
      </AppShell>
    );
  }

  // ---- RETURN 3: THE REAL PAGE ----

  return (
    <AppShell active="/workout" userName="Test User">
      <PageHeader
        title="Workout Plan"
        subtitle="Your personalised weekly training schedule"
        actions={<Button variant="secondary">Regenerate</Button>}
      />

      {/*
        DAY TABS
        --------
        .map() turns an array of data into an array of HTML elements.
        This is the single most important thing to understand in React.

        Read it as: "for each day in days, give me a Button".

        The `key` prop is required by React whenever you .map() into a list.
        It must be unique and stable — use an id or a name, never the array
        index if the list can reorder.
      */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
        {days.map((day, index) => (
          <Button
            key={day.day}
            size="sm"
            variant={index === selectedDay ? 'primary' : 'secondary'}
            onClick={() => setSelectedDay(index)}
          >
            {day.day}
          </Button>
        ))}
      </div>

      {/*
        THE SELECTED DAY
        ----------------
        `current.exercises.length === 0 ? A : B` is a ternary — inline if/else.
        Use it for small either/or choices inside HTML.
      */}
      <Card title={`${current.day} — ${current.focus}`}>
        {current.exercises.length === 0 ? (
          <EmptyState
            icon="😴"
            title="Rest day"
            message="No training scheduled. Recovery is part of the plan."
          />
        ) : (
          <div>
            {current.exercises.map(exercise => (
              <div
                key={exercise.name}
                style={{
                  padding: 'var(--space-4) 0',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                <div style={{ fontWeight: 'var(--weight-semibold)' }}>
                  {exercise.name}
                </div>

                <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                  {exercise.sets} sets × {exercise.reps} reps · {exercise.restSeconds}s rest
                </div>

                {/*
                  `{condition && <thing/>}` renders `thing` only when the
                  condition is true. Use it when there's no "else" case —
                  here, notes are optional so we show nothing if absent.
                */}
                {exercise.notes && (
                  <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', marginTop: 'var(--space-1)' }}>
                    {exercise.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </AppShell>
  );
}

// ============================================================================
// THE FIVE RULES THIS FILE DEMONSTRATES
//
// 1. Every page is wrapped in <AppShell> with `active` set to its own route.
// 2. Handle loading, then empty, then real content. In that order, every time.
// 3. Use components from '../components'. Never write raw <button> or <div
//    className="card">.
// 4. Colours and spacing come from CSS variables — var(--color-primary), not
//    '#2563EB'. If you're typing a hex code, stop and ask.
// 5. Never call fetch() here. Data comes from '../api/client'.
//
// Stuck for 30 minutes? Post in the group. That's the rule.
// ============================================================================