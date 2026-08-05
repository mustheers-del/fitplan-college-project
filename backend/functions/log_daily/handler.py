"""
POST /logs/daily   ·   OWNER: [C]

NO LLM CALL HERE. Raw text straight to DynamoDB. Saving is instant and free.
"""

import json
import logging

from pydantic import ValidationError

from common import auth, logs
from common.models import DailyLogIn

logging.getLogger().setLevel(logging.INFO)


def lambda_handler(event, context):
    try:
        user_id = auth.get_user_id(event)
    except auth.Unauthorized as e:
        return auth.error(str(e), 401)

    try:
        entry = DailyLogIn.model_validate(json.loads(event.get("body") or "{}"))
    except json.JSONDecodeError:
        return auth.error("request body is not valid JSON", 400)
    except ValidationError as e:
        return auth.error("log validation failed", 400, e.errors())

    if not entry.workout_text.strip() and not entry.meals_text.strip():
        return auth.error("log is empty -- provide workoutText or mealsText", 400)

    return auth.created({"log": logs.save_daily_log(user_id, entry)})
