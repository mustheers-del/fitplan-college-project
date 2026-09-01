"""
Business-rule validation for generated weekly plans.

OWNER: [M] Mustheer.

These checks are separate from Pydantic schema validation.
Pydantic checks whether the JSON has the correct shape.
These checks verify whether the plan is actually appropriate
for the user's profile.
"""

from __future__ import annotations

from common.models import UserProfile, WeeklyPlan


# ---------------------------------------------------------------------------
# Shared injury restrictions
# ---------------------------------------------------------------------------

INJURY_BANS = {
    "knee": {
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
        "box jump",
        "burpee",
        "pistol squat",
    },
    "shoulder": {
        "overhead press",
        "military press",
        "upright row",
        "behind-the-neck",
        "dip",
        "dips",
    },
    "lower_back": {
        "deadlift",
        "good morning",
        "bent-over row",
        "back extension",
    },
}


# ---------------------------------------------------------------------------
# Meal restrictions
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


# ---------------------------------------------------------------------------
# Beginner restrictions
# ---------------------------------------------------------------------------

ADVANCED_BAR = {
    "barbell squat",
    "back squat",
    "front squat",
    "barbell deadlift",
    "barbell bench press",
    "barbell row",
    "clean and jerk",
    "snatch",
}

# ---------------------------------------------------------------------------
# Individual checks
# ---------------------------------------------------------------------------

def check_weekly_structure(
    plan: WeeklyPlan,
    profile: UserProfile,
) -> list[str]:
    failures: list[str] = []

    training_days = [
        day
        for day in plan.workout_plan
        if not day.is_rest_day
    ]

    rest_days = [
        day
        for day in plan.workout_plan
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

    for day in training_days:
        if not day.exercises:
            failures.append(
                f"day {day.day} is marked training but has no exercises"
            )

    return failures


def check_injuries(
    plan: WeeklyPlan,
    profile: UserProfile,
) -> list[str]:
    failures: list[str] = []

    injury_text = " ".join(profile.injuries).lower()

    for injury, forbidden_exercises in INJURY_BANS.items():
        if injury not in injury_text:
            continue

        for day in plan.workout_plan:
            for exercise in day.exercises:
                name = exercise.name.lower()

                for forbidden in forbidden_exercises:
                    if forbidden in name:
                        failures.append(
                            f"day {day.day}: '{exercise.name}' "
                            f"is not allowed for {injury} injury"
                        )

    return failures


def check_equipment(
    plan: WeeklyPlan,
    profile: UserProfile,
) -> list[str]:
    failures: list[str] = []

    equipment = {
        item.lower().replace("-", " ")
        for item in profile.equipment
    }

    if equipment == {"bodyweight"}:
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


def check_meals_per_day(
    plan: WeeklyPlan,
    profile: UserProfile,
) -> list[str]:
    failures: list[str] = []

    for day in plan.meal_plan:
        if len(day.meals) != profile.meals_per_day:
            failures.append(
                f"meal day {day.day}: expected "
                f"{profile.meals_per_day} meals, "
                f"got {len(day.meals)}"
            )

    return failures


def check_vegetarian(
    plan: WeeklyPlan,
    profile: UserProfile,
) -> list[str]:
    failures: list[str] = []

    vegetarian_preferences = {
        "vegetarian",
        "vegan",
    }

    if profile.meal_pref not in vegetarian_preferences:
        return failures

    for day in plan.meal_plan:
        for meal in day.meals:
            blob = (
                f"{meal.name} "
                f"{' '.join(meal.ingredients)}"
            ).lower()

            for meat in MEAT:
                if meat in blob:
                    failures.append(
                        f"day {day.day}/{meal.name}: "
                        f"contains '{meat}'"
                    )

    return failures


def check_calories(
    plan: WeeklyPlan,
    profile: UserProfile,
) -> list[str]:
    failures: list[str] = []

    if profile.calorie_target is None:
        return failures

    for day in plan.meal_plan:
        difference = day.total_calories - profile.calorie_target

        if abs(difference) > 100:
            if difference < 0:
                correction = f"increase by about {abs(difference)} kcal"
            else:
                correction = f"decrease by about {difference} kcal"

            failures.append(
                f"day {day.day}: {day.total_calories} kcal vs target "
                f"{profile.calorie_target} "
                f"(difference {difference:+d}; {correction}; "
                f"must be within +/-100 kcal)"
            )

    return failures

def check_beginner_level(
    plan: WeeklyPlan,
    profile: UserProfile,
) -> list[str]:
    failures: list[str] = []

    if profile.experience != "beginner":
        return failures

    for day in plan.workout_plan:
        for exercise in day.exercises:
            name = exercise.name.lower()

            for forbidden in ADVANCED_BAR:
                if forbidden in name:
                    failures.append(
                        f"day {day.day}: advanced exercise "
                        f"'{exercise.name}' is not appropriate "
                        f"for beginner"
                    )

    return failures


# ---------------------------------------------------------------------------
# Combined validation
# ---------------------------------------------------------------------------

def check_all_rules(
    plan: WeeklyPlan,
    profile: UserProfile,
) -> list[str]:
    """
    Return all business-rule violations.

    An empty list means the plan passed all checks.
    """

    failures: list[str] = []

    failures.extend(
        check_weekly_structure(plan, profile)
    )

    failures.extend(
        check_injuries(plan, profile)
    )

    failures.extend(
        check_equipment(plan, profile)
    )

    failures.extend(
        check_meals_per_day(plan, profile)
    )

    failures.extend(
        check_vegetarian(plan, profile)
    )

    failures.extend(
        check_beginner_level(plan, profile)
    )


    failures.extend(
        check_calories(plan, profile)
    )
    return failures
