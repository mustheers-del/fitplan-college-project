# backend/tests/test_onboarding.py
"""Tests for common/onboarding.py — profile create/update and calorie estimation."""

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


def _profile(**overrides):
    from common.models import UserProfile

    base = dict(
        age=25, sex="male", heightCm=175, weightKg=70,
        goal="build_muscle", activityLevel="moderate",
        experience="beginner", daysPerWeek=4,
    )
    base.update(overrides)
    return UserProfile.model_validate(base)


def test_estimate_fills_calorie_target_when_null(dynamo_setup):
    from common import onboarding

    saved = onboarding.create_or_update_profile("u1", _profile())
    assert saved.calorie_target is not None
    assert 1200 <= saved.calorie_target <= 5000


def test_user_supplied_calorie_target_is_kept(dynamo_setup):
    from common import onboarding

    saved = onboarding.create_or_update_profile("u1", _profile(calorieTarget=2800))
    assert saved.calorie_target == 2800


def test_reonboard_preserves_created_at(dynamo_setup):
    from common import onboarding, dynamo

    onboarding.create_or_update_profile("u1", _profile())
    first = dynamo.get_item("u1", dynamo.SK_PROFILE)

    onboarding.create_or_update_profile("u1", _profile(weightKg=72))
    second = dynamo.get_item("u1", dynamo.SK_PROFILE)

    assert second["createdAt"] == first["createdAt"]
    assert second["updatedAt"] >= first["updatedAt"]
    assert second["weightKg"] == 72


def test_get_profile_none_for_unknown_user(dynamo_setup):
    from common import onboarding

    assert onboarding.get_profile("nobody") is None


def test_get_profile_roundtrips(dynamo_setup):
    from common import onboarding
    from common.models import UserProfile

    onboarding.create_or_update_profile("u1", _profile())
    got = onboarding.get_profile("u1")
    assert isinstance(got, UserProfile)
    assert got.age == 25


def test_female_bmr_branch(dynamo_setup):
    from common import onboarding

    saved = onboarding.create_or_update_profile("u1", _profile(sex="female"))
    assert 1200 <= saved.calorie_target <= 5000