# Plite Document State Example Usability

status: done
created: 2026-05-20
completion_id: 019e3627-238b-7993-a8cf-26be45504c47
scope: apps/www/src/app/(app)/examples/plite/_examples/document-state.tsx

## Goal

Fix the Document State example so the body editor is plainly editable by mouse,
and title-field typing never steals selection or focus back to the editor.

## Reported Bug

- The main editor cannot be clicked reliably enough to edit it.
- Repro path: select main editor, select title, type in title, select editor
  again, type. The editor selection/focus behavior is wrong.
- Playwright coverage should use real page interactions, not only the editor
  harness selection helper.

## Current Finding

- Existing `document-state` Playwright coverage inserts body text only after
  `editor.selection.select(...)`, so it can pass while mouse editing is broken.
- Prior Plite browser learnings warn that model selection helpers are not enough
  evidence for browser-owned text input and selection behavior.
- A normal wrapper around the styled `<Editable>` intercepted clicks because the
  Plite root carries default `z-index: -1`; the example needs a non-intercepting
  wrapper and `style={{ zIndex: 0 }}` on the styled root.
- `useSetStateField` state writes used default selection side effects, and
  `selection.dom: 'preserve'` was not honored by the React selection bridge.

## Plan

1. done: Add a failing Playwright interaction row for click body -> type -> click
   title -> type -> click body -> type.
2. done: Fix the owning layer: example layout if the click target is bad, React state
   field setter/update options if state writes steal editor focus.
3. done: Verify with focused Playwright, site/root typecheck as needed, lint fix, and
   a real browser interaction pass.

## Verification

- pass: `PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/document-state.test.ts --project=chromium`
- pass: `bun test ./packages/plite-react/test/selection-side-effect-policy-contract.ts`
- pass: `bun --filter plite-react typecheck`
- pass: `bun typecheck:site`
- pass: `bun typecheck:root`
- pass: `bun lint:fix`
- pass: `dev-browser --connect http://127.0.0.1:9222` on `http://localhost:3100/examples/document-state`
  with click editor -> type, click title -> type, click editor -> type.
  Screenshot: `/Users/zbeyens/.dev-browser/tmp/plite-document-state-usability.png`
- recorded: `docs/solutions/ui-bugs/2026-05-20-slate-react-state-field-setters-must-preserve-external-focus.md`
