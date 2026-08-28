/**
 * TypeScript mirrors of the backend Pydantic models.
 * OWNER: Aayan, in direct coordination with Ankush.
 *
 * You two own opposite ends of the same contract. When Ankush changes
 * common/models.py, this file changes in the SAME sprint. A drift here is
 * the classic "works in Postman, breaks in the app" bug.
 *
 * Note: the API speaks camelCase (Pydantic aliases), so these match 1:1.
 *
 * Optionality rule: REQUEST types (UserProfileIn, DailyLogIn) mark
 * backend-defaulted fields optional, because the backend fills them in.
 * RESPONSE types mark everything required, because by the time the backend
 * serialises, every default is already filled.
 */

// Python `date` and `datetime` serialise to ISO strings over JSON,
// so they are `string` here — not Date objects.

export type Goal =
  | "lose_weight"
  | "build_muscle"
  | "stay_fit"
  | "gain_strength";
export type Experience = "beginner" | "intermediate" | "advanced";
export type Split =
  | "full_body"
  | "upper_lower"
  | "push_pull_legs"
  | "bro_split";
export type MealPref =
  | "omnivore"
  | "vegetarian"
  | "vegan"
  | "eggetarian"
  | "pescatarian";
export type Sex = "male" | "female" | "other";
export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";
export type MealSlot = "breakfast" | "lunch" | "dinner" | "snack";
export type BudgetTier = "low" | "medium" | "high";
export type GenerationSource = "llm" | "llm_retry" | "fallback";

/**
 * Request shape — what the onboarding wizard SENDS.
 * Fields with a backend default are optional; the backend fills them in.
 * Fields with no default are required — the backend can't invent them.
 *
 * Named to match the backend's DailyLogIn / DailyLog pattern.
 */
export interface UserProfileIn {
  // required — no default in models.py
  age: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  goal: Goal;
  activityLevel: ActivityLevel;
  experience: Experience;
  daysPerWeek: number;

  // optional — models.py supplies a default
  split?: Split;
  equipment?: string[];
  injuries?: string[];
  mealPref?: MealPref;
  cuisine?: string[];
  allergies?: string[];
  mealsPerDay?: number;
  cookingTime?: number;
  supplements?: string[];
  budgetTier?: BudgetTier;

  // optional and nullable — defaults to None in models.py
  calorieTarget?: number | null;
}

/**
 * Response shape — what GET /profile RETURNS.
 * Every defaulted field is present, because the backend has filled it in.
 *
 * NOTE: this does NOT `extends UserProfileIn`, unlike DailyLog extends
 * DailyLogIn. There, the stored type only ADDS fields. Here the optionality
 * flips — fields that are optional on the way in are guaranteed on the way
 * out — and `extends` cannot turn an optional field into a required one.
 * Written out explicitly so the difference is visible.
 *
 * Storage-only fields (PK, SK) are deliberately absent — never returned.
 */
export interface UserProfile {
  age: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  goal: Goal;
  activityLevel: ActivityLevel;
  experience: Experience;
  daysPerWeek: number;
  split: Split;
  equipment: string[];
  injuries: string[];
  mealPref: MealPref;
  cuisine: string[];
  allergies: string[];
  mealsPerDay: number;
  cookingTime: number;
  supplements: string[];
  budgetTier: BudgetTier;
  calorieTarget: number | null;

  // set by the backend — pending confirmation from Ankush
  createdAt: string;
  updatedAt: string;
}

// --- Response shapes below: everything required, defaults already filled ---

export interface WorkoutExercise {
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
  notes: string | null;
  targetMuscle: string | null;
}

export interface WorkoutDay {
  day: number;
  title: string;
  isRestDay: boolean;
  durationMin: number;
  estCalories: number;
  exercises: WorkoutExercise[];
}

export interface Meal {
  name: string;
  slot: MealSlot;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  prepMinutes: number;
  ingredients: string[];
}

export interface MealDay {
  day: number;
  meals: Meal[];
  totalCalories: number;
  totalProteinG: number;
}

export interface WeeklyPlan {
  weekStartDate: string; // YYYY-MM-DD
  workoutPlan: WorkoutDay[];
  mealPlan: MealDay[];
  coachNote: string | null;
  generatedAt: string | null;
  modelUsed: string | null;
  promptTokens: number | null;
  completionTokens: number | null;
  /** "fallback" means AI generation failed — surface a "regenerate" nudge
   *  rather than silently showing a generic plan. */
  generationSource: GenerationSource;
}

/** Request shape — what the daily check-in POSTs. Raw text only. */
export interface DailyLogIn {
  date: string;
  workoutText?: string;
  mealsText?: string;
  tags?: string[];
}

/** Response shape — what's stored and returned. */
export interface DailyLog extends DailyLogIn {
  createdAt: string;
  parsed: boolean;
  parsedWorkout: Record<string, unknown> | null;
  parsedMeals: Record<string, unknown> | null;
}

/** Frontend-only shape for API error responses — no counterpart in models.py. */
export interface ApiError {
  error: string;
  detail?: unknown;
}

export interface ParsedDay {
  date: string;
  completed: boolean;
  exercises: Record<string, unknown>[];
  meals: Record<string, unknown>[];
  deviations: string[];
}

export interface AdherenceSummary {
  sessionsPlanned: number;
  sessionsCompleted: number;
  avgAdherence: number;
  notes: string;
}

export interface ParsedWeek {
  days: ParsedDay[];
  summary: AdherenceSummary;
}
