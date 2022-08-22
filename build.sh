#!/bin/bash

lerna exec --scope @xolvio/plate-comments -- yarn p:build && \
lerna exec --scope @xolvio/plate-ui-comments -- yarn p:build
