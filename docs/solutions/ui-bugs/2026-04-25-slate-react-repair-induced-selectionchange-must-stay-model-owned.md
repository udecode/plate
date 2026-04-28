---
title: Slate React repair-induced selectionchange must stay model-owned
date: 2026-04-25
category: docs/solutions/ui-bugs
module: slate-v2 slate-react browser editing
problem_type: ui_bug
component: tooling
symptoms:
  - Repeated native word-delete could leave the visible caret and editor model in different authority modes
  - Repair-induced selectionchange trace entries reported dom-current after a model-owned delete repair
  - Broadly blocking native selectionchange broke toolbar selection and paste paths
root_cause: async_timing
resolution_type: code_fix
severity: high
tags: [slate-v2, slate-react, selectionchange, caret, beforeinput, word-delete, model-owned]
---

# Slate React repair-induced selectionchange must stay model-owned

## Problem

After Slate handles a destructive browser edit as model-owned, the DOM repair
it schedules can itself trigger `selectionchange`. If that repair-induced
`selectionchange` re-enters the pipeline as `dom-current`, a delayed browser
selection can reopen DOM authority after the model mutation is already correct.

## Symptoms

- Repeated `Alt+Backspace` in `/examples/richtext` could produce screenshot-class
  drift where visual text/caret state no longer matched the intended model lane.
- Headless Playwright did not always reproduce the exact visual split, but the
  kernel trace showed the authority leak: repair-induced `selectionchange`
  events reported `selectionSource: dom-current`.
- Follow-up typing was the necessary proof: final text alone could look correct
  while the next input still used stale selection authority.

## What Didn't Work

- Reproducing only the screenshot was not reliable enough. The deterministic
  RED was the trace invariant: repair-induced selection changes after
  model-owned destructive edits must remain model-owned.
- Blocking all native `selectionchange` imports while model selection was
  preferred was too blunt. It fixed the word-delete row but broke legitimate
  DOM selection import for toolbar commands and paste.
- Model-only assertions missed the bug class because the model mutation could be
  correct while the visible browser caret and next-event selection source were
  wrong.

## Solution

Treat destructive model-owned `beforeinput` repairs as model-owned all the way
through the repair-induced `selectionchange` event:

```ts
repair: {
  focus: true,
  kind: 'repair-caret',
  selectionSourceTransition: {
    preferModelSelection: true,
    reason: 'model-command',
    selectionSource: 'model-owned',
  },
}
```

Then, when `selectionchange` is known to be repair-induced, canonicalize the
editable selection preference before tracing or importing:

```ts
if (selectionChangeOrigin === 'repair-induced') {
  setEditableModelSelectionPreference({
    preferModelSelection: true,
    selectionSource: 'model-owned',
  })
}
```

Finally, clear only the transient repair origin after that repair event. Keep
model preference/source active, but allow later explicit user DOM selection to
import normally.

## Why This Works

The repair event is not a fresh user intent. It is a consequence of a
model-owned mutation. Letting it report as `dom-current` creates two competing
selection authorities inside one native action.

The narrow rule keeps the right split:

- repair-induced `selectionchange` stays model-owned
- later real user selection can still import from DOM
- toolbar and paste flows are not broken by a global model-preference guard

## Prevention

- Add browser rows for destructive native edits that assert model text, visible
  DOM text, DOM selection containment, follow-up typing, and trace source.
- Trace repair-induced `selectionchange` separately from native user
  `selectionchange`.
- Do not accept broad "ignore DOM selection" fixes unless toolbar selection and
  paste rows stay green.
- Build generated gauntlets around authority invariants, not only final text.

## Related Issues

- [Slate React model-owned input must ignore stale DOM target ranges](./2026-04-21-slate-react-model-owned-input-must-ignore-stale-dom-target-ranges.md)
- [Slate React keydown must import DOM selection before model-owned navigation](./2026-04-22-slate-react-keydown-must-import-dom-selection-before-model-owned-navigation.md)
- [Slate React model-owned insert must repair the DOM caret](../logic-errors/2026-04-22-slate-react-model-owned-insert-must-repair-dom-caret.md)
