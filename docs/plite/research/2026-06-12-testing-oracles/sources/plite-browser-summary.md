# Plite Browser Source Summary

## Files Read

- `.tmp/plite/packages/plite-browser/src/core/first-party-browser-contracts.ts`
- `.tmp/plite/packages/plite-browser/src/playwright/index.ts`
- `.tmp/plite/packages/plite-browser/src/playwright/ime.ts`
- `.tmp/plite/packages/plite-browser/test/core/scenario.test.ts`

## Relevant Existing Strength

- First-party operation registry already names inline voids, block voids,
  editable islands, table-cell navigation, external decorations, overlays,
  mouse selection, paste, and IME families.
- Selection harness exposes model selection, DOM selection, displayed
  native/view selection, selected text, DOM selection location, caret rects,
  and no-double-highlight assertion.
- Clipboard harness owns native clipboard, synthetic event payloads,
  DataTransfer paste, fallback insertion, and trace/model-selection checks.
- IME harness owns Chromium CDP native composition, synthetic composition,
  coarse-pointer semantic fallback, and direct insert text.
- Scenario runner owns trace snapshots, runtime-error checks, replay artifacts,
  reduction candidates, drag, paste, IME, undo, type, DOM selection, and
  selected text assertions.

## Closed Gap

Huge-document repeated vertical selection has strong route-local proof but no
first-party operation family. That makes future automation less likely to route
directly to the full assertion bundle.

The formatted-boundary IME proof is also now named as a first-party operation
family.

Rapid consecutive and cross-paragraph richtext IME now have a first-party
operation family backed by native Chromium proof and a synthetic transport
regression row.

Stepwise synthetic IME helpers now let tests hold composition open while app
state changes. Async decoration refresh during active composition has a
first-party operation family backed by prop and hook decoration proof.

The still-open IME research lead is overlap cancellation.
