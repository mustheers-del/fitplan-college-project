"""
Pydantic models — the contract between the AI layer, the API and the frontend.

OWNER: [B]  ·  Reviewed by [M] before anything else is built on top.

These models do double duty:
  1. Validate incoming API request bodies
  2. Validate what Bedrock returns (WeeklyPlan.model_validate on LLM output)

That second job is why the constraints here matter. A Field(ge=..., le=...)
here is what stops the model programming 900 reps.
"""

from __future__ import annotations

from datetime import date, datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field, field_validator

# --------------------------------------------------------------------------
# Enums (as Literals — they serialise into the JSON schema the LLM sees)
# --------------------------------------------------------------------------

Goal = Literal["lose_weight", "build_muscle", "stay_fit", "gain_strength"]
Experience = Literal["beginner", "intermediate", "advanced"]
Split = Literal["full_body", "upper_lower", "push_pull_legs", "bro_split"]
MealPref = Literal["omnivore", "vegetarian", "vegan", "eggetarian", "pescatarian"]
Sex = Literal["male", "female", "other"]
ActivityLevel = Literal["sedentary", "light", "moderate", "active", "very_active"]


# --------------------------------------------------------------------------
# User profile
# --------------------------------------------------------------------------


class UserProfile(BaseModel):
    """Written once at onboarding, editable later. SK = 'PROFILE'."""

    age: int = Field(ge=13, le=100)
    sex: Sex
    height_cm: float = Field(ge=100, le=250, alias="heightCm")
    weight_kg: float = Field(ge=30, le=300, alias="weightKg")
    goal: Goal
    activity_level: ActivityLevel = Field(alias="activityLevel")
    experience: Experience
    days_per_week: int = Field(ge=1, le=7, alias="daysPerWeek")
    equipment: list[str] = Field(default_factory=lambda: ["bodyweight"])
    split: Split = "full_body"
    injuries: list[str] = Field(default_factory=list)
    meal_pref: MealPref = Field(default="omnivore", alias="mealPref")
    cuisine: list[str] = Field(default_factory=list)
    allergies: list[str] = Field(default_factory=list)
    meals_per_day: int = Field(default=3, ge=2, le=6, alias="mealsPerDay")
    cooking_time: int = Field(default=30, ge=5, le=180, alias="cookingTime")
    calorie_target: Optional[int] = Field(default=None, ge=1000, le=6000, alias="calorieTarget")
    supplements: list[str] = Field(default_factory=list)
    budget_tier: Literal["low", "medium", "high"] = Field(default="medium", alias="budgetTier")

    model_config = {"populate_by_name": True, "extra": "forbid"}

    @field_validator("equipment")
    @classmethod
    def _equipment_not_empty(cls, v: list[str]) -> list[str]:
        return v or ["bodyweight"]


# --------------------------------------------------------------------------
# Weekly plan — this is what the LLM must produce
# --------------------------------------------------------------------------


class WorkoutExercise(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    sets: int = Field(ge=1, le=10)
    reps: str = Field(description="e.g. '8-12' or '30 sec' for timed holds")
    rest_seconds: int = Field(default=60, ge=15, le=300, alias="restSeconds")
    notes: Optional[str] = Field(default=None, max_length=200)
    target_muscle: Optional[str] = Field(default=None, alias="targetMuscle")

    model_config = {"populate_by_name": True, "extra": "allow"}


class WorkoutDay(BaseModel):
    day: int = Field(ge=1, le=7)
    title: str = Field(min_length=2, max_length=60, description="e.g. 'Upper Body Strength'")
    is_rest_day: bool = Field(default=False, alias="isRestDay")
    duration_min: int = Field(default=45, ge=0, le=180, alias="durationMin")
    est_calories: int = Field(default=0, ge=0, le=2000, alias="estCalories")
    exercises: list[WorkoutExercise] = Field(default_factory=list)

    model_config = {"populate_by_name": True, "extra": "allow"}

    @field_validator("exercises")
    @classmethod
    def _sane_exercise_count(cls, v: list[WorkoutExercise]) -> list[WorkoutExercise]:
        if len(v) > 10:
            raise ValueError("more than 10 exercises in one session is not a realistic plan")
        return v


class Meal(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    slot: Literal["breakfast", "lunch", "dinner", "snack"]
    calories: int = Field(ge=0, le=2500)
    protein_g: float = Field(ge=0, le=250, alias="proteinG")
    carbs_g: float = Field(ge=0, le=500, alias="carbsG")
    fats_g: float = Field(ge=0, le=200, alias="fatsG")
    prep_minutes: int = Field(default=15, ge=0, le=180, alias="prepMinutes")
    ingredients: list[str] = Field(default_factory=list)

    model_config = {"populate_by_name": True, "extra": "allow"}


class MealDay(BaseModel):
    day: int = Field(ge=1, le=7)
    meals: list[Meal]
    total_calories: int = Field(ge=0, le=8000, alias="totalCalories")
    total_protein_g: float = Field(ge=0, le=500, alias="totalProteinG")

    model_config = {"populate_by_name": True, "extra": "allow"}


class WeeklyPlan(BaseModel):
    """SK = 'PLAN#<weekStartDate>'. This is the LLM's output contract."""

    week_start_date: date = Field(alias="weekStartDate")
    workout_plan: list[WorkoutDay] = Field(alias="workoutPlan")
    meal_plan: list[MealDay] = Field(alias="mealPlan")
    coach_note: Optional[str] = Field(default=None, max_length=500, alias="coachNote")

    # metadata — set by the backend, never by the model
    generated_at: Optional[datetime] = Field(default=None, alias="generatedAt")
    model_used: Optional[str] = Field(default=None, alias="modelUsed")
    prompt_tokens: Optional[int] = Field(default=None, alias="promptTokens")
    completion_tokens: Optional[int] = Field(default=None, alias="completionTokens")
    generation_source: Literal["llm", "llm_retry", "fallback"] = Field(
        default="llm", alias="generationSource"
    )

    model_config = {"populate_by_name": True, "extra": "allow"}

    @field_validator("workout_plan", "meal_plan")
    @classmethod
    def _exactly_seven_days(cls, v: list) -> list:
        if len(v) != 7:
            raise ValueError(f"plan must contain exactly 7 days, got {len(v)}")
        days = sorted(d.day for d in v)
        if days != list(range(1, 8)):
            raise ValueError(f"days must be 1..7 with no duplicates, got {days}")
        return v


# --------------------------------------------------------------------------
# Daily logs
# --------------------------------------------------------------------------


class DailyLogIn(BaseModel):
    """What the user POSTs. Raw text only — no LLM call on write."""

    date: date
    workout_text: str = Field(default="", max_length=4000, alias="workoutText")
    meals_text: str = Field(default="", max_length=4000, alias="mealsText")
    tags: list[str] = Field(default_factory=list)

    model_config = {"populate_by_name": True, "extra": "forbid"}


class DailyLog(DailyLogIn):
    """What's stored. SK = 'DAILYLOG#<date>'."""

    created_at: datetime = Field(alias="createdAt")
    parsed: bool = False
    parsed_workout: Optional[dict] = Field(default=None, alias="parsedWorkout")
    parsed_meals: Optional[dict] = Field(default=None, alias="parsedMeals")

    model_config = {"populate_by_name": True, "extra": "ignore"}


# --------------------------------------------------------------------------
# Parsed adherence — the LLM's other output contract (log parsing)
# --------------------------------------------------------------------------


class ParsedDay(BaseModel):
    date: date
    completed: bool
    exercises: list[dict] = Field(default_factory=list)
    meals: list[dict] = Field(default_factory=list)
    deviations: list[str] = Field(default_factory=list)

    model_config = {"extra": "allow"}


class AdherenceSummary(BaseModel):
    sessions_planned: int = Field(ge=0, le=7, alias="sessionsPlanned")
    sessions_completed: int = Field(ge=0, le=7, alias="sessionsCompleted")
    avg_adherence: float = Field(ge=0.0, le=1.0, alias="avgAdherence")
    notes: str = Field(default="", max_length=800)

    model_config = {"populate_by_name": True, "extra": "allow"}


class ParsedWeek(BaseModel):
    days: list[ParsedDay]
    summary: AdherenceSummary

    model_config = {"extra": "allow"}
