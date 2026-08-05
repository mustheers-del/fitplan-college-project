"""
POST /plan/generate   ·   OWNER: [M] Mustheer -- do not edit without asking

Body: {"force": bool, "week": "YYYY-MM-DD"}   both optional

Lambda config matters here: timeout 60s, memory 512MB. A cold Bedrock call
plus a correction retry comfortably exceeds the 3s default, and the failure
presents as a mystery 502.
"""

import json
import logging

from common import auth, plans

logging.getLogger().setLevel(logging.INFO)


def lambda_handler(event, context):
    try:
        user_id = auth.get_user_id(event)
    except auth.Unauthorized as e:
        return auth.error(str(e), 401)

    body = {}
    if event.get("body"):
        try:
            body = json.loads(event["body"])
        except json.JSONDecodeError:
            return auth.error("request body is not valid JSON", 400)

    try:
        plan = plans.generate_plan_for_user(
            user_id=user_id,
            week_start=body.get("week"),
            force=bool(body.get("force", False)),
        )
    except ValueError as e:
        return auth.error(str(e), 409)
    except Exception:
        logging.exception("unexpected failure generating plan for %s", user_id)
        return auth.error("plan generation failed, please try again", 500)

    return auth.ok({"plan": plan.model_dump(by_alias=True, mode="json")})
