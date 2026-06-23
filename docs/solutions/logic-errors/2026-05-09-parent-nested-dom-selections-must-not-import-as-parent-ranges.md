---
title: Parent nested DOM selections must not import as parent ranges
date: 2026-05-09
category: docs/solutions/logic-errors
module: Plite nested editor selection runtime
problem_type: logic_error
component: testing_framework
symptoms:
  - "A DOM selection from the parent editor into a nested editor overwrote parent text on the next typed character."
  - "The selectionchange path looked guarded, but beforeinput target-range import still used the invalid DOM selection."
root_cause: logic_error
resolution_type: code_fix
severity: high
tags: [plite, nested-editors, selection, beforeinput, lexical-harvest]
---

# Parent nested DOM selections must not import as parent ranges

## Problem

Lexical regression 7635 pushed Plite's editable-void coverage from plain nested
editing into rich paste inside a nested editor. The new browser row exposed an
adjacent parent/nested selection bug: a DOM range starting in the parent editor
and ending in the nested editor could overwrite parent content on the next
typed character.

## Symptoms

- The nested rich HTML paste proof first failed because formatting was dropped.
- After rich paste support was added, the full editable-voids browser file
  failed in the existing parent-to-nested selection row.
- The parent editor text became `Outer u`, proving typed text replaced a parent
  range derived from an invalid cross-editor DOM selection.

## What Didn't Work

- Guarding only the `selectionchange` import path. Browser `beforeinput`
  supplies target ranges, and those can still overwrite model selection if they
  are accepted while the live DOM selection crosses editor ownership.
- Checking only that a focus endpoint is somewhere under the parent editor. A
  nested editor is physically inside the parent void DOM, but it is not a
  selectable endpoint for the parent editor.
- Treating this as a test-order issue. The failure reproduced isolated.

## Solution

Require both DOM selection endpoints to belong to the current editor's
selectable surface before importing either the live DOM selection or a
`beforeinput` target range.

The runtime changes:

- `selection-controller.ts` uses `ReactEditor.hasSelectableTarget` for both
  anchor and focus endpoints.
- `selection-reconciler.ts` skips beforeinput target-range import when the live
  DOM selection crosses out of the current editor.
- Target range endpoints are also checked with `hasSelectableTarget`.

Verification:

```bash
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/editable-voids.test.ts --project=chromium -g "parent selection that crosses|rich HTML inside nested editor"
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/editable-voids.test.ts --project=chromium
bun run lint:fix && bun check
```

## Why This Works

Nested editors live under the parent editor's DOM, but they have their own
`data-plite-editor` root and selection ownership. `hasSelectableTarget` preserves
valid parent selections, including non-readonly void targets, while rejecting
endpoints owned by a nested editor.

Checking the live DOM selection before trusting `beforeinput` target ranges is
the key part. Otherwise the browser can provide a target range that looks
locally resolvable after an invalid cross-editor selection has already been
created.

## Prevention

- For nested editor rows, pair the happy path with a parent-to-nested selection
  guard.
- Do not rely on `selectionchange` proof alone when `beforeinput` can import
  target ranges.
- Prefer `hasSelectableTarget` for both endpoints when deciding whether a DOM
  range belongs to the current editor.
- Assert parent value isolation and parent selection restoration after nested
  editor interactions.

## Related Issues

- [HTML clipboard fallback must not inherit selected inline text](./2026-05-09-html-clipboard-fallback-must-not-inherit-selected-inline-text.md)
- [Clipboard fragment format keys must guard HTML fallback](./2026-05-04-clipboard-fragment-format-keys-must-guard-html-fallback.md)
