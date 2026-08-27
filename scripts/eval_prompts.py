"""
FitPlan prompt evaluation harness.

Runs five representative profiles through the real AI generation path,
checks the resulting WeeklyPlan against explicit product rules, and writes
a Markdown evaluation report.

Run from repository root:

    
This is an evaluation tool only. It does NOT write plans to DynamoDB.
"""

from __future__ import annotations

import os
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any

# Make backend/ importable when this script is run from the repository root.
ROOT = Path(__file__).resolve().parents[1]
BACKEND = ROOT / "backend"

if str(BACKEND) not in sys.path:
    sys.path.insert(0, str(BACKEND))

# Keep local evaluation on the configured provider.
os.environ.setdefault("AWS_REGION", "us-east-1")

from common import ai  # noqa: E402
from common.models import UserProfile, WeeklyPlan  # noqa: E402
from common.prompts import PLAN_SYSTEM_PROMPT, build_plan_user_prompt  # noqa: E402


# ---------------------------------------------------------------------------
# Evaluation profiles
# ---------------------------------------------------------------------------

@dataclass
class EvalProfile:
    name: str
    profile: dict[str, Any]
    rules: list[str]


PROFILES = [
    EvalProfile(
        name="beginner_lose_weight_3_days",
        profile={
            "age": 25,
            "sex": "male",
            "heightCm": 175,
            "weightKg": 80,
            "goal": "lose_weight",
            "activityLevel": "light",
            "experience": "beginner",
            "daysPerWeek": 3,
            "equipment": ["bodyweight"],
            "split": "full_body",
            "injuries": [],
            "mealPref": "omnivore",
            "cuisine": ["Indian"],
            "allergies": [],
            "mealsPerDay": 3,
            "cookingTime": 45,
            "calorieTarget": 2000,
            "supplements": [],
            "budgetTier": "medium",
        },
        rules=[
            "exactly 3 training days",
            "exactly 4 rest days",
            "no advanced barbell work",
        ],
    ),
    EvalProfile(
        name="advanced_build_muscle_6_days",
        profile={
            "age": 28,
            "sex": "male",
            "heightCm": 180,
            "weightKg": 78,
            "goal": "build_muscle",
            "activityLevel": "active",
            "experience": "advanced",
            "daysPerWeek": 6,
            "equipment": [
                "barbell",
                "dumbbells",
                "bench",
                "cable_machine",
            ],
            "split": "push_pull_legs",
            "injuries": [],
            "mealPref": "omnivore",
            "cuisine": ["Indian"],
            "allergies": [],
            "mealsPerDay": 4,
            "cookingTime": 60,
            "calorieTarget": 2800,
            "supplements": [],
            "budgetTier": "high",
        },
        rules=[
            "exactly 6 training days",
            "exactly 1 rest day",
            "use the extra training days sensibly",
            "do not repeat one identical workout split all week",
        ],
    ),
    EvalProfile(
        name="intermediate_knee_injury_4_days",
        profile={
            "age": 30,
            "sex": "female",
            "heightCm": 165,
            "weightKg": 68,
            "goal": "stay_fit",
            "activityLevel": "moderate",
            "experience": "intermediate",
            "daysPerWeek": 4,
            "equipment": ["bodyweight", "dumbbells", "resistance_bands"],
            "split": "upper_lower",
            "injuries": ["knee injury"],
            "mealPref": "omnivore",
            "cuisine": ["Indian"],
            "allergies": [],
            "mealsPerDay": 3,
            "cookingTime": 45,
            "calorieTarget": 2100,
            "supplements": [],
            "budgetTier": "medium",
        },
        rules=[
            "exactly 4 training days",
            "exactly 3 rest days",
            "no loaded knee flexion",
            "no squats, lunges, leg press, leg extension, step-ups, or jumping",
        ],
    ),
    EvalProfile(
        name="vegetarian_build_muscle_5_days",
        profile={
            "age": 24,
            "sex": "female",
            "heightCm": 168,
            "weightKg": 60,
            "goal": "build_muscle",
            "activityLevel": "active",
            "experience": "intermediate",
            "daysPerWeek": 5,
            "equipment": ["dumbbells", "bench", "bodyweight"],
            "split": "upper_lower",
            "injuries": [],
            "mealPref": "vegetarian",
            "cuisine": ["Indian"],
            "allergies": [],
            "mealsPerDay": 4,
            "cookingTime": 45,
            "calorieTarget": 2300,
            "supplements": [],
            "budgetTier": "medium",
        },
        rules=[
            "exactly 5 training days",
            "exactly 2 rest days",
            "zero meat or fish in every meal",
        ],
    ),
    EvalProfile(
        name="beginner_maintain_3_days",
        profile={
            "age": 22,
            "sex": "male",
            "heightCm": 172,
            "weightKg": 70,
            "goal": "stay_fit",
            "activityLevel": "light",
            "experience": "beginner",
            "daysPerWeek": 3,
            "equipment": ["bodyweight"],
            "split": "full_body",
            "injuries": [],
            "mealPref": "omnivore",
            "cuisine": ["Indian"],
            "allergies": [],
            "mealsPerDay": 3,
            "cookingTime": 30,
            "calorieTarget": 2100,
            "supplements": [],
            "budgetTier": "low",
        },
        rules=[
            "exactly 3 training days",
            "exactly 4 rest days",
            "no over-prescription",
            "beginner-appropriate exercises",
        ],
    ),
]


# ---------------------------------------------------------------------------
# Rule dictionaries
# ---------------------------------------------------------------------------

MEAT = {
    "chicken",
    "beef",
    "pork",
    "fish",
    "salmon",
    "tuna",
    "turkey",
    "bacon",
    "ham",
    "lamb",
    "shrimp",
    "prawn",
    "mutton",
}

KNEE = {
    "squat",
    "squats",
    "lunge",
    "lunges",
    "leg press",
    "leg extension",
    "step-up",
    "step up",
    "jump",
    "jumping",
}

ADVANCED_BAR = {
    "barbell squat",
    "back squat",
    "front squat",
    "barbell deadlift",
    "deadlift",
    "barbell bench press",
    "barbell row",
    "clean and jerk",
    "snatch",
}


# ---------------------------------------------------------------------------
# Checks
# ---------------------------------------------------------------------------

def check_weekly_structure(
    plan: WeeklyPlan,
    profile: UserProfile,
) -> list[str]:
    failures: list[str] = []

    if len(plan.workout_plan) != 7:
        failures.append(
            f"workoutPlan has {len(plan.workout_plan)} days instead of 7"
        )

    if len(plan.meal_plan) != 7:
        failures.append(
            f"mealPlan has {len(plan.meal_plan)} days instead of 7"
        )

    training_days = [
        day for day in plan.workout_plan
        if not day.is_rest_day
    ]

    rest_days = [
        day for day in plan.workout_plan
        if day.is_rest_day
    ]

    if len(training_days) != profile.days_per_week:
        failures.append(
            f"expected {profile.days_per_week} training days, "
            f"got {len(training_days)}"
        )

    expected_rest = 7 - profile.days_per_week

    if len(rest_days) != expected_rest:
        failures.append(
            f"expected {expected_rest} rest days, "
            f"got {len(rest_days)}"
        )

    for day in rest_days:
        if day.exercises:
            failures.append(
                f"day {day.day} is marked rest but has exercises"
            )

    return failures


def check_vegetarian(plan: WeeklyPlan) -> list[str]:
    failures: list[str] = []

    for day in plan.meal_plan:
        for meal in day.meals:
            blob = (
                f"{meal.name} "
                f"{' '.join(meal.ingredients)}"
            ).lower()

            for meat in MEAT:
                if meat in blob:
                    failures.append(
                        f"day {day.day}/{meal.name}: contains '{meat}'"
                    )

    return failures


def check_knee_safety(plan: WeeklyPlan) -> list[str]:
    failures: list[str] = []

    for day in plan.workout_plan:
        for exercise in day.exercises:
            name = exercise.name.lower()

            for forbidden in KNEE:
                if forbidden in name:
                    failures.append(
                        f"day {day.day}: '{exercise.name}'"
                    )

    return failures


def check_beginner_level(plan: WeeklyPlan) -> list[str]:
    failures: list[str] = []

    for day in plan.workout_plan:
        for exercise in day.exercises:
            name = exercise.name.lower()

            for forbidden in ADVANCED_BAR:
                if forbidden in name:
                    failures.append(
                        f"day {day.day}: advanced exercise '{exercise.name}'"
                    )

    return failures


def check_meals_per_day(
    plan: WeeklyPlan,
    profile: UserProfile,
) -> list[str]:
    failures: list[str] = []

    for day in plan.meal_plan:
        if len(day.meals) != profile.meals_per_day:
            failures.append(
                f"meal day {day.day}: expected "
                f"{profile.meals_per_day} meals, got {len(day.meals)}"
            )

    return failures


def check_equipment(
    plan: WeeklyPlan,
    profile: UserProfile,
) -> list[str]:
    """
    Lightweight equipment check.

    We only flag obvious equipment names. This is intentionally conservative
    so the harness does not produce false positives from exercise names.
    """

    failures: list[str] = []

    equipment = {
        item.lower().replace("-", " ")
        for item in profile.equipment
    }

    if "bodyweight" in equipment and len(equipment) == 1:
        forbidden_equipment_terms = {
            "barbell",
            "dumbbell",
            "cable",
            "machine",
            "bench",
            "kettlebell",
        }

        for day in plan.workout_plan:
            for exercise in day.exercises:
                name = exercise.name.lower()

                for term in forbidden_equipment_terms:
                    if term in name:
                        failures.append(
                            f"day {day.day}: '{exercise.name}' "
                            f"appears to require {term}"
                        )

    return failures


def check_all_rules(
    plan: WeeklyPlan,
    profile: UserProfile,
) -> list[str]:
    failures = []

    failures.extend(check_weekly_structure(plan, profile))
    failures.extend(check_meals_per_day(plan, profile))
    failures.extend(check_equipment(plan, profile))

    if profile.meal_pref == "vegetarian":
        failures.extend(check_vegetarian(plan))

    if any("knee" in injury.lower() for injury in profile.injuries):
        failures.extend(check_knee_safety(plan))

    if profile.experience == "beginner":
        failures.extend(check_beginner_level(plan))

    return failures


# ---------------------------------------------------------------------------
# Generation
# ---------------------------------------------------------------------------

def generate_for_profile(
    evaluation_profile: EvalProfile,
) -> dict[str, Any]:
    profile = UserProfile.model_validate(evaluation_profile.profile)

    week_start = "2026-08-24"

    user_prompt = build_plan_user_prompt(
        profile=profile,
        week_start=week_start,
    )

    started = time.perf_counter()

    try:
        plan, result, source = ai.invoke_structured(
            system=PLAN_SYSTEM_PROMPT,
            user_content=user_prompt,
            model_cls=WeeklyPlan,
            max_tokens=8000,
            temperature=0.4,
        )

        elapsed = time.perf_counter() - started

        failures = check_all_rules(plan, profile)

        return {
            "profile": evaluation_profile,
            "profile_model": profile,
            "plan": plan,
            "result": result,
            "source": source,
            "elapsed": elapsed,
            "failures": failures,
            "error": None,
        }

    except Exception as exc:
        elapsed = time.perf_counter() - started

        return {
            "profile": evaluation_profile,
            "profile_model": profile,
            "plan": None,
            "result": None,
            "source": "error",
            "elapsed": elapsed,
            "failures": [f"generation failed: {exc}"],
            "error": exc,
        }


# ---------------------------------------------------------------------------
# Report
# ---------------------------------------------------------------------------

def make_report(results: list[dict[str, Any]]) -> str:
    lines = []

    lines.append("# FitPlan Prompt Evaluation")
    lines.append("")
    lines.append(f"Provider: `{os.environ.get('AI_PROVIDER', 'openrouter')}`")
    lines.append("")
    lines.append(
        "This report evaluates five representative profiles against "
        "WeeklyPlan validation and explicit product rules."
    )
    lines.append("")

    lines.append(
        "| Profile | Pydantic | 7 days | Training days | Rule checks | "
        "Tokens in | Tokens out | Source | Seconds |"
    )
    lines.append(
        "|---|---|---:|---:|---|---:|---:|---|---:|"
    )

    for result in results:
        evaluation_profile = result["profile"]
        profile = result["profile_model"]
        plan = result["plan"]
        ai_result = result["result"]

        if plan is not None:
            pydantic_status = "PASS"
            seven_days = "PASS" if (
                len(plan.workout_plan) == 7
                and len(plan.meal_plan) == 7
            ) else "FAIL"

            training_days = sum(
                not day.is_rest_day
                for day in plan.workout_plan
            )

            training_status = (
                "PASS"
                if training_days == profile.days_per_week
                else "FAIL"
            )

            rule_status = (
                "PASS"
                if not result["failures"]
                else "FAIL"
            )

            prompt_tokens = ai_result.prompt_tokens
            completion_tokens = ai_result.completion_tokens

        else:
            pydantic_status = "FAIL"
            seven_days = "FAIL"
            training_status = "FAIL"
            rule_status = "FAIL"
            prompt_tokens = 0
            completion_tokens = 0

        lines.append(
            f"| `{evaluation_profile.name}` | "
            f"{pydantic_status} | "
            f"{seven_days} | "
            f"{training_days if plan else '-'} "
            f"/ {profile.days_per_week} ({training_status}) | "
            f"{rule_status} | "
            f"{prompt_tokens} | "
            f"{completion_tokens} | "
            f"`{result['source']}` | "
            f"{result['elapsed']:.2f} |"
        )

    lines.append("")
    lines.append("## Rule failures")
    lines.append("")

    any_failures = False

    for result in results:
        failures = result["failures"]

        if not failures:
            lines.append(
                f"### `{result['profile'].name}` — PASS"
            )
            lines.append("")
            lines.append("No automated rule failures.")
            lines.append("")
        else:
            any_failures = True

            lines.append(
                f"### `{result['profile'].name}` — FAIL"
            )
            lines.append("")

            for failure in failures:
                lines.append(f"- {failure}")

            lines.append("")

    if not any_failures:
        lines.append(
            "**Overall result: PASS — all five profiles passed "
            "the automated checks.**"
        )
    else:
        lines.append(
            "**Overall result: FAIL — at least one profile needs "
            "prompt/model improvement.**"
        )

    lines.append("")
    lines.append("## Profiles tested")
    lines.append("")

    for result in results:
        profile = result["profile_model"]

        lines.append(
            f"- `{result['profile'].name}`: "
            f"{profile.experience}, {profile.goal}, "
            f"{profile.days_per_week} days/week, "
            f"{profile.meal_pref}"
        )

    lines.append("")

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> int:
    print("=" * 70)
    print("FitPlan Prompt Evaluation")
    print("=" * 70)
    print()
    print(
        f"AI_PROVIDER={os.environ.get('AI_PROVIDER', 'openrouter')}"
    )
    print()

    results = []

    for index, evaluation_profile in enumerate(PROFILES, start=1):
        print(
            f"[{index}/{len(PROFILES)}] "
            f"{evaluation_profile.name}..."
        )

        result = generate_for_profile(evaluation_profile)
        results.append(result)

        if result["plan"] is not None:
            training_days = sum(
                not day.is_rest_day
                for day in result["plan"].workout_plan
            )

            print(
                f"  source={result['source']} "
                f"training_days={training_days} "
                f"tokens="
                f"{result['result'].prompt_tokens}/"
                f"{result['result'].completion_tokens} "
                f"time={result['elapsed']:.2f}s"
            )

        if result["failures"]:
            print("  FAIL:")
            for failure in result["failures"]:
                print(f"    - {failure}")
        else:
            print("  PASS")

        print()

    report = make_report(results)

    output_path = ROOT / "eval-before.md"
    output_path.write_text(report, encoding="utf-8")

    print("=" * 70)
    print(f"Report written to: {output_path}")
    print("=" * 70)

    failed = sum(bool(result["failures"]) for result in results)

    print(
        f"{len(results) - failed}/{len(results)} profiles passed."
    )

    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
