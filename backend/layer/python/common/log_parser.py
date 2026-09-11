"""
Free-text log -> structured adherence. OWNER: [M]

BATCH ONLY. One Bedrock call per user per week, never one per log entry.
That is a 7x cost difference for zero benefit.
"""

from __future__ import annotations

import logging
from typing import Optional

from common import ai
from common.models import AdherenceSummary, ParsedWeek
from common.prompts import PARSE_SYSTEM_PROMPT, build_parse_user_prompt

log = logging.getLogger(__name__)


def parse_logs_batch(logs: list[dict], planned_sessions: int) -> Optional[ParsedWeek]:
    """
    Returns None if there is nothing to parse, or if parsing fails.
    A failed parse must NOT block plan generation -- we just generate
    without adherence context that week.
    """
    usable = [
        {
            "date": l.get("date"),
            "workoutText": (l.get("workoutText") or "")[:2000],
            "mealsText": (l.get("mealsText") or "")[:2000],
            "tags": l.get("tags", []),
        }
        for l in logs
        if (l.get("workoutText") or l.get("mealsText"))
    ]

    if not usable:
        log.info("no usable logs to parse")
        return None

    try:
        parsed, result, source = ai.invoke_structured(
            system=PARSE_SYSTEM_PROMPT,
            user_content=build_parse_user_prompt(usable, planned_sessions),
            model_cls=ParsedWeek,
            max_tokens=2000,
            temperature=0.1,   # extraction, not creativity
        )
        log.info("parsed %d logs source=%s tokens=%d/%d", len(usable), source,
                 result.prompt_tokens, result.completion_tokens)
        return parsed
    except Exception:
        log.exception("log parsing failed -- continuing without adherence context")
        return None


def empty_adherence(planned: int) -> ParsedWeek:
    return ParsedWeek(
        days=[],
        summary=AdherenceSummary(
            sessionsPlanned=planned, sessionsCompleted=0,
            avgAdherence=0.0, notes="No logs recorded this week.",
        ),
    )

