---
title: Slate React selection export listeners must skip DOM-owned selection
date: 2026-04-27
category: docs/solutions/ui-bugs
module: slate-v2 slate-react browser editing
problem_type: ui_bug
component: tooling
symptoms:
  - App-owned scrollSelectionIntoView did not fire after programmatic editor.select.
  - A direct selection export listener fixed programmatic selection but flattened real mouse selection.
  - Hovering toolbar mouse-drag proof timed out because window selection stayed empty.
root_cause: logic_error
resolution_type: code_fix
severity: high
tags: [slate-v2, slate-react, selection, dom-selection, hovering-toolbar, app-owned]
---

# Slate React selection export listeners must skip DOM-owned selection

## Problem

After moving a hot descendant binding to runtime-id selector hooks,
programmatic/app-owned selection needed a direct DOM export path that did not
bring back editable-root rerenders. The first direct listener was too broad and
overwrote native mouse selection during `/examples/hovering-toolbar`.

## Symptoms

- `Editable forwards scrollSelectionIntoView to app-owned code` returned `[]`
  instead of the selected DOM text.
- Adding a selection-only listener made that unit row green, but the real
  mouse toolbar canary failed because `window.getSelection()?.toString()`
  stayed empty.
- The failure was not visible in programmatic `selectText()` coverage; it only
  appeared on real mouse drag.

## What Didn't Work

- Re-enabling editable-root rerenders for every `set_selection`. That would
  hide the bug by waking React broadly and violate the Phase 3 render budget.
- Exporting model selection to the DOM on every selection-only commit. That
  steals authority from native mouse drag and collapses the browser-owned
  selection path.
- Trusting the app-owned unit row alone. It proved programmatic export, not
  native selection ownership.

## Solution

Subscribe to selection-only commits from the selector runtime, but export to
the DOM only when the current selection is not DOM-owned:

```ts
const { addEventListener: addSelectorEventListener } =
  useContext(SlateSelectorContext)

useIsomorphicLayoutEffect(() => {
  return addSelectorEventListener(
    () => {
      if (
        inputController.state.selectionChangeOrigin === 'native-user' ||
        inputController.state.selectionSource === 'dom-current'
      ) {
        return
      }

      syncDOMSelectionToEditor()
    },
    {
      shouldUpdate: (_operations, commit) =>
        Boolean(commit?.selectionChanged && !commit.childrenChanged),
    }
  )
}, [addSelectorEventListener, inputController, syncDOMSelectionToEditor])
```

Keep the proof pair together:

```bash
bun --filter slate-react test:vitest -- app-owned-customization -t "scrollSelectionIntoView"

PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 \
  bunx playwright test playwright/integration/examples/hovering-toolbar.test.ts \
  -g "real mouse selection" --project=chromium --reporter=line
```

## Why This Works

Selection export has two different owners:

- programmatic/app-owned model selection should push the model range into DOM
- native mouse selection should remain DOM-owned and import into the model

The listener is useful only for the first case. During native drag selection,
the selection controller marks the state as `dom-current` / `native-user`;
exporting back to DOM at that point fights the browser and breaks overlays.

The final guard keeps the selector-runtime listener narrow: it handles
selection-only model changes without broad React rerender, while letting real
mouse selection complete in the browser.

## Prevention

- Any direct model-to-DOM selection export listener needs a paired native mouse
  selection canary.
- Do not accept a programmatic selection test as proof for selection-owned UI.
  Include a real mouse drag that asserts DOM selection, model selection, and
  overlay visibility.
- Treat `dom-current` and `native-user` as hard stops for model export unless a
  specific repair path says otherwise.
- Keep app/programmatic selection forwarding and native selection ownership in
  the same test group when changing `EditableDOMRoot`.

## Related Issues

- [Slate React mouseup must import final DOM selection for overlays](./2026-04-27-slate-react-mouseup-must-import-final-dom-selection-for-overlays.md)
- [Slate React repair-induced selectionchange must stay model-owned](./2026-04-25-slate-react-repair-induced-selectionchange-must-stay-model-owned.md)
- [EditableBlocks app-owned surfaces must not churn runtime ids or miss plain-editor updates](../logic-errors/2026-04-20-editable-blocks-app-owned-surfaces-must-not-churn-runtime-ids-or-miss-plain-editor-updates.md)
