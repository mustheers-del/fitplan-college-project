# FitPlan IAM — scoped developer policies

**Owner:** Parshuram · **Applied by:** Mustheer (account owner)
**Status:** DRAFT — do not attach until reviewed

## Why

`fitplan-developers` currently has **10 attached managed policies**, which is the
AWS default limit per group. Sprint 3 adds CloudFront, which would be an 11th and
would fail. Rather than request a quota increase, these two customer-managed
policies replace nine of the ten AWS-managed `*FullAccess` policies with
resource-scoped equivalents.

This also brings the Sprint 7 least-privilege review forward, which was going to
have to happen anyway.

| Before | After |
|---|---|
| 10 attached managed policies | 2 attached managed policies |
| Broad `*FullAccess` on 9 services | Scoped to `fitplan-*` resources in `us-east-1` |
| 0 free slots | 8 free slots |

## What each policy covers

**`fitplan-deploy-core`** — everything needed to run `sam build && sam deploy`:
CloudFormation on `fitplan-*` stacks and the SAM CLI managed stack, the SAM
transform, the SAM deployment bucket, Lambda functions and layers named
`fitplan-*`, and IAM role management restricted to roles named `fitplan-*`.

**`fitplan-runtime-resources`** — the resources the stack creates: the
`fitplan-*` DynamoDB tables, `/aws/lambda/fitplan-*` log groups, `fitplan-*` SQS
queues, `fitplan-*` EventBridge schedules, the HTTP API, read access to the
Cognito pool, and CloudFront (added now so Sprint 3 needs no further IAM change).

`fitplan-guardrails` — the existing inline policy with the Bedrock model Deny —
**stays exactly as it is.** Nothing here touches it.

## Deliberate use of `Resource: "*"`

Some statements have to be unscoped because the API is account-level and does not
accept a resource ARN. These are all read-only list/describe calls:

- `cloudformation:ValidateTemplate`, `ListStacks`
- `s3:ListAllMyBuckets`
- `lambda:ListFunctions`, `ListLayers`, `GetLayerVersion`
- `iam:ListRoles`, `ListPolicies`, `GetPolicy`
- `dynamodb:ListTables`
- `logs:DescribeLogGroups` and Logs Insights query actions
- `sqs:ListQueues`
- `scheduler:ListSchedules`
- `cognito-idp:List*` / `Describe*`
- `cloudfront:*` and `acm` reads — CloudFront distributions have no useful
  name-prefix ARN before creation

Everything that creates, modifies or deletes a resource is ARN-scoped.

## Rollout — order matters

Per Mustheer: **attach first, prove, then detach.** If the deploy fails with only
the new policies attached, the old ones are still there to fall back on.

1. Mustheer creates both policies in the IAM console from these JSON files
2. Mustheer attaches both to the `fitplan-developers` group
   *(group is temporarily at 12 attached policies — AWS allows this to be
   exceeded only if the quota is raised, so if the attach is refused, detach
   `AmazonS3FullAccess` and `AmazonSQSFullAccess` first as the two least likely
   to be needed mid-test)*
3. Parshuram runs a full verification against `fitplan-dev`:
   ```
   aws sts get-caller-identity
   cd backend
   sam build
   sam deploy
   curl.exe <api-url>/dev/health
   aws logs describe-log-groups --log-group-name-prefix /aws/lambda/fitplan-dev
   aws dynamodb describe-table --table-name fitplan-dev-main
   ```
4. Ankush confirms he can still deploy and read the table
5. **Only then** Mustheer detaches the nine AWS-managed policies:
   `AWSCloudFormationFullAccess`, `AWSLambda_FullAccess`,
   `AmazonDynamoDBFullAccess`, `AmazonS3FullAccess`, `AmazonSQSFullAccess`,
   `CloudWatchLogsFullAccess`, `AmazonAPIGatewayAdministrator`,
   `AmazonEventBridgeSchedulerFullAccess`, `IAMFullAccess`
6. Re-run step 3 to confirm nothing broke after the detach

`AmazonCognitoPowerUser` can stay attached if preferred — the scoped policy only
grants read access to the pool, and nobody needs to modify it after Sprint 2.

## Rollback

Re-attach the AWS-managed policies in the console. Takes about a minute. Nothing
in these policies deletes or modifies existing resources.

## Fallback

If the scoped policies turn out to break something non-obvious, AWS will raise
the attached-policy quota from 10 to 20 on request. Mustheer's suggestion, and
worth keeping in reserve rather than fighting an AccessDenied loop mid-sprint.
