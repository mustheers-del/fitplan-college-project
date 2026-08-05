# FitPlan — Master Project Plan

**Repo:** `gym-plan-v2` (client's GitHub, you are all invited)
**Team size:** 5
**Plan length:** 8 sprints × 1 week + a 3-day Sprint 0
**Stack:** React + TypeScript (Vite) · Python 3.12 Lambda · DynamoDB · Cognito · Bedrock · SAM
**AWS region:** `us-east-1` — non-negotiable, everyone uses this one

---

## 0. Read this before anything else

This document is the single source of truth. If someone asks "what am I doing this week", the answer is in `03-SPRINT-PLAN.md`. If someone asks "how do I set up my laptop", the answer is in `01-DAY-ZERO-SETUP.md`. Nobody should be asking you these things in WhatsApp.

The whole point of the architecture the client gave you is this one line, and it drives every decision below:

> Business logic lives in a shared Python `common/` layer, not duplicated per interface. Both the REST API (for React) and the MCP tools are thin wrappers around the same functions.

That means: **nobody writes business logic inside a Lambda handler.** Handlers parse the request, call a function in `common/`, and format the response. That's it. This is the rule that keeps 5 people from stepping on each other.

---

## 1. The five roles

I've split this so you (Mustheer) carry the heaviest and most technically interesting load — the entire AI layer — while the other four have real, non-trivial, clearly-bounded work that doesn't require them to touch your code.

### You — Tech Lead + AI Engineer
**You own the parts that make this project impressive.**

- The AWS account, IAM, Bedrock access, budget alarms
- `common/bedrock.py` — the Bedrock client wrapper
- All prompt engineering: plan generation prompt, log parsing prompt, JSON schema enforcement
- `generate_plan` Lambda and `weekly_plan_gen` Lambda (the two-step parse-then-generate flow)
- The entire MCP server layer
- Code review on every PR — you are the only one who merges to `dev` and `main`
- Architecture decisions, final integration, the client demo

**Roughly 40% of the codebase and 100% of the hard parts.** Nobody else touches `common/bedrock.py`, `functions/generate_plan/`, `functions/weekly_plan_gen/`, or `mcp_server/`. Put a `CODEOWNERS` file in the repo saying exactly that.

### Person B — Backend: Data & Profile API
- `common/models.py` — all Pydantic models (UserProfile, WeeklyPlan, DailyLog, and the strict schema the LLM must return)
- `common/dynamo.py` — every read/write helper against DynamoDB
- `common/onboarding.py` — profile create/update logic
- `functions/onboard/` and `functions/get_plan/` handlers

They are effectively building the data layer that your AI code calls. Their Pydantic models are what validates your Bedrock output — so their work directly enables yours.

### Person C — Backend: Logs + Infra/DevOps
- `template.yaml` (the SAM template) — owns it entirely, everyone else asks them to add resources
- `common/logs.py`, `functions/log_daily/`, `functions/get_logs/`
- `sam deploy` for the dev and prod stacks
- GitHub Actions CI: lint + test on PR, deploy on merge to `dev`
- S3 + CloudFront setup for the frontend
- CloudWatch alarms

This is the "make it actually run in the cloud" person. If they're your most reliable friend, give them this — everything else is blocked on deploys working.

### Person D — Frontend Lead
- Vite + React + TS app skeleton, routing, folder structure
- The design system extracted from the mockup: colors, spacing, typography, `Card`, `Button`, `StatTile`, `Sidebar` components
- Dashboard page (the big one from the mockup — stat tiles, Today's Focus, weekly progress chart, macro donut)
- Workout Details page and plan rendering
- Progress Analytics page with Recharts

### Person E — Frontend: Auth, Onboarding + QA
- Login / Signup / Forgot Password screens, then wiring them to real Cognito
- The 4-step onboarding wizard (the mockup shows it clearly)
- Daily check-in screen
- `src/api/` typed fetch client + `src/types/` TS interfaces mirroring Person B's Pydantic models
- Manual QA pass each sprint, bug tickets, README, demo video

---

## 2. Ground rules — send these to the group chat

1. **`us-east-1`. Always.** Someone will deploy to `ap-south-1` because it's closer to India and then spend two days confused about why Bedrock isn't there. Do not let this happen.
2. **Nobody pushes to `main` or `dev`.** Feature branch → PR → Mustheer reviews → merge. Details in `04-GIT-WORKFLOW.md`.
3. **No business logic in handlers.** If a handler is longer than ~30 lines, it belongs in `common/`.
4. **Never commit AWS keys.** `.env` is gitignored on day one. If someone commits a key, the key is rotated immediately — no exceptions, no "it's fine it's just dev".
5. **Ask in the group within 30 minutes of being stuck.** A 30-minute rule beats someone silently burning a whole day.
6. **Daily 15-minute standup, same time every day.** What I did / what I'm doing / what's blocking me. Nothing else. India time, pick a slot everyone can actually make.
7. **Definition of done** = code merged + deployed to dev + the person who tests it isn't you. Person E tests backend work; Person B or C tests frontend work.

---

## 3. Sprint calendar at a glance

| Sprint | Theme | Goal you can demo at the end |
|---|---|---|
| **0** (3 days) | Setup | Everyone's laptop works, repo is scaffolded, AWS is ready |
| **1** | Skeleton | `curl /health` returns 200; React shell runs locally |
| **2** | Auth | Sign up → log in → hit an authenticated endpoint |
| **3** | Onboarding | Real user completes onboarding, profile lands in DynamoDB, app is on a public URL |
| **4** | **AI generation** | Click "Generate Plan" → real Bedrock-generated workout + meal plan renders |
| **5** | Daily logs | User writes free-text logs; you parse a week into structured JSON |
| **6** | Automation | EventBridge regenerates plans weekly using last week's adherence |
| **7** | MCP + hardening | Same backend reachable through an MCP client; bug bash done |
| **8** | Polish + demo | Client demo, docs, cost report |

**Sprint 4 is the sprint that matters.** Everything before it is plumbing; everything after is expansion. If you're running late, protect Sprint 4 and cut Sprint 6/7 scope instead.

---

## 4. The build order, and why it's this order

The client's doc gives a 10-step MVP build order. I've kept it but parallelised it across 5 people. The dependency chain that actually constrains you:

```
Cognito user pool
      ↓
JWT authorizer on API Gateway  ──→  frontend auth screens can be wired
      ↓
onboard Lambda + Users table   ──→  there is a profile to generate against
      ↓
generate_plan + Bedrock        ──→  there is a plan to display
      ↓
log_daily + DailyLogs          ──→  there is adherence data to parse
      ↓
weekly_plan_gen (parse → generate)
      ↓
MCP layer (wraps everything above)
```

Notice the MCP layer is dead last and is explicitly marked optional in the client's own doc. **Do not let anyone start it early.** It is the most tempting thing to build and the least valuable until the rest works.

The frontend can run one sprint "ahead" on mocked data — Person D should build the Dashboard against a hardcoded JSON fixture in Sprint 2 and swap it for the real API in Sprint 4. That's how you keep 2 frontend people busy while the backend catches up.

---

## 5. What you personally say to your friends

Copy-paste this into the group:

> Team — I've split FitPlan into 8 one-week sprints. Everyone has a clear lane so we're not editing the same files.
>
> - **[B]** — backend data layer: Pydantic models, DynamoDB helpers, onboarding + get-plan APIs
> - **[C]** — infra + logs: the SAM template, deployments, CI, daily-log APIs
> - **[D]** — frontend lead: design system, Dashboard, plan display, charts
> - **[E]** — frontend: auth screens, onboarding wizard, daily check-in, QA
> - **Me** — AI layer (Bedrock prompts, plan generation, log parsing), MCP server, architecture, and reviewing all PRs
>
> Before we write any code, everyone does `docs/01-DAY-ZERO-SETUP.md` — it's step-by-step, should take about an hour. Ping the group if you get stuck for more than 30 minutes.
>
> Rules: region is always `us-east-1`, nobody pushes directly to `main`/`dev`, no AWS keys in git. Standup daily, 15 min.

---

## 6. Files in this docs folder

| File | Who reads it |
|---|---|
| `00-START-HERE.md` | Everyone, once |
| `01-DAY-ZERO-SETUP.md` | Everyone, Sprint 0 |
| `02-AWS-FOUNDATION.md` | You only |
| `03-SPRINT-PLAN.md` | Everyone, every sprint |
| `04-GIT-WORKFLOW.md` | Everyone, once |
| `05-AI-LAYER-GUIDE.md` | You only — your deep-dive for Sprints 4–6 |

---

## 7. Risks, honestly

| Risk | How likely | What you do about it |
|---|---|---|
| Bedrock access not granted in time | Medium | Request model access on **day one** of Sprint 0. It can take hours. |
| LLM returns malformed JSON | High | Pydantic validation + one retry + a fallback template plan. Built into Sprint 4. |
| Bedrock cost surprise | Low-medium | Budget alarm at $5/$15/$30 before the first API call. Haiku is cheap; the risk is a retry loop. |
| A teammate goes quiet for a week | High (be honest) | Frontend and backend lanes are independent — losing one person delays a lane, not the project. You can absorb Person B's work if you must. |
| Everyone builds on `main` and it breaks | High | The git workflow doc exists for exactly this. Enforce it from commit #1, not commit #100. |
| Scope creep (someone wants a mobile app) | Certain | The mockup has a phone screen in the corner. It is **responsive web**, not React Native. Say this out loud in Sprint 0. |
