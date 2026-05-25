---
title: Async decorate refresh must export DOM selection after projection changes
date: 2026-05-23
last_updated: 2026-05-23
category: docs/solutions/logic-errors
module: Slate React runtime
problem_type: logic_error
component: frontend_stimulus
symptoms:
  - Async `Editable.decorate` updates visually highlight the new text but leave the browser caret behind.
  - Slate model selection can be correct while the DOM caret remains at the old decorated boundary.
  - Browser proof fails only after delayed decoration restructuring, not immediately after typing.
root_cause: async_timing
resolution_type: code_fix
severity: high
tags: [slate-v2, slate-react, decorate, projection, selection, browser-proof]
---

# Async decorate refresh must export DOM selection after projection changes

## Problem

`Editable.decorate` can change from an async React state update after the user
types. The decoration refresh splits and wraps text DOM without creating a Slate
editor commit, so the normal commit-driven selection export does not run.

## Symptoms

- The exact #5987 proof typed ` there` at the end of
  `This is some text here about. there`.
- The delayed highlight appeared correctly.
- Slate selection stayed at offset `41`, but the browser DOM caret stayed at
  offset `35`.

## What Didn't Work

- Projection-source stability alone was not enough. The text was rendered
  correctly, but the browser caret still followed the old DOM boundary.
- Checking only Slate model selection was a fake green. The model selection was
  already correct while the real caret was wrong.

## Solution

Projection refresh now reports whether rendered projection buckets changed. The
editable runtime subscribes once to those refresh results and requests a render
repair when a non-editor projection refresh changes rendered text:

```ts
return projectionStore.subscribeProjectionRefresh((result) => {
  if (!result.requiresDOMSelectionExport) return

  requestEditableRepair({
    forceRender: true,
    kind: 'force-render',
    selectionSourceTransition: {
      preferModelSelection: true,
      reason: 'projection-refresh',
      selectionSource: 'model-owned',
    },
  })
})
```

The regression lives in the browser suite, not a model-only unit test:

```ts
await page.keyboard.type(' there')
await expect(page.locator('[data-cy="async-decoration-highlight"]')).toHaveCount(3)
await editor.assert.selection({
  anchor: { path: [0, 0], offset: 41 },
  focus: { path: [0, 0], offset: 41 },
})
await expect
  .poll(() => getDOMCaretOffsetInFirstText(editor.root))
  .toEqual({
    offset: 41,
    text: 'This is some text here about. there there',
  })
```

## Why This Works

Text projection subscribers update when the decoration source refreshes, but no
Slate commit fires because the document did not change. A projection refresh
result gives the editable runtime an explicit signal that rendered text changed
without an editor commit, so the DOM-selection export path can run after React
commits the new highlighted text structure.

This matches the upstream root cause: decoration DOM restructuring and
selection restoration must be part of the same repair window.

## Prevention

- For decoration or projection bugs, assert both Slate selection and browser DOM
  caret position.
- If a projection refresh changes rendered text without an editor commit,
  the projection store should report that change and editable should own the DOM
  selection export.
- Do not call force-render from decoration adapters. Adapters should refresh
  sources; editable owns repair timing.
- Keep exact browser rows for async UI state changes that rewrite text DOM.

## Related Issues

- Slate issue #5987: caret jumps when `decorate` changes from async state.
- Slate PR #6033: upstream fix for the same decorate/caret failure.
- [Projected segment focus should not clobber the browser caret](./2026-04-15-projected-segment-focus-should-not-clobber-dom-caret.md)
- [Annotation store inputs must keep stable data references](./2026-04-15-annotation-store-inputs-must-keep-stable-data-references.md)
- [EditableBlocks app-owned surfaces must not churn runtime ids or miss plain-editor updates](./2026-04-20-editable-blocks-app-owned-surfaces-must-not-churn-runtime-ids-or-miss-plain-editor-updates.md)
