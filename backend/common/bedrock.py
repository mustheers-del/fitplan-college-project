"""
Bedrock client wrapper.

OWNER: [M] Mustheer. Nobody else edits this file.

Everything that talks to an LLM goes through here. That means cost controls,
retry policy, JSON extraction and token accounting live in exactly one place.
"""

from __future__ import annotations

import json
import logging
import os
import re
from typing import Any, Type, TypeVar

import boto3
from botocore.config import Config
from pydantic import BaseModel, ValidationError

log = logging.getLogger(__name__)

MODEL_ID = os.environ.get(
    "BEDROCK_MODEL_ID", "us.amazon.nova-lite-v1:0"
)
REGION = os.environ.get("AWS_REGION", "us-east-1")

# Adaptive retries handle ThrottlingException when the whole team tests at once.
_config = Config(
    retries={"max_attempts": 3, "mode": "adaptive"},
    read_timeout=60,
    connect_timeout=10,
)

_client = None


def client():
    """Lazy singleton — created once per Lambda container, not per invocation."""
    global _client
    if _client is None:
        _client = boto3.client("bedrock-runtime", region_name=REGION, config=_config)
    return _client


T = TypeVar("T", bound=BaseModel)


class BedrockResult:
    """Raw text plus token accounting, so callers can record cost."""

    def __init__(self, text: str, prompt_tokens: int, completion_tokens: int):
        self.text = text
        self.prompt_tokens = prompt_tokens
        self.completion_tokens = completion_tokens

    def __repr__(self) -> str:
        return (
            f"<BedrockResult in={self.prompt_tokens} out={self.completion_tokens} "
            f"chars={len(self.text)}>"
        )


def invoke(
    system: str,
    messages: list[dict[str, Any]],
    max_tokens: int = 4000,
    temperature: float = 0.4,
) -> BedrockResult:
    """
    One Bedrock call. `messages` is the Anthropic messages format.

    max_tokens is capped deliberately — a plan needing more than 4k tokens
    means the schema is wrong, not that the budget is too small.
    """
    body = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": max_tokens,
        "temperature": temperature,
        "system": system,
        "messages": messages,
    }

    resp = client().invoke_model(
        modelId=MODEL_ID,
        body=json.dumps(body, separators=(",", ":")),
        contentType="application/json",
        accept="application/json",
    )
    payload = json.loads(resp["body"].read())

    text = "".join(
        block.get("text", "") for block in payload.get("content", []) if block.get("type") == "text"
    )
    usage = payload.get("usage", {})

    result = BedrockResult(
        text=text,
        prompt_tokens=usage.get("input_tokens", 0),
        completion_tokens=usage.get("output_tokens", 0),
    )
    log.info("bedrock call %s", result)
    return result


def extract_json(text: str) -> dict:
    """
    Pull a JSON object out of model output.

    Handles: bare JSON, ```json fences, prose before/after, and the prefill
    case where the response starts mid-object.
    """
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)

    # Prefill case: we sent "{" as the assistant turn, so the response
    # continues from there and has no opening brace of its own.
    if not text.lstrip().startswith("{"):
        candidate = "{" + text
        try:
            return json.loads(candidate)
        except json.JSONDecodeError:
            pass

    start, end = text.find("{"), text.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise ValueError(f"no JSON object found in model output: {text[:200]!r}")
    return json.loads(text[start : end + 1])


def invoke_structured(
    system: str,
    user_content: str,
    model_cls: Type[T],
    max_tokens: int = 4000,
    temperature: float = 0.4,
) -> tuple[T, BedrockResult, str]:
    """
    Call Bedrock and validate the output against `model_cls`.

    Uses assistant prefill to force JSON, and allows EXACTLY ONE correction
    retry. Not a loop — a loop is how you get a surprise AWS bill.

    Returns (validated_model, last_result, source) where source is
    "llm" or "llm_retry". Raises if both attempts fail; the caller decides
    whether to fall back to a static plan.
    """
    messages = [
        {"role": "user", "content": user_content},
        {"role": "assistant", "content": "{"},  # prefill: forces JSON start
    ]

    first = invoke(system, messages, max_tokens=max_tokens, temperature=temperature)

    try:
        return model_cls.model_validate(extract_json(first.text)), first, "llm"
    except (ValidationError, ValueError, json.JSONDecodeError) as exc:
        # Bind to an outer name: Python deletes `exc` when the except
        # block ends, and the retry prompt below needs the error text.
        first_error = exc
        log.warning("first attempt failed validation: %s", first_error)

    # --- the one and only retry ---
    retry_messages = [
        {"role": "user", "content": user_content},
        {"role": "assistant", "content": "{" + first.text},
        {
            "role": "user",
            "content": (
                f"That response failed schema validation with this error:\n\n{first_error}\n\n"
                "Return the corrected JSON object only. No explanation, no markdown."
            ),
        },
        {"role": "assistant", "content": "{"},
    ]
    second = invoke(system, retry_messages, max_tokens=max_tokens, temperature=0.2)

    # If this raises, it propagates — the caller catches it and uses a fallback.
    return model_cls.model_validate(extract_json(second.text)), second, "llm_retry"
