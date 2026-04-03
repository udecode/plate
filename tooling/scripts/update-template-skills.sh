#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BASE_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
PRESET_SOURCE="$BASE_DIR/tooling"

sync_template_skills() {
  local template_dir="$1"

  bun x skiller@latest install "$PRESET_SOURCE" \
    --preset preset \
    --project-root "$template_dir" \
    -y

  rm -f "$template_dir/.agents/.skiller-preset-manifest.json"
  rm -f "$template_dir/.agents/.skiller-sync-manifest.json"
}

sync_template_skills "$BASE_DIR/templates/plate-template"
sync_template_skills "$BASE_DIR/templates/plate-playground-template"
