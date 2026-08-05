# FitPlan

AI-powered weekly gym & meal plan generator. Serverless, AWS, free-tier conscious.

**Stack:** React + TypeScript (Vite) · Python 3.12 Lambda · DynamoDB · Cognito · Amazon Bedrock · SAM
**Region:** `us-east-1` — everything, always.

---

## Quick start

```bash
# backend
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
pytest -q

# frontend
cd ../frontend
npm install
cp .env.example .env      # fill in the values [M] and [C] post in the group
npm run dev               # http://localhost:5173
```

Full setup instructions, including AWS credentials: **`docs/01-DAY-ZERO-SETUP.md`**

---

## Repo layout

```
backend/
  common/                 shared business logic — ALL logic lives here
    models.py             Pydantic models (also the LLM output contract)   [B]
    dynamo.py             every DynamoDB read/write                        [B]
    onboarding.py         profile create/update, calorie estimation        [B]
    logs.py               daily log write/read (no LLM call on write)      [C]
    bedrock.py            Bedrock client, JSON extraction, one-retry       [M]
    prompts.py            every prompt in the project                      [M]
    plans.py              plan generation logic                            [M]
    log_parser.py         batch free-text → structured adherence           [M]
    auth.py               JWT claims + response helpers                    [M]
  functions/              thin Lambda handlers — parse, delegate, format
  scripts/                prompt development + evaluation harness          [M]
  tests/
  template.yaml           SAM infrastructure                               [C]

frontend/
  src/
    api/client.ts         typed fetch client — no raw fetch elsewhere      [E]
    types/api.ts          TS mirrors of the Pydantic models                [E]
    auth/                 Cognito integration                              [E]
    components/           design system + shell                            [D]
    pages/                screens                                          [D]/[E]
    styles/tokens.css     design tokens — no raw hex or px in components   [D]

docs/                     the project plan. read 00-START-HERE.md first.
```

---

## The one architectural rule

> Business logic lives in `common/`. Lambda handlers and MCP tools are thin wrappers around the same functions.

A handler parses the request, calls `common/`, formats the response. If a handler has more than ~30 lines of logic, the logic is in the wrong place. This is what lets five people work in parallel without conflicts, and it's what makes the MCP layer in Sprint 7 nearly free to build.

---

## Team

| | Role | Owns |
|---|---|---|
| **Mustheer** | Tech Lead + AI | Bedrock, prompts, plan generation, MCP server, all reviews |
| **[B]** | Backend: data | Models, DynamoDB layer, profile APIs |
| **[C]** | Infra + logs | SAM template, CI/CD, deployments, log APIs |
| **[D]** | Frontend lead | Design system, Dashboard, plan display, charts |
| **[E]** | Frontend + QA | Auth, onboarding wizard, check-in, testing |

---

## Contributing

Feature branch → PR into `dev` → Mustheer reviews → merge. Nobody pushes to `main` or `dev`.
Full rules: **`docs/04-GIT-WORKFLOW.md`**

---

## Docs

| File | For |
|---|---|
| `docs/00-START-HERE.md` | Everyone — roles, rules, sprint calendar |
| `docs/01-DAY-ZERO-SETUP.md` | Everyone — laptop setup |
| `docs/02-AWS-FOUNDATION.md` | Mustheer — AWS account setup |
| `docs/03-SPRINT-PLAN.md` | Everyone — week-by-week tickets |
| `docs/04-GIT-WORKFLOW.md` | Everyone — git rules |
| `docs/05-AI-LAYER-GUIDE.md` | Mustheer — prompts, cost control, evaluation |
