#!/usr/bin/env bash
set -euo pipefail

# This recipe command is responsible for printing METRIC lines.
cd '/Users/zbeyens/git/plate-2/.tmp/slate-v2' && HUGE_DOC_FULL_LEGACY_REPO=../../../slate HUGE_DOC_FULL_BLOCKS=5000 HUGE_DOC_FULL_ITERATIONS=5 HUGE_DOC_FULL_TRACE_ITERATIONS=5 HUGE_DOC_FULL_TYPE_OPS=10 bun run bench:react:huge-document:full:local
