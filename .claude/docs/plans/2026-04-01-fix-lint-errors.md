# 2026-04-01 Fix lint errors

## Goal

Clear the current root `pnpm lint:fix` failure without touching unrelated dirty files.

## Context

- Prior repo notes say the remaining root lint failures live in `packages/mdast-util-from-markdown` and `packages/remark-parse`.
- This task is verification and cleanup work, so the source of truth is the live current `pnpm lint:fix` output.

## Plan

1. Capture the exact current lint diagnostics.
2. Fix only the files reported by the current run.
3. Re-run lint and any required follow-up verification for touched files.

## Progress

- [in_progress] Capture current lint diagnostics.
- [pending] Apply targeted fixes.
- [pending] Re-run verification.
