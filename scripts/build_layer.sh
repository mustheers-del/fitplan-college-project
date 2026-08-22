#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

LAYER="backend/layer"

rm -rf "$LAYER/python" backend/common-layer.zip
mkdir -p "$LAYER/python"

# Copy source code into the generated layer
cp -r backend/common "$LAYER/python/common"

# Install dependencies for Lambda's Python 3.12 ARM64 environment
pip install \
  --platform manylinux2014_aarch64 \
  --implementation cp \
  --python-version 3.12 \
  --only-binary=:all: \
  --target "$LAYER/python" \
  --upgrade \
  pydantic

# Remove caches and compiled Python files
find "$LAYER" -name '__pycache__' -type d -prune -exec rm -rf {} + 2>/dev/null || true
find "$LAYER" -name '*.pyc' -delete

# Record the source commit used for this build
git rev-parse --short HEAD > "$LAYER/python/common/BUILD_STAMP" 2>/dev/null || \
  echo "dirty" > "$LAYER/python/common/BUILD_STAMP"

# Create the Lambda layer zip
powershell.exe -Command "Compress-Archive -Path 'backend/layer/python' -DestinationPath 'backend/common-layer.zip' -Force"

echo "--- layer contents check ---"

powershell.exe -Command '
Add-Type -AssemblyName System.IO.Compression.FileSystem
$z=[IO.Compression.ZipFile]::OpenRead("backend/common-layer.zip")
$names=$z.Entries.FullName
$z.Dispose()

$required=@(
  "python\common\openrouter.py",
  "python\common\plans.py",
  "python\common\BUILD_STAMP"
)

foreach ($file in $required) {
  if ($names -notcontains $file) {
    Write-Host "MISSING FILE IN ZIP: $file"
    exit 1
  }
}

Write-Host "Required files found in ZIP."
'

for FILE in \
  "backend/layer/python/common/openrouter.py" \
  "backend/layer/python/common/plans.py" \
  "backend/layer/python/common/BUILD_STAMP"; do
  if [ ! -f "$FILE" ]; then
    echo "MISSING FILE: $FILE"
    exit 1
  fi
done

echo "Required files exist in the generated layer."

echo
echo "Layer built successfully."
echo "Build stamp: $(cat "$LAYER/python/common/BUILD_STAMP")"
echo "Output: backend/common-layer.zip"
