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
from datetime import UTC, datetime
from decimal import Decimal
from typing import Any

import boto3
from boto3.dynamodb.conditions import Key


def _now_iso() -> str:
    return datetime.now(UTC).isoformat()


TABLE_NAME = os.environ["TABLE_NAME"]
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


def get_item(user_id: str, sk: str) -> dict | None:
    resp = table().get_item(Key={"PK": pk(user_id), "SK": sk})
    item = resp.get("Item")
    return from_dynamo(item) if item else None


def put_item(user_id: str, sk: str, data: dict) -> None:
    item = {"PK": pk(user_id), "SK": sk, **data}
    table().put_item(Item=to_dynamo(item))


def update_item(user_id: str, sk: str, data: dict) -> tuple[dict, bool]:
    """Merge `data` into an item, server-side and atomically.

    Only the attributes in `data` are written; attributes not in `data` are
    left untouched (unlike put_item, which full-replaces). createdAt is set only
    on first write via if_not_exists; updatedAt is always set.

    Returns (item, created) — created is True if the row did not exist before.
    """
    now = _now_iso()
    names = {"#createdAt": "createdAt", "#updatedAt": "updatedAt"}
    values = {":now": now}
    set_parts = [
        "#createdAt = if_not_exists(#createdAt, :now)",
        "#updatedAt = :now",
    ]

    for i, (k, v) in enumerate(data.items()):
        names[f"#f{i}"] = k
        values[f":v{i}"] = v
        set_parts.append(f"#f{i} = :v{i}")

    resp = table().update_item(
        Key={"PK": pk(user_id), "SK": sk},
        UpdateExpression="SET " + ", ".join(set_parts),
        ExpressionAttributeNames=names,
        ExpressionAttributeValues=to_dynamo(values),
        ReturnValues="ALL_NEW",
    )
    item = from_dynamo(resp["Attributes"])
    created = item.get("createdAt") == now
    return item, created


def query_prefix(
    user_id: str, sk_prefix: str, limit: int = 50, ascending: bool = False
) -> list[dict]:
    """All items for a user whose SK starts with `sk_prefix`.

    Pages through results — DynamoDB returns at most 1MB per call and signals
    more via LastEvaluatedKey. Without this, a user's history silently stops
    at the first page with no error.

    `limit` caps the number of items returned. Pass limit=None for all of them.
    """
    items: list[dict] = []
    kwargs: dict = {}

    while True:
        resp = table().query(
            KeyConditionExpression=Key("PK").eq(pk(user_id)) & Key("SK").begins_with(sk_prefix),
            ScanIndexForward=ascending,
            **kwargs,
        )
        items.extend(resp.get("Items", []))

        last_key = resp.get("LastEvaluatedKey")
        if not last_key or (limit is not None and len(items) >= limit):
            break
        kwargs["ExclusiveStartKey"] = last_key

    if limit is not None:
        items = items[:limit]
    return [from_dynamo(i) for i in items]


def query_between(user_id: str, sk_start: str, sk_end: str, limit: int | None = None) -> list[dict]:
    """Range query — e.g. a week of DAILYLOG# entries. Pages through results."""
    items: list[dict] = []
    kwargs: dict = {}

    while True:
        resp = table().query(
            KeyConditionExpression=Key("PK").eq(pk(user_id)) & Key("SK").between(sk_start, sk_end),
            ScanIndexForward=True,
            **kwargs,
        )
        items.extend(resp.get("Items", []))

        last_key = resp.get("LastEvaluatedKey")
        if not last_key or (limit is not None and len(items) >= limit):
            break
        kwargs["ExclusiveStartKey"] = last_key

    if limit is not None:
        items = items[:limit]
    return [from_dynamo(i) for i in items]


def delete_item(user_id: str, sk: str) -> None:
    table().delete_item(Key={"PK": pk(user_id), "SK": sk})
