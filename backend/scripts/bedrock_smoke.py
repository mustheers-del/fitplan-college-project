"""
Sprint 1, [M]: prove Bedrock works before building any Lambda around it.

    python scripts/bedrock_smoke.py
"""

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from common import bedrock

if __name__ == "__main__":
    print(f"model: {bedrock.MODEL_ID}")
    r = bedrock.invoke(
        system="You are a fitness coach. Answer in one short sentence.",
        messages=[{"role": "user", "content": "Is squatting three times a week too much for a beginner?"}],
        max_tokens=100,
    )
    print(f"\n{r.text}\n")
    print(f"tokens in/out: {r.prompt_tokens}/{r.completion_tokens}")
