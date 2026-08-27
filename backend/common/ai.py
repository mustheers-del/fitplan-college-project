"""
AI provider selector and structured-output handling.

Provider selection is controlled by AI_PROVIDER.
Supported providers: openrouter, bedrock.
"""

from __future__ import annotations

import json
import logging
import os
import re
from typing import Any, Type, TypeVar

from pydantic import BaseModel, ValidationError
from common.models import UserProfile
from common.plan_validation import check_all_rules

log = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)


class AIResult:
    """Raw model text plus token accounting."""

    def __init__(
        self,
        text: str,
        prompt_tokens: int,
        completion_tokens: int,
    ):
        self.text = text
        self.prompt_tokens = prompt_tokens
        self.completion_tokens = completion_tokens

    def __repr__(self) -> str:
        return (
            f"<AIResult in={self.prompt_tokens} "
            f"out={self.completion_tokens} chars={len(self.text)}>"
        )


def extract_json(text: str) -> dict:
    """
    Extract exactly one JSON object from model output.

    Handles:
    - bare JSON
    - markdown fences
    - leading/trailing whitespace
    - harmless text before/after JSON
    """

    if not text:
        raise ValueError("model returned empty output")

    text = text.strip()

    # Remove markdown fences.
    text = re.sub(
        r"^```(?:json)?\s*",
        "",
        text,
        flags=re.IGNORECASE,
    )
    text = re.sub(
        r"\s*```$",
        "",
        text,
    )

    # Find the first JSON object.
    start = text.find("{")

    if start == -1:
        raise ValueError("model output does not contain a JSON object")

    text = text[start:]

    decoder = json.JSONDecoder()

    try:
        parsed, end = decoder.raw_decode(text)
    except json.JSONDecodeError as exc:
        raise ValueError(
            f"could not extract complete JSON object: {exc}"
        ) from exc

    if not isinstance(parsed, dict):
        raise ValueError("model output JSON root must be an object")

    # Ignore harmless text after the JSON object.
    trailing = text[end:].strip()

    if trailing:
        log.warning(
            "Ignoring trailing text after JSON object: %s",
            trailing[:200],
        )

    return parsed


def _invoke(*args: Any, **kwargs: Any):
    """Invoke the configured AI provider."""

    provider = os.environ.get(
        "AI_PROVIDER",
        "openrouter",
    ).lower()

    if provider == "openrouter":
        from . import openrouter

        return openrouter.invoke(*args, **kwargs)

    if provider == "bedrock":
        from . import bedrock

        return bedrock.invoke(*args, **kwargs)

    raise ValueError(
        f"Unknown AI_PROVIDER: {provider!r}"
    )


def _validation_summary(exc: Exception) -> str:
    """Return a compact validation message for the retry."""

    if isinstance(exc, ValidationError):
        return str(exc)

    return str(exc)


def invoke_structured(
    system: str,
    user_content: str,
    model_cls: Type[T],
    max_tokens: int = 8000,
    temperature: float = 0.4,
    profile: UserProfile | None = None,
) -> tuple[T, Any, str]:
    """
    Call the selected AI provider and validate the response.

    First attempt:
        Ask the model for a complete JSON object.

    Second attempt:
        Regenerate the complete object if parsing or validation fails.

    Returns:
        (validated_model, result, source)

    source:
        "llm"       = first attempt succeeded
        "llm_retry" = correction retry succeeded
    """

    # ===============================================================
    # FIRST ATTEMPT
    # ===============================================================

    messages = [
        {
            "role": "user",
            "content": user_content,
        },
    ]

    first = _invoke(
        system,
        messages,
        max_tokens=max_tokens,
        temperature=temperature,
    )

    try:
        parsed = extract_json(first.text)

        model = model_cls.model_validate(parsed)

        if profile is not None:
            rule_failures = check_all_rules(model, profile)

            if rule_failures:
                raise ValueError(
                    "Business-rule validation failed:\n- "
                    + "\n- ".join(rule_failures)
                )

        return model, first, "llm"

    except (ValidationError, ValueError, json.JSONDecodeError) as exc:
        first_error = exc

        log.warning(
            "first attempt failed validation: %s",
            first_error,
        )

    # ===============================================================
    # RETRY
    # ===============================================================

    retry_prompt = f"""
Your previous response failed validation.

Validation error:
{_validation_summary(first_error)}

Generate the ENTIRE weekly plan again from scratch.

STRICT REQUIREMENTS:

1. Return exactly ONE complete JSON object.
2. Return ONLY JSON. No markdown, no ```json fences, no explanation.
3. Follow the supplied Pydantic schema exactly.
4. Do not rename fields or add fields.
5. workoutPlan must contain exactly 7 days numbered 1 through 7.
6. mealPlan must contain exactly 7 days numbered 1 through 7.
7. Follow the FIXED 7-DAY LAYOUT from the original request exactly.
8. Training-day count must equal daysPerWeek.
9. Every rest day must have isRestDay=true and exercises=[].
10. Every training day must have isRestDay=false and at least one exercise.

11. BEGINNER RULE:
    If experience_level is beginner, ZERO advanced exercises are allowed.
    Every exercise must be beginner or clearly accessible intermediate.
    Do NOT use advanced barbell movements such as barbell back squat,
    barbell deadlift, barbell bench press, or other technically demanding
    advanced movements for a beginner.

12. INJURY RULE:
    If the user has a knee injury, NEVER use squats, lunges, step-ups,
    jumping, running, or other movements that stress the knee.
    Use safe alternatives instead.

13. EQUIPMENT RULE:
    Use ONLY equipment explicitly listed in the user's equipment array.
    If equipment is ["bodyweight"], use only exercises requiring no equipment.
    Never assume a bench, chair, wall, stairs, table, weights, bands,
    machines, or other equipment that was not listed.

14. Respect all other injury restrictions.
15. Respect vegetarian/vegan meal preferences absolutely.
16. Respect all listed allergies absolutely.
17. Number of meals per day must equal mealsPerDay.
18. Total preparation time for each day must not exceed cookingTime.
19. Every day's totalCalories MUST be within +/-100 kcal of calorieTarget.
20. Do not intentionally undershoot or overshoot the calorie target.
21. Before returning JSON, check EVERY exercise against experience,
    injury, and equipment restrictions.
22. Before returning JSON, check EVERY meal against diet and allergy rules.
23. Before returning JSON, check EVERY day's calories against calorieTarget.
24. Make sure the JSON is COMPLETE and ends with the final closing brace.
25. Never stop halfway through workoutPlan or mealPlan.
ORIGINAL USER REQUEST:

{user_content}
"""

    retry_messages = [
        {
            "role": "user",
            "content": retry_prompt,
        },
    ]

    second = _invoke(
        system,
        retry_messages,
        max_tokens=max_tokens,
        temperature=0.1,
    )

    log.debug(
        "Retry response length=%d",
        len(second.text),
    )

    # ===============================================================
    # VALIDATE RETRY
    # ===============================================================

    try:
        parsed = extract_json(second.text)

        model = model_cls.model_validate(parsed)

        if profile is not None:
            rule_failures = check_all_rules(model, profile)

            if rule_failures:
                raise ValueError(
                    "Business-rule validation failed:\n- "
                    + "\n- ".join(rule_failures)
                )

        return model, second, "llm_retry"

    except (ValidationError, ValueError, json.JSONDecodeError) as exc:
        log.error(
            "retry failed validation: %s",
            exc,
        )

        # Give ourselves useful diagnostics.
        log.error(
            "Retry output length=%d",
            len(second.text),
        )

        log.error(
            "Retry output tail=%r",
            second.text[-1000:],
        )

        raise


def model_id() -> str:
    """Return the model ID for the currently selected AI provider."""

    provider = os.environ.get(
        "AI_PROVIDER",
        "openrouter",
    ).lower()

    if provider == "openrouter":
        from . import openrouter

        return openrouter.MODEL_ID

    if provider == "bedrock":
        from . import bedrock

        return bedrock.MODEL_ID

    raise ValueError(
        f"Unknown AI_PROVIDER: {provider!r}"
    )
