---
title: Non React Coverage Roadmap Execution
type: testing
date: 2026-03-24
status: completed
---

# Non React Coverage Roadmap Execution

## Goal

Execute Tier 1 and Tier 2 from the locked non-React coverage roadmap in one program pass, with targeted tests and real verification.

## Inputs

- [2026-03-24-non-react-coverage-roadmap.md](docs/plans/2026-03-24-non-react-coverage-roadmap.md)
- `.agents/rules/testing-review.mdc`
- `.agents/rules/testing.mdc`

## Status

- [x] Reload skills and roadmap context
- [x] Search relevant learnings and prior solutions
- [x] Inspect existing specs and touched seams by package
- [x] Execute Tier 1
- [x] Execute Tier 2
- [x] Run verification and update roadmap statuses

## Notes

- File-first execution, but batch edits by package when that saves time without diluting the roadmap order.
- No `/react` in this phase.
- Deferred items remain deferred unless new work proves they should move.
- Broad affected-package `bun test` sweeps still hit unrelated legacy table failures, so the closeout gate used the locked 39-file roadmap spec matrix plus build, serialized typecheck, and lint.
- Relevant learnings:
  - direct helper specs catch table and markdown bugs earlier than broad transform smoke
  - filtered Turbo typecheck can lie; if it gets weird, rerun serialized
  - package typecheck can need build-first or even root build warm-up before calling the debt real
