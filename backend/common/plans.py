"""
Plan generation business logic.

OWNER: [M] Mustheer.

This is the function the REST handler calls AND the function the MCP tool
calls. That is the entire point of the shared-layer architecture — write it
once here, wrap it twice.
"""

from __future__ import annotations

import logging
from datetime import date, datetime, timedelta, timezone
from typing import Optional

from common import ai, dynamo, onboarding
from common.models import ParsedWeek, UserProfile, WeeklyPlan
from common.prompts import PLAN_SYSTEM_PROMPT, build_plan_user_prompt

log = logging.getLogger(__name__)


def current_week_start(today: Optional[date] = None) -> str:
    """Monday of the current week, as YYYY-MM-DD."""
    today = today or datetime.now(timezone.utc).date()
    return (today - timedelta(days=today.weekday())).isoformat()


def get_plan(user_id: str, week_start: Optional[str] = None) -> Optional[WeeklyPlan]:
    week_start = week_start or current_week_start()
    item = dynamo.get_item(user_id, dynamo.sk_plan(week_start))
    return WeeklyPlan.model_validate(item) if item else None


def list_plan_weeks(user_id: str, limit: int = 20) -> list[str]:
    items = dynamo.query_prefix(user_id, "PLAN#", limit=limit)
    return [i["SK"].removeprefix("PLAN#") for i in items]


def generate_plan_for_user(
    user_id: str,
    week_start: Optional[str] = None,
    force: bool = False,
    adherence: Optional[ParsedWeek] = None,
) -> WeeklyPlan:
    """
    The core function. Called by:
      - POST /plan/generate      (user clicks the button)
      - weekly_plan_gen Lambda   (EventBridge, with adherence)
      - the MCP regenerate_plan tool

    Idempotent unless force=True, so a double-click doesn't cost money twice.
    """
    week_start = week_start or current_week_start()

    if not force:
        existing = get_plan(user_id, week_start)
        if existing:
            log.info("plan already exists for %s week %s", user_id, week_start)
            return existing

    profile = onboarding.get_profile(user_id)
    if not profile:
        raise ValueError("user has no profile - complete onboarding first")

    previous_plan = None
    if adherence:
        prev_week = (date.fromisoformat(week_start) - timedelta(days=7)).isoformat()
        previous_plan = get_plan(user_id, prev_week)

    user_prompt = build_plan_user_prompt(profile, week_start, previous_plan, adherence)

    try:
        plan, result, source = ai.invoke_structured(
            system=PLAN_SYSTEM_PROMPT,
            user_content=user_prompt,
            model_cls=WeeklyPlan,
            max_tokens=4000,
            temperature=0.4,
        )
        prompt_tokens, completion_tokens = result.prompt_tokens, result.completion_tokens
    except Exception:
        # Both attempts failed. A generic plan beats a 500 error.
        log.exception("plan generation failed for %s — using fallback", user_id)
        plan = _fallback_plan(profile, week_start)
        source, prompt_tokens, completion_tokens = "fallback", 0, 0

    plan.week_start_date = date.fromisoformat(week_start)
    plan.generated_at = datetime.now(timezone.utc)
    plan.model_used = ai.model_id()
    plan.prompt_tokens = prompt_tokens
    plan.completion_tokens = completion_tokens
    plan.generation_source = source

    dynamo.put_item(
        user_id,
        dynamo.sk_plan(week_start),
        plan.model_dump(by_alias=True, mode="json"),
    )
    log.info(
        "plan stored user=%s week=%s source=%s tokens=%d/%d",
        user_id, week_start, source, prompt_tokens, completion_tokens,
    )
    return plan


def _fallback_plan(profile: UserProfile, week_start: str) -> WeeklyPlan:
    """
    Deterministic template plan. Not good, but valid and safe.

    TODO [M] Sprint 4: expand this into three real templates
    (full_body / upper_lower / ppl) so the fallback is genuinely usable.
    """
    training_days = set(range(1, profile.days_per_week + 1))

    workout = []
    for d in range(1, 8):
        if d in training_days:
            workout.append({
                "day": d, "title": "Full Body Basics", "isRestDay": False,
                "durationMin": 45, "estCalories": 300,
                "exercises": [
                    {"name": "Bodyweight Squat", "sets": 3, "reps": "12", "restSeconds": 60},
                    {"name": "Push Up", "sets": 3, "reps": "8-12", "restSeconds": 60},
                    {"name": "Plank", "sets": 3, "reps": "30 sec", "restSeconds": 45},
                ],
            })
        else:
            workout.append({
                "day": d, "title": "Rest", "isRestDay": True,
                "durationMin": 0, "estCalories": 0, "exercises": [],
            })

    target = profile.calorie_target or 2000
    per_meal = target // profile.meals_per_day
    slots = ["breakfast", "lunch", "dinner", "snack", "snack", "snack"]
    meals = [
        {
            "day": d,
            "meals": [
                {
                    "name": "Balanced meal", "slot": slots[i], "calories": per_meal,
                    "proteinG": round(per_meal * 0.3 / 4, 1),
                    "carbsG": round(per_meal * 0.4 / 4, 1),
                    "fatsG": round(per_meal * 0.3 / 9, 1),
                    "prepMinutes": 15, "ingredients": [],
                }
                for i in range(profile.meals_per_day)
            ],
            "totalCalories": per_meal * profile.meals_per_day,
            "totalProteinG": round(target * 0.3 / 4, 1),
        }
        for d in range(1, 8)
    ]

    return WeeklyPlan.model_validate({
        "weekStartDate": week_start,
        "workoutPlan": workout,
        "mealPlan": meals,
        "coachNote": "We had trouble generating your personalised plan. "
                     "Here's a solid starting template — regenerate any time.",
    })
