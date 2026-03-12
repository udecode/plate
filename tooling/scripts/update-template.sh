#!/bin/bash

set -euo pipefail

# Parse parameters
USE_LOCAL=false
MODE="${1:-basic}"
USE_LOCAL_FILES=false
LOCAL_REGISTRY_DIR=""

# Check for --local flag
if [[ "${1:-}" == "--local" ]]; then
  USE_LOCAL=true
  MODE="${2:-basic}"
elif [[ "${2:-}" == "--local" ]]; then
  USE_LOCAL=true
fi

# Determine registry prefix
if [[ -n "${TEMPLATE_REGISTRY_URL:-}" ]]; then
  REGISTRY_PREFIX="${TEMPLATE_REGISTRY_URL%/}"
elif [[ "$USE_LOCAL" == true ]]; then
  USE_LOCAL_FILES=true
  REGISTRY_PREFIX=""
else
  REGISTRY_PREFIX="@plate"
fi

get_registry_item() {
  local name="$1"

  if [[ "$USE_LOCAL_FILES" == true ]]; then
    echo "$name.json"
    return
  fi

  if [[ "$REGISTRY_PREFIX" == http://* ]] || [[ "$REGISTRY_PREFIX" == https://* ]]; then
    echo "$REGISTRY_PREFIX/$name.json"
    return
  fi

  echo "$REGISTRY_PREFIX/$name"
}

# Map mode to template and registry
case "$MODE" in
  basic)
    TEMPLATE_NAME="plate-template"
    REGISTRY_NAME="$(get_registry_item editor-basic)"
    ;;
  ai)
    TEMPLATE_NAME="plate-playground-template"
    REGISTRY_NAME="$(get_registry_item editor-ai)"
    ;;
  *)
    echo "❌ Error: Mode must be 'basic' or 'ai'"
    echo "Usage: $0 [--local] <mode>"
    echo "  basic - Updates plate-template with @plate/editor-basic"
    echo "  ai    - Updates plate-playground-template with @plate/editor-ai"
    echo ""
    echo "Options:"
    echo "  --local - Use local registry (http://localhost:3000/rd/...)"
    echo ""
    echo "Environment:"
    echo "  TEMPLATE_REGISTRY_URL - Override the registry prefix (for example: http://127.0.0.1:3210/r)"
    exit 1
    ;;
esac

BASE=$(pwd)
TEMPLATE_DIR="$BASE/templates/$TEMPLATE_NAME"

if [[ "$USE_LOCAL_FILES" == true ]]; then
  LOCAL_REGISTRY_SOURCE="${TEMPLATE_LOCAL_REGISTRY_SOURCE:-$BASE/apps/www/public/rd}"
  LOCAL_REGISTRY_DIR=$(mktemp -d)
  trap 'rm -rf "$LOCAL_REGISTRY_DIR"' EXIT

  node "$BASE/tooling/scripts/prepare-local-template-registry.mjs" \
    "$LOCAL_REGISTRY_SOURCE" \
    "$LOCAL_REGISTRY_DIR"
fi

echo "📦 Updating $TEMPLATE_NAME packages..."
if [[ "$USE_LOCAL_FILES" == true ]]; then
  echo "Using local registry dir: $LOCAL_REGISTRY_DIR"
else
  echo "Using registry prefix: $REGISTRY_PREFIX"
fi
cd "$TEMPLATE_DIR"

# Update all packages to latest versions
echo "Running bun update --latest..."
bun update --latest

# Add registry component via shadcn
echo "Adding $REGISTRY_NAME via shadcn..."
if [[ "$USE_LOCAL_FILES" == true ]]; then
  (
    cd "$LOCAL_REGISTRY_DIR"
    npx shadcn@latest add "$REGISTRY_NAME" --cwd "$TEMPLATE_DIR" -o
  )
else
  npx shadcn@latest add "$REGISTRY_NAME" -o
fi

# Run lint:fix
echo "Running bun lint:fix..."
bun lint:fix

# Run typecheck
echo "Running bun typecheck..."
bun typecheck

echo "✅ Done! Packages updated, $REGISTRY_NAME added, linted, and typechecked in $TEMPLATE_NAME."
cd "$BASE"
