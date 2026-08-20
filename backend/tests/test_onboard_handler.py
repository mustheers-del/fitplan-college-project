# backend/tests/test_onboard_handler.py
"""Tests for functions/onboard/handler.py — the HTTP edge: auth, parsing, status codes."""

import json
import boto3
import pytest
from moto import mock_aws


@pytest.fixture
def dynamo_setup():
    with mock_aws():
        boto3.resource("dynamodb", region_name="us-east-1").create_table(
            TableName="fitplan-test-main",
            KeySchema=[
                {"AttributeName": "PK", "KeyType": "HASH"},
                {"AttributeName": "SK", "KeyType": "RANGE"},
            ],
            AttributeDefinitions=[
                {"AttributeName": "PK", "AttributeType": "S"},
                {"AttributeName": "SK", "AttributeType": "S"},
            ],
            BillingMode="PAY_PER_REQUEST",
        )
        import common.dynamo as d

        d._table = None
        yield
        d._table = None


def _event(body, sub="user-123"):
    """A fake API Gateway v2 event with a Cognito JWT sub claim."""
    ev = {
        "requestContext": {"authorizer": {"jwt": {"claims": {"sub": sub}}}},
        "body": body,
    }
    return ev


def _valid_body():
    return json.dumps({
        "age": 25, "sex": "male", "heightCm": 175, "weightKg": 70,
        "goal": "build_muscle", "activityLevel": "moderate",
        "experience": "beginner", "daysPerWeek": 4,
    })


def _handler():
    from functions.onboard.handler import lambda_handler
    return lambda_handler


def test_valid_onboard_returns_201(dynamo_setup):
    resp = _handler()(_event(_valid_body()), None)
    assert resp["statusCode"] == 201
    body = json.loads(resp["body"])
    assert body["profile"]["age"] == 25


def test_missing_jwt_returns_401(dynamo_setup):
    resp = _handler()({"body": _valid_body()}, None)  # no requestContext
    assert resp["statusCode"] == 401


def test_malformed_json_returns_400(dynamo_setup):
    resp = _handler()(_event("{not valid json"), None)
    assert resp["statusCode"] == 400


def test_invalid_profile_returns_400_with_detail(dynamo_setup):
    bad = json.dumps({"age": 5, "sex": "male", "heightCm": 175, "weightKg": 70,
                      "goal": "build_muscle", "activityLevel": "moderate",
                      "experience": "beginner", "daysPerWeek": 4})  # age 5 < 13
    resp = _handler()(_event(bad), None)
    assert resp["statusCode"] == 400
    assert "detail" in json.loads(resp["body"])



def test_unknown_field_rejected(dynamo_setup):
    # UserProfile has extra="forbid" — a stray field should 400
    body = json.loads(_valid_body())
    body["hackerField"] = "x"
    resp = _handler()(_event(json.dumps(body)), None)
    assert resp["statusCode"] == 400


