#!/bin/bash

lerna exec --scope @udecode/plate-comments -- yarn build && \
rm -rf packages/ui/collaboration/comments/node_modules && \
yarn && \
lerna exec --scope @udecode/plate-ui-comments -- yarn build
