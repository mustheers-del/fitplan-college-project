"""
Daily log logic. OWNER: [C]

Critical rule from the architecture doc: writing a log makes NO LLM call.
Raw text goes straight to DynamoDB. Parsing happens in batch, once a week,
inside weekly_plan_gen. Saving must be instant and free.
"""

from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from typing import Optional

from common import dynamo
from common.models import DailyLogIn


def save_daily_log(user_id: str, entry: DailyLogIn) -> dict:
    data = entry.model_dump(by_alias=True, mode="json")
    data["createdAt"] = datetime.now(timezone.utc).isoformat()
    data["parsed"] = False
    dynamo.put_item(user_id, dynamo.sk_log(entry.date.isoformat()), data)
    return data


def get_log(user_id: str, day: str) -> Optional[dict]:
    return dynamo.get_item(user_id, dynamo.sk_log(day))


def get_logs_range(user_id: str, start: str, end: str) -> list[dict]:
    return dynamo.query_between(user_id, dynamo.sk_log(start), dynamo.sk_log(end))


def get_recent_logs(user_id: str, days: int = 7) -> list[dict]:
    today = datetime.now(timezone.utc).date()
    start = (today - timedelta(days=days - 1)).isoformat()
    return get_logs_range(user_id, start, today.isoformat())


def get_week_logs(user_id: str, week_start: str) -> list[dict]:
    start = date.fromisoformat(week_start)
    return get_logs_range(user_id, start.isoformat(), (start + timedelta(days=6)).isoformat())


def mark_logs_parsed(user_id: str, dates: list[str]) -> None:
    """Called by weekly_plan_gen after a successful batch parse."""
    for d in dates:
        item = dynamo.get_item(user_id, dynamo.sk_log(d))
        if item:
            item["parsed"] = True
            item.pop("PK", None)
            item.pop("SK", None)
            dynamo.put_item(user_id, dynamo.sk_log(d), item)
