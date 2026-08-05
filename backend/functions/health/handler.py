"""GET /health -- unauthenticated. Sprint 1's proof that deployment works."""

import json
import os


def lambda_handler(event, context):
    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps({
            "status": "ok",
            "service": "fitplan-api",
            "stage": os.environ.get("STAGE", "dev"),
        }),
    }
