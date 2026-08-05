from decimal import Decimal

from common.dynamo import from_dynamo, sk_log, sk_plan, to_dynamo


def test_float_roundtrip():
    """The Decimal trap. This test exists so nobody rediscovers it in Sprint 4."""
    original = {"weight": 72.5, "reps": 12, "nested": {"macros": [30.5, 40.0]}}
    assert from_dynamo(to_dynamo(original)) == original


def test_to_dynamo_produces_decimals():
    assert isinstance(to_dynamo({"x": 1.5})["x"], Decimal)


def test_key_helpers():
    assert sk_plan("2026-08-03") == "PLAN#2026-08-03"
    assert sk_log("2026-08-05") == "DAILYLOG#2026-08-05"
