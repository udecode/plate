#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(dirname "$0")"

if (($# > 0)); then
  "$SCRIPT_DIR/update-template.sh" "$@" basic
  "$SCRIPT_DIR/update-template.sh" "$@" ai
else
  "$SCRIPT_DIR/update-template.sh" basic
  "$SCRIPT_DIR/update-template.sh" ai
fi

"$SCRIPT_DIR/update-template-skills.sh"
