# The AI Layer — Mustheer's deep dive

This is your part. Sprints 1, 3, 4, 5, 6 all have AI work in them, and it's the work that makes this project worth showing anyone.

---

## The mental model

An LLM plan generator has exactly three failure modes, and your job is engineering around all three:

1. **It returns something that isn't valid JSON** → strip fences, one retry with the error fed back, then a static fallback
2. **It returns valid JSON that's wrong** (12 exercises for a beginner, 900 calories for a bulk) → constraints in the prompt + Pydantic validators that reject impossible values
3. **It costs more than you expected** → Haiku only, capped `max_tokens`, batch parsing, no retry loops

Everything below is one of those three.

---

## Model choice

| | Claude Haiku 4.5 | Nova Lite |
|---|---|---|
| Model ID | `us.anthropic.claude-haiku-4-5-20251001-v1:0` | `us.amazon.nova-lite-v1:0` |
| Instruction following | Better | Good enough |
| JSON reliability | Better | Needs more retries |
| Cost | Slightly higher | Slightly lower |
| **Use for** | **Plan generation** | Log parsing (simpler task) |

Start with Haiku for both. Only move log parsing to Nova Lite if cost becomes real — at your usage it won't. Put the model ID in an environment variable (`BEDROCK_MODEL_ID`) so switching is a config change, never a code change.

Always use the `us.` inference-profile IDs. They spread requests across US regions, which matters when five of you are testing simultaneously and hitting throttling.

---

## The plan generation prompt

Structure it in four blocks. This ordering is deliberate — constraints before the schema, schema before the data.

### Block 1 — Persona and task
```
You are an experienced strength and conditioning coach and a registered
dietitian. You design safe, progressive, realistic weekly training and
nutrition plans.
```

Keep it short. Long personas waste tokens and don't improve output.

### Block 2 — Hard constraints
This is where most of your quality comes from. Be specific and numeric:

```
RULES — these are absolute:
- Produce exactly 7 days, day1 through day7.
- Number of training days must equal the user's daysPerWeek. Remaining days
  are rest or active recovery.
- Never program an exercise that loads an injured area listed in injuries[].
- Beginners: 3-5 exercises per session, compound movements, 8-12 reps.
  Intermediate: 4-6 exercises. Advanced: 5-8, may include intensity techniques.
- Only use equipment listed in equipment[]. If equipment is ["bodyweight"],
  program bodyweight movements only.
- Daily calories must be within 100 kcal of calorieTarget.
- Respect dietary restrictions in allergies[] and mealPref absolutely. A
  vegetarian plan containing meat is a complete failure of the task.
- Meals per day must equal mealsPerDay.
- Total recipe prep time per day must not exceed cookingTime minutes.
```

The injury and dietary lines are the ones that matter most. A plan with slightly wrong reps is a minor issue; a plan telling someone with a shoulder injury to overhead press is a real problem.

### Block 3 — Output format
```
Return ONLY a JSON object matching this exact schema. No markdown fences,
no explanation, no text before or after the JSON.
```

Then paste the schema. Generate it from Person B's Pydantic model rather than writing it by hand — they stay in sync automatically:

```python
schema = WeeklyPlan.model_json_schema()
```

### Block 4 — User context
Profile, plus last week's plan, plus parsed adherence. Serialised compactly — this is where your input tokens go, so don't dump raw JSON with 4-space indentation.

---

## Getting reliable JSON

Three techniques, in order of how much they help:

**1. Prefill the assistant turn.** The single most effective trick with Claude on Bedrock. You add an assistant message that's just `{`, so the model has already started the JSON and physically cannot open with "Sure! Here's your plan:".

```python
messages = [
    {"role": "user", "content": user_context},
    {"role": "assistant", "content": "{"},   # ← prefill
]
# then prepend "{" back onto the response before parsing
raw = "{" + response_text
```

**2. Strip fences defensively anyway.** Even with prefill, handle the case:

```python
import re, json

def extract_json(text: str) -> dict:
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    start, end = text.find("{"), text.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("no JSON object found in model output")
    return json.loads(text[start : end + 1])
```

**3. One retry with the error as feedback.** Not a loop. Exactly one.

```python
try:
    plan = WeeklyPlan.model_validate(extract_json(raw))
except (ValidationError, ValueError) as e:
    corrected = bedrock.invoke(
        system=SYSTEM_PROMPT,
        messages=[
            {"role": "user", "content": user_context},
            {"role": "assistant", "content": raw},
            {"role": "user", "content":
                f"That response failed validation:\n{e}\n\n"
                f"Return the corrected JSON only."},
        ],
    )
    plan = WeeklyPlan.model_validate(extract_json(corrected))   # if this throws, fall back
```

If the retry also fails: log it loudly, return a static template plan, and set `"generated": "fallback"` on the record so you can measure how often it happens. **A user seeing a generic plan is a bad day. A user seeing a 500 error is a lost user.**

---

## The two-step weekly flow

This is the part of the architecture that makes the product actually intelligent rather than a plan-shaped random generator. It runs in `weekly_plan_gen`:

```
Step 1 — PARSE (one Bedrock call for the whole week)
  Input:  7 days of raw free text logs
  Output: {"days":[{"date":"...","completed":true,"exercises":[...],
                    "deviations":["skipped cardio","reduced bench to 55kg"]}],
           "summary":{"sessionsPlanned":5,"sessionsCompleted":3,
                      "avgAdherence":0.6,"notes":"..."}}

Step 2 — GENERATE (one Bedrock call)
  Input:  profile + last week's plan + the parsed adherence from step 1
  Output: next week's plan
```

Two calls per user per week. That's it. **Do not parse per log entry** — the architecture doc is explicit about this and it's a 7× cost difference for no benefit.

### Progressive overload rules for the generation prompt

```
ADAPTATION RULES based on last week's adherence:
- Completed all sessions and reported sessions as "easy": increase load
  ~2.5-5% on compound lifts, or add one set.
- Completed all sessions, reported them as hard: keep the same load.
- Completed 60-80% of sessions: keep volume the same, do not increase.
- Completed under 60%: REDUCE weekly volume by roughly 20% and shorten
  sessions. The plan was too ambitious — do not repeat it.
- A specific exercise was skipped repeatedly: substitute a different
  movement for the same muscle group.
```

That last rule is the one that makes users feel understood. It's four lines of prompt and it's the difference between "the app gave me a plan" and "the app noticed I hate lunges".

---

## Cost control, concretely

| Guardrail | How |
|---|---|
| Cap output | `max_tokens: 4000` for plans, `2000` for parsing. A plan that needs more than 4k tokens has a schema problem. |
| No retry loops | Exactly one retry. Ever. Enforce it with a counter, not with discipline. |
| Compact input | `json.dumps(profile, separators=(",", ":"))` — no pretty printing into a prompt. |
| Cheap model only | The IAM Deny policy in `02-AWS-FOUNDATION.md` makes expensive models impossible, not just discouraged. |
| Don't regenerate from scratch | Feed last week's plan in as context and ask for an adaptation. Better output *and* fewer output tokens. |
| Track every call | Store `promptTokens` / `completionTokens` on the plan record. Then your Sprint 8 cost report writes itself. |
| Idempotency | Check for an existing plan for the week before generating. Stops double-clicks costing money. |

Rough arithmetic: ~3k input + ~3k output per generation, at Haiku pricing, is a fraction of a cent. A hundred test generations during development costs less than a coffee. **The failure mode isn't per-call cost — it's a loop.** Everything above exists to prevent the loop.

---

## How to actually develop prompts

Don't iterate inside Lambda. The deploy cycle will destroy your patience.

```
backend/scripts/
  bedrock_smoke.py        # one call, prints raw output
  test_profiles.py        # 5 fixture profiles covering the edge cases
  eval_plans.py           # runs all 5 through generation, validates, prints a pass/fail table
```

Your five fixture profiles:

1. **Beginner, lose weight**, 3 days/week, home, bodyweight only
2. **Advanced, build muscle**, 6 days/week, full gym, PPL split
3. **Intermediate with a knee injury**, 4 days/week — tests the injury constraint
4. **Vegetarian, high protein target** — tests dietary constraints
5. **Very time-limited**, 30 min sessions, 20 min cooking — tests time constraints

Run `eval_plans.py` after every prompt change. When all five pass ten times in a row, the prompt is done. This is a real evaluation loop and it's the thing that separates "I called an LLM API" from "I engineered an AI feature" — worth saying explicitly in your demo and your CV.

---

## Things that will surprise you

- **Cold starts.** First Bedrock call from a cold Lambda can take 8–15 seconds. Set `timeout: 60`, `memory: 512`. The default 3s timeout produces a mystery 502.
- **`Decimal` from DynamoDB.** Boto3 returns `Decimal`, Pydantic wants `float`, `json.dumps` refuses `Decimal`. Write one converter in `common/dynamo.py` on day one.
- **Throttling.** `ThrottlingException` when five of you test at once. Retry with exponential backoff — boto3 does this if you configure `Config(retries={"max_attempts": 3, "mode": "adaptive"})`.
- **The model will pass validation and still be wrong.** Read the actual generated plans. Ask someone who lifts whether the plan is sane. Schema validity is not quality, and only a human catches the difference.
- **Prompt changes silently break things.** When you improve the prompt in Sprint 6, rerun the Sprint 4 fixtures. This is why `eval_plans.py` exists.

---

## What to say about this in the demo

Don't say "we used AI". Everyone says that. Say:

> "The plan generator is a two-step pipeline. It parses a week of free-text logs into structured adherence data in one batch call, then feeds that adherence into the generation prompt with explicit progressive-overload rules — so if you skipped three sessions, next week's plan gets easier instead of repeating something you couldn't finish. Output is validated against a Pydantic schema with a single correction retry and a deterministic fallback, so the API never returns a malformed plan. Costs about half a cent per user per week."

That's an engineering answer, and it's the one that gets remembered.
