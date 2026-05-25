# Slate v2 Focus History Policy Cleanup

## Goal

Make the current focus/history policy beta-clean:

- History control hooks name DOM focus behavior explicitly.
- Root chrome names selection placement explicitly.
- Root chrome `restore` restores the last known selection for that root.
- Existing mounted-root editor focus behavior stays intact.

## Plan

1. Add regression coverage for root chrome restoring an inactive root caret.
2. Rename public options:
   - `useSlateHistory({ focusPolicy })`
   - `useSlateRootChrome(root, { selection })`
3. Store last non-null selection per root in Slate React runtime context.
4. Use mounted root editors for DOM focus, and last per-root selection for chrome restore.
5. Run focused React tests, typechecks, lint, and browser example proof.

## Notes

- `docs/solutions/patterns/critical-patterns.md` is absent in this checkout.
- Relevant prior learnings:
  - `docs/solutions/ui-bugs/2026-05-23-slate-react-mounted-root-editor-focus-for-root-chrome-history.md`
  - `docs/solutions/ui-bugs/2026-05-21-slate-v2-multi-root-chrome-clicks-must-activate-root-before-focus.md`

## Result

- `useSlateHistory` uses `focusPolicy` for DOM focus behavior.
- `useSlateRootChrome` uses `selection` for root caret placement.
- Runtime context stores last known selection per root.
- Root chrome restores inactive root carets and leaves already-focused editable
  clicks native.
- History and root chrome share `focusSlateEditable`, which focuses the mounted
  editable element before asking Slate DOM focus to sync selection.

## Verification

- `bun --filter slate-react test:vitest -- ./test/use-slate-root-chrome.test.tsx ./test/use-slate-history.test.tsx`
- `bun --filter slate-react typecheck`
- `bun typecheck:site`
- `bun lint:fix`
- `bun build:next`
- `PLAYWRIGHT_BASE_URL=http://localhost:3123 PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/multi-root-document.test.ts --project=chromium --workers=1`
