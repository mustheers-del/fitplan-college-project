# backend/tests/test_dynamo_pagination.py
"""Pagination tests — the bug these cover is silent, so it needs real data."""

import boto3
import pytest
from moto import mock_aws


@pytest.fixture
def dynamo_table():
    with mock_aws():
        client = boto3.resource("dynamodb", region_name="us-east-1")
        client.create_table(
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

        d._table = None  # force re-resolve against the mock
        yield d
        d._table = None


def test_query_prefix_returns_more_than_one_page(dynamo_table):
    d = dynamo_table
    for i in range(120):
        d.put_item("u1", d.sk_log(f"2026-01-{i:03d}"), {"note": "x" * 100})

    assert len(d.query_prefix("u1", "DAILYLOG#", limit=None)) == 120
    assert len(d.query_prefix("u1", "DAILYLOG#", limit=50)) == 50


def test_query_between_returns_all_in_range(dynamo_table):
    d = dynamo_table
    for i in range(1, 32):
        d.put_item("u1", d.sk_log(f"2026-01-{i:02d}"), {"note": "y"})

    got = d.query_between("u1", "DAILYLOG#2026-01-01", "DAILYLOG#2026-01-31")
    assert len(got) == 31
