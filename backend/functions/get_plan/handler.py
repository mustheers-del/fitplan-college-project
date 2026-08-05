"""
GET /plan?week=YYYY-MM-DD   ·   OWNER: [B]
GET /plans                  ·   list available weeks
"""

import logging

from common import auth, plans

logging.getLogger().setLevel(logging.INFO)


def lambda_handler(event, context):
    try:
        user_id = auth.get_user_id(event)
    except auth.Unauthorized as e:
        return auth.error(str(e), 401)

    path = event.get("rawPath", "")
    if path.endswith("/plans"):
        return auth.ok({"weeks": plans.list_plan_weeks(user_id)})

    week = (event.get("queryStringParameters") or {}).get("week")
    plan = plans.get_plan(user_id, week)
    if not plan:
        return auth.error("no plan found for that week", 404)

    return auth.ok({"plan": plan.model_dump(by_alias=True, mode="json")})
