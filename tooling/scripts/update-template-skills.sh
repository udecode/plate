#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BASE_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
PRESET_SOURCE="$BASE_DIR/tooling"

sync_template_skills() {
  local template_dir="$1"

  # Older generated templates do not retain Skiller's pruning manifest.
  rm -f \
    "$template_dir/.claude/prompt.yml" \
    "$template_dir/.claude/scripts/post-compact.sh" \
    "$template_dir/.claude/scripts/session-start.sh" \
    "$template_dir/.claude/scripts/user-prompt-submit.sh" \
    "$template_dir/.agents/rules/agent-browser-issue.mdc" \
    "$template_dir/.agents/rules/dev-browser.mdc" \
    "$template_dir/.agents/rules/grill-me.mdc" \
    "$template_dir/.agents/rules/hard-cut.mdc"

  bun x skiller@latest install "$PRESET_SOURCE" \
    --preset preset \
    --project-root "$template_dir" \
    -y

  rm -f "$template_dir/.agents/.skiller-preset-manifest.json"
  rm -f "$template_dir/.agents/.skiller-sync-manifest.json"
}

if (($# > 0)); then
  for template_dir in "$@"; do
    sync_template_skills "$template_dir"
  done
else
  sync_template_skills "$BASE_DIR/templates/plate-template"
  sync_template_skills "$BASE_DIR/templates/plate-playground-template"
fi
