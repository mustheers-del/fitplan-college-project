#!/usr/bin/env bash
#
# Build the frontend and publish it to S3 (and invalidate CloudFront, if it
# exists yet).
#
# Why this script exists: the deployed bundle went stale. It was uploaded by
# hand once, and nothing rebuilt it when dev moved, so the browser was calling
# an endpoint the backend had already changed. One command now does the whole
# thing, the same way every time.
#
# Usage:
#   bash scripts/deploy_frontend.sh
#   FRONTEND_BUCKET=some-other-bucket bash scripts/deploy_frontend.sh
#   DRY_RUN=1 bash scripts/deploy_frontend.sh     # show what would change
#
# Requires: node, npm, aws cli with credentials for this account.

set -euo pipefail

# --- configuration -------------------------------------------------------
# Override with an environment variable rather than editing this file.
# NOTE: this bucket was created by hand, outside template.yaml. When
# EnableFrontendHosting is turned on, CloudFormation creates its own bucket
# named fitplan-<stage>-frontend-<account>. On that day this default changes.
FRONTEND_BUCKET="${FRONTEND_BUCKET:-fitplan-frontend-169471471296}"

# Empty until CloudFront exists. Set it and invalidation runs automatically.
CLOUDFRONT_DISTRIBUTION_ID="${CLOUDFRONT_DISTRIBUTION_ID:-}"

DRY_RUN="${DRY_RUN:-}"

# Resolve paths relative to this script, so it works from any directory.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
FRONTEND_DIR="${REPO_ROOT}/frontend"
DIST_DIR="${FRONTEND_DIR}/dist"

echo "==> Repo:    ${REPO_ROOT}"
echo "==> Bucket:  s3://${FRONTEND_BUCKET}"
[ -n "${DRY_RUN}" ] && echo "==> DRY RUN - nothing will be uploaded"

# --- preflight -----------------------------------------------------------
# Fail early with a readable message rather than half way through an upload.

for cmd in node npm aws; do
  command -v "$cmd" >/dev/null 2>&1 || { echo "ERROR: '$cmd' not found on PATH"; exit 1; }
done

[ -d "${FRONTEND_DIR}" ] || { echo "ERROR: no frontend directory at ${FRONTEND_DIR}"; exit 1; }

# The API URL is compiled into the bundle at build time, not read at runtime.
# If it is missing the site loads fine and every API call fails silently -
# which is a miserable thing to debug, so refuse to build without it.
if [ ! -f "${FRONTEND_DIR}/.env.production" ]; then
  echo "ERROR: frontend/.env.production is missing."
  echo "       VITE_API_URL is baked into the bundle at build time. Without it"
  echo "       the app deploys successfully and then fails every request."
  exit 1
fi

if ! grep -q '^VITE_API_URL=' "${FRONTEND_DIR}/.env.production"; then
  echo "ERROR: VITE_API_URL is not set in frontend/.env.production"
  exit 1
fi

# Confirm the bucket exists and we can reach it before spending time building.
if ! aws s3api head-bucket --bucket "${FRONTEND_BUCKET}" >/dev/null 2>&1; then
  echo "ERROR: cannot access bucket '${FRONTEND_BUCKET}'."
  echo "       Either it does not exist, or these credentials cannot see it."
  exit 1
fi

# --- build ---------------------------------------------------------------
echo "==> Building frontend"
cd "${FRONTEND_DIR}"

# npm ci, not npm install: installs exactly what package-lock.json says, so
# the deployed bundle matches what was tested.
npm ci
npm run build

[ -d "${DIST_DIR}" ] || { echo "ERROR: build produced no dist/ directory"; exit 1; }
[ -f "${DIST_DIR}/index.html" ] || { echo "ERROR: dist/index.html missing"; exit 1; }

echo "==> Built $(find "${DIST_DIR}" -type f | wc -l) files"

# --- upload --------------------------------------------------------------
# Two passes, deliberately.
#
# Vite fingerprints asset filenames (app.4f3a1c.js), so those files never
# change content under the same name and can be cached for a year.
#
# index.html is NOT fingerprinted. If it is cached, browsers keep loading the
# old page, which points at the old assets - the bundle is updated in S3 and
# nobody sees it. That is precisely the stale-frontend problem this script is
# meant to prevent, so index.html is uploaded last and marked no-cache.

SYNC_FLAGS=(--delete)
[ -n "${DRY_RUN}" ] && SYNC_FLAGS+=(--dryrun)

echo "==> Uploading fingerprinted assets (long cache)"
aws s3 sync "${DIST_DIR}/" "s3://${FRONTEND_BUCKET}/" \
  "${SYNC_FLAGS[@]}" \
  --exclude "index.html" \
  --cache-control "public,max-age=31536000,immutable"

echo "==> Uploading index.html (no cache)"
if [ -n "${DRY_RUN}" ]; then
  echo "    (dry run) would upload ${DIST_DIR}/index.html"
else
  aws s3 cp "${DIST_DIR}/index.html" "s3://${FRONTEND_BUCKET}/index.html" \
    --cache-control "no-cache,no-store,must-revalidate" \
    --content-type "text/html"
fi

# --- invalidate ----------------------------------------------------------
# CloudFront caches at the edge as well. Without an invalidation it keeps
# serving the previous files for up to 24 hours and the deploy looks like it
# did nothing.

if [ -z "${CLOUDFRONT_DISTRIBUTION_ID}" ]; then
  echo "==> No CLOUDFRONT_DISTRIBUTION_ID set - skipping invalidation."
  echo "    (Expected for now: CloudFront is blocked pending AWS account review.)"
elif [ -n "${DRY_RUN}" ]; then
  echo "==> (dry run) would invalidate ${CLOUDFRONT_DISTRIBUTION_ID}"
else
  echo "==> Invalidating CloudFront ${CLOUDFRONT_DISTRIBUTION_ID}"
  aws cloudfront create-invalidation \
    --distribution-id "${CLOUDFRONT_DISTRIBUTION_ID}" \
    --paths "/*" \
    --query "Invalidation.Id" --output text
fi

echo "==> Done."
