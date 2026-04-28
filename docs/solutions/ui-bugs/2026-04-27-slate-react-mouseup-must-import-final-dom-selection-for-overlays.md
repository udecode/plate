---
title: Slate React mouseup must import final DOM selection for overlays
date: 2026-04-27
category: docs/solutions/ui-bugs
module: slate-v2 slate-react browser editing
problem_type: ui_bug
component: tooling
symptoms:
  - Hovering toolbar stayed hidden after real mouse selection in /examples/hovering-toolbar.
  - Browser DOM selection contained selected text while Slate model selection stayed collapsed.
  - Existing green coverage used programmatic selectText instead of a real mouse drag.
root_cause: async_timing
resolution_type: code_fix
severity: high
tags: [slate-v2, slate-react, mouse-selection, selectionchange, hovering-toolbar, slate-browser]
---

# Slate React mouseup must import final DOM selection for overlays

## Problem

`/examples/hovering-toolbar` could fail to show the toolbar after selecting
text with a real mouse drag. Programmatic selection stayed green, so the
coverage missed the user path.

## Symptoms

- `window.getSelection()?.toString()` returned selected text after the drag.
- `__slateBrowserHandle.getSelection()` stayed collapsed at the drag start in
  headless Chromium.
- The toolbar kept inline/default `opacity: 0` and `top/left: -10000px`.
- The old test even contained `page.pause()` and only used `selectText()`.

## What Didn't Work

- Reading `editor.getSelection()` inside the toolbar effect. That still relies
  on some other render to happen.
- Only switching the toolbar from `useSlate()` to `useSlateSelection()`. That
  is the correct React subscription, but it exposes the deeper issue: Slate had
  not imported the final expanded mouse selection into the model.
- Trusting the default Playwright server for stress proof. A reused `3101`
  server can be stale; pin stress proof to the known current server when
  investigating a live dev fix.

## Solution

Make selection-owned UI subscribe to the explicit selection selector:

```ts
const editor = useSlateStatic<CustomEditor>()
const selection = useSlateSelection()

useEffect(() => {
  if (!selection || Range.isCollapsed(selection)) {
    el.removeAttribute('style')
    return
  }
}, [editor, inFocus, selection])
```

Then import the final DOM selection on editor `mouseup` for non-internal
targets:

```ts
const handleMouseUp = useCallback(
  (event: React.MouseEvent<HTMLDivElement>) => {
    if (isInteractiveInternalTarget(editor, event.target)) {
      attributes.onMouseUp?.(event)
      return
    }

    const handled =
      (attributes.onMouseUp?.(event) as boolean | void) ??
      event.defaultPrevented

    if (!handled) {
      syncEditorSelectionFromDOM({ editor, inputController })
    }
  },
  [attributes.onMouseUp, editor, inputController]
)
```

Finally, add a real mouse-drag browser regression that asserts both DOM and
model selection:

```ts
await selectTextWithMouse(page.locator('span[data-slate-string="true"]').first())
await expect
  .poll(() => page.evaluate(() => window.getSelection()?.toString() ?? ''))
  .not.toBe('')
await expect.poll(() => hasExpandedModelSelection(page)).toBe(true)
await expect(page.getByTestId('menu')).toHaveCSS('opacity', '1')
```

## Why This Works

Chromium can leave the throttled `selectionchange` pipeline with a collapsed
intermediate selection during drag. The DOM selection becomes expanded by the
time `mouseup` fires, but no final import is guaranteed.

`mouseup` is the last native event in the drag-selection user action, so it is
the right point to reconcile current DOM selection into Slate model selection.
The internal-target guard keeps buttons, inputs, and other app-owned controls
from being pulled into editor selection import.

The toolbar also needs selector discipline: overlay visibility is selection
state, so React should subscribe to `useSlateSelection()` and keep the editor
object from `useSlateStatic()`.

## Prevention

- Browser tests for selection-owned UI must include at least one real mouse
  drag, not only `locator.selectText()` or model-handle selection.
- Assert model selection is expanded when the product behavior depends on Slate
  selection, not only when DOM text is highlighted.
- Keep selector-owned React UI on `useSlateSelector` or `useSlateSelection`.
  `useSlate()` is too broad for React performance and too vague for ownership.
- Run opt-in stress proof against the server that actually contains the current
  code. Use `PLAYWRIGHT_BASE_URL=http://localhost:3100 bun test:stress` when
  the dev server is the truth.

## Related Issues

- [Slate React keydown must import DOM selection before model-owned navigation](./2026-04-22-slate-react-keydown-must-import-dom-selection-before-model-owned-navigation.md)
- [Slate React repair-induced selectionchange must stay model-owned](./2026-04-25-slate-react-repair-induced-selectionchange-must-stay-model-owned.md)
- [Slate browser proof must separate model-owned handles, root selection, and usable focus](../logic-errors/2026-04-24-slate-browser-proof-must-separate-model-owned-handles-root-selection-and-usable-focus.md)
- [Slate browser selectionchange proof must separate traceability from programmatic import](../test-failures/2026-04-22-slate-browser-selectionchange-proof-must-separate-traceability-from-programmatic-import.md)
