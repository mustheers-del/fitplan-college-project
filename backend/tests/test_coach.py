import json

from common.models import UserProfile
from functions.coach import handler


def make_profile():
    return UserProfile(
        age=20,
        sex="male",
        heightCm=171,
        weightKg=65,
        goal="stay_fit",
        activityLevel="moderate",
        experience="beginner",
        daysPerWeek=4,
        equipment=["bodyweight"],
        mealPref="vegetarian",
        injuries=[],
    )


def make_event(message):
    return {
        "requestContext": {
            "authorizer": {
                "jwt": {
                    "claims": {
                        "sub": "test-user"
                    }
                }
            }
        },
        "body": json.dumps({"message": message}),
    }


def test_empty_message():
    response = handler.lambda_handler(make_event(""), None)

    assert response["statusCode"] == 400


def test_message_too_long():
    response = handler.lambda_handler(make_event("x" * 2001), None)

    assert response["statusCode"] == 400


def test_profile_missing(monkeypatch):
    monkeypatch.setattr(
        handler.onboarding,
        "get_profile",
        lambda user_id: None,
    )

    response = handler.lambda_handler(
        make_event("How is my progress?"),
        None,
    )

    assert response["statusCode"] == 404


def test_successful_coach_reply(monkeypatch):
    monkeypatch.setattr(
        handler.onboarding,
        "get_profile",
        lambda user_id: make_profile(),
    )

    monkeypatch.setattr(
        handler.logs,
        "get_recent_logs",
        lambda user_id, days: [],
    )

    class FakeResult:
        text = "You are doing well. Keep following your routine consistently."

    monkeypatch.setattr(
        handler.ai,
        "_invoke",
        lambda *args, **kwargs: FakeResult(),
    )

    response = handler.lambda_handler(
        make_event("How is my progress?"),
        None,
    )

    assert response["statusCode"] == 200

    body = json.loads(response["body"])

    assert body["reply"] == (
        "You are doing well. Keep following your routine consistently."
    )


def test_ai_failure(monkeypatch):
    monkeypatch.setattr(
        handler.onboarding,
        "get_profile",
        lambda user_id: make_profile(),
    )

    monkeypatch.setattr(
        handler.logs,
        "get_recent_logs",
        lambda user_id, days: [],
    )

    def fake_invoke(*args, **kwargs):
        raise RuntimeError("AI unavailable")

    monkeypatch.setattr(
        handler.ai,
        "_invoke",
        fake_invoke,
    )

    response = handler.lambda_handler(
        make_event("Give me motivation"),
        None,
    )

    assert response["statusCode"] == 502
