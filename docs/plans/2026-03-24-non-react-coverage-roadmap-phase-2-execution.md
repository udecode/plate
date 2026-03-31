---
title: Non React Coverage Roadmap Phase 2 Execution
type: testing
date: 2026-03-24
status: completed
---

# Non React Coverage Roadmap Phase 2 Execution

## Scope

- Execute the locked Tier 1 and Tier 2 non-React files from [2026-03-24-non-react-coverage-roadmap-phase-2.md](/Users/zbeyens/git/plate/docs/plans/2026-03-24-non-react-coverage-roadmap-phase-2.md).
- Keep the work file-first.
- Add direct tests or expand existing specs only where the seam is still honest.

## Current Plan

1. Inspect existing implementations and nearby specs.
2. Add Tier 1 coverage.
3. Add Tier 2 coverage.
4. Update roadmap statuses.
5. Run targeted tests, then build, typecheck, and lint for touched packages.

## Notes

- Tier 2 already has decent harnesses for `ViewPlugin`, `onDropNode`, `upsertLink`, and `convertNodesSerialize`; expand those instead of cloning new suites.
- The likely touched packages are `core`, `code-block`, `excalidraw`, `dnd`, `link`, and `markdown`.
- The batch exposed one real runtime bug in `withScrolling`: it was writing `mode` / `operations` into the DOMPlugin store instead of `scrollMode` / `scrollOperations`, and it failed to restore state on thrown callbacks.
