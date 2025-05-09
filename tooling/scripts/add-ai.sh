#!/bin/sh

# add editor-ai
# node ./packages/cli/dist/index.js add localhost:3000/r/editor-ai -c ./templates/plate-template

./pre-registry.sh && npx shadcn@canary add localhost:3000/r/editor-ai -o && ./post-registry.sh