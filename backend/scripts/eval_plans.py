"""
Sprint 3-4, [M]: the evaluation loop.

Runs all five fixture profiles through generation, validates each, and prints
a pass/fail table. Run this after EVERY prompt change. When all five pass ten
times in a row, the prompt is done.

    python scripts/eval_plans.py
"""

import sys, os, time
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from common import bedrock
from common.models import UserProfile, WeeklyPlan
from common.prompts import PLAN_SYSTEM_PROMPT, build_plan_user_prompt
from scripts.test_profiles import PROFILES

WEEK = "2026-08-03"


def check_constraints(profile: UserProfile, plan: WeeklyPlan) -> list[str]:
    """Schema validity is not quality. These are the checks that catch quality."""
    problems = []

    training = [d for d in plan.workout_plan if not d.is_rest_day]
    if len(training) != profile.days_per_week:
        problems.append(f"{len(training)} training days, expected {profile.days_per_week}")

    if profile.injuries:
        banned = {"squat", "lunge", "jump", "box jump"} if any(
            "knee" in i.lower() for i in profile.injuries) else set()
        for d in training:
            for ex in d.exercises:
                if any(b in ex.name.lower() for b in banned):
                    problems.append(f"INJURY VIOLATION: '{ex.name}' with {profile.injuries}")

    if profile.meal_pref in ("vegetarian", "vegan"):
        meat = {"chicken", "mutton", "beef", "pork", "fish", "prawn", "egg" if profile.meal_pref == "vegan" else ""}
        for md in plan.meal_plan:
            for m in md.meals:
                blob = (m.name + " " + " ".join(m.ingredients)).lower()
                for w in meat:
                    if w and w in blob:
                        problems.append(f"DIET VIOLATION: '{m.name}' contains {w}")

    for md in plan.meal_plan:
        if len(md.meals) != profile.meals_per_day:
            problems.append(f"day {md.day}: {len(md.meals)} meals, expected {profile.meals_per_day}")
            break

    if profile.calorie_target:
        for md in plan.meal_plan:
            if abs(md.total_calories - profile.calorie_target) > 150:
                problems.append(
                    f"day {md.day}: {md.total_calories} kcal vs target {profile.calorie_target}")
                break

    return problems


def main():
    results = []
    for name, raw in PROFILES.items():
        profile = UserProfile.model_validate(raw)
        if profile.calorie_target is None:
            from common.onboarding import estimate_calorie_target
            profile.calorie_target = estimate_calorie_target(profile)

        t0 = time.time()
        try:
            plan, result, source = bedrock.invoke_structured(
                system=PLAN_SYSTEM_PROMPT,
                user_content=build_plan_user_prompt(profile, WEEK),
                model_cls=WeeklyPlan,
            )
            problems = check_constraints(profile, plan)
            results.append((name, "PASS" if not problems else "SOFT-FAIL", source,
                            f"{time.time()-t0:.1f}s",
                            f"{result.prompt_tokens}/{result.completion_tokens}",
                            problems))
        except Exception as e:
            results.append((name, "HARD-FAIL", "-", f"{time.time()-t0:.1f}s", "-", [str(e)[:120]]))

    print(f"\n{'profile':<26}{'result':<12}{'source':<11}{'time':<8}{'tokens':<12}")
    print("-" * 75)
    for name, status, source, elapsed, tokens, problems in results:
        print(f"{name:<26}{status:<12}{source:<11}{elapsed:<8}{tokens:<12}")
        for p in problems:
            print(f"    ! {p}")

    passed = sum(1 for r in results if r[1] == "PASS")
    print(f"\n{passed}/{len(results)} clean\n")
    return 0 if passed == len(results) else 1


if __name__ == "__main__":
    sys.exit(main())
