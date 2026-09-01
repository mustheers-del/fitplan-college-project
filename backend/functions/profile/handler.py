"""
GET /profile  - return the authenticated user's profile.
PATCH /profile - update the authenticated user's profile.
"""

import json

from pydantic import ValidationError

from common import auth, onboarding
from common.models import UserProfile


def lambda_handler(event, context):
    try:
        user_id = auth.get_user_id(event)
    except auth.Unauthorized as e:
        return auth.error(str(e), 401)

    method = (
        event.get("requestContext", {})
        .get("http", {})
        .get("method", "")
        .upper()
    )

    # GET /profile
    if method == "GET":
        profile = onboarding.get_profile(user_id)

        if profile is None:
            return auth.error("profile not found", 404)

        return auth.ok({
            "profile": profile.model_dump(by_alias=True, mode="json")
        })

    # PATCH /profile
    if method == "PATCH":
        try:
            body = json.loads(event.get("body") or "{}")
            profile = UserProfile.model_validate(body)
        except json.JSONDecodeError:
            return auth.error("request body is not valid JSON", 400)
        except ValidationError as e:
            return auth.error("profile validation failed", 400, e.errors())

        saved, _ = onboarding.create_or_update_profile(user_id, profile)
        return auth.ok({
            "profile": saved.model_dump(by_alias=True, mode="json")
        })

    return auth.error("method not allowed", 405)
