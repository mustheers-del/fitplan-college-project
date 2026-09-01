import json
import urllib.error
import urllib.request

import pytest

from common import openrouter


class FakeResponse:
    def __init__(self, payload):
        self.payload = json.dumps(payload).encode("utf-8")

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False

    def read(self):
        return self.payload


def reset_openrouter_state():
    openrouter._ssm = None
    openrouter._api_key = None


@pytest.fixture(autouse=True)
def clean_state():
    reset_openrouter_state()
    yield
    reset_openrouter_state()


def test_invoke_success_returns_text_and_token_counts(monkeypatch):
    monkeypatch.setattr(
        openrouter,
        "_get_api_key",
        lambda: "test-key",
    )

    payload = {
        "choices": [
            {
                "message": {
                    "content": '{"ok": true}',
                }
            }
        ],
        "usage": {
            "prompt_tokens": 123,
            "completion_tokens": 45,
        },
    }

    captured = {}

    def fake_urlopen(request, timeout):
        captured["request"] = request
        captured["timeout"] = timeout
        return FakeResponse(payload)

    monkeypatch.setattr(
        urllib.request,
        "urlopen",
        fake_urlopen,
    )

    result = openrouter.invoke(
        "system prompt",
        [{"role": "user", "content": "hello"}],
        max_tokens=500,
        temperature=0.2,
    )

    assert result.text == '{"ok": true}'
    assert result.prompt_tokens == 123
    assert result.completion_tokens == 45

    assert captured["timeout"] == openrouter._timeout

    body = json.loads(captured["request"].data.decode("utf-8"))

    assert body["model"] == openrouter.MODEL_ID
    assert body["max_tokens"] == 500
    assert body["temperature"] == 0.2
    assert body["response_format"] == {"type": "json_object"}

    assert body["messages"][0] == {
        "role": "system",
        "content": "system prompt",
    }


@pytest.mark.parametrize("status", [401, 402, 403])
def test_invoke_http_errors_raise_runtime_error(monkeypatch, status):
    monkeypatch.setattr(
        openrouter,
        "_get_api_key",
        lambda: "test-key",
    )

    def fake_urlopen(request, timeout):
        raise urllib.error.HTTPError(
            openrouter.OPENROUTER_URL,
            status,
            "OpenRouter error",
            {},
            __import__("io").BytesIO(
                b'{"error":"test error"}'
            ),
        )

    monkeypatch.setattr(
        urllib.request,
        "urlopen",
        fake_urlopen,
    )

    with pytest.raises(RuntimeError, match=f"OpenRouter HTTP {status}"):
        openrouter.invoke(
            "system",
            [{"role": "user", "content": "hello"}],
        )


def test_invoke_urLError_raises_runtime_error(monkeypatch):
    monkeypatch.setattr(
        openrouter,
        "_get_api_key",
        lambda: "test-key",
    )

    def fake_urlopen(request, timeout):
        raise urllib.error.URLError("network unavailable")

    monkeypatch.setattr(
        urllib.request,
        "urlopen",
        fake_urlopen,
    )

    with pytest.raises(RuntimeError, match="OpenRouter request failed"):
        openrouter.invoke(
            "system",
            [{"role": "user", "content": "hello"}],
        )


def test_invoke_timeout_raises_runtime_error(monkeypatch):
    monkeypatch.setattr(
        openrouter,
        "_get_api_key",
        lambda: "test-key",
    )

    def fake_urlopen(request, timeout):
        raise TimeoutError()

    monkeypatch.setattr(
        urllib.request,
        "urlopen",
        fake_urlopen,
    )

    with pytest.raises(
        RuntimeError,
        match="OpenRouter request timed out",
    ):
        openrouter.invoke(
            "system",
            [{"role": "user", "content": "hello"}],
        )


def test_invoke_malformed_json_raises_json_error(monkeypatch):
    monkeypatch.setattr(
        openrouter,
        "_get_api_key",
        lambda: "test-key",
    )

    class BadJsonResponse(FakeResponse):
        def __init__(self):
            self.payload = b'{"choices":'

    monkeypatch.setattr(
        urllib.request,
        "urlopen",
        lambda request, timeout: BadJsonResponse(),
    )

    with pytest.raises(json.JSONDecodeError):
        openrouter.invoke(
            "system",
            [{"role": "user", "content": "hello"}],
        )


def test_invoke_missing_choices_raises_runtime_error(monkeypatch):
    monkeypatch.setattr(
        openrouter,
        "_get_api_key",
        lambda: "test-key",
    )

    monkeypatch.setattr(
        urllib.request,
        "urlopen",
        lambda request, timeout: FakeResponse(
            {"usage": {"prompt_tokens": 1}}
        ),
    )

    with pytest.raises(
        RuntimeError,
        match="OpenRouter returned no choices",
    ):
        openrouter.invoke(
            "system",
            [{"role": "user", "content": "hello"}],
        )


def test_invoke_empty_content_raises_runtime_error(monkeypatch):
    monkeypatch.setattr(
        openrouter,
        "_get_api_key",
        lambda: "test-key",
    )

    monkeypatch.setattr(
        urllib.request,
        "urlopen",
        lambda request, timeout: FakeResponse(
            {
                "choices": [
                    {
                        "message": {
                            "content": "",
                        }
                    }
                ]
            }
        ),
    )

    with pytest.raises(
        RuntimeError,
        match="OpenRouter returned empty content",
    ):
        openrouter.invoke(
            "system",
            [{"role": "user", "content": "hello"}],
        )


def test_get_api_key_reads_ssm_only_once(monkeypatch):
    calls = []

    class FakeSSM:
        def get_parameter(self, **kwargs):
            calls.append(kwargs)
            return {
                "Parameter": {
                    "Value": "secret-test-key",
                }
            }

    fake_ssm = FakeSSM()

    monkeypatch.setattr(
        openrouter,
        "_get_ssm",
        lambda: fake_ssm,
    )

    assert openrouter._get_api_key() == "secret-test-key"
    assert openrouter._get_api_key() == "secret-test-key"

    assert len(calls) == 1
    assert calls[0]["Name"] == openrouter.API_KEY_PARAM
    assert calls[0]["WithDecryption"] is True
