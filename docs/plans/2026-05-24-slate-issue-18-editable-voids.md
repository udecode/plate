# Slate Issue 18 Editable Voids

## Goal

Resolve `udecode/slate#18`: nested rich text editor inside `examples/editable-voids` loses caret placement and input after clicking.

## Source

- Issue: https://github.com/udecode/slate/issues/18
- Route: `http://localhost:3100/examples/editable-voids`
- Reported baseline: Slate v2 commit `e62c2046`, Chrome on macOS
- Attachment: GitHub user attachment resolves to `video/mp4`; transcript required before implementation.

## Current Plan

1. Fetch issue source and transcript attached video.
2. Inspect current `.tmp/slate-v2` and `/Users/zbeyens/git/slate-v2` owner for editable voids, nested editors, focus, and selection import.
3. Reproduce current behavior on the local example.
4. If red-current, add the smallest browser proof row, fix the durable owner, and verify from `/Users/zbeyens/git/slate-v2`.
5. If already accounted, keep code unchanged, verify current behavior, comment, and close if confidence is high.

## Findings

- Video transcript:
  - `[00:00]` editable-voids example is open.
  - `[00:01]` cursor starts at end of `This is editable rich text, much better than a <star>!`.
  - `[00:02]-[00:09]` user repeatedly clicks words inside the nested editor; expected caret remains usable and tracks clicked text.
- `/Users/zbeyens/git/slate-v2` is only a stub (`.clawpatch`, `site/`) in this checkout; current source lives in `/Users/zbeyens/git/plate-2/.tmp/slate-v2`, matching the resolve-slate-issue rule that `.tmp/slate-v2` wins.
- Current `.tmp/slate-v2` already has editable-voids Playwright rows for semantic nested insert and focused nested input, but the issue flow needs real mouse-click caret relocation inside the nested editor.
- Current classification: `already-accounted` with missing browser regression proof.
- The issue flow passes in current `.tmp/slate-v2` with a new desktop Chrome Playwright row that performs real mouse clicks inside the nested editor and native keyboard typing.

## Verification Log

- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/editable-voids.test.ts --project=chromium --grep "keeps nested editor caret usable after real mouse clicks"`: passed.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/editable-voids.test.ts --project=chromium --grep "nested editor"`: 6 passed.
- `bun check`: passed.
- `bun lint:fix`: passed, no fixes applied.
