# Plite Document State Undo Selection Bug

status: done
created: 2026-05-20
completion_id: 019e3627-238b-7993-a8cf-26be45504c47
scope: apps/www/src/app/(app)/examples/plite/_examples/document-state.tsx, packages/plite-react/src/editable

## Goal

Fix the Document State example crash where undo from the external title input
tries to focus the Plite editor and exhausts pending-operation retries.

## Video Evidence

```xml
<video-transcripts>
<video-transcript title="Document State undo selection bug">
[00:00] (The application displays a "Q2 Planning Brief" document title field and a Plite editor content area.)
[00:01] (The user clicks into the "Q2 Planning Brief" title field.)
[00:02] (The user types the letter "p" at the end of the title.)
[00:03] (The title field now displays "Q2 Planning Briefp".)
[00:04] (The user presses Command + Z to undo the title change.)
[00:05] (The application triggers an error state.)
[00:06] (The screen transitions to a browser error page showing "Could not focus, editor seems stuck with pending operations".)
[00:07] (The error log highlights the file "plite-dom/src/plugin/dom-editor.ts" at line 826.)
[00:08] (The error message indicates that retries are exhausted while the editor is focused.)
[00:09] (The user presses Command + Shift + Z to attempt a redo operation.)
</video-transcript>
</video-transcripts>
```

## Current Finding

- The prior history repair learning is valid for editor-owned contenteditable
  and native controls embedded inside editable voids.
- The Document State title input is outside the editable root and writes a state
  field; its keyboard undo should not request Plite editor focus repair.
- The visible crash points at `DOMEditor.focus`, so the likely bug is event or
  history ownership leaking from an external app input into model-owned repair.
- Follow-up: keyboard undo followed by keyboard redo in the title still throws
  `Could not set focus, editor seems stuck with pending operations` in the
  user's Next/Turbopack dev surface.

## Plan

1. done: Add a focused Playwright regression for title type -> undo ->
   no crash and title focus remains external.
2. done: Trace which Plite handler handles the external undo event.
3. done: Fix the ownership boundary at the shared React input/history layer.
4. done: Verify focused Playwright, package/site typecheck, lint, and real
   browser interaction proof.
5. done: Reproduce and fix the title input undo -> redo keyboard cycle.
6. done: Fix the remaining title-input shortcut focus steal reported by
   the user after undo/redo in the title field.
7. done: Reproduce and fix repeated title-input undo crossing from
   title-only state history into prior editor-content history without editor
   DOM focus stealing the cursor.

## Verification

- pass: `bun test ./packages/plite-history/test/document-state-history-contract.ts`
- pass: `PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/document-state.test.ts --project=chromium`
- pass: `bun --filter plite-history typecheck`
- pass: `bun typecheck:site`
- pass: `bun typecheck:root`
- pass: `bun lint:fix`
- pass: RED then GREEN
  `PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/document-state.test.ts --project=chromium --grep "repeated undo"`
  proving second undo from the title input removes the editor `p` while keeping
  title focus.
- pass: `PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/document-state.test.ts --project=chromium`
- pass: `bun typecheck:site`
- pass: `bun typecheck:root`
- pass: `bun test ./packages/plite-history/test/document-state-history-contract.ts`
- pass: `bun test ./packages/plite-dom/test/dom-coverage.ts --bail 1`
- pass: `bun lint:fix`
- pass: `dev-browser --connect http://127.0.0.1:9222` on
  `http://localhost:3100/examples/document-state` with editor type -> title
  type -> keyboard undo -> keyboard undo. After second undo:
  `activeLabel:"Document title"`, `editorFocused:false`,
  `commit:"commit:5;ops:remove_text;state:none;tags:historic"`,
  model/DOM text no longer contain `nodes.p`, `overlayText:null`,
  `pageErrors:[]`. Screenshot:
  `/Users/zbeyens/.dev-browser/tmp/document-state-title-repeated-undo-fixed.png`
- pass: `dev-browser --connect http://127.0.0.1:9222` on `http://localhost:3100/examples/document-state`
  with editor type -> title type -> Undo document change. Screenshot:
  `/Users/zbeyens/.dev-browser/tmp/document-state-undo-fixed.png`
- pass: `bun test ./packages/plite-dom/test/dom-coverage.ts --bail 1`
- pass: `PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/document-state.test.ts --project=chromium --grep "undo redo"`
- pass: `PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/document-state.test.ts --project=chromium`
- pass: `bun --filter plite-dom typecheck`
- pass: `bun --filter plite-history typecheck`
- pass: `bun typecheck:site`
- pass: `bun typecheck:root`
- pass: `bun lint:fix`
- pass: `dev-browser --connect http://127.0.0.1:9222` with editor type ->
  title type -> keyboard undo -> keyboard redo. Screenshot:
  `/Users/zbeyens/.dev-browser/tmp/document-state-title-undo-redo-fixed.png`
- pass: active title input -> undo/redo keeps the title input focused in the
  live Next/Turbopack dev surface and uses `tags:historic`. Screenshot:
  `/Users/zbeyens/.dev-browser/tmp/document-state-title-shortcut-owned-history.png`
- pass: `PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/document-state.test.ts --project=chromium`
- pass: `bun test ./packages/plite-dom/test/dom-coverage.ts --bail 1`
- pass: `bun test ./packages/plite-history/test/document-state-history-contract.ts`
- pass: `bun typecheck:site`
- pass: `bun typecheck:root`
- pass: `bun lint:fix`
