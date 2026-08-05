"""
GET /logs/daily?range=7d   ·   OWNER: [C]
"""

import logging

from common import auth, logs

logging.getLogger().setLevel(logging.INFO)


def lambda_handler(event, context):
    try:
        user_id = auth.get_user_id(event)
    except auth.Unauthorized as e:
        return auth.error(str(e), 401)

    params = event.get("queryStringParameters") or {}
    rng = params.get("range", "7d")

    try:
        days = int(rng.rstrip("d"))
        if not 1 <= days <= 90:
            raise ValueError
    except ValueError:
        return auth.error("range must be between 1d and 90d", 400)

    return auth.ok({"logs": logs.get_recent_logs(user_id, days), "range": rng})
