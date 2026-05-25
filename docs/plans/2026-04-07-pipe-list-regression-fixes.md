# Pipe And List Regression Fixes

## Goal

Fix the two real regressions introduced by the recent perf cuts:

- pathless `inject.nodeProps` must survive the wrapped element path in
  `pipeRenderElement(...)`
- unordered list visuals must still work for non-paragraph list blocks

## Plan

1. Add regression tests for wrapped-element inject props.
2. Add regression tests for unordered list visuals on non-paragraph blocks.
3. Fix the shared element path.
4. Fix the list plugin targeting.
5. Verify with targeted tests, build, and typecheck.

## Outcome

Kept.

- `pipeRenderElement(...)` now preserves pathless injected props on the wrapped
  directional path
- active `belowNodes` wrappers no longer get skipped by the fast path
- unordered list-item styling is no longer paragraph-only
