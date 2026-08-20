import sys
from pathlib import Path

# Allow imports from backend/common when running this script directly.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from common import openrouter


result = openrouter.invoke(
    system="You are a helpful assistant. Return a short answer.",
    messages=[
        {
            "role": "user",
            "content": "Say hello to FitPlan in one sentence.",
        }
    ],
    max_tokens=100,
    temperature=0.2,
)

print("MODEL:", openrouter.MODEL_ID)
print("RESPONSE:", result.text)
print("PROMPT TOKENS:", result.prompt_tokens)
print("COMPLETION TOKENS:", result.completion_tokens)