# Cmd+A Delete Empty Root

## Goal

Fix the collaboration/demo crash where selecting the whole document with Cmd+A and deleting leaves the initiating editor with an empty root, then clicking or undoing throws.

## Status

- [x] Reproduced in dev-browser on the Yjs collaboration example.
- [x] Added a failing core normalization test for `Editor.replace(...children: [])`.
- [x] Fix empty editor root normalization.
- [x] Add browser regression for real keyboard Cmd+A + Backspace + Undo.
- [x] Verify with focused unit, e2e, typecheck, and lint.

## Findings

- Initiating peer becomes `children=[]`/empty DOM after Cmd+A Backspace.
- Remote peers render an empty paragraph/placeholder, so peers structurally diverge until the initiator interacts again.
- Clicking/undoing the initiating editor then throws:
  - `Cannot get the start point in the node at path [] because it has no start text node.`
  - `Cannot read properties of undefined (reading 'text')`
- Existing normalizer repairs empty non-editor elements but not an empty editor root.
- `Editor.replace` mutates snapshot children without operations, so transaction normalization needs an explicit replace-root pass.

## Changeset

Published package code under `packages/` changes. Add a changeset unless repo policy says this package path is exempt.

Added `.changeset/fix-empty-editor-root-normalization.md` for `slate`.

## Verification

- `bun test ./packages/slate/test/normalization-contract.ts` passed.
- `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100 bun playwright test playwright/integration/examples/yjs-collaboration.test.ts -g "keeps peers usable"` passed across Chromium, Firefox, mobile, and WebKit.
- `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100 bun run playwright -- --project=chromium playwright/integration/examples/yjs-collaboration.test.ts` passed with one existing flaky retry in the mixed mark/text insertion case.
- `bun --filter slate typecheck` passed.
- `bun lint:fix` passed with no fixes applied.
- dev-browser 9222 manual replay passed: Cmd+A Backspace produced one empty paragraph per peer, clicking A and pressing Cmd+Z restored `Hello world!` on all peers with no page errors.
- Captured the learning in `docs/solutions/runtime-errors/slate-empty-root-normalization-2026-05-27.md`.

## Follow-up: placeholder/focus polish

- User reported Cmd+A Backspace looked like it lost focus and the placeholder moved to a strange position.
- dev-browser showed focus and selection stayed in the editor, but the placeholder was positioned against the editor root instead of the empty paragraph:
  - `topDelta: 8`
  - `widthDelta: 24`
- The deltas matched the editor padding (`8px 12px 18px`).
- Fixed the Yjs example `renderElement` output so rendered block elements are positioned containers for the placeholder.
- Extended the Cmd+A deletion e2e case to assert focus remains in the editor and the placeholder aligns with the empty paragraph.
- Verification:
  - Red test reproduced the bad deltas before the fix.
  - `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100 bun run playwright -- --project=chromium playwright/integration/examples/yjs-collaboration.test.ts -g "keeps peers usable"` passed.
  - `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100 bun run playwright -- playwright/integration/examples/yjs-collaboration.test.ts -g "keeps peers usable"` passed across Chromium, Firefox, mobile, and WebKit.
  - dev-browser 9222 replay showed focus true, paragraph/placeholder deltas all `0`, and no page errors.
  - `bun typecheck:site` passed.
  - `bun --filter slate typecheck` passed.
  - `bun lint:fix` passed with no fixes applied.

## Follow-up: single-line focus loss

- User reported multi-paragraph Cmd+A Backspace kept focus, while single-line
  Cmd+A Backspace lost usable focus.
- Video transcript helper was unavailable because no `GEMINI_API_KEY` or
  `GOOGLE_API_KEY` was configured, so frames and browser replay were used.
- Chromium did not expose the failure consistently after the placeholder fix.
- Firefox/WebKit reproduced the real failure:
  - `document.activeElement` stayed on the editor.
  - `getSelection().rangeCount` became `0` after Backspace.
  - Continuing to type no-oped.
- The same failure reproduced in `custom-placeholder`, so the bug is
  `slate-react`, not Yjs.
- Root cause: `applyFullBlockDeleteFragment` removed the fully selected final
  block and relied on root normalization to insert an empty paragraph, but did
  not restore a collapsed model selection into that normalized block.
- Fix: after deleting all top-level root blocks, set selection to `[0, 0]:0`.
  Do not insert a second paragraph here; the core root normalizer already owns
  the empty-root repair.
- Added a `slate-react` changeset:
  `.changeset/fix-single-line-select-all-focus.md`.
- Verification:
  - Red: `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100 bun run playwright -- --project=firefox playwright/integration/examples/yjs-collaboration.test.ts -g "single-line select-all"` failed with peer text stuck at `Write...`.
  - Green: same Firefox focused test passed.
  - Cross-browser: `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100 bun run playwright -- playwright/integration/examples/yjs-collaboration.test.ts -g "selecting all|single-line select-all"` passed, 8/8.
  - dev-browser 9222 replay passed: after Backspace `rangeCount=1`, focus stayed active, typing `2` synced to all four peers.
  - `bun --filter slate-react typecheck` passed.
  - `bun typecheck:site` passed.
  - `bun test ./packages/slate/test/normalization-contract.ts` passed, 15/15.
  - `bun --filter slate typecheck` passed.
  - `bun lint:fix` passed; first run formatted one file, final rerun applied no fixes.
