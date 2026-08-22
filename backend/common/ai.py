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
    Extract one JSON object from model output.

    Handles:
    - bare JSON
    - markdown fences
    - prose before/after JSON
    - assistant-prefill where the response starts after '{'
    """

    text = text.strip()

    # Remove markdown fences.
    text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\s*```$", "", text)

    # Normal complete JSON object.
    if text.startswith("{"):
        start = text.find("{")
        end = text.rfind("}")

        if start != -1 and end != -1 and end >= start:
            json_text = text[start : end + 1]
            return json.loads(json_text)

    # Assistant-prefill case:
    # The provider may return:
    #
    #   "weekStartDate": "...",
    #   ...
    # }
    #
    # because we already supplied "{"
    if not text.startswith("{"):
        candidate = "{" + text

        try:
            return json.loads(candidate)
        except json.JSONDecodeError:
            pass

    # Last attempt: find the outermost JSON object.
    start = text.find("{")
    end = text.rfind("}")

    if start == -1 or end == -1 or end <= start:
        raise ValueError(
            f"no JSON object found in model output: {text[:300]!r}"
        )

    json_text = text[start : end + 1]

    return json.loads(json_text)


def _invoke(*args: Any, **kwargs: Any):
    """Invoke the configured AI provider."""

    provider = os.environ.get("AI_PROVIDER", "openrouter").lower()

    if provider == "openrouter":
        from . import openrouter

        return openrouter.invoke(*args, **kwargs)

    if provider == "bedrock":
        from . import bedrock

        return bedrock.invoke(*args, **kwargs)

    raise ValueError(f"Unknown AI_PROVIDER: {provider!r}")


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
        Normal structured-output request.

    Second attempt:
        Sends the validation errors back to the model and asks for a
        completely corrected JSON object.

    Returns:
        (validated_model, result, source)

    source:
        "llm"       = first attempt succeeded
        "llm_retry" = correction retry succeeded
    """

    # ---------------------------------------------------------------
    # FIRST ATTEMPT
    # ---------------------------------------------------------------

    messages = [
        {
            "role": "user",
            "content": user_content,
        },
        {
            "role": "assistant",
            "content": "{",
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

    # ---------------------------------------------------------------
    # RETRY
    # ---------------------------------------------------------------
    #
    # IMPORTANT:
    # Do not feed the entire malformed assistant response back as an
    # assistant message. Instead, tell the model what failed and ask
    # it to regenerate the object according to the schema.
    # ---------------------------------------------------------------

    retry_prompt = f"""
The JSON object you generated failed validation against the required
Pydantic schema.

Validation error:

{first_error}

Generate the ENTIRE JSON object again from scratch.

Important corrections:
- Follow the schema exactly.
- Do not rename fields.
- Do not invent alternative field names.
- "slot" MUST be exactly one of:
  "breakfast", "lunch", "dinner", "snack".
- Numeric fields must have the correct JSON number type.
- workoutPlan must contain exactly 7 days numbered 1 through 7.
- mealPlan must contain exactly 7 days numbered 1 through 7.
- Every required field must be present.
- Do not add commentary.
- Do not use markdown.
- Return ONLY the JSON object.

Original request:

{user_content}
"""

    retry_messages = [
        {
            "role": "user",
            "content": retry_prompt,
        },
        {
            "role": "assistant",
            "content": "{",
        },
    ]

    second = _invoke(
        system,
        retry_messages,
        max_tokens=max_tokens,
        temperature=0.2,
    )

    # Keep this temporarily so we can inspect the model's retry output
    # while debugging OpenRouter structured output.
    print("\n===== OPENROUTER SECOND RESPONSE =====")
    print(second.text)
    print("===== END OPENROUTER SECOND RESPONSE =====\n")

    try:
        parsed = extract_json(second.text)
        model = model_cls.model_validate(parsed)

        return model, second, "llm_retry"

    except (ValidationError, ValueError, json.JSONDecodeError) as exc:
        log.error(
            "retry failed validation: %s",
            exc,
        )

        raise


def model_id() -> str:
    """Return the model ID for the currently selected AI provider."""

    provider = os.environ.get("AI_PROVIDER", "openrouter").lower()

    if provider == "openrouter":
        from . import openrouter

        return openrouter.MODEL_ID

    if provider == "bedrock":
        from . import bedrock

        return bedrock.MODEL_ID

    raise ValueError(f"Unknown AI_PROVIDER: {provider!r}")