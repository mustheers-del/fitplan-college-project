"""
Auth helpers. OWNER: [M]

API Gateway's Cognito JWT authorizer has already validated the token by the
time your handler runs. You are only reading claims here, not verifying —
do not add token verification, it's already done and doing it twice is a
common and pointless mistake.
"""

from __future__ import annotations

import json
from typing import Any


class Unauthorized(Exception):
    pass


def get_user_id(event: dict[str, Any]) -> str:
    """Cognito `sub` — the stable user ID. Never use email as a key."""
    try:
        return event["requestContext"]["authorizer"]["jwt"]["claims"]["sub"]
    except (KeyError, TypeError) as exc:
        raise Unauthorized("no valid JWT claims on request") from exc


def get_email(event: dict[str, Any]) -> str | None:
    try:
        return event["requestContext"]["authorizer"]["jwt"]["claims"].get("email")
    except (KeyError, TypeError):
        return None


# --------------------------------------------------------------------------
# Response helpers — every handler uses these so responses are consistent
# --------------------------------------------------------------------------

_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",  # [C]: tighten to the CloudFront domain in Sprint 7
}


def ok(body: Any, status: int = 200) -> dict:
    return {"statusCode": status, "headers": _HEADERS, "body": json.dumps(body, default=str)}


def created(body: Any) -> dict:
    return ok(body, 201)


def error(message: str, status: int = 400, detail: Any = None) -> dict:
    payload: dict[str, Any] = {"error": message}
    if detail is not None:
        payload["detail"] = detail
    return {"statusCode": status, "headers": _HEADERS, "body": json.dumps(payload, default=str)}
