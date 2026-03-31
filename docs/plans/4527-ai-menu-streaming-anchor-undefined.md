# Issue 4527: AI menu streaming anchor can be undefined

## Tracker

- Source type: GitHub issue
- Source id: `#4527`
- Title: `AIMenu: Cannot read properties of undefined (reading '0') during streaming`
- URL: `https://github.com/udecode/plate/issues/4527`
- Task type: bug
- Expected outcome: confirm whether current `main` can still dereference an undefined AI chat anchor during streaming; if yes, fix it and verify the AI menu remains stable during streaming startup
- Browser surface: yes, but the first reproduction seam may be a targeted React/UI test around `AIMenu`

## Relevant area

- `apps/www/src/registry/ui/ai-menu.tsx`
- `packages/ai/src/react/ai-chat/AIChatPlugin.ts`
- `packages/ai/src/react/ai-chat/streaming/streamInsertChunk.ts`
- any AI menu or AI streaming tests in `apps/www` or `packages/ai`

## Learnings

- The issue was reported against Plate `49.0.2`, so it may be stale
- Current `main` still contains the exact `anchor![0]` dereference inside the `streaming` effect in `AIMenu`
- No PR referencing `#4527` is currently open or merged by title/body search

## Plan

1. Inspect the current AI menu and AI chat anchor lifecycle on `main`.
2. Reproduce the undefined-anchor path on current code with the smallest honest seam.
3. If the bug is live, add a regression test and implement the minimal fix.
4. Run targeted verification, then broader required checks if code changed.
5. Create/update the PR and issue comment only if the bug is still valid and fixed.

## Progress

- Fetched the issue and comments.
- Read the task, planning-with-files, learnings-researcher, and bug-reproduction-validator skill docs.
- Searched local solution docs and current code for AI streaming, anchors, and `AIMenu`.
- Confirmed the current `AIMenu` implementation still uses `const anchorDom = editor.api.toDOMNode(anchor![0])!` inside a `setTimeout`.
- Added a regression test in `apps/www/src/registry/ui/ai-menu.spec.tsx` that reproduced the current undefined-anchor crash on `main`.
- Updated `apps/www/src/registry/ui/ai-menu.tsx` to resolve the anchor inside the timeout, guard missing anchor entries, and clear the timeout on cleanup.
- Verified with targeted tests, `pnpm --filter www build`, `pnpm --filter www typecheck`, `pnpm lint:fix`, and full `pnpm check`.
- Re-opened the live `/blocks/editor-ai` surface in the real browser and captured proof at `.claude/tmp/4527-ai-menu-browser-proof.png`.

## Errors

- `planning-with-files` session catchup script path from the generated skill is missing locally, so catchup could not run in this repo.
- `dev-browser` screenshot writes only accept repo-relative paths, not absolute paths.
