# Slate v2 Mobile Example Proof Fix

## Goal

Make the `document-state` and `multi-root-document` mobile example proofs pass
without weakening the architecture claim.

## Current Evidence

- `document-state` mobile rows fail because raw `click()` into inputs and
  wrapped editor text places the caret in mobile-specific positions.
- `multi-root-document` mobile rows fail because raw clicks can hit mobile
  chrome/status controls instead of the intended root, and clipboard API
  permissions differ from desktop Chromium.
- The existing Slate browser harness already exposes semantic focus, selection,
  text insertion, and paste helpers. Use those for deterministic mobile proof.

## Decisions

- Keep real browser coverage.
- Do not call a semantic-handle row native mobile text transport.
- Prefer root/editor handles for deterministic model selection and root-local
  paste behavior.
- Keep raw pointer rows only where the claim is specifically pointer activation.
- Fix library/runtime code only if deterministic proof still exposes a runtime
  bug after test transport is honest.

## Plan

1. Add local Playwright helpers for append-to-input and deterministic Slate
   selection/text insertion.
2. Convert mobile-unstable raw clicks in `document-state` to explicit editor
   selections.
3. Convert mobile-unstable multi-root root activation rows to stable root chrome
   or semantic root handles.
4. Use the existing clipboard helper for root-local paste instead of privileged
   `navigator.clipboard.writeText` in mobile.
5. Rerun focused mobile specs against fresh static output.

## Verification

- `bun build:next`
- `PORT=3123 bun serve:playwright`
- `PLAYWRIGHT_BASE_URL=http://localhost:3123 PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/document-state.test.ts playwright/integration/examples/multi-root-document.test.ts --project=mobile --workers=1`
- Focused Chromium rerun for the same specs if mobile passes.

## Result

- `document-state` mobile rows use deterministic editor selection for editor
  mutations and explicit input caret placement for title edits.
- `multi-root-document` keeps native pointer proof isolated, while root-editing
  rows use `SlateBrowserEditorHarness.rootAt(...)` for deterministic mobile
  semantic transport without reaching into browser-handle internals.
- Mobile gets clipboard permission parity with Chromium; the root-local paste row
  uses handle-backed clipboard ingress to avoid claiming native mobile clipboard
  transport.

Verified:

- `bun build:next`
- `PLAYWRIGHT_BASE_URL=http://localhost:3123 PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/document-state.test.ts playwright/integration/examples/multi-root-document.test.ts --project=mobile --workers=1`
- `PLAYWRIGHT_BASE_URL=http://localhost:3123 PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/document-state.test.ts playwright/integration/examples/multi-root-document.test.ts --project=chromium --workers=1`
- `bun lint:fix`
- `bun --filter slate-browser build`
- `bun --filter slate-browser typecheck`
- `bun typecheck:root`
- `docs/solutions/test-failures/2026-05-23-slate-v2-mobile-example-proofs-must-separate-native-pointer-from-semantic-editing.md`
  captures the reusable mobile proof rule.
