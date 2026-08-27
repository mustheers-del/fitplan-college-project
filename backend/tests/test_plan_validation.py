from datetime import date

from common.models import UserProfile, WeeklyPlan
from common.plan_validation import check_all_rules


def make_profile(**overrides) -> UserProfile:
    data = {
        "age": 25,
        "sex": "male",
        "heightCm": 175,
        "weightKg": 75,
        "goal": "stay_fit",
        "activityLevel": "moderate",
        "experience": "intermediate",
        "daysPerWeek": 3,
        "equipment": ["bodyweight"],
        "split": "full_body",
        "injuries": [],
        "mealPref": "omnivore",
        "cuisine": ["Indian"],
        "allergies": [],
        "mealsPerDay": 3,
        "cookingTime": 30,
        "calorieTarget": 2000,
        "supplements": [],
        "budgetTier": "medium",
    }
    data.update(overrides)
    return UserProfile.model_validate(data)


def make_plan(
    profile: UserProfile,
    exercise_names=None,
    meal_count=None,
) -> WeeklyPlan:
    exercise_names = exercise_names or ["Push Up"]

    workout = []

    for day in range(1, 8):
        if day <= profile.days_per_week:
            workout.append(
                {
                    "day": day,
                    "title": "Training",
                    "isRestDay": False,
                    "durationMin": 45,
                    "estCalories": 300,
                    "exercises": [
                        {
                            "name": name,
                            "sets": 3,
                            "reps": "10",
                            "restSeconds": 60,
                        }
                        for name in exercise_names
                    ],
                }
            )
        else:
            workout.append(
                {
                    "day": day,
                    "title": "Rest",
                    "isRestDay": True,
                    "durationMin": 0,
                    "estCalories": 0,
                    "exercises": [],
                }
            )

    count = meal_count if meal_count is not None else profile.meals_per_day

    meal_days = []

    for day in range(1, 8):
        meals = []

        for i in range(count):
            slots = ["breakfast", "lunch", "dinner", "snack"]

            meals.append(
                {
                    "name": "Rice and vegetables",
                    "slot": slots[i % len(slots)],
                    "calories": 600,
                    "proteinG": 30,
                    "carbsG": 70,
                    "fatsG": 15,
                    "prepMinutes": 20,
                    "ingredients": ["rice", "vegetables"],
                }
            )

        meal_days.append(
            {
                "day": day,
                "meals": meals,
                "totalCalories": 1800,
                "totalProteinG": 90,
            }
        )

    return WeeklyPlan.model_validate(
        {
            "weekStartDate": date(2026, 8, 24),
            "workoutPlan": workout,
            "mealPlan": meal_days,
            "coachNote": "Test plan",
        }
    )


def test_valid_plan_has_no_business_rule_failures():
    profile = make_profile()
    plan = make_plan(profile)

    assert check_all_rules(plan, profile) == []


def test_training_day_count_is_checked():
    profile = make_profile(daysPerWeek=4)
    plan = make_plan(profile)

    # Change one training day into a rest day.
    plan.workout_plan[3].is_rest_day = True
    plan.workout_plan[3].exercises = []

    failures = check_all_rules(plan, profile)

    assert any("expected 4 training days" in failure for failure in failures)


def test_knee_injury_rejects_forbidden_exercise():
    profile = make_profile(injuries=["knee pain"])
    plan = make_plan(
        profile,
        exercise_names=["Squat"],
    )

    failures = check_all_rules(plan, profile)

    assert any("Squat" in failure for failure in failures)


def test_bodyweight_profile_rejects_equipment_exercise():
    profile = make_profile(equipment=["bodyweight"])
    plan = make_plan(
        profile,
        exercise_names=["Barbell Bench Press"],
    )

    failures = check_all_rules(plan, profile)

    assert any("barbell" in failure.lower() for failure in failures)


def test_meals_per_day_is_checked():
    profile = make_profile(mealsPerDay=4)
    plan = make_plan(
        profile,
        meal_count=3,
    )

    failures = check_all_rules(plan, profile)

    assert any("expected 4 meals" in failure for failure in failures)


def test_vegetarian_profile_rejects_meat():
    profile = make_profile(mealPref="vegetarian")
    plan = make_plan(profile)

    plan.meal_plan[0].meals[0].name = "Chicken rice"

    failures = check_all_rules(plan, profile)

    assert any("chicken" in failure.lower() for failure in failures)


def test_vegan_profile_rejects_meat():
    profile = make_profile(mealPref="vegan")
    plan = make_plan(profile)

    plan.meal_plan[0].meals[0].ingredients = ["chicken", "rice"]

    failures = check_all_rules(plan, profile)

    assert any("chicken" in failure.lower() for failure in failures)


def test_beginner_profile_rejects_advanced_barbell_exercise():
    profile = make_profile(experience="beginner")
    plan = make_plan(
        profile,
        exercise_names=["Barbell Squat"],
    )

    failures = check_all_rules(plan, profile)

    assert any("advanced exercise" in failure.lower() for failure in failures)

def test_beginner_bodyweight_romanian_deadlift_is_not_flagged_as_barbell():
    profile = make_profile(experience="beginner")
    plan = make_plan(
        profile,
        exercise_names=["Romanian Deadlifts (Bodyweight)"],
    )

    failures = check_all_rules(plan, profile)

    assert not any(
        "advanced exercise" in failure.lower()
        for failure in failures
    )