# Git Workflow — read once, follow always

The single biggest source of pain in a 5-person student project is git. Not the code. Git. This doc prevents that.

---

## Branches

```
main   ← production. Only Mustheer merges here, only at the end of a sprint.
dev    ← integration. Everything lands here first. This is what deploys to the dev environment.
feature/<name>  ← your work
```

**Nobody commits directly to `main` or `dev`. Ever.** Mustheer enables branch protection so git will physically refuse.

Branch naming — always prefix with your initial so the branch list is readable:

```
feature/b-onboard-lambda
feature/c-sam-template
feature/d-dashboard-page
feature/e-onboarding-wizard
feature/m-bedrock-client
fix/d-sidebar-active-state
```

---

## The loop you run every single time

```bash
# 1. Start from the latest dev
git checkout dev
git pull

# 2. Branch
git checkout -b feature/b-onboard-lambda

# 3. Work. Commit often — small commits are easier to review and revert.
git add backend/functions/onboard/
git commit -m "feat(onboard): validate profile with pydantic"

# 4. Before pushing, pull dev again and rebase onto it
git fetch origin
git rebase origin/dev
# (fix conflicts if any, then: git rebase --continue)

# 5. Push
git push -u origin feature/b-onboard-lambda

# 6. Open a PR on GitHub: base = dev, compare = your branch
# 7. Ping Mustheer in the group
# 8. He reviews → you fix comments → he merges
# 9. Delete your branch, start the next one from a fresh dev
```

**Step 4 is the one people skip and it's the one that matters.** Rebasing before you push means conflicts get resolved on your branch, by you, while you still remember the code — instead of in the PR, in front of everyone, at 1am.

---

## Commit messages

Format: `type(scope): what changed, in the imperative`

```
feat(onboard): add POST /onboard handler
fix(dashboard): correct macro donut percentage rounding
chore(deps): bump pydantic to 2.9
docs(readme): add local setup section
refactor(dynamo): extract Decimal converter
test(logs): add moto tests for log_daily
```

Types: `feat` `fix` `chore` `docs` `refactor` `test` `style`

Bad commits that will get your PR sent back: `update`, `fix bug`, `changes`, `asdf`, `final`, `final2`, `final_FINAL`.

---

## Pull request rules

**A PR must:**
- Change **one thing**. If the title needs an "and", split it.
- Be under ~400 lines of real change where possible. Big PRs get rubber-stamped, and rubber-stamped PRs are where bugs live.
- Have a description with: what it does, how to test it, and a screenshot for anything visual.
- Pass CI (lint + tests) before review is requested.

**PR template** — put this in `.github/pull_request_template.md`:

```markdown
## What
<!-- one or two sentences -->

## Why
<!-- link the sprint ticket -->

## How to test
1.
2.

## Screenshots
<!-- required for any UI change -->

## Checklist
- [ ] Ran locally and it works
- [ ] No secrets, keys, or .env files committed
- [ ] No business logic added inside a Lambda handler
- [ ] Tests pass (`pytest` / `npm run build`)
```

---

## Review rules — this part is for Mustheer

You are the only reviewer, which means you are also the bottleneck. Two commitments:

1. **Review within 24 hours.** A PR sitting for three days means that person stops working and the sprint slips silently.
2. **Distinguish blocking from non-blocking comments.** Prefix them:
   - `BLOCKING:` must fix before merge (bug, security, breaks the shared-layer rule)
   - `nit:` optional, merge anyway (naming, style preference)

If you only ever leave `nit:` comments, merge it. Perfect is the enemy of a shipped project, and morale on a student team is a real resource.

Things that are always **BLOCKING**:
- Business logic inside a Lambda handler
- Hardcoded table names, model IDs, region strings, or URLs
- Any credential, key, or `.env` in the diff
- A bare `except:` that swallows an error
- New DynamoDB access that bypasses `common/dynamo.py`
- Frontend calling `fetch` directly instead of going through `src/api/client.ts`

---

## Conflicts

They will happen. When they do:

```bash
git rebase origin/dev
# CONFLICT in backend/common/models.py

# Open the file. You'll see:
# <<<<<<< HEAD
# their version
# =======
# your version
# >>>>>>> your-commit

# Keep the right thing — usually BOTH, merged sensibly. Delete the <<<< ==== >>>> markers.
git add backend/common/models.py
git rebase --continue
```

If you're lost and about to make it worse:

```bash
git rebase --abort     # back to before you started, nothing lost
```

Then ask in the group. **Never delete your local repo and re-clone to "fix" a conflict.** You lose work and you learn nothing.

---

## The one thing that will actually go wrong

Two people editing `template.yaml` or `common/models.py` at the same time. These are the shared files.

**The rule:** `template.yaml` belongs to **[C]**. `common/models.py` belongs to **[B]**. If you need a change to either, you post in the group: *"[C], I need a new Lambda for `get_logs` — can you add it?"* You do not edit it yourself, even though you technically can.

This feels slow. It is much faster than the alternative.

---

## Branch protection settings (Mustheer sets these)

GitHub → Settings → Branches → Add rule, for both `main` and `dev`:

- ✅ Require a pull request before merging
- ✅ Require approvals: **1**
- ✅ Require status checks to pass — select the CI workflow
- ✅ Require branches to be up to date before merging
- ✅ Do not allow bypassing the above settings

That last one applies the rules to you too. Turn it on anyway — the day you push a broken commit straight to `dev` at 2am is the day the team stops respecting the process.

---

## .gitignore — this is in the scaffold, don't remove lines from it

```
.env
.env.*
!.env.example
.aws/
*.pem
credentials
.venv/
__pycache__/
node_modules/
dist/
.aws-sam/
samconfig.toml
.DS_Store
```

If someone commits a real key anyway: **tell Mustheer immediately**. He deactivates the key in IAM within minutes. Removing it from git history is the secondary concern — the key being live is the actual emergency. There is no embarrassment here; the only bad outcome is staying quiet about it.
