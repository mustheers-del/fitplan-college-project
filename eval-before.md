# FitPlan Prompt Evaluation

Provider: `openrouter`

This report evaluates five representative profiles against WeeklyPlan validation and explicit product rules.

| Profile | Pydantic | 7 days | Training days | Rule checks | Tokens in | Tokens out | Source | Seconds |
|---|---|---:|---:|---|---:|---:|---|---:|
| `beginner_lose_weight_3_days` | PASS | PASS | 3 / 3 (PASS) | PASS | 2289 | 5004 | `llm` | 27.85 |
| `advanced_build_muscle_6_days` | PASS | PASS | 6 / 6 (PASS) | PASS | 2303 | 6229 | `llm` | 28.47 |
| `intermediate_knee_injury_4_days` | PASS | PASS | 4 / 4 (PASS) | PASS | 2300 | 4177 | `llm` | 19.51 |
| `vegetarian_build_muscle_5_days` | PASS | PASS | 5 / 5 (PASS) | PASS | 2295 | 5794 | `llm` | 25.42 |
| `beginner_maintain_3_days` | PASS | PASS | 3 / 3 (PASS) | PASS | 2289 | 4908 | `llm` | 23.56 |

## Rule failures

### `beginner_lose_weight_3_days` — PASS

No automated rule failures.

### `advanced_build_muscle_6_days` — PASS

No automated rule failures.

### `intermediate_knee_injury_4_days` — PASS

No automated rule failures.

### `vegetarian_build_muscle_5_days` — PASS

No automated rule failures.

### `beginner_maintain_3_days` — PASS

No automated rule failures.

**Overall result: PASS — all five profiles passed the automated checks.**

## Profiles tested

- `beginner_lose_weight_3_days`: beginner, lose_weight, 3 days/week, omnivore
- `advanced_build_muscle_6_days`: advanced, build_muscle, 6 days/week, omnivore
- `intermediate_knee_injury_4_days`: intermediate, stay_fit, 4 days/week, omnivore
- `vegetarian_build_muscle_5_days`: intermediate, build_muscle, 5 days/week, vegetarian
- `beginner_maintain_3_days`: beginner, stay_fit, 3 days/week, omnivore
