---
title: Slate React scroll visibility must use post-update DOM ranges
date: 2026-05-11
last_updated: 2026-05-11
category: docs/solutions/logic-errors
module: Slate React
problem_type: logic_error
component: frontend_stimulus
symptoms:
  - "The first typed edit autoscrolled the caret back into view"
  - "After scrolling away and typing again, the editor did not autoscroll a second time"
  - "A green scroll helper test still missed the real scroll-away typing path"
root_cause: logic_error
resolution_type: code_fix
severity: high
tags: [slate-react, scrolling, caret, dom-range, contenteditable, beforeinput]
---

# Slate React scroll visibility must use post-update DOM ranges

## Problem

Repeated typing after manual scroll-away looked like a scroll helper bug, but
the durable failure was broader: Slate React could preserve stale
model-selection ownership after DOM repair/programmatic export, then skip the
live DOM caret path that native `insertText` needed.

The scroll helper also depended on `scroll-into-view-if-needed` by temporarily
overriding `getBoundingClientRect`, which made repeated caret visibility proof
fragile.

## Symptoms

- Typing while scrolled away from the caret autoscrolled once.
- Scrolling away again and typing without another click did not autoscroll.
- Browser proof passed when the test clicked again before the second type, but
  failed when it matched the reported user path.
- The original partial fix only restored DOM method state; it did not prove the
  selection and repair lifecycle that drives repeated native text input.

## What Didn't Work

- Treating this as only a scroll-container problem. The container could scroll;
  the runtime had to reveal the effective post-update caret range.
- Treating this as only a DOM method cleanup bug. Restoring temporary
  `getBoundingClientRect` mutation was correct, but too local.
- Re-clicking the target paragraph in the browser test before the second type.
  That bypassed the stale ownership path the user hit.
- Running the static example without rebuilding `slate-react` and `site/out`.
  The Playwright row can keep serving stale package output.

## Solution

Use a real user-path browser row:

```ts
await scrollBlockIntoView(editor, lastBlockIndex)
await clickTextBlock(editor, lastBlockIndex)

await scrollContainersAwayFromCaret(editor)
await page.keyboard.insertText(' first-scroll')
await expectCaretVisibleInScrollableParent(editor)

await scrollContainersAwayFromCaret(editor)
await page.keyboard.insertText(' second-scroll')
await expectCaretVisibleInScrollableParent(editor)
```

Then make Slate React ownership reasoned instead of a bare boolean. Native
`insertText` can ignore stale repair/programmatic model preference, while
explicit model-owned guards still hold:

```ts
export const isEditableModelSelectionPreferredForInput = ({
  inputController,
  inputType,
}: {
  inputController: EditableInputController
  inputType: string
}) => {
  if (!isEditableModelSelectionPreferred(inputController)) return false
  if (inputType !== 'insertText') return true

  const preference = inputController.state.modelSelectionPreference
  if (!preference?.preferModelSelection) return false

  return (
    inputController.state.isComposing ||
    preference.reason === 'browser-handle' ||
    preference.reason === 'composition' ||
    preference.reason === 'internal-control' ||
    preference.reason === 'model-command' ||
    preference.reason === 'shell-backed'
  )
}
```

Repair paths should reveal the current DOM selection or the materialized
post-update collapsed range:

```ts
const domRange = domNode.ownerDocument.createRange()
domRange.setStart(domNode, domOffset)
domRange.setEnd(domNode, domOffset)

domSelection.setBaseAndExtent(domNode, domOffset, domNode, domOffset)
scrollSelectionIntoView(editor, domRange)
```

Finally, replace the dependency-backed method mutation with a Slate-owned rect
walker:

```ts
scrollRectIntoViewIfNeeded({
  rect: toScrollRect(targetRect),
  startElement: leafEl,
})
```

That let `slate-react` remove `scroll-into-view-if-needed` and
`compute-scroll-into-view` from its dependency graph.

## Why This Works

Native text input is driven by the browser's current editable selection unless
a current model-owned reason explicitly owns the event. Repair-induced and
programmatic-export origins are not enough to suppress a later native
`insertText` DOM import.

Caret visibility also belongs after DOM selection export or post-input repair.
At that point Slate has a real collapsed DOM range to reveal. Walking scrollable
ancestors from inner to outer, then the viewport, keeps the scroll delta local
and avoids mutating DOM measurement methods.

## Prevention

- Browser rows for caret bugs must repeat the exact user path. Do not add a
  second click if the bug report says the second type happens after scroll-away
  only.
- Rebuild `slate-react` and the static example before Playwright proof when the
  example is served from `site/out`.
- Model selection preference needs a reason. A boolean cannot distinguish
  internal controls from stale repair ownership.
- Repair and selection-export paths should scroll the post-update DOM range,
  not a model range that still needs DOM materialization.
- Tests should cover both harness layers:
  - Vitest/jsdom for model preference, DOM repair, and rect walker contracts.
  - Playwright for the real scroll-away typing route.

## Related Issues

- [Slate React keydown must import DOM selection before model-owned navigation](../ui-bugs/2026-04-22-slate-react-keydown-must-import-dom-selection-before-model-owned-navigation.md)
- [Slate React repair-induced selectionchange must stay model-owned](../ui-bugs/2026-04-25-slate-react-repair-induced-selectionchange-must-stay-model-owned.md)
