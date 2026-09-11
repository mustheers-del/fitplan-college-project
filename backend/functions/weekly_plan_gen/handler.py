"""
EventBridge Scheduler -> weekly plan regeneration   ·   OWNER: [M] Mustheer

The two-step flow the architecture doc specifies:
    1. PARSE   last week's raw logs -> structured adherence (1 Bedrock call)
    2. GENERATE next week's plan using that adherence     (1 Bedrock call)

Two calls per user per week. That is the whole cost model.

SAFETY: MAX_USERS_PER_RUN caps fan-out. A bug that loops over every user
without a cap is the one realistic way this project produces a surprise bill.
"""

import logging
import os
from datetime import date, timedelta

from common import dynamo, log_parser, logs, plans

logging.getLogger().setLevel(logging.INFO)

MAX_USERS_PER_RUN = int(os.environ.get("MAX_USERS_PER_RUN", "50"))
TARGET_USER_ID = os.environ.get("TARGET_USER_ID")


def lambda_handler(event, context):
    this_week = plans.current_week_start()
    last_week = (date.fromisoformat(this_week) - timedelta(days=7)).isoformat()

    user_ids = [TARGET_USER_ID] if TARGET_USER_ID else _list_active_users()[:MAX_USERS_PER_RUN]
    logging.info("weekly run: week=%s users=%d", this_week, len(user_ids))

    succeeded, failed = 0, 0
    for user_id in user_ids:
        try:
            _regenerate_for_user(user_id, this_week, last_week)
            succeeded += 1
        except Exception:
            logging.exception("weekly generation failed for user %s", user_id)
            failed += 1

    return {"week": this_week, "succeeded": succeeded, "failed": failed}


def _regenerate_for_user(user_id: str, this_week: str, last_week: str) -> None:
    # ---- step 1: parse ----
    week_logs = logs.get_week_logs(user_id, last_week)
    previous = plans.get_plan(user_id, last_week)
    planned = (
        sum(1 for d in previous.workout_plan if not d.is_rest_day) if previous else 0
    )

    adherence = log_parser.parse_logs_batch(week_logs, planned)

    # ---- step 2: generate ----
    plans.generate_plan_for_user(
        user_id=user_id, week_start=this_week, force=False, adherence=adherence
    )

    if adherence and week_logs:
        logs.mark_logs_parsed(user_id, [l["date"] for l in week_logs])


def _list_active_users() -> list[str]:
    """
    TODO [M] Sprint 6: replace the table scan with a GSI on SK='PROFILE',
    or maintain a small ACTIVE_USERS item. A scan is fine at MVP scale and
    genuinely wrong at 10k users -- leave this comment in until it's fixed.
    """
    resp = dynamo.table().scan(
        FilterExpression="SK = :sk",
        ExpressionAttributeValues={":sk": "PROFILE"},
        ProjectionExpression="PK",
    )
    return [i["PK"].removeprefix("USER#") for i in resp.get("Items", [])]


