#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MANIFEST_PATH="$ROOT_DIR/manifest.json"

if [[ ! -f "$MANIFEST_PATH" ]]; then
  echo "manifest.json not found at repository root" >&2
  exit 1
fi

python3 - "$ROOT_DIR" "$MANIFEST_PATH" <<'PY'
import json
import pathlib
import re
import sys

root = pathlib.Path(sys.argv[1])
manifest_path = pathlib.Path(sys.argv[2])

try:
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
except json.JSONDecodeError as exc:
    raise SystemExit(f"manifest.json is not valid JSON: {exc}")

if manifest.get("manifest_version") != 3:
    raise SystemExit("manifest_version must be 3")

required_fields = {
    "name": manifest.get("name"),
    "version": manifest.get("version"),
    "background.service_worker": manifest.get("background", {}).get("service_worker"),
    "action.default_popup": manifest.get("action", {}).get("default_popup"),
}

missing = [field for field, value in required_fields.items() if not value]
if missing:
    raise SystemExit(f"Missing required manifest fields: {', '.join(missing)}")

version = str(manifest["version"])
if not re.fullmatch(r"\d+(?:\.\d+){0,3}", version):
    raise SystemExit(
        "manifest.version must use 1 to 4 dot-separated numeric segments, for example 1.1 or 1.2.3.4"
    )

files_to_check = {
    manifest["background"]["service_worker"],
    manifest["action"]["default_popup"],
}

for icon_group in (manifest.get("icons", {}), manifest.get("action", {}).get("default_icon", {})):
    for path in icon_group.values():
        files_to_check.add(path)

missing_files = sorted(str(path) for path in files_to_check if not (root / path).is_file())
if missing_files:
    raise SystemExit(f"Manifest references files that do not exist: {', '.join(missing_files)}")

print(f"Validated Chrome extension manifest version {version}")
PY
