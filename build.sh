#!/bin/bash

lerna exec --scope @xolvio/plate-comments -- yarn build && \
rm -rf packages/ui/collaboration/comments/node_modules && \
yarn && \
lerna exec --scope @xolvio/plate-ui-comments -- yarn build
