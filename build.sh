#!/bin/bash

rm -rf node_modules && \
rm -rf packages/collaboration/comments/node_modules && \
rm -rf packages/ui/collaboration/comments/node_modules && \
yarn && \
lerna exec --scope @xolvio/plate-comments -- yarn build && \
lerna exec --scope @xolvio/plate-ui-comments -- yarn build
