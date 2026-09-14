import json

from functions.recipes import handler


def make_event(meal_name="Chicken Bowl", ingredients=None):
    if ingredients is None:
        ingredients = ["chicken", "rice", "vegetables"]

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
        "body": json.dumps({
            "mealName": meal_name,
            "ingredients": ingredients,
        }),
    }


def test_missing_meal_name():
    response = handler.lambda_handler(
        make_event(meal_name=""),
        None,
    )

    assert response["statusCode"] == 400


def test_invalid_ingredients():
    event = make_event()
    event["body"] = json.dumps({
        "mealName": "Chicken Bowl",
        "ingredients": "chicken",
    })

    response = handler.lambda_handler(event, None)

    assert response["statusCode"] == 400


def test_meal_name_too_long():
    response = handler.lambda_handler(
        make_event(meal_name="x" * 201),
        None,
    )

    assert response["statusCode"] == 400


def test_too_many_ingredients():
    response = handler.lambda_handler(
        make_event(
            ingredients=[f"ingredient-{i}" for i in range(31)]
        ),
        None,
    )

    assert response["statusCode"] == 400


def test_successful_recipe(monkeypatch):
    class FakeResult:
        text = json.dumps({
            "name": "Chicken Bowl",
            "ingredients": [
                "chicken",
                "rice",
                "vegetables",
            ],
            "steps": [
                "Cook the chicken.",
                "Cook the rice.",
                "Combine everything and serve.",
            ],
            "prepMinutes": 20,
        })

    monkeypatch.setattr(
        handler.ai,
        "_invoke",
        lambda *args, **kwargs: FakeResult(),
    )

    response = handler.lambda_handler(
        make_event(),
        None,
    )

    assert response["statusCode"] == 200

    body = json.loads(response["body"])

    assert body["name"] == "Chicken Bowl"
    assert body["ingredients"] == [
        "chicken",
        "rice",
        "vegetables",
    ]
    assert len(body["steps"]) == 3
    assert body["prepMinutes"] == 20


def test_invalid_ai_json(monkeypatch):
    class FakeResult:
        text = "this is not valid json"

    monkeypatch.setattr(
        handler.ai,
        "_invoke",
        lambda *args, **kwargs: FakeResult(),
    )

    response = handler.lambda_handler(
        make_event(),
        None,
    )

    assert response["statusCode"] == 502


def test_ai_failure(monkeypatch):
    def fake_invoke(*args, **kwargs):
        raise RuntimeError("AI unavailable")

    monkeypatch.setattr(
        handler.ai,
        "_invoke",
        fake_invoke,
    )

    response = handler.lambda_handler(
        make_event(),
        None,
    )

    assert response["statusCode"] == 502
