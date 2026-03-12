#!/bin/bash

set -euo pipefail

EXTRA_ARGS=("$@")

"$(dirname "$0")/update-template.sh" "${EXTRA_ARGS[@]}" basic
"$(dirname "$0")/update-template.sh" "${EXTRA_ARGS[@]}" ai
