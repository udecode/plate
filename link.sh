#!/bin/bash

cd packages/ui/collaboration/comments/node_modules/@udecode && \
rm -rf plate-comments && \
ln -s ../../../../../collaboration/comments plate-comments
