# backend/tests/conftest.py
"""
Pytest session config.

TABLE_NAME is required by common.dynamo and has no default — a Lambda always
gets it from the Globals block in template.yaml, but tests run outside Lambda,
so it's set here for the whole session.

This must be set before common.dynamo is imported, which is why it's at module
level rather than inside a fixture.
"""

import os

os.environ.setdefault("TABLE_NAME", "fitplan-test-main")
os.environ.setdefault("AWS_REGION", "us-east-1")