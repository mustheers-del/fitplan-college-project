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

1. Return exactly ONE JSON object.
2. Return ONLY JSON.
3. Do NOT use markdown.
4. Do NOT use ```json fences.
5. Do NOT add any explanation before or after the JSON.
6. Follow the supplied Pydantic schema exactly.
7. Do not rename fields.
8. Do not add fields that are not in the schema.
9. workoutPlan must contain exactly 7 days numbered 1 through 7.
10. mealPlan must contain exactly 7 days numbered 1 through 7.
11. Training-day count must equal daysPerWeek.
12. Rest days must have:
    "isRestDay": true
    and
    "exercises": []
13. "slot" must be exactly one of:
    "breakfast", "lunch", "dinner", "snack"
14. Respect injuries.
15. Respect equipment.
16. Respect vegetarian/non-vegetarian preference.
17. Respect allergies.
18. Respect mealsPerDay.
19. Respect cookingTime.
20. Keep each day's meal calories within the required target.
21. Make sure the JSON is COMPLETE and ends with the final closing brace.
22. Never stop halfway through the mealPlan.
23. Before returning the answer, mentally verify that every opening
    object/array has its corresponding closing brace/bracket.

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