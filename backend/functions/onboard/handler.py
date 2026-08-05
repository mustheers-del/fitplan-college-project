"""
POST /onboard   ·   OWNER: [B]

Handlers are THIN. Parse, delegate to common/, format. If this file grows
past ~30 lines of logic, the logic belongs in common/onboarding.py.
"""

import json
import logging

from pydantic import ValidationError

from common import auth, onboarding
from common.models import UserProfile

logging.getLogger().setLevel(logging.INFO)


def lambda_handler(event, context):
    try:
        user_id = auth.get_user_id(event)
    except auth.Unauthorized as e:
        return auth.error(str(e), 401)

    try:
        body = json.loads(event.get("body") or "{}")
        profile = UserProfile.model_validate(body)
    except json.JSONDecodeError:
        return auth.error("request body is not valid JSON", 400)
    except ValidationError as e:
        return auth.error("profile validation failed", 400, e.errors())

    saved = onboarding.create_or_update_profile(user_id, profile)
    return auth.created({"profile": saved.model_dump(by_alias=True, mode="json")})
