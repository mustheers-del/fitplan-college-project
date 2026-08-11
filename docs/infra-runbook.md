# FitPlan Infrastructure Runbook

**Owner:** Parshuram · **Environment:** `fitplan-dev` · **Region:** `us-east-1`

How to deploy the backend, how to check it worked, and what to do when it
doesn't. Written so anyone on the team can deploy if I'm not around.

---

## What's deployed

One CloudFormation stack, `fitplan-dev`, built from `backend/template.yaml`:

| Resource | Name |
|---|---|
| DynamoDB table | `fitplan-dev-main` |
| HTTP API | one API, seven routes, `/dev` stage |
| Lambda functions | seven, all prefixed `fitplan-dev-` |
| Shared layer | `fitplan-dev-common`, built from `backend/layer/` |
| Dead-letter queue | `fitplan-dev-weekly-dlq` |
| Scheduled job | weekly plan generation — **currently DISABLED** |
| Log groups | seven, 7-day retention on dev, 30 on prod |

## URLs and identifiers

```
Health check   https://j3svg2s5id.execute-api.us-east-1.amazonaws.com/dev/health
Base URL       https://j3svg2s5id.execute-api.us-east-1.amazonaws.com/dev
               ^ this is VITE_API_URL for the frontend. The /dev matters.
Table          fitplan-dev-main
Stack          fitplan-dev
Region         us-east-1
```

---

## Before you deploy

You need: AWS CLI v2, SAM CLI, Python 3.12, and AWS credentials for an account
in the `fitplan-developers` group.

```powershell
aws sts get-caller-identity     # confirms who you are
aws configure get region        # must say us-east-1
```

---

## Deploying

```powershell
cd C:\Users\<you>\gym-plan-v2
git checkout dev
git pull origin dev
cd backend
sam build
sam deploy
```

`sam deploy` shows a changeset and waits. **Read it before typing `y`.** Look for
anything marked `Delete` or `Replacement` that you weren't expecting.

Parameters are already saved in `samconfig.toml`, so no `--guided` needed.

### When to deploy

Any time backend code merges to `dev`. Deploys are **manual this sprint** — there
is no auto-deploy — so AWS runs whatever was last deployed, not what's on `dev`.
If nobody deploys, people test against stale code without knowing.

---

## Verifying it worked

```powershell
curl.exe https://j3svg2s5id.execute-api.us-east-1.amazonaws.com/dev/health
```
Expect: `{"status":"ok","service":"fitplan-api","stage":"dev"}`

```powershell
aws logs describe-log-groups --log-group-name-prefix /aws/lambda/fitplan-dev `
  --query "logGroups[].{Name:logGroupName,Retention:retentionInDays}" --output table
```
Expect: seven groups, all showing 7.

```powershell
aws dynamodb describe-table --table-name fitplan-dev-main --query "Table.TableStatus"
```
Expect: `"ACTIVE"`

---

## Watching logs live

```powershell
sam logs --stack-name fitplan-dev --name HealthFunction --tail
```

Leave it running, hit the API from another window, and the log lines appear in a
few seconds. Ctrl+C to stop.

---

## Before changing template.yaml

Two checks, every time. Both take seconds and both catch mistakes that are
otherwise painful.

```powershell
cd backend
sam validate --lint          # must say "is a valid SAM Template"
```

```powershell
cd ..
git diff origin/dev --stat   # must list ONLY the files you meant to change
```

---

## Common failures

### `AccessDenied` during deploy
An IAM permission is missing. The error names the exact action, e.g.
`sqs:CreateQueue`. Copy the whole line and ask Mustheer — he owns the account.
Don't widen your own permissions.

Nothing is broken when this happens: CloudFormation rolls back automatically and
deletes anything it half-created.

### `ROLLBACK_COMPLETE`
A failed *first* deploy leaves the stack in this state, and CloudFormation will
not deploy over it. Delete the stack, then redeploy:

```powershell
aws cloudformation delete-stack --stack-name fitplan-dev --region us-east-1
aws cloudformation wait stack-delete-complete --stack-name fitplan-dev --region us-east-1
```

The `wait` command prints nothing and sits there until it finishes. Silence is
success.

### `ResourceAlreadyExistsException` on a log group
That Lambda ran once before CloudFormation managed its log group, so AWS created
it automatically. Delete it in CloudWatch → Log groups, then redeploy.

### `Error: No changes to deploy`
Two possibilities:
- **Good:** `dev` and AWS already match. Nothing to do.
- **Bad:** you edited `template.yaml` but didn't run `sam build`. `sam deploy`
  deploys from `.aws-sam/build/`, not from your source file. Run `sam build`
  first, then deploy again.

### Deploy succeeds but the endpoint 404s
Check the URL has `/dev` in it. `https://.../dev/health` works;
`https://.../health` does not. The stage name is part of the path.

### `{"message":"Not Found"}` on the base URL
Correct behaviour. There is no route at the root. Only the seven defined routes
respond.

### `401 Unauthorized` on any endpoint except `/health`
Correct behaviour. Every route except `/health` sits behind the Cognito JWT
authoriser. Until the login screens exist, a 401 is what you should get.

---

## Rolling back

CloudFormation rolls back automatically on a failed deploy. To undo a *successful*
deploy, revert the commit on `dev` and deploy again:

```powershell
git revert <commit-sha>
git push origin dev     # via a PR
cd backend
sam build
sam deploy
```

---

## Things that have caught us before

- **`sam deploy` uses `.aws-sam/build/`**, not your source file. Always
  `sam build` after editing the template.
- **The `/dev` in the URL** is part of the path, not decoration.
- **YAML indentation** — a resource name must sit two spaces in, level with its
  neighbours. `sam validate --lint` catches this; the editor often doesn't.
- **`git diff origin/dev --stat` before every push.** Formatting tools can
  rewrite files you only opened to read.
- **Deploys are manual.** `dev` and AWS drift apart silently.

---

## Who to ask

| Area | Person |
|---|---|
| `template.yaml`, deploys, CI, hosting, monitoring | Parshuram |
| IAM and the AWS account | Mustheer |
| `models.py`, `dynamo.py`, backend data | Ankush |
| AI layer, prompts, auth | Mustheer |

If I'm unavailable, **Ankush has the same AWS permissions** and can run the deploy
steps above.
