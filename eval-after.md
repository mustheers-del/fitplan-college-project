FitPlan AI Evaluation — After Validation/Prompt Improvements

Result:
4/5 clean

beginner_cut_home: PASS — llm
advanced_bulk_gym: PASS — llm
knee_injury: PASS — llm
vegetarian_high_protein: HARD-FAIL — OpenRouter HTTP 402 (credit/in-flight limit)
time_limited: PASS — llm

Backend tests:
56 passed

Note:
The vegetarian profile was not evaluated because OpenRouter rejected the request due to the available credit/in-flight limit. This is an infrastructure/credit limitation, not a plan validation failure.
