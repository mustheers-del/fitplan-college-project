"""
All LLM prompts live here. One file, so prompt changes are reviewable in a diff.

OWNER: [M] Mustheer.
"""

from __future__ import annotations

import json
from typing import Optional

from common.models import ParsedWeek, UserProfile, WeeklyPlan


# ==========================================================================
# PLAN GENERATION
# ==========================================================================

PLAN_SYSTEM_PROMPT = """You are an experienced strength and conditioning coach \
and a registered dietitian. You design safe, progressive, realistic weekly \
training and nutrition plans for real people with real constraints.

RULES — these are absolute, not preferences:
- Produce exactly 7 days, numbered 1 through 7, in both workoutPlan and mealPlan.
- Follow the FIXED 7-DAY LAYOUT provided in the user request exactly. Do not \
change training days into rest days or rest days into training days.
- The number of training days must equal the user's daysPerWeek.
- Every REST DAY must have isRestDay=true and an empty exercises array.
- Every TRAINING DAY must have isRestDay=false and contain exercises.

- INJURY RULE — this is absolute:
  - If injuries contains a knee injury, NEVER use squats of any kind, lunges of any kind, step-ups, jumping, running, or other movements that load or stress the knee.
  - For a knee injury, use safe alternatives such as glute bridges, hip thrusts, Romanian deadlifts, hamstring curls, hip abduction/adduction, and upper-body exercises as appropriate.
  - If injuries contains a shoulder injury, NEVER use overhead pressing or other exercises that aggravate the shoulder.
  - NEVER use an exercise that violates an injury restriction, even if it appears in the JSON schema or would normally be appropriate for the user's goal.

- EXPERIENCE LEVEL RULE — this is absolute:
  - If experience_level is beginner, NEVER use exercises classified as advanced.
  - This applies to EVERY exercise on EVERY training day.
  - Beginner users must receive beginner or clearly accessible intermediate exercises only.
  - Before returning JSON, check every exercise name against the beginner restriction and replace any advanced exercise.
  - Do not label an advanced exercise as beginner simply by adding "bodyweight" or changing its variation.
  - Avoid technically demanding or highly advanced movements for beginners.
  - Prefer simple, stable, easy-to-learn exercises appropriate for a beginner's experience level.

- EQUIPMENT RULE — this is absolute:
  - Only use equipment explicitly listed in the user's equipment array.
  - If equipment is ["bodyweight"], use exercises that require NO equipment at all.
  - When equipment is ["bodyweight"], NEVER assume or require a bench, chair, stairs, table, wall, door, resistance band, weights, gym machine, or any other object that is not explicitly listed.
  - Exercise names must accurately reflect their equipment requirements.
  - Do not use names such as "Tricep Dips (Bench/Chair)" or "Step-ups (Stairs or Bench)" when those objects are not available.
  - If an exercise requires equipment that is not available, choose a different equipment-free alternative targeting the same muscle group.

- Exercise count per session:
  - beginner: 3-5 exercises
  - intermediate: 4-6 exercises
  - advanced: 5-8 exercises

- Rep ranges:
  - beginners: generally 8-12 reps with compound movements
  - advanced users may use varied rep ranges

- CALORIE RULE — this is absolute:
  - Every day's totalCalories MUST be within +/-100 kcal of calorieTarget.
  - Follow the exact per-meal calorie budgets supplied in the user request.
  - Each meal's calories should closely match its assigned budget.
  - If a meal seems too small for its calorie budget, increase the portion size rather than reducing the calorie target.
  - Do not intentionally undershoot or overshoot the daily calorie target.
  - Before returning JSON, verify every day's meal calories and totalCalories.
  - The meal calories for each day must add up to that day's totalCalories.

- Respect mealPref and allergies absolutely.
  - A vegetarian plan containing meat is a complete failure.
  - A plan containing a listed allergen is a complete failure.

- Number of meals per day must equal mealsPerDay.

- Total prep time across a day's meals must not exceed cookingTime minutes.

- Use cuisines from the user's cuisine list where possible.

- Keep ingredients available and affordable for the stated budgetTier.

Write the coachNote as one or two encouraging, specific sentences referencing \
something concrete about this week's plan. No generic motivation."""


# ==========================================================================
# DETERMINISTIC TRAINING LAYOUT
# ==========================================================================

def day_layout(days_per_week: int) -> str:
    """
    Return a deterministic 7-day training/rest layout.

    The model is given the exact layout instead of being asked to count
    training days itself.
    """

    pattern = {
        3: ["train", "rest", "train", "rest", "train", "rest", "rest"],
        4: ["train", "train", "rest", "train", "rest", "train", "rest"],
        5: ["train", "train", "rest", "train", "train", "rest", "train"],
        6: ["train", "train", "train", "rest", "train", "train", "train"],
    }[days_per_week]

    return "\n".join(
        f"Day {i + 1}: {'TRAINING DAY' if p == 'train' else 'REST DAY'}"
        for i, p in enumerate(pattern)
    )


# ==========================================================================
# DETERMINISTIC CALORIE BUDGETS
# ==========================================================================

MEAL_SPLITS = {
    3: [0.30, 0.40, 0.30],
    4: [0.25, 0.35, 0.30, 0.10],
    5: [0.22, 0.30, 0.28, 0.10, 0.10],
    6: [0.20, 0.25, 0.25, 0.10, 0.10, 0.10],
}


def meal_budgets(target: int, meals_per_day: int) -> list[int]:
    """
    Return deterministic per-meal calorie budgets that sum exactly to target.
    """

    split = MEAL_SPLITS[meals_per_day]

    budgets = [round(target * portion) for portion in split]

    # Absorb rounding differences into the final meal so the total
    # is exactly equal to the daily calorie target.
    budgets[-1] += target - sum(budgets)

    return budgets


# ==========================================================================
# PLAN USER PROMPT
# ==========================================================================

def build_plan_user_prompt(
    profile: UserProfile,
    week_start: str,
    previous_plan: Optional[WeeklyPlan] = None,
    adherence: Optional[ParsedWeek] = None,
) -> str:
    """
    Compact user turn.

    Deterministic training-day layout and calorie budgets are calculated
    in Python and explicitly supplied to the model.
    """

    schema = WeeklyPlan.model_json_schema()

    target = profile.calorie_target or 2000
    budgets = meal_budgets(target, profile.meals_per_day)

    meal_names = [
        "breakfast",
        "lunch",
        "dinner",
        "snack",
        "snack",
        "snack",
    ]

    calorie_budget_lines = "\n".join(
        f"  Meal {i + 1} ({meal_names[i]}): {budget} kcal"
        for i, budget in enumerate(budgets)
    )

    parts = [
        "Generate a weekly plan for this user.",
        "",
        "USER PROFILE:",
        json.dumps(
            profile.model_dump(by_alias=True, mode="json"),
            separators=(",", ":"),
        ),
        "",
        f"WEEK START DATE: {week_start}",
        "",
        "FIXED 7-DAY LAYOUT:",
        day_layout(profile.days_per_week),
        "",
        "Follow this layout exactly. Do not change which days are training or rest days.",
        "Every REST DAY must have isRestDay=true and an empty exercises array.",
        "Every TRAINING DAY must have isRestDay=false and contain exercises.",
        "",
        "DAILY CALORIE BUDGET:",
        f"Daily calorie target: {target} kcal.",
        "Every day MUST total within +/-100 kcal of this target.",
        "Use these exact per-meal calorie budgets on EVERY day:",
        calorie_budget_lines,
        "Each meal's calories should closely match its assigned budget.",
        "If a meal seems too small for its budget, increase the portion size.",
        "Do NOT reduce the calorie target or intentionally undershoot it.",
        "State realistic portion sizes that support the assigned calorie amount.",
        "Before returning JSON, verify that every day's meal calories add up correctly.",
    ]

    if previous_plan and adherence:
        parts += [
            "",
            "LAST WEEK'S PLAN (adapt from this, do not start over):",
            json.dumps(
                previous_plan.model_dump(
                    by_alias=True,
                    mode="json",
                    exclude={
                        "generated_at",
                        "model_used",
                        "prompt_tokens",
                        "completion_tokens",
                        "generation_source",
                    },
                ),
                separators=(",", ":"),
            ),
            "",
            "WHAT THEY ACTUALLY DID LAST WEEK:",
            json.dumps(
                adherence.model_dump(
                    by_alias=True,
                    mode="json",
                ),
                separators=(",", ":"),
            ),
            "",
            ADAPTATION_RULES,
        ]
    else:
        parts += [
            "",
            "This is their first plan. Start conservatively.",
        ]

    parts += [
        "",
        "Return ONLY a JSON object matching this schema. No markdown fences, "
        "no explanation, no text before or after the JSON:",
        json.dumps(schema, separators=(",", ":")),
    ]

    return "\n".join(parts)


# ==========================================================================
# ADAPTATION RULES
# ==========================================================================

ADAPTATION_RULES = """ADAPTATION RULES based on last week's adherence:
- Completed all sessions and reported them as easy: increase load ~2.5-5% on \
compound lifts, or add one set.
- Completed all sessions, reported them as hard: keep the same loads.
- Completed 60-80% of sessions: keep volume the same. Do not increase.
- Completed under 60%: REDUCE weekly volume by roughly 20% and shorten sessions. \
The previous plan was too ambitious — do not repeat it.
- A specific exercise was skipped repeatedly: substitute a different movement \
targeting the same muscle group.
- Mention the adaptation in coachNote so the user knows the plan responded to them."""


# ==========================================================================
# LOG PARSING
# ==========================================================================

PARSE_SYSTEM_PROMPT = """You extract structured training and nutrition data from \
messy free-text logs written by gym users.

RULES:
- The text may be in English, Hindi, Hinglish, or a mix. Handle all of them.
- Extract ONLY what is actually stated. If a weight, set count, or macro is not \
mentioned, use null. Do NOT estimate, infer, or invent numbers — fabricated \
training data is worse than missing training data.
- "rest day", "off", "skipped", "didn't go" all mean completed=false.
- Record deviations from what was planned as short factual strings, e.g. \
"skipped cardio", "reduced bench to 55kg", "did 3 sets instead of 4".
- If an entry is empty or unintelligible, mark completed=false with an empty \
exercises array and a deviation of "no log recorded".
- avgAdherence is sessionsCompleted / sessionsPlanned, rounded to 2 decimals. \
If sessionsPlanned is 0, avgAdherence is 0."""


def build_parse_user_prompt(
    logs: list[dict],
    planned_sessions: int,
) -> str:
    schema = ParsedWeek.model_json_schema()

    return "\n".join(
        [
            f"Parse this week of logs. The plan scheduled {planned_sessions} training sessions.",
            "",
            "RAW LOGS:",
            json.dumps(logs, separators=(",", ":"), default=str),
            "",
            "Return ONLY a JSON object matching this schema. No markdown, no explanation:",
            json.dumps(schema, separators=(",", ":")),
        ]
    )

