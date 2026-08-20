#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

ZIP="backend/common-layer.zip"
LAYER_NAME="fitplan-dev-common"

if [ ! -f "$ZIP" ]; then
  echo "ERROR: $ZIP not found."
  echo "Run ./scripts/build_layer.sh first."
  exit 1
fi

echo "--- publishing Lambda layer ---"

ARN=$(aws lambda publish-layer-version \
  --layer-name "$LAYER_NAME" \
  --zip-file "fileb://$ZIP" \
  --compatible-runtimes python3.12 \
  --compatible-architectures arm64 \
  --query 'LayerVersionArn' \
  --output text)

echo "Published layer:"
echo "$ARN"

echo
echo "--- attaching layer to Lambda functions ---"

for FN in \
  fitplan-dev-health \
  fitplan-dev-onboard \
  fitplan-dev-get-plan \
  fitplan-dev-get-plans \
  fitplan-dev-generate-plan \
  fitplan-dev-log-daily \
  fitplan-dev-get-logs
do
  aws lambda update-function-configuration \
    --function-name "$FN" \
    --layers "$ARN" \
    --query 'FunctionName' \
    --output text

  echo "  attached -> $FN"
done

echo
echo "--- verifying layer attachment ---"

for FN in \
  fitplan-dev-onboard \
  fitplan-dev-generate-plan
do
  echo -n "$FN -> "

  aws lambda get-function-configuration \
    --function-name "$FN" \
    --query 'Layers[0].Arn' \
    --output text
done

echo
echo "Layer publishing and attachment completed."
