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
- The number of training days must equal the user's daysPerWeek. All other days \
are rest days with isRestDay=true and an empty exercises array.
- NEVER program an exercise that loads an injured area listed in injuries. If the \
user has a knee injury, no squats, lunges, or jumping. If a shoulder injury, no \
overhead pressing. Substitute a safe alternative for the same muscle group.
- Only use equipment listed in the user's equipment array. If it is \
["bodyweight"], program bodyweight movements only. Do not assume a gym.
- Exercise count per session: beginner 3-5, intermediate 4-6, advanced 5-8.
- Rep ranges: beginners 8-12 with compound movements. Advanced may use varied ranges.
- Daily total calories must be within 100 kcal of calorieTarget.
- Respect mealPref and allergies absolutely. A vegetarian plan containing meat, or \
a plan containing a listed allergen, is a complete failure of the task.
- Number of meals per day must equal mealsPerDay.
- Total prep time across a day's meals must not exceed cookingTime minutes.
- Use cuisines from the user's cuisine list where possible. Keep ingredients \
available and affordable for the stated budgetTier.

Write the coachNote as one or two encouraging, specific sentences referencing \
something concrete about this week's plan. No generic motivation."""


def build_plan_user_prompt(
    profile: UserProfile,
    week_start: str,
    previous_plan: Optional[WeeklyPlan] = None,
    adherence: Optional[ParsedWeek] = None,
) -> str:
    """
    Compact user turn. Note separators=(",", ":") — pretty-printing JSON into
    a prompt burns input tokens for no benefit.
    """
    schema = WeeklyPlan.model_json_schema()

    parts = [
        "Generate a weekly plan for this user.",
        "",
        "USER PROFILE:",
        json.dumps(profile.model_dump(by_alias=True, mode="json"), separators=(",", ":")),
        "",
        f"WEEK START DATE: {week_start}",
    ]

    if previous_plan and adherence:
        parts += [
            "",
            "LAST WEEK'S PLAN (adapt from this, do not start over):",
            json.dumps(
                previous_plan.model_dump(by_alias=True, mode="json", exclude={
                    "generated_at", "model_used", "prompt_tokens",
                    "completion_tokens", "generation_source",
                }),
                separators=(",", ":"),
            ),
            "",
            "WHAT THEY ACTUALLY DID LAST WEEK:",
            json.dumps(adherence.model_dump(by_alias=True, mode="json"), separators=(",", ":")),
            "",
            ADAPTATION_RULES,
        ]
    else:
        parts += ["", "This is their first plan. Start conservatively."]

    parts += [
        "",
        "Return ONLY a JSON object matching this schema. No markdown fences, "
        "no explanation, no text before or after the JSON:",
        json.dumps(schema, separators=(",", ":")),
    ]
    return "\n".join(parts)


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
# LOG PARSING  (batch — one call for the whole week, never per entry)
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


def build_parse_user_prompt(logs: list[dict], planned_sessions: int) -> str:
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
