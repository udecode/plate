#!/bin/bash

lerna exec --scope @xolvio/plate-comments -- yarn build && \
lerna exec --scope @xolvio/plate-ui-comments -- yarn build
