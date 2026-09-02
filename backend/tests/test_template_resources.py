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


API_ROUTES = [
    ("GET", "/health"),
    ("POST", "/onboard"),
    ("GET", "/profile"),
    ("PATCH", "/profile"),
    ("GET", "/plan"),
    ("GET", "/plans"),
    ("POST", "/plan/generate"),
    ("POST", "/logs/daily"),
    ("GET", "/logs/daily"),
]


def test_template_declares_all_functions():
    text = Path("backend/template.yaml").read_text()

    missing = [
        resource
        for resource in REQUIRED
        if f"\n  {resource}:" not in text
    ]

    assert not missing, f"missing from template.yaml: {missing}"


def test_frontend_api_routes_exist_in_template():
    text = Path("backend/template.yaml").read_text()

    missing = []

    for method, path in API_ROUTES:
        route = f"Path: {path}"
        http_method = f"Method: {method}"

        if route not in text or http_method not in text:
            missing.append(f"{method} {path}")

    assert not missing, (
        "frontend API routes missing from backend/template.yaml: "
        f"{missing}"
    )