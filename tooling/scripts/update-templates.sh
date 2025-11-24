#!/bin/bash

set -e # bail on errors

# Parameters
TEMPLATE_NAME="${1:-plate-template}"
REGISTRY_NAME="${2:-@plate/editor-basic}"

# Validate template name
if [[ "$TEMPLATE_NAME" != "plate-template" && "$TEMPLATE_NAME" != "plate-playground-template" ]]; then
  echo "❌ Error: Template must be 'plate-template' or 'plate-playground-template'"
  echo "Usage: $0 <template-name> <registry-name>"
  echo "Example: $0 plate-template @plate/editor-basic"
  exit 1
fi

BASE=$(pwd)
TEMPLATE_DIR="$BASE/templates/$TEMPLATE_NAME"

echo "📦 Updating $TEMPLATE_NAME packages..."
cd "$TEMPLATE_DIR"

# Update all packages to latest versions
echo "Running pnpm update --latest..."
pnpm update --latest

# Add registry component via shadcn
echo "Adding $REGISTRY_NAME via shadcn..."
npx shadcn@latest add "$REGISTRY_NAME" -o

echo "✅ Done! Packages updated and $REGISTRY_NAME added to $TEMPLATE_NAME."
cd "$BASE"
