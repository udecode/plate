#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo "Reinstalling repo dependencies from: ${ROOT_DIR}"

TARGETS=(
  "${ROOT_DIR}/node_modules"
  "${ROOT_DIR}/.turbo"
  "${ROOT_DIR}/apps/www/.next"
  "${ROOT_DIR}/apps/www/.contentlayer"
)

while IFS= read -r path; do
  TARGETS+=("${path}")
done < <(
  find "${ROOT_DIR}" \
    \( -path "${ROOT_DIR}/node_modules" -o -path "${ROOT_DIR}/.git" -o -path "${ROOT_DIR}/templates" \) -prune -o \
    \( -name node_modules -o -name tsconfig.tsbuildinfo \) -print
)

for path in "${TARGETS[@]}"; do
  if [[ -e "${path}" ]]; then
    echo "Removing ${path#${ROOT_DIR}/}"
    rm -rf "${path}"
  fi
done

cd "${ROOT_DIR}"
pnpm install
