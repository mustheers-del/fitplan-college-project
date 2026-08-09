# backend/tests/test_bedrock.py
"""
Tests for common/bedrock.py — entirely against mocks.
 
These pass with the AWS account still blocked, on CI, and offline. No test in
this file may ever make a real AWS call: if one does, CI becomes flaky and
starts costing money.
 
OWNER: Mustheer.
"""
 
import json
from unittest.mock import MagicMock, patch
 
import pytest
from pydantic import BaseModel, Field, ValidationError
 
from common import bedrock
from common.bedrock import BedrockResult, extract_json, invoke, invoke_structured
 
 
class TinyPlan(BaseModel):
    """Stand-in for the real plan model — keeps these tests independent of models.py."""
 
    days: int = Field(ge=1, le=7)
    focus: str
 
 
def _response(text: str, input_tokens: int = 100, output_tokens: int = 50) -> dict:
    """Build a fake invoke_model response with a readable .body."""
    body = MagicMock()
    body.read.return_value = json.dumps(
        {
            "content": [{"type": "text", "text": text}],
            "usage": {"input_tokens": input_tokens, "output_tokens": output_tokens},
        }
    ).encode()
    return {"body": body}
 
 
@pytest.fixture(autouse=True)
def _reset_client():
    """The module caches its client in a global — clear it between tests."""
    bedrock._client = None
    yield
    bedrock._client = None
 
 
# ---------------------------------------------------------------------------
# client() — the lazy singleton
# ---------------------------------------------------------------------------
 
 
@patch("common.bedrock.boto3.client")
def test_client_is_created_once_and_reused(mock_boto):
    first = bedrock.client()
    second = bedrock.client()
 
    assert first is second
    assert mock_boto.call_count == 1, "a new client per call would cost ~200ms each time"
 
 
@patch("common.bedrock.boto3.client")
def test_client_targets_bedrock_runtime_in_the_configured_region(mock_boto):
    bedrock.client()
 
    args, kwargs = mock_boto.call_args
    assert args[0] == "bedrock-runtime"
    assert kwargs["region_name"] == bedrock.REGION
 
 
# ---------------------------------------------------------------------------
# extract_json
# ---------------------------------------------------------------------------
 
 
@pytest.mark.parametrize(
    "raw",
    [
        '{"days": 3, "focus": "push"}',
        'Here is your plan:\n{"days": 3, "focus": "push"}\nHope that helps!',
        '```json\n{"days": 3, "focus": "push"}\n```',
        '```\n{"days": 3, "focus": "push"}\n```',
        '  \n  {"days": 3, "focus": "push"}  \n ',
    ],
)
def test_extract_json_survives_prose_and_fences(raw):
    assert extract_json(raw) == {"days": 3, "focus": "push"}
 
 
def test_extract_json_handles_the_prefill_case():
    """
    We send '{' as the assistant turn, so the model's reply continues from
    there and has no opening brace of its own.
    """
    assert extract_json('"days": 3, "focus": "push"}') == {"days": 3, "focus": "push"}
 
 
def test_extract_json_raises_when_there_is_no_object():
    with pytest.raises(ValueError, match="no JSON object found"):
        extract_json("I'm afraid I can't help with that.")
 
 
# ---------------------------------------------------------------------------
# invoke
# ---------------------------------------------------------------------------
 
 
@patch("common.bedrock.boto3.client")
def test_invoke_returns_text_and_token_counts(mock_boto):
    mock_boto.return_value.invoke_model.return_value = _response(
        "hello there", input_tokens=120, output_tokens=34
    )
 
    result = invoke("sys", [{"role": "user", "content": "hi"}])
 
    assert isinstance(result, BedrockResult)
    assert result.text == "hello there"
    assert result.prompt_tokens == 120
    assert result.completion_tokens == 34
 
 
@patch("common.bedrock.boto3.client")
def test_invoke_sends_the_expected_body(mock_boto):
    mock_boto.return_value.invoke_model.return_value = _response("ok")
 
    messages = [{"role": "user", "content": "hi"}]
    invoke("SYSTEM", messages, max_tokens=256, temperature=0.1)
 
    kwargs = mock_boto.return_value.invoke_model.call_args.kwargs
    assert kwargs["modelId"] == bedrock.MODEL_ID
 
    body = json.loads(kwargs["body"])
    assert body["system"] == "SYSTEM"
    assert body["messages"] == messages
    assert body["max_tokens"] == 256
    assert body["temperature"] == 0.1
 
 
@patch("common.bedrock.boto3.client")
def test_invoke_joins_multiple_text_blocks_and_ignores_other_types(mock_boto):
    body = MagicMock()
    body.read.return_value = json.dumps(
        {
            "content": [
                {"type": "text", "text": "part one "},
                {"type": "thinking", "text": "SHOULD NOT APPEAR"},
                {"type": "text", "text": "part two"},
            ],
            "usage": {"input_tokens": 1, "output_tokens": 2},
        }
    ).encode()
    mock_boto.return_value.invoke_model.return_value = {"body": body}
 
    assert invoke("sys", []).text == "part one part two"
 
 
@patch("common.bedrock.boto3.client")
def test_invoke_defaults_token_counts_to_zero_when_usage_is_absent(mock_boto):
    body = MagicMock()
    body.read.return_value = json.dumps({"content": [{"type": "text", "text": "x"}]}).encode()
    mock_boto.return_value.invoke_model.return_value = {"body": body}
 
    result = invoke("sys", [])
    assert result.prompt_tokens == 0
    assert result.completion_tokens == 0
 
 
def test_bedrock_result_repr_is_useful_in_logs():
    assert "in=10" in repr(BedrockResult("abc", 10, 20))
    assert "out=20" in repr(BedrockResult("abc", 10, 20))
    assert "chars=3" in repr(BedrockResult("abc", 10, 20))
 
 
# ---------------------------------------------------------------------------
# invoke_structured
# ---------------------------------------------------------------------------
 
 
@patch("common.bedrock.boto3.client")
def test_invoke_structured_validates_on_the_first_try(mock_boto):
    mock_boto.return_value.invoke_model.return_value = _response(
        '"days": 3, "focus": "push"}'
    )
 
    plan, result, source = invoke_structured("sys", "user", TinyPlan)
 
    assert plan.days == 3
    assert plan.focus == "push"
    assert source == "llm"
    assert isinstance(result, BedrockResult)
    assert mock_boto.return_value.invoke_model.call_count == 1
 
 
@patch("common.bedrock.boto3.client")
def test_invoke_structured_sends_the_prefill_turn(mock_boto):
    """The trailing '{' assistant turn is what forces the model into JSON."""
    mock_boto.return_value.invoke_model.return_value = _response(
        '"days": 3, "focus": "push"}'
    )
 
    invoke_structured("sys", "make me a plan", TinyPlan)
 
    body = json.loads(mock_boto.return_value.invoke_model.call_args.kwargs["body"])
    assert body["messages"][0] == {"role": "user", "content": "make me a plan"}
    assert body["messages"][-1] == {"role": "assistant", "content": "{"}
 
 
@patch("common.bedrock.boto3.client")
def test_invoke_structured_retries_once_and_succeeds(mock_boto):
    mock_boto.return_value.invoke_model.side_effect = [
        _response('"days": 99, "focus": "push"}'),  # violates le=7
        _response('"days": 3, "focus": "push"}'),  # corrected
    ]
 
    plan, _result, source = invoke_structured("sys", "user", TinyPlan)
 
    assert plan.days == 3
    assert source == "llm_retry"
    assert mock_boto.return_value.invoke_model.call_count == 2
 
 
@patch("common.bedrock.boto3.client")
def test_retry_feeds_the_validation_error_back_to_the_model(mock_boto):
    """
    Regression guard. The retry prompt must contain the actual validator error,
    otherwise the model has no idea what to correct.
    """
    mock_boto.return_value.invoke_model.side_effect = [
        _response('"days": 99, "focus": "push"}'),
        _response('"days": 3, "focus": "push"}'),
    ]
 
    invoke_structured("sys", "original prompt", TinyPlan)
 
    second_body = json.loads(
        mock_boto.return_value.invoke_model.call_args_list[1].kwargs["body"]
    )
    correction = second_body["messages"][2]["content"]
 
    assert "failed schema validation" in correction
    assert "less_than_equal" in correction or "less than or equal" in correction
    assert second_body["messages"][0]["content"] == "original prompt"
 
 
@patch("common.bedrock.boto3.client")
def test_retry_runs_at_a_lower_temperature(mock_boto):
    """Second attempt should be more deterministic than the first."""
    mock_boto.return_value.invoke_model.side_effect = [
        _response('"days": 99, "focus": "push"}'),
        _response('"days": 3, "focus": "push"}'),
    ]
 
    invoke_structured("sys", "user", TinyPlan, temperature=0.9)
 
    first_body = json.loads(mock_boto.return_value.invoke_model.call_args_list[0].kwargs["body"])
    second_body = json.loads(mock_boto.return_value.invoke_model.call_args_list[1].kwargs["body"])
 
    assert first_body["temperature"] == 0.9
    assert second_body["temperature"] == 0.2
 
 
@patch("common.bedrock.boto3.client")
def test_invoke_structured_gives_up_after_two_attempts(mock_boto):
    """
    Must not loop. Two calls, then the error propagates so the caller can fall
    back to a static plan. A loop inside a Lambda burns tokens until timeout.
    """
    mock_boto.return_value.invoke_model.side_effect = [
        _response('"days": 99, "focus": "push"}'),
        _response('"days": 99, "focus": "push"}'),
    ]
 
    with pytest.raises(ValidationError):
        invoke_structured("sys", "user", TinyPlan)
 
    assert mock_boto.return_value.invoke_model.call_count == 2
 
 
@patch("common.bedrock.boto3.client")
def test_unparseable_output_twice_also_gives_up(mock_boto):
    mock_boto.return_value.invoke_model.side_effect = [
        _response("I cannot help with that."),
        _response("Still cannot help."),
    ]
 
    with pytest.raises(ValueError, match="no JSON object found"):
        invoke_structured("sys", "user", TinyPlan)
 
    assert mock_boto.return_value.invoke_model.call_count == 2
 