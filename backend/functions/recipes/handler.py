"""
POST /recipes/generate
Generate a simple recipe from a FitPlan meal.
"""

from __future__ import annotations

import json
import logging

from common import ai, auth

log = logging.getLogger(__name__)


RECIPE_SYSTEM_PROMPT = """
You are FitPlan Recipe Assistant.

Create a simple, healthy recipe based on the meal information provided.

Rules:
- Use the provided ingredients where possible.
- Keep the recipe practical and easy to cook.
- Do not add unnecessary expensive ingredients.
- Respect the provided nutrition information.
- Give clear step-by-step cooking instructions.
- Do not provide medical advice.
- Return ONLY valid JSON.
- Do not use markdown code fences.

Return exactly this structure:
{
  "name": "recipe name",
  "ingredients": ["ingredient 1", "ingredient 2"],
  "steps": ["step 1", "step 2"],
  "prepMinutes": 20
}
"""


def lambda_handler(event, context):
    try:
        user_id = auth.get_user_id(event)
    except auth.Unauthorized as e:
        return auth.error(str(e), 401)

    try:
        body = json.loads(event.get("body") or "{}")
    except json.JSONDecodeError:
        return auth.error("request body is not valid JSON", 400)

    meal_name = body.get("mealName")
    ingredients = body.get("ingredients")

    if not isinstance(meal_name, str) or not meal_name.strip():
        return auth.error("mealName is required", 400)

    if not isinstance(ingredients, list):
        return auth.error("ingredients must be a list", 400)

    meal_name = meal_name.strip()

    if len(meal_name) > 200:
        return auth.error("mealName is too long", 400)

    if len(ingredients) > 30:
        return auth.error("too many ingredients", 400)

    user_content = f"""
MEAL NAME:
{meal_name}

INGREDIENTS:
{json.dumps(ingredients)}

Create a simple recipe for this meal.
"""

    try:
        result = ai._invoke(
            RECIPE_SYSTEM_PROMPT,
            [
                {
                    "role": "user",
                    "content": user_content,
                }
            ],
            max_tokens=700,
            temperature=0.3,
        )

        recipe = json.loads(result.text.strip())

        if not isinstance(recipe, dict):
            return auth.error("AI returned invalid recipe data", 502)

        return auth.ok(recipe)

    except json.JSONDecodeError:
        log.exception("Recipe AI returned invalid JSON")
        return auth.error("AI returned invalid recipe data", 502)

    except Exception:
        log.exception("Recipe generation failed")
        return auth.error("recipe service temporarily unavailable", 502)
