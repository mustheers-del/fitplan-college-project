"""
DynamoDB access layer. Single-table design.

OWNER: [B]

Every read and write in the project goes through this module. If you find
yourself calling boto3's dynamodb resource anywhere else, that's a BLOCKING
review comment.

Key design (from the client's architecture doc):
    PK = USER#<userId>
    SK = PROFILE | PLAN#<weekStartDate> | DAILYLOG#<date>
"""

from __future__ import annotations

import os
from decimal import Decimal
from typing import Any, Optional

import boto3
from boto3.dynamodb.conditions import Key

TABLE_NAME = os.environ.get("TABLE_NAME", "fitplan-dev-main")
REGION = os.environ.get("AWS_REGION", "us-east-1")

_table = None


def table():
    global _table
    if _table is None:
        _table = boto3.resource("dynamodb", region_name=REGION).Table(TABLE_NAME)
    return _table


# --------------------------------------------------------------------------
# The Decimal problem
#
# DynamoDB stores numbers as Decimal. Pydantic wants float. json.dumps
# refuses Decimal outright. This bites every team once — solve it here, once.
# --------------------------------------------------------------------------


def to_dynamo(obj: Any) -> Any:
    """float -> Decimal, recursively. Use before every put_item."""
    if isinstance(obj, float):
        return Decimal(str(obj))
    if isinstance(obj, dict):
        return {k: to_dynamo(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [to_dynamo(v) for v in obj]
    return obj


def from_dynamo(obj: Any) -> Any:
    """Decimal -> int/float, recursively. Use after every read."""
    if isinstance(obj, Decimal):
        return int(obj) if obj % 1 == 0 else float(obj)
    if isinstance(obj, dict):
        return {k: from_dynamo(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [from_dynamo(v) for v in obj]
    return obj


# --------------------------------------------------------------------------
# Key helpers — never build key strings by hand elsewhere
# --------------------------------------------------------------------------


def pk(user_id: str) -> str:
    return f"USER#{user_id}"


SK_PROFILE = "PROFILE"


def sk_plan(week_start: str) -> str:
    return f"PLAN#{week_start}"


def sk_log(day: str) -> str:
    return f"DAILYLOG#{day}"


# --------------------------------------------------------------------------
# Generic operations
# --------------------------------------------------------------------------


def get_item(user_id: str, sk: str) -> Optional[dict]:
    resp = table().get_item(Key={"PK": pk(user_id), "SK": sk})
    item = resp.get("Item")
    return from_dynamo(item) if item else None


def put_item(user_id: str, sk: str, data: dict) -> None:
    item = {"PK": pk(user_id), "SK": sk, **data}
    table().put_item(Item=to_dynamo(item))


def query_prefix(user_id: str, sk_prefix: str, limit: int = 50, ascending: bool = False) -> list[dict]:
    """All items for a user whose SK starts with `sk_prefix`."""
    resp = table().query(
        KeyConditionExpression=Key("PK").eq(pk(user_id)) & Key("SK").begins_with(sk_prefix),
        Limit=limit,
        ScanIndexForward=ascending,
    )
    return [from_dynamo(i) for i in resp.get("Items", [])]


def query_between(user_id: str, sk_start: str, sk_end: str) -> list[dict]:
    """Range query — e.g. a week of DAILYLOG# entries."""
    resp = table().query(
        KeyConditionExpression=Key("PK").eq(pk(user_id)) & Key("SK").between(sk_start, sk_end),
        ScanIndexForward=True,
    )
    return [from_dynamo(i) for i in resp.get("Items", [])]


def delete_item(user_id: str, sk: str) -> None:
    table().delete_item(Key={"PK": pk(user_id), "SK": sk})
