# FitPlan — 8 Sprint Plan with Per-Person Tickets

**How to use this:** at the start of each sprint, paste that sprint's section into the group chat. Each person only needs to read their own block plus the "Sprint goal".

Legend: **[M]** Mustheer · **[B]** Backend/Data · **[C]** Infra/Logs · **[D]** Frontend Lead · **[E]** Frontend/Auth+QA

---

# Sprint 0 — Setup (3 days)

**Sprint goal:** every laptop works, AWS is ready, the repo has a skeleton everyone can build on.

### [M] — you
1. Complete all of `02-AWS-FOUNDATION.md`. **Bedrock access request goes in on hour one** — it's the only step with an unpredictable wait.
2. Push the scaffold to `dev` (I've generated it — see `scaffold/`). One commit: `chore: initial project scaffold`.
3. Create `dev` branch, set as default, add branch protection on `main` + `dev`.
4. Add `CODEOWNERS`:
   ```
   *                           @mustheer
   /backend/common/bedrock.py  @mustheer
   /backend/functions/generate_plan/     @mustheer
   /backend/functions/weekly_plan_gen/   @mustheer
   /backend/mcp_server/        @mustheer
   ```
5. Create a GitHub Project board with columns: `Backlog / This Sprint / In Progress / In Review / Done`. Add every ticket from Sprints 1–3 now, the rest later.
6. DM each teammate their AWS access key.
7. Book the daily standup slot.

### [B] [C] [D] [E] — everyone else
1. Do `01-DAY-ZERO-SETUP.md` end to end.
2. Post the ✅ checklist in the group.
3. Read `00-START-HERE.md` and `04-GIT-WORKFLOW.md`.
4. Read the client's architecture PDF — all of it, it's only 3 pages.
5. Make one throwaway PR (add your name to `CONTRIBUTORS.md`) so everyone has done the branch → PR → review → merge loop once before it matters.

**Exit criteria:** 5 ✅ posts, 5 merged practice PRs, Bedrock returns text from the CLI.

---

# Sprint 1 — Skeleton deployed

**Sprint goal:** `curl https://<api-id>.execute-api.us-east-1.amazonaws.com/health` → `200 {"status":"ok"}`, and `npm run dev` shows the app shell.

### [M]
- `common/bedrock.py` — the client wrapper. `invoke(system, user, max_tokens) -> str`, plus a `invoke_json(...)` that parses and validates against a Pydantic model.
- A throwaway script `scripts/bedrock_smoke.py` that calls Bedrock with a fake profile and prints a plan. **Not a Lambda yet** — you're proving the model can do the task before you build infrastructure around it.
- Start collecting prompt notes in `docs/05-AI-LAYER-GUIDE.md` as you learn what works.
- Review every PR within 24 hours. This is a real commitment — if you're the bottleneck in week 1, the whole plan slips.

### [B]
- `common/models.py` — Pydantic v2 models: `UserProfile`, `WorkoutExercise`, `WorkoutDay`, `Meal`, `MealDay`, `WeeklyPlan`, `DailyLog`. Field types, constraints, and `Literal` enums for goal/experience/split.
- These models are the contract between the AI layer and everything else. **Get them reviewed by M before writing anything else.**
- `common/dynamo.py` — `get_item`, `put_item`, `query_by_prefix`, `query_between` helpers. Table name from env var, never hardcoded.

### [C]
- `template.yaml` — SAM template with: the DynamoDB table, one `health` Lambda, an HTTP API, and the shared `common/` Lambda layer.
- `sam build && sam deploy --guided` to a `fitplan-dev` stack.
- Post the API URL in the group.
- `.github/workflows/ci.yml` — on PR: `ruff check`, `pytest`, `npm run build`. Nothing else yet.

### [D]
- `npm create vite@latest frontend -- --template react-ts`, router, folder structure.
- Extract the design system from the mockup into `src/styles/tokens.css`: the blue `#2563EB`, greys, radii, shadows, spacing scale.
- Build `<AppShell>`: the left sidebar (Dashboard, Workout, Meal Plan, Daily Logs, Progress, Calendar, Achievements, Profile, Settings) + top bar with search and avatar. Static, no data.
- Build primitives: `<Card>`, `<Button>`, `<StatTile>`.

### [E]
- Login, Signup, Forgot Password screens — pixel-matching the mockup's left panel. **UI only, no Cognito yet.**
- `src/types/api.ts` — TS interfaces mirroring [B]'s Pydantic models exactly. Coordinate with [B] directly; you two own opposite ends of the same contract.
- `src/api/client.ts` — a typed `fetch` wrapper with a base URL from `import.meta.env.VITE_API_URL` and a hook for injecting the auth token later.

**Exit criteria:** deployed health endpoint returns 200; local frontend shows the sidebar + login screen; models reviewed and merged.

---

# Sprint 2 — Auth works end to end

**Sprint goal:** you can sign up with a real email, receive the verification code, log in, and call an authenticated API that knows who you are.

### [M]
- Wire the Cognito JWT authorizer into `template.yaml` (pair with [C] on this — it's the fiddliest config in the project).
- `common/auth.py` — extract `userId` from the API Gateway event's JWT claims (`event["requestContext"]["authorizer"]["jwt"]["claims"]["sub"]`). Every handler uses this; nobody re-implements it.
- Prompt engineering v1: iterate on the plan-generation system prompt in your script until it returns valid JSON 10 times out of 10. Log which failures you saw — you'll need them for the retry logic.

### [B]
- `common/onboarding.py` — `create_or_update_profile(user_id, profile: UserProfile)`, `get_profile(user_id)`.
- `functions/onboard/handler.py` — `POST /onboard`. Parse body → `UserProfile.model_validate` → call common → return 201. **Under 30 lines.**
- Unit tests with `moto` mocking DynamoDB.

### [C]
- GitHub Actions: deploy `fitplan-dev` automatically on merge to `dev`.
- Store AWS creds as GitHub repo secrets (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) — get a dedicated deploy key from [M], don't use your personal one.
- Add the Cognito authorizer config that [M] specifies.
- CloudWatch log group retention: 7 days on dev (default is "never expire" and it silently costs money).

### [D]
- Dashboard page built against `src/fixtures/dashboard.json` — a hardcoded fixture matching what the real API will return. This is deliberate: you're a sprint ahead of the backend and shouldn't wait.
- Stat tiles row (Calories / Workout / Water / Weight), Today's Focus card with the completion ring, Weekly Progress line chart, Macronutrient donut. Recharts for both charts.

### [E]
- Install `aws-amplify` (v6) or `amazon-cognito-identity-js`. **Amplify is easier — use it** unless [M] objects.
- Wire real signup → email code confirmation → login → token in memory.
- `<ProtectedRoute>` wrapper; redirect to `/login` when unauthenticated.
- Attach the JWT as `Authorization: Bearer <idToken>` in `src/api/client.ts`.
- Token refresh handling — Amplify does this, verify it actually works by leaving a tab open an hour.

**Exit criteria:** real signup → real login → `GET /me` returns your own `userId` from the JWT.

---

# Sprint 3 — Onboarding complete, app on a public URL

**Sprint goal:** a stranger can visit a URL, sign up, complete onboarding, and their profile is in DynamoDB.

### [M]
- Finalise the plan JSON schema. This is the thing the LLM must produce and Pydantic must accept. Freeze it this sprint — changing it in Sprint 5 means reworking frontend, backend and prompts simultaneously.
- Write the system prompt properly (coach persona, hard constraints, output-format rules, few-shot example).
- Test against 5 different fake profiles: beginner cutting, advanced bulking, injury-limited, vegetarian, 3-days-per-week. Fix the prompt until all 5 produce sane, schema-valid plans.
- Measure token cost per generation and note it.

### [B]
- `GET /profile` and `PATCH /profile` endpoints.
- Validation edge cases: heights/weights out of range, empty arrays, `mealsPerDay` between 2 and 6, etc. Return clean 400s with a readable `detail`, not stack traces.
- Seed script: `scripts/seed_dev_user.py` creating a realistic test profile so everyone can develop against consistent data.

### [C]
- S3 bucket + CloudFront distribution for the frontend. Bucket private, CloudFront with OAC.
- GitHub Action: on merge to `dev`, `npm run build` and sync `dist/` to S3, then create a CloudFront invalidation.
- Post the public dev URL in the group.
- SPA routing fix: CloudFront custom error response mapping 403/404 → `/index.html` with 200. **This will break React Router if you skip it** and the symptom is confusing (works on click, 404 on refresh).

### [D]
- Dashboard now consumes the real `/profile` endpoint instead of the fixture.
- Empty states: "No plan yet — generate your first one" and a loading skeleton.
- `<Sidebar>` active-route highlighting.

### [E]
- The 4-step onboarding wizard, matching the mockup: **1** Personal Info · **2** Fitness Goal · **3** Experience · **4** Food Preference.
- Progress indicator, Back/Continue, per-step validation, state kept across steps.
- Final step → `POST /onboard` → redirect to dashboard.
- Redirect a logged-in user with no profile straight into onboarding.

**Exit criteria:** send the CloudFront URL to someone outside the team; they sign up and complete onboarding successfully.

---

# Sprint 4 — AI generates a real plan ⭐

**This is the sprint that makes the project. Protect it.**

**Sprint goal:** click "Generate New Plan" in the dashboard → 10 seconds later a real Bedrock-generated 7-day workout + meal plan renders on screen.

### [M] — your big sprint, roughly 4× everyone else's load
- `functions/generate_plan/handler.py` — `POST /plan/generate`:
  1. `userId` from JWT
  2. Load profile from DynamoDB
  3. Build the prompt (profile + constraints + last week's plan if it exists)
  4. Call Bedrock Haiku 4.5 via `common/bedrock.py`
  5. Parse JSON out of the response (models sometimes wrap it in prose or code fences — strip both)
  6. `WeeklyPlan.model_validate(...)`
  7. **On validation failure: one retry**, with the validation error fed back to the model as a correction message. Not a loop — exactly one retry, then fall back to a static template plan and flag it.
  8. Write to `PLAN#<weekStartDate>`, store `modelUsed`, `promptTokens`, `completionTokens`
- `common/plans.py` — `generate_plan_for_user(user_id, context) -> WeeklyPlan`. **All the logic lives here**; the handler is a 15-line wrapper. This function is exactly what the MCP tool will call in Sprint 7 — that's the whole point of the shared-layer design.
- Lambda config: `timeout: 60`, `memory: 512`. A cold Bedrock call plus retry can exceed the 3-second default and the failure looks like a mystery 502.
- Idempotency: don't let a double-click generate two plans. Check for an existing plan for that week and require an explicit `force: true`.

### [B]
- `functions/get_plan/handler.py` — `GET /plan?week=YYYY-MM-DD`, defaults to the current week.
- `GET /plans` — list all week-start dates for the history/week-switcher UI.
- Make sure the Pydantic models round-trip cleanly through DynamoDB (Decimal ↔ float is the classic trap — DynamoDB returns `Decimal`, Pydantic wants `float`; write a converter in `common/dynamo.py` once and use it everywhere).

### [C]
- CloudWatch dashboard: Lambda invocations, errors, duration, DynamoDB consumed capacity, Bedrock invocation count.
- Alarm: Lambda error rate > 5% over 5 minutes → email.
- Alarm: `generate_plan` duration p99 > 45s.
- Structured JSON logging so CloudWatch Logs Insights is actually usable.

### [D]
- The "AI Generating Plan" screen from the mockup — the progress list ("Analyzing your goals… Creating personalized workout… Generating meal recommendations…") with the progress bar. It's theatre over a single API call, and it's the right call: 10 seconds of blank screen feels broken, 10 seconds of visible progress feels fast.
- Workout Details page: day tabs, exercise list with sets/reps, "Start Workout" button.
- "Generate New Plan" button on the dashboard, with proper loading and error states.

### [E]
- Meal Plan page: day-by-day meals with macros per meal and daily totals.
- Error handling across the app: what the user sees when generation fails. A real message and a Retry button, never a silent spinner.
- Full QA pass on the whole signup → onboard → generate → view flow. Write up every bug as a GitHub issue with steps to reproduce.

**Exit criteria:** demo it to the client. This is the moment the project stops looking like a CRUD app.

---

# Sprint 5 — Daily logging

**Sprint goal:** the user types "did 4x8 bench at 60kg, felt easy, skipped cardio. ate 3 meals, chicken rice twice" and a week later that text has become structured data.

### [M]
- The **log parsing prompt** — free text → structured JSON (`exercises[]` with names/sets/reps/weight, `meals[]` with rough macros, `adherenceNotes`). Different prompt, same `common/bedrock.py`.
- `common/log_parser.py` — `parse_logs_batch(logs: list[DailyLog]) -> ParsedWeek`. **Batch, not per-entry.** The architecture doc is explicit about this and it's a 7× cost saving: one call per week, not one per log.
- Handle the messy cases: empty logs, logs in Hindi/Hinglish, "rest day", contradictions. The prompt should return `null` fields rather than inventing data — hallucinated workout data is worse than missing data.

### [B]
- Refactor: any duplicated DynamoDB access that's crept in gets consolidated into `common/dynamo.py`.
- Pagination for `GET /logs` (30+ entries).
- `GET /logs/summary?range=7d` — aggregates for the progress charts.

### [C]
- `common/logs.py` + `functions/log_daily/` (`POST /logs/daily`) and `functions/get_logs/` (`GET /logs/daily?range=7d`).
- Raw text is written **immediately, with no LLM call** — the architecture doc is specific about this. Saving must be instant and free.
- Backfill support: `date` in the body so users can log yesterday.

### [D]
- Progress Analytics page: Overview / Workout / Nutrition / Body tabs, calories-burned chart, workouts / avg-duration / consistency stat row.
- Hydration tracker and the weight-progress sparkline from the mockup.

### [E]
- Daily check-in screen: two big free-text boxes (workout, meals), optional tags, date picker for backfill.
- Autosave draft to component state so a refresh doesn't lose typing.
- The "12 Day Streak" card + achievements row.

**Exit criteria:** log 7 days of text, run [M]'s batch parser, get clean structured JSON out.

---

# Sprint 6 — Weekly automation

**Sprint goal:** nobody clicks anything and a new, better plan appears every Monday.

### [M]
- `functions/weekly_plan_gen/handler.py`, triggered by EventBridge Scheduler (weekly cron).
- The **two-step flow** the architecture specifies:
  1. Fetch profile + last week's plan + last week's raw logs
  2. **Parse** logs → structured adherence (planned vs actual, deviations)
  3. **Generate** the new plan with that adherence as context
  4. Validate, write, mark logs as parsed
- Progressive overload logic in the prompt: if they hit all their sets, increase load; if they missed sessions, reduce volume rather than repeating a plan they can't finish.
- Loop over all users — but cap concurrency and add a guard so a bug can't fan out into thousands of Bedrock calls.
- EventBridge Scheduler, not an EventBridge rule. Cheaper and it does timezones.

### [B]
- Plan history API + "compare this week vs last week" data.

### [C]
- Dead letter queue on `weekly_plan_gen`. It runs unattended at 3am — you need to know when it fails.
- Integration test: seed a user, trigger the Lambda manually, assert a plan lands in DynamoDB.
- (Stretch) SES weekly email digest.

### [D]
- Week switcher, plan history view, week-over-week comparison.
- Achievements page.

### [E]
- Settings page: notification prefs, profile editing, regenerate-plan trigger.
- Full responsive pass — the mockup shows a phone. It's **responsive web**, not a native app. Make sure that's understood.

**Exit criteria:** manually fire the scheduled Lambda; a new plan appears that visibly reflects last week's logged behaviour.

---

# Sprint 7 — MCP layer + hardening

**Sprint goal:** the same backend, reachable from an MCP client. Plus everything that's currently held together with tape gets fixed.

### [M]
- `mcp_server/server.py` — tools: `onboard_user`, `get_weekly_plan`, `regenerate_plan`, `log_daily`, `get_logs`.
- **Every tool is a thin wrapper calling the same `common/` functions the REST handlers call.** If you find yourself writing new logic here, the shared layer wasn't factored properly — fix the layer, not the MCP server.
- Deploy behind a Lambda Function URL with streamable HTTP.
- Auth: same Cognito JWT as bearer token.
- Test it from a real MCP client and record a short screen capture — this is a strong demo moment for the client.

### [B] [C] [D] [E] — bug bash week
- Every error state, empty state, and loading state gets checked.
- [C]: IAM least-privilege review — strip the `*FullAccess` policies off the Lambda execution roles and scope them to the actual table and model ARNs.
- [C]: production stack `fitplan-prod`, separate from dev.
- [D]/[E]: accessibility basics — labels on inputs, keyboard nav, focus states, colour contrast.
- [E]: cross-browser check (Chrome, Safari, Firefox, mobile Safari).

**Exit criteria:** feature complete. Nothing new after this point.

---

# Sprint 8 — Polish, docs, demo

### Everyone
- Each person writes the README section for their own area.
- Architecture diagram updated to match what you actually built (it always drifts).
- Demo video: signup → onboarding → generate → log → weekly regeneration → MCP.

### [M]
- Cost report: actual AWS spend across all 8 weeks, broken down by service. Clients love this and it proves the "free tier / credit conscious" requirement was met.
- Handover doc: how to deploy, how to rotate keys, where the prompts live, how to change models.
- Client demo.

### [C]
- Final prod deploy, prod budget alarms, PITR on the prod table.

---

## Effort split (roughly)

| Person | Share of total work | The hard parts they own |
|---|---|---|
| **[M] You** | **~40%** | All AI/Bedrock, prompt engineering, MCP server, architecture, every code review |
| [B] | ~15% | Data models, the LLM output contract, profile APIs |
| [C] | ~15% | All infrastructure, CI/CD, deployments, logs APIs |
| [D] | ~17% | Design system, Dashboard, charts, plan rendering |
| [E] | ~13% | Auth, onboarding wizard, check-in, QA |

You carry the most, and more importantly you carry the parts that are hard to hand off. The other four have work that's genuinely useful but bounded — they can each be productive without needing to understand your prompts, and none of them can block you.

---

## If you fall behind

Cut in this order:
1. **SES email digest** — nice, not needed
2. **MCP layer** — the client's own doc calls it optional
3. **Achievements / streaks** — pure polish
4. **Progress charts** — show a table instead
5. **Weekly automation** — keep the manual "Generate Plan" button

Never cut: auth, onboarding, plan generation, plan display. That's the product.
