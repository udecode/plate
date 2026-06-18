# Yjs Demo Four Editors And Marks

Date: 2026-05-25
Status: complete

## Target

- Render the `yjs-collaboration` example as a four-editor collaboration demo.
- Match the referenced feel: compact two-column editor cards, editor title, online/offline button, remove button, inline mark toolbar, white editing surface.
- Show offline editors with a red/pink card background.
- Add mark buttons for bold, italic, underline, code, heading one, heading two, quote, ordered list, unordered list, and link-like control.
- Preserve existing collaboration controls needed by tests: append, select, replace, undo, redo, reconcile.
- Keep browser coverage for collaboration behavior and add coverage for the new UI shape and mark sync.

## Progress

- Loaded relevant skills and existing Yjs solution notes.
- Inspected the current two-peer `yjs-collaboration` example and Playwright coverage.
- Reworked the example into four data-driven peers.
- Added inline mark/block toolbar controls and red offline card styling.
- Added Playwright coverage for four editors, offline red panels, and mark sync.
- Kept existing collaboration simulation controls testable.
- Restored visible bottom diagnostics for user/client, net/yjs state, counts, and cursors.

## Verification

- Passed: `bun lint:fix`.
- Passed: `bun check`.
- Passed: `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/yjs-collaboration.test.ts --project=chromium` (15 tests).
- Passed: `dev-browser --connect http://127.0.0.1:9222` visual check. Screenshot: `/Users/felixfeng/.dev-browser/tmp/yjs-four-editors-users.png`.

## Follow-Up: Multi-Editor Focus Scope

- Reproduced: after B/C/D go offline, clicking C moved focus to A and clicking D moved focus to B.
- Root cause: Slate React model-to-DOM selection export could write a stale selection into the document while the browser selection belonged to another `[data-slate-editor]`.
- Fixed: both `syncEditableDOMSelectionToEditor` and `useEditableSelectionReconciler` skip selection export when the current DOM selection is inside another Slate editor root.
- Added Playwright coverage: `keeps offline editor focus scoped to the clicked editor`.
- Passed: `bun check`.
- Passed: `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/yjs-collaboration.test.ts --project=chromium` (16 tests).
- Passed: `dev-browser --connect http://127.0.0.1:9222` repro path; A/B/C/D active selection stayed in the clicked surface.
