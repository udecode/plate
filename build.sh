#!/bin/bash

lerna exec --scope @udecode/plate-comments -- yarn p:build && \
lerna exec --scope @udecode/plate-ui-comments -- yarn p:build
