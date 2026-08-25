from pathlib import Path


REQUIRED = [
    "HealthFunction",
    "OnboardFunction",
    "ProfileFunction",
    "GetPlanFunction",
    "GeneratePlanFunction",
    "LogDailyFunction",
    "GetLogsFunction",
    "WeeklyPlanGenFunction",
]


def test_template_declares_all_functions():
    text = Path("backend/template.yaml").read_text()

    missing = [
        resource
        for resource in REQUIRED
        if f"\n  {resource}:" not in text
    ]

    assert not missing, f"missing from template.yaml: {missing}"
