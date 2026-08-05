/**
 * TypeScript mirrors of the backend Pydantic models.
 * OWNER: [E], in direct coordination with [B].
 *
 * You two own opposite ends of the same contract. When [B] changes
 * common/models.py, this file changes in the SAME sprint. A drift here is
 * the classic "works in Postman, breaks in the app" bug.
 *
 * Note: the API speaks camelCase (Pydantic aliases), so these match 1:1.
 */

export type Goal = "lose_weight" | "build_muscle" | "stay_fit" | "gain_strength";
export type Experience = "beginner" | "intermediate" | "advanced";
export type Split = "full_body" | "upper_lower" | "push_pull_legs" | "bro_split";
export type MealPref = "omnivore" | "vegetarian" | "vegan" | "eggetarian" | "pescatarian";
export type Sex = "male" | "female" | "other";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type MealSlot = "breakfast" | "lunch" | "dinner" | "snack";

export interface UserProfile {
  age: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  goal: Goal;
  activityLevel: ActivityLevel;
  experience: Experience;
  daysPerWeek: number;
  equipment: string[];
  split: Split;
  injuries: string[];
  mealPref: MealPref;
  cuisine: string[];
  allergies: string[];
  mealsPerDay: number;
  cookingTime: number;
  calorieTarget: number | null;
  supplements: string[];
  budgetTier: "low" | "medium" | "high";
}

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
  /** "fallback" means AI generation failed — [D]/[E] should surface a
   *  "regenerate" nudge rather than silently showing a generic plan. */
  generationSource: "llm" | "llm_retry" | "fallback";
}

export interface DailyLog {
  date: string;
  workoutText: string;
  mealsText: string;
  tags: string[];
  createdAt: string;
  parsed: boolean;
}

export interface ApiError {
  error: string;
  detail?: unknown;
}
