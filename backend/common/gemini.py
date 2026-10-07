"""
Gemini API client wrapper for FitPlan.

Keeps the same invoke() interface as OpenRouter/Bedrock so the rest
of the application does not need to change.
"""

from __future__ import annotations

import json
import logging
import os
import urllib.error
import urllib.request
from typing import Any

import boto3

log = logging.getLogger(__name__)

MODEL_ID = os.environ.get(
    "GEMINI_MODEL_ID",
    "gemini-3.7-flash",
)

FALLBACK_MODELS = [
    "gemini-3.7-flash",
    "gemini-3.6-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.5-flash",
]

API_KEY_PARAM = os.environ.get(
    "GEMINI_KEY_PARAM",
    "fitplan_gemini_key",
)

_timeout = int(
    os.environ.get(
        "GEMINI_TIMEOUT",
        "55",
    )
)

_ssm = None
_api_key = None


def _get_ssm():
    global _ssm

    if _ssm is None:
        _ssm = boto3.client(
            "ssm",
            region_name=os.environ.get(
                "AWS_REGION",
                "us-east-1",
            ),
        )

    return _ssm


def _get_api_key() -> str:
    """
    Get Gemini API key.

    Local development:
        GEMINI_API_KEY environment variable

    AWS:
        SSM SecureString named by GEMINI_KEY_PARAM
    """

    global _api_key

    if _api_key is not None:
        return _api_key

    local_key = os.environ.get("GEMINI_API_KEY")

    if local_key:
        _api_key = local_key
        return _api_key

    response = _get_ssm().get_parameter(
        Name=API_KEY_PARAM,
        WithDecryption=True,
    )

    _api_key = response["Parameter"]["Value"]

    return _api_key


class GeminiResult:
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
            f"<GeminiResult "
            f"in={self.prompt_tokens} "
            f"out={self.completion_tokens} "
            f"chars={len(self.text)}>"
        )


def invoke(
    system: str,
    messages: list[dict[str, Any]],
    max_tokens: int = 8000,
    temperature: float = 0.4,
) -> GeminiResult:
    """
    Make a Gemini GenerateContent request.

    If a model is temporarily unavailable, automatically tries
    another free Gemini Flash model.
    """

    contents = []

    for message in messages:
        role = message.get("role", "user")
        content = message.get("content", "")

        gemini_role = "model" if role == "assistant" else "user"

        contents.append(
            {
                "role": gemini_role,
                "parts": [
                    {
                        "text": str(content),
                    }
                ],
            }
        )

    body = {
        "systemInstruction": {
            "parts": [
                {
                    "text": system,
                }
            ]
        },
        "contents": contents,
        "generationConfig": {
            "maxOutputTokens": max_tokens,
            "responseMimeType": "application/json",
            "thinkingConfig": {
                "thinkingLevel": "low",
            },
        },
    }

    preferred = os.environ.get("GEMINI_MODEL_ID", MODEL_ID)

    models = []
    for model in [preferred, *FALLBACK_MODELS]:
        if model not in models:
            models.append(model)

    last_error = None

    for model in models:
        url = (
            "https://generativelanguage.googleapis.com/"
            f"v1beta/models/{model}:generateContent"
        )

        request = urllib.request.Request(
            url,
            data=json.dumps(body).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "x-goog-api-key": _get_api_key(),
            },
            method="POST",
        )

        try:
            log.info("Trying Gemini model: %s", model)

            with urllib.request.urlopen(
                request,
                timeout=_timeout,
            ) as response:
                raw = response.read().decode(
                    "utf-8",
                    errors="replace",
                )

                payload = json.loads(raw)

        except urllib.error.HTTPError as exc:
            error_body = exc.read().decode(
                "utf-8",
                errors="replace",
            )

            last_error = RuntimeError(
                f"Gemini HTTP {exc.code} on {model}: "
                f"{error_body[:2000]}"
            )

            if exc.code in (429, 500, 502, 503, 504):
                log.warning(
                    "Gemini model %s unavailable (%s), trying next model",
                    model,
                    exc.code,
                )
                continue

            raise last_error from exc

        except urllib.error.URLError as exc:
            last_error = RuntimeError(
                f"Gemini request failed on {model}: {exc}"
            )
            continue

        except TimeoutError:
            last_error = RuntimeError(
                f"Gemini request timed out on {model}"
            )
            continue

        candidates = payload.get("candidates", [])

        if not candidates:
            last_error = RuntimeError(
                f"Gemini returned no candidates on {model}: {payload}"
            )
            continue

        candidate = candidates[0]

        content = candidate.get("content", {})
        parts = content.get("parts", [])

        text_parts = [
            part.get("text", "")
            for part in parts
            if isinstance(part, dict) and part.get("text")
        ]

        text = "".join(text_parts).strip()

        if not text:
            last_error = RuntimeError(
                f"Gemini returned empty content on {model}: {payload}"
            )
            continue

        usage = payload.get("usageMetadata", {})

        result = GeminiResult(
            text=text,
            prompt_tokens=usage.get(
                "promptTokenCount",
                0,
            ),
            completion_tokens=usage.get(
                "candidatesTokenCount",
                0,
            ),
        )

        log.info(
            "Gemini call succeeded: %s model=%s",
            result,
            model,
        )

        return result

    raise last_error or RuntimeError(
        "All Gemini fallback models failed."
    )

