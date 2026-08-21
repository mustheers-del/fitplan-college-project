# CI Audit — August 2026

**Author:** Parshuram · **Scope:** `.github/workflows/ci.yml`, `.github/workflows/no-direct-push.yml`

The question for every check: **does it actually run, and can it actually fail the
build?** Reading the config answers the first. Only breaking things answers the
second.

---

## Summary

Seven issues found. Three were checks that appeared to be running and were not.
The most serious is the last one: the entire pipeline is currently stopped at the
account level, so nothing is being checked at all.

| # | Finding | Status |
|---|---|---|
| 1 | `cfn-lint` did not exist | Fixed |
| 2 | `ruff` was never called by CI | Fixed |
| 3 | ESLint has never been installed | Open |
| 4 | `on: push` only covers `main` and `dev` | Documented |
| 5 | `.gitignore` was emptied, undetected | Restored |
| 6 | `*.tsbuildinfo` is not gitignored | Open |
| 7 | **GitHub Actions is not running at all** | **Open, urgent** |

---

## 1. cfn-lint did not exist

`ci.yml` ran `ruff` (nominally), `pytest` and `npm run build`. Nothing parsed
`backend/template.yaml`.

**Consequence:** PR #27 merged with a syntactically invalid template — a duplicate
`Stage` key in the `Parameters` block — and all checks were green. It was caught
by a human reading the diff, not by the pipeline.

**Fixed.** A `SAM Template Lint` job now runs `cfn-lint backend/template.yaml` on
every PR.

**Verified:** locally, an invalid template returns exit code 2; the valid template
returns 0. See section 9.

---

## 2. ruff was never called by CI

`ruff>=0.6.0` was in `requirements-dev.txt`, and the project documentation stated
CI ran "ruff, pytest, npm run build". The backend job installed dependencies and
then ran `pytest -q`. There was no `ruff` step.

**Consequence:** 35 lint findings had accumulated across `bedrock.py`,
`plans.py`, `prompts.py`, `log_parser.py`, `weekly_plan_gen/`, `models.py`,
`dynamo.py`, `onboarding.py` and `scripts/`, none of them ever surfaced.

**Also:** the version was unpinned, so CI installed whatever was newest on the day
it ran while each developer had whatever they last installed. A future ruff
release could have failed a build with nobody having changed any code.

**Fixed.** Pinned to `ruff==0.16.2`, findings cleared, `ruff check .` now runs in
the backend job.

---

## 3. ESLint has never been installed

`frontend/package.json` defines:

```json
"lint": "eslint . --ext ts,tsx"
```

But `eslint` appears nowhere in `dependencies` or `devDependencies`, and there is
no `eslint` binary in `node_modules/.bin`. Running `npm run lint` gives:

```
'eslint' is not recognized as an internal or external command
```

CI never calls it either — the frontend job only runs `npm run build`.

**This is the strongest of the three.** ruff was installed but never invoked.
ESLint has never been runnable by anyone, on any machine, since the script was
written.

**Not fixed, deliberately.** Installing ESLint would surface findings across
`frontend/src/`, which belongs to other people. Reported for them to decide.

---

## 4. `on: push` only covers `main` and `dev`

```yaml
on:
  pull_request:
    branches: [main, dev]
  push:
    branches: [main, dev]
```

Pushing to a feature branch does not trigger CI. Feature branches are covered
entirely by the `pull_request` event, which stops firing once a PR is closed.

**Not necessarily wrong** — it saves runner minutes — but it means "I pushed and
CI didn't run" has a non-obvious explanation. Documented rather than changed.

---

## 5. `.gitignore` was emptied and nothing detected it

At some point `.gitignore` was reduced to 0 bytes on a developer machine. It
normally covers `node_modules/`, `.venv/`, `__pycache__/`, `.aws-sam/`, `.env`,
`.env.*` and `*.csv`.

**Consequence if committed:** a stray `git add .` could have committed thousands
of files, or a `.env`. Nothing in CI verifies the file is intact.

**Restored.** Worth considering a check that fails if `.gitignore` shrinks
unexpectedly.

---

## 6. `*.tsbuildinfo` is not gitignored

`npm run build` produces `frontend/tsconfig.tsbuildinfo`, which shows as untracked
and would be committed by `git add .`. `dist/` and `node_modules/` are covered;
this is not.

Small, but the same category as finding 5.

---

## 7. GitHub Actions is not running at all

Pushes to the audit branch and to a subsequent feature branch both produced:

```
Startup failure
```

with an account billing / spending-limit error. **The runner never starts, so no
job executes.**

**This is not specific to one branch.** No pull request from any team member is
currently being linted, tested or validated. CI appears present in the UI and is
doing nothing.

**It has already caused a real failure.** Two deliberately-failing test files from
this audit branch were merged into `dev`. `pytest -q` on `dev` fails as a result.
Under a working pipeline that merge would have been blocked.

The repository is private, so Actions minutes come from a capped monthly pool.
Roughly 100 runs have been used.

**Needs the account owner** to check Settings → Billing → Actions and either raise
the spending limit or confirm the payment method.

---

## 8. Verification method

Each check was tested by deliberately breaking it and observing the exit code.
Where the break involved a file owned by another developer, it was **not**
performed — findings were reported instead.

| Check | Config | Normal path | Failure path | Runs in Actions |
|---|---|---|---|---|
| Backend Tests (pytest) | ✅ | 30 passed | ✅ exit 1 (local) | ⚠️ blocked, finding 7 |
| Frontend Build (`tsc -b && vite build`) | ✅ | ✅ exit 0 | ⏳ untested | ⚠️ blocked, finding 7 |
| SAM Template Lint (cfn-lint) | ✅ | ✅ exit 0 | ✅ exit 2 (local) | ⚠️ blocked, finding 7 |
| ruff | ✅ | ✅ clean | ⏳ untested | ⚠️ blocked, finding 7 |
| ESLint | ❌ not installed | N/A | N/A | never ran |
| no-direct-push | ✅ | observed firing on merges #21, #30 | ⏳ untested by design | — |

**Two deliberate gaps.** The frontend failure path would require a temporary file
under `frontend/src/`, which belongs to other developers. The `no-direct-push`
failure path would require pushing directly to `dev`, which is the thing the team
agreed not to do.

---

## 9. Evidence

**cfn-lint failure path.** `backend/template.yaml` was temporarily replaced with a
template containing an invalid property, after taking a backup:

```
E3002 Additional properties are not allowed
('ThisPropertyDoesNotExist' was unexpected)
backend\template.yaml:6:7
exit code 2
```

Original restored, `cfn-lint` returned 0, backup deleted, working tree clean.

**pytest failure path.** A test file containing `assert False` returned exit code
1 locally. (These files subsequently reached `dev` — see finding 7.)

**Frontend normal path.**
```
vite v5.4.21 building for production...
✓ 645 modules transformed.
✓ built in 6.13s
exit code 0
```

---

## Recommendations

**Immediate**
1. Resolve the Actions billing so CI runs again. Nothing else here matters while
   the pipeline is stopped.

**This sprint**
2. Decide on ESLint — install and wire it in, or remove the dead `lint` script so
   it stops implying a check that doesn't exist.
3. Add `*.tsbuildinfo` to `.gitignore`.

**Later**
4. Consider a check that fails if `.gitignore` shrinks unexpectedly.
5. Document the `on: push` scoping so "CI didn't run on my branch" has an obvious
   answer.

---

## The pattern

Three separate checks looked like they were working and were not — one missing,
one never invoked, one never installed. Then the pipeline itself turned out to be
in exactly the same state at the account level.

A check that cannot fail is worse than no check, because people trust it. Every
one of these was believed to be running by someone on the team, including in our
own documentation.
