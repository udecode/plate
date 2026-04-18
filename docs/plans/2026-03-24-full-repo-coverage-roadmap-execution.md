---
title: Full Repo Coverage Roadmap Execution
type: testing
date: 2026-03-24
status: completed
---

# Full Repo Coverage Roadmap Execution

## Goal

Execute the locked full-repo roadmap from [2026-03-24-full-repo-coverage-roadmap.md](docs/plans/2026-03-24-full-repo-coverage-roadmap.md) without inventing a new batch.

## Phase Plan

- [completed] Phase 1: `selection` cluster
- [completed] Phase 2: `ai` cluster
- [completed] Phase 3: `link`, `toggle`, `combobox`, `table`, `media`
- [completed] Phase 4: `toc`, `emoji`, `cursor`, `math`
- [completed] Phase 5: `list`, `list-classic`, `callout`, `excalidraw`
- [completed] Phase 6: verification and roadmap status update

## Learnings Applied

- Restore Bun spies in the same spec file or full-suite order lies. See [2026-03-24-spec-spies-must-be-restored-or-full-suite-order-breaks.md](docs/solutions/test-failures/2026-03-24-spec-spies-must-be-restored-or-full-suite-order-breaks.md).
- Keep React coverage file-first and seam-first. No wrapper smoke tests.

## Notes

- Group files by seam cluster so one honest spec can cover multiple roadmap items.
- Favor `renderHook` and thin provider wrappers where possible.
- Only fix runtime bugs if the new direct tests expose them.
