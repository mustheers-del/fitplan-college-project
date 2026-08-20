"""
OpenRouter client wrapper.

OWNER: [M] Mustheer.

OpenRouter is a transport only. Provider selection and structured
validation stay in ai.py.
"""

from __future__ import annotations

import logging
import os
from typing import Any

import boto3
import urllib.request
import urllib.error
import json

log = logging.getLogger(__name__)

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

MODEL_ID = os.environ.get(
    "OPENROUTER_MODEL_ID",
    "anthropic/claude-haiku-4.5",
)

API_KEY_PARAM = os.environ.get(
    "OPENROUTER_KEY_PARAM",
    "fitplan_openrouter_key",
)

_timeout = int(os.environ.get("OPENROUTER_TIMEOUT", "45"))

_ssm = None
_api_key = None


def _get_ssm():
    global _ssm

    if _ssm is None:
        _ssm = boto3.client(
            "ssm",
            region_name=os.environ.get("AWS_REGION", "us-east-1"),
        )

    return _ssm


def _get_api_key() -> str:
    """Load the OpenRouter API key from SSM once per Lambda container."""
    global _api_key

    if _api_key is None:
        response = _get_ssm().get_parameter(
            Name=API_KEY_PARAM,
            WithDecryption=True,
        )
        _api_key = response["Parameter"]["Value"]

    return _api_key


class OpenRouterResult:
    """Raw text plus token accounting."""

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
            f"<OpenRouterResult in={self.prompt_tokens} "
            f"out={self.completion_tokens} chars={len(self.text)}>"
        )


def invoke(
    system: str,
    messages: list[dict[str, Any]],
    max_tokens: int = 4000,
    temperature: float = 0.4,
) -> OpenRouterResult:
    """
    Make one OpenRouter chat-completions request.

    The public interface intentionally matches bedrock.invoke().
    """

    api_messages = [
        {"role": "system", "content": system},
        *messages,
    ]

    body = {
        "model": MODEL_ID,
        "messages": api_messages,
        "max_tokens": max_tokens,
        "temperature": temperature,
    }

    request = urllib.request.Request(
        OPENROUTER_URL,
        data=json.dumps(body).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {_get_api_key()}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://fitplan.local",
            "X-Title": "FitPlan",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=_timeout) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        error_body = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(
            f"OpenRouter HTTP {exc.code}: {error_body[:1000]}"
        ) from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(f"OpenRouter request failed: {exc}") from exc

    choices = payload.get("choices", [])
    if not choices:
        raise RuntimeError(f"OpenRouter returned no choices: {payload}")

    message = choices[0].get("message", {})
    text = message.get("content", "")

    usage = payload.get("usage", {})

    result = OpenRouterResult(
        text=text or "",
        prompt_tokens=usage.get("prompt_tokens", 0),
        completion_tokens=usage.get("completion_tokens", 0),
    )

    log.info("openrouter call %s", result)

    return result