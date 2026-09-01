import json
import os
import sys
from pathlib import Path

# Allow imports from backend/common when running this script directly.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

os.environ["AI_PROVIDER"] = "openrouter"
os.environ["OPENROUTER_MODEL_ID"] = "anthropic/claude-haiku-4.5"

from common import ai
from common.models import WeeklyPlan
from common.prompts import PLAN_SYSTEM_PROMPT


profile = {
    "goal": "build_muscle",
    "experienceLevel": "beginner",
    "daysPerWeek": 4,
    "heightCm": 175,
    "weightKg": 72,
    "age": 24,
    "dietaryPreference": "vegetarian",
}

try:
    model, result, source = ai.invoke_structured(
        system=PLAN_SYSTEM_PROMPT,
        user_content=json.dumps(profile),
        model_cls=WeeklyPlan,
        max_tokens=8000,
        temperature=0.4,
    )

    print("SOURCE:", source)
    print("MODEL:", ai.model_id())
    print("DAYS:", len(model.workout_plan))
    print("PROMPT TOKENS:", result.prompt_tokens)
    print("COMPLETION TOKENS:", result.completion_tokens)
    print("VALIDATION: PASSED")

except Exception as exc:
    print("SOURCE: ERROR")
    print("ERROR:", exc)

    if "result" in locals():
        print("\nRAW MODEL RESPONSE:")
        print(result.text)

    import traceback
    traceback.print_exc()
    raise
