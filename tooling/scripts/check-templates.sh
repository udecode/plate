#!/usr/bin/env bash

set -euo pipefail

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

for template in plate-template plate-playground-template; do
  (
    cd "$repo_dir/templates/$template"
    echo "Checking $template"
    bun install --no-frozen-lockfile
    bun lint
    bun typecheck
    bun run build
  )
done
