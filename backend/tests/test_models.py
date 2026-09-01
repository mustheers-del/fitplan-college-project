"""Sprint 1 sanity tests. [B] extends these as the models grow."""

import pytest
from pydantic import ValidationError

from common.models import UserProfile, WeeklyPlan


def _profile(**over):
    base = dict(
        age=25, sex="male", heightCm=175, weightKg=70, goal="build_muscle",
        activityLevel="moderate", experience="beginner", daysPerWeek=4,
    )
    base.update(over)
    return base


def test_profile_valid():
    p = UserProfile.model_validate(_profile())
    assert p.days_per_week == 4
    assert p.equipment == ["bodyweight"]   # default applied


def test_profile_rejects_impossible_age():
    with pytest.raises(ValidationError):
        UserProfile.model_validate(_profile(age=200))


def test_profile_rejects_eight_training_days():
    with pytest.raises(ValidationError):
        UserProfile.model_validate(_profile(daysPerWeek=8))


def _day(n):
    return {"day": n, "title": "Rest", "isRestDay": True, "exercises": []}


def _meal(slot="breakfast"):
    return {
        "name": "Oats and eggs",
        "slot": slot,
        "calories": 400,
        "proteinG": 20,
        "carbsG": 50,
        "fatsG": 12,
    }


def _meal_day(n):
    return {
        "day": n,
        "meals": [_meal("breakfast"), _meal("lunch"), _meal("dinner")],
        "totalCalories": 1200,
        "totalProteinG": 60,
    }


def test_plan_requires_exactly_seven_days():
    """This validator is what stops a 5-day LLM response reaching the frontend."""
    with pytest.raises(ValidationError):
        WeeklyPlan.model_validate({
            "weekStartDate": "2026-08-03",
            "workoutPlan": [_day(i) for i in range(1, 6)],
            "mealPlan": [_meal_day(i) for i in range(1, 8)],
        })


def test_plan_rejects_duplicate_days():
    with pytest.raises(ValidationError):
        WeeklyPlan.model_validate({
            "weekStartDate": "2026-08-03",
            "workoutPlan": [_day(1)] * 7,
            "mealPlan": [_meal_day(i) for i in range(1, 8)],
        })


def test_plan_accepts_valid_week():
    plan = WeeklyPlan.model_validate({
        "weekStartDate": "2026-08-03",
        "workoutPlan": [_day(i) for i in range(1, 8)],
        "mealPlan": [_meal_day(i) for i in range(1, 8)],
    })
    assert len(plan.workout_plan) == 7

def test_workout_day_rejects_exercises_on_rest_day():
    with pytest.raises(ValidationError):
        WeeklyPlan.model_validate({
            "weekStartDate": "2026-08-03",
            "workoutPlan": [
                {
                    "day": 1,
                    "title": "Rest",
                    "isRestDay": True,
                    "exercises": [{
                        "name": "Squat",
                        "sets": 3,
                        "reps": "10",
                    }],
                }
            ] + [_day(i) for i in range(2, 8)],
            "mealPlan": [_meal_day(i) for i in range(1, 8)],
        })


def test_workout_day_rejects_training_day_without_exercises():
    with pytest.raises(ValidationError):
        WeeklyPlan.model_validate({
            "weekStartDate": "2026-08-03",
            "workoutPlan": [
                {
                    "day": 1,
                    "title": "Upper Body",
                    "isRestDay": False,
                    "exercises": [],
                }
            ] + [_day(i) for i in range(2, 8)],
            "mealPlan": [_meal_day(i) for i in range(1, 8)],
        })


def test_workout_exercise_accepts_valid_reps():
    from common.models import WorkoutExercise

    assert WorkoutExercise(name="Squat", sets=3, reps="8-12")
    assert WorkoutExercise(name="Plank", sets=3, reps="30 sec")
    assert WorkoutExercise(name="Push-ups", sets=3, reps="10")


def test_workout_exercise_rejects_invalid_reps():
    from common.models import WorkoutExercise

    with pytest.raises(ValidationError):
        WorkoutExercise(name="Squat", sets=3, reps="many")