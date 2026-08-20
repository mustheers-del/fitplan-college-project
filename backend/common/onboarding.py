"""
Profile / onboarding logic. OWNER: [B]

TODO [B] Sprint 2: implement calorie_target estimation (Mifflin-St Jeor +
activity multiplier + goal adjustment) so the LLM gets a number instead of null.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from common import dynamo
from common.models import UserProfile

_ACTIVITY_MULTIPLIER = {
    "sedentary": 1.2,
    "light": 1.375,
    "moderate": 1.55,
    "active": 1.725,
    "very_active": 1.9,
}

_GOAL_ADJUSTMENT = {
    "lose_weight": -400,
    "build_muscle": +300,
    "gain_strength": +200,
    "stay_fit": 0,
}


def estimate_calorie_target(profile: UserProfile) -> int:
    """Mifflin-St Jeor BMR × activity multiplier, adjusted for goal."""
    if profile.sex == "male":
        bmr = 10 * profile.weight_kg + 6.25 * profile.height_cm - 5 * profile.age + 5
    else:
        bmr = 10 * profile.weight_kg + 6.25 * profile.height_cm - 5 * profile.age - 161

    tdee = bmr * _ACTIVITY_MULTIPLIER[profile.activity_level]
    target = int(tdee + _GOAL_ADJUSTMENT[profile.goal])
    return max(1200, min(target, 5000))  # never prescribe a dangerous deficit


def create_or_update_profile(user_id: str, profile: UserProfile) -> UserProfile:
    if profile.calorie_target is None:
        profile.calorie_target = estimate_calorie_target(profile)

    data = profile.model_dump(by_alias=True, mode="json")
    existing = dynamo.get_item(user_id, dynamo.SK_PROFILE)
    now = datetime.now(timezone.utc).isoformat()

    data["createdAt"] = existing.get("createdAt", now) if existing else now
    data["updatedAt"] = now

    dynamo.put_item(user_id, dynamo.SK_PROFILE, data)
    return profile


def get_profile(user_id: str) -> Optional[UserProfile]:
    item = dynamo.get_item(user_id, dynamo.SK_PROFILE)
    if not item:
        return None
    for k in ("PK", "SK", "createdAt", "updatedAt"):
        item.pop(k, None)
    return UserProfile.model_validate(item)
