#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="${DIST_DIR:-$ROOT_DIR/dist}"
ARTIFACT_BASENAME="${ARTIFACT_BASENAME:-base64-to-file-extension}"

"$ROOT_DIR/scripts/validate-extension.sh" >/dev/null

VERSION="$(
  python3 - "$ROOT_DIR/manifest.json" <<'PY'
import json
import sys

with open(sys.argv[1], encoding="utf-8") as fh:
    manifest = json.load(fh)

print(manifest["version"])
PY
)"

mkdir -p "$DIST_DIR"
ARTIFACT_PATH="$DIST_DIR/${ARTIFACT_BASENAME}-v${VERSION}.zip"
rm -f "$ARTIFACT_PATH"

cd "$ROOT_DIR"
zip -rq "$ARTIFACT_PATH" . \
  -x ".git/*" \
  -x ".github/*" \
  -x "dist/*" \
  -x "scripts/*" \
  -x "README.md" \
  -x "LICENSE" \
  -x ".DS_Store"

echo "$ARTIFACT_PATH"
