"""
POST /coach/message
AI fitness coach using the user's profile and recent daily logs.
"""

from __future__ import annotations

import json
import logging

from common import ai, auth, logs, onboarding

log = logging.getLogger(__name__)


COACH_SYSTEM_PROMPT = """
You are FitPlan AI Coach, a simple and supportive fitness assistant.

Your job is to help users with:
- progress feedback
- rest-day advice
- motivation
- simple fitness questions
- workout and nutrition guidance based on their FitPlan profile

IMPORTANT SAFETY RULES:
- Do not diagnose medical conditions.
- Do not provide medical treatment or claim to be a doctor.
- If the user describes an injury, severe pain, chest pain, difficulty breathing,
  fainting, or another potentially serious medical issue, recommend speaking
  with a qualified healthcare professional.
- Do not invent information about the user's profile or logs.
- Keep answers practical and easy to understand.
- Do not create a complete weekly workout or meal plan unless explicitly asked.
- Use the profile and recent logs as context.
- If there is not enough information, say so instead of making up details.

Return ONLY the natural-language answer to the user.
Do not return JSON.
Do not use markdown code fences.
"""


def lambda_handler(event, context):
    try:
        user_id = auth.get_user_id(event)
    except auth.Unauthorized as e:
        return auth.error(str(e), 401)

    try:
        body = json.loads(event.get("body") or "{}")
    except json.JSONDecodeError:
        return auth.error("request body is not valid JSON", 400)

    message = body.get("message")

    if not isinstance(message, str) or not message.strip():
        return auth.error("message is required", 400)

    message = message.strip()

    if len(message) > 2000:
        return auth.error("message is too long", 400)

    profile = onboarding.get_profile(user_id)

    if profile is None:
        return auth.error("profile not found", 404)

    recent_logs = logs.get_recent_logs(user_id, 7)

    profile_data = profile.model_dump(
        by_alias=True,
        mode="json",
    )

    user_content = f"""
USER PROFILE:
{json.dumps(profile_data, indent=2)}

RECENT DAILY LOGS:
{json.dumps(recent_logs, indent=2)}

USER MESSAGE:
{message}

Answer the user's message using the profile and recent logs above.
Keep the answer concise, useful, and personalized.
"""

    try:
        result = ai._invoke(
            COACH_SYSTEM_PROMPT,
            [
                {
                    "role": "user",
                    "content": user_content,
                }
            ],
            max_tokens=700,
            temperature=0.4,
        )

        reply = result.text.strip()

        if not reply:
            return auth.error("AI returned an empty response", 502)

        return auth.ok({
            "reply": reply,
        })

    except Exception:
        log.exception("Coach AI request failed")
        return auth.error("coach service temporarily unavailable", 502)
