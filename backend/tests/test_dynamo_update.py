# backend/tests/test_dynamo_update.py
"""Tests for dynamo.update_item — atomic partial merge, timestamps, create/update flag."""

import time

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
        yield d
        d._table = None


def test_first_write_reports_created(dynamo_setup):
    d = dynamo_setup
    item, created = d.update_item("u1", "PROFILE", {"goal": "stay_fit"})
    assert created is True
    assert "createdAt" in item
    assert "updatedAt" in item


def test_second_write_reports_not_created(dynamo_setup):
    d = dynamo_setup
    d.update_item("u1", "PROFILE", {"goal": "stay_fit"})
    _, created = d.update_item("u1", "PROFILE", {"goal": "build_muscle"})
    assert created is False


def test_partial_write_preserves_other_fields(dynamo_setup):
    d = dynamo_setup
    d.update_item("u1", "PROFILE", {"goal": "stay_fit", "age": 20})
    item, _ = d.update_item("u1", "PROFILE", {"age": 21})
    assert item["goal"] == "stay_fit"  # untouched field survives
    assert item["age"] == 21  # named field updated


def test_created_at_preserved_updated_at_changes(dynamo_setup):
    d = dynamo_setup
    first, _ = d.update_item("u1", "PROFILE", {"goal": "stay_fit"})
    time.sleep(0.01)
    second, _ = d.update_item("u1", "PROFILE", {"goal": "build_muscle"})
    assert second["createdAt"] == first["createdAt"]
    assert second["updatedAt"] != first["updatedAt"]


def test_float_values_survive_roundtrip(dynamo_setup):
    d = dynamo_setup
    item, _ = d.update_item("u1", "PROFILE", {"weightKg": 72.5})
    assert item["weightKg"] == 72.5  # Decimal->float conversion works through update
