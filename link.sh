#!/bin/bash

cd packages/ui/collaboration/comments/node_modules/@xolvio && \
rm -rf plate-comments && \
ln -s ../../../../../collaboration/comments plate-comments
