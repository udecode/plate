---
title: Plite React IME replacement undo needs one atomic replacement
date: 2026-05-07
category: docs/solutions/ui-bugs
module: Plite slate-react composition runtime
problem_type: ui_bug
component: testing_framework
symptoms:
  - Splitting an IME replacement into model deletion and insertion creates two history boundaries.
  - Undo can remove only the inserted IME text without restoring the original selected content.
  - Publishing the deletion while Chromium owns the composition range can crash the page.
root_cause: logic_error
resolution_type: code_fix
severity: high
tags: [plite, slate-react, ime, composition, history, undo]
---

# Plite React IME replacement undo needs one atomic replacement

## Problem

IME replacement over an expanded selection is one user action. Deleting the
model selection on `compositionstart` and inserting the composed text later
splits that action across model publications. It also lets React reconcile DOM
nodes that Chromium still owns.

## Symptoms

- Replacing the selected `b` in `ab` with IME text produces `aす`.
- One undo must restore `ab` and the original expanded selection.
- Cross-node replacement must not remove native composition endpoints before
  Chromium releases them.

## What Didn't Work

- Pre-deleting the expanded selection at `compositionstart`. This invalidates
  the browser-owned range and creates a model commit before the replacement is
  ready.
- Tracking that deletion in an editor `WeakSet` and forcing the later insert to
  merge. This hides the history split without fixing the ownership split.
- Committing fallback text synchronously in `compositionend`. Blink may still
  own the composition DOM during the event stack and its microtask checkpoint.

## Solution

Keep the expanded model selection intact while native composition owns the DOM.
At `compositionend`, capture that selection, the pending composition text, and
the current model text. Schedule composition release and fallback work after the
native event stack.

The normal final input path replaces the captured selection in one transaction.
If Chromium omits usable final input, the deferred fallback performs the same
targeted replacement only when the model has not changed since
`compositionend`. DOM cleanup runs in the same owned deferred task.

The transaction records the original selection and the replacement together.
History receives one edit, so one undo restores both the selected content and
its selection without forced merge metadata.

## Why This Works

The browser can expose several composition events, but the model edit is still
one replacement. Preserving the target prevents React from deleting native DOM
endpoints. Deferring fallback arbitration lets final input win and prevents a
second insertion when the model already changed. One targeted transaction gives
history the correct before-selection, document replacement, and after-selection
without joining unrelated commits.

## Prevention

- Do not mutate the document during `compositionstart` or synchronously at
  `compositionend`.
- Preserve the expanded model target until final input or deferred fallback
  replaces it.
- Commit deletion, insertion, marks, and collapsed after-selection in one
  transaction.
- Keep deferred cleanup inside the composition DOM-mutation owner.
- Assert one undo restores both original text and the expanded selection.

## Verification

- `pnpm --filter @platejs/plite-react test -- composition-state-contract.test.ts input-history-contract.test.ts`
- `pnpm --filter plite test:plite-browser:chromium richtext.test.ts --grep "replaces multiple formatted text nodes with Korean IME composition"`

## Related Issues

- [Plite React IME formatted replacement needs deferred native cleanup](./2026-05-07-plite-react-ime-formatted-selection-needs-native-owned-cleanup.md)
- [Plite browser IME proof rows need honest DOM composition boundaries](../developer-experience/2026-05-07-plite-browser-ime-proof-rows-need-honest-dom-composition.md)
