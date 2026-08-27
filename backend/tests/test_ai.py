import json

import pytest

from common import ai
from common.models import UserProfile


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


def valid_plan() -> dict:
    workout = []

    for day in range(1, 8):
        if day in {1, 3, 5}:
            workout.append(
                {
                    "day": day,
                    "title": "Training",
                    "isRestDay": False,
                    "durationMin": 45,
                    "estCalories": 300,
                    "exercises": [
                        {
                            "name": "Push Up",
                            "sets": 3,
                            "reps": "10",
                            "restSeconds": 60,
                        }
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

    meal_days = []

    for day in range(1, 8):
        meal_days.append(
            {
                "day": day,
                "meals": [
                    {
                        "name": "Rice and vegetables",
                        "slot": "breakfast",
                        "calories": 600,
                        "proteinG": 30,
                        "carbsG": 70,
                        "fatsG": 15,
                        "prepMinutes": 10,
                        "ingredients": ["rice", "vegetables"],
                    },
                    {
                        "name": "Rice and vegetables",
                        "slot": "lunch",
                        "calories": 700,
                        "proteinG": 30,
                        "carbsG": 80,
                        "fatsG": 15,
                        "prepMinutes": 10,
                        "ingredients": ["rice", "vegetables"],
                    },
                    {
                        "name": "Rice and vegetables",
                        "slot": "dinner",
                        "calories": 700,
                        "proteinG": 30,
                        "carbsG": 80,
                        "fatsG": 15,
                        "prepMinutes": 10,
                        "ingredients": ["rice", "vegetables"],
                    },
                ],
                "totalCalories": 2000,
                "totalProteinG": 90,
            }
        )

    return {
        "weekStartDate": "2026-08-24",
        "workoutPlan": workout,
        "mealPlan": meal_days,
        "coachNote": "Test plan.",
    }


def test_invoke_structured_passes_valid_plan_without_retry(monkeypatch):
    profile = make_profile()
    calls = []

    result = ai.AIResult(
        json.dumps(valid_plan()),
        10,
        20,
    )

    def fake_invoke(*args, **kwargs):
        calls.append({"args": args, "kwargs": kwargs})
        return result
    monkeypatch.setattr(ai, "_invoke", fake_invoke)

    model, returned, source = ai.invoke_structured(
        system="system",
        user_content="user",
        model_cls=__import__(
            "common.models",
            fromlist=["WeeklyPlan"],
        ).WeeklyPlan,
        profile=profile,
    )

    assert model is not None
    assert returned is result
    assert source == "llm"
    assert len(calls) == 1


def test_invoke_structured_retries_on_business_rule_failure(monkeypatch):
    profile = make_profile()
    calls = []

    bad_plan = valid_plan()

    # Add a fourth training day, violating daysPerWeek=3.
    bad_plan["workoutPlan"][1]["isRestDay"] = False
    bad_plan["workoutPlan"][1]["exercises"] = [
        {
            "name": "Push Up",
            "sets": 3,
            "reps": "10",
            "restSeconds": 60,
        }
    ]
    good_plan = valid_plan()

    responses = [
        ai.AIResult(json.dumps(bad_plan), 10, 20),
        ai.AIResult(json.dumps(good_plan), 11, 21),
    ]

    def fake_invoke(*args, **kwargs):
        calls.append({"args": args, "kwargs": kwargs})
        return responses.pop(0)

    monkeypatch.setattr(ai, "_invoke", fake_invoke)

    from common.models import WeeklyPlan

    model, returned, source = ai.invoke_structured(
        system="system",
        user_content="user",
        model_cls=WeeklyPlan,
        profile=profile,
    )

    assert model is not None
    assert returned.prompt_tokens == 11
    assert source == "llm_retry"
    assert len(calls) == 2

    retry_content = calls[1]["args"][1][0]["content"]
    assert "previous response failed validation" in retry_content.lower()
    assert "expected 3 training days" in retry_content.lower()


def test_invoke_structured_does_not_require_profile_for_generic_models(monkeypatch):
    class TinyModel(__import__("pydantic").BaseModel):
        value: int

    result = ai.AIResult(
        '{"value": 123}',
        5,
        6,
    )

    monkeypatch.setattr(
        ai,
        "_invoke",
        lambda *args, **kwargs: result,
    )

    model, returned, source = ai.invoke_structured(
        system="system",
        user_content="user",
        model_cls=TinyModel,
    )

    assert model.value == 123
    assert returned is result
    assert source == "llm"
