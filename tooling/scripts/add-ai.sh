#!/bin/sh

# add editor-ai
# node ./packages/cli/dist/index.js add plate/editor-ai -c ./templates/plate-template

./pre-registry.sh && npx shadcx@latest add plate/editor-ai -o && ./post-registry.sh