---
title: Slate React foreign DOM selections must be ignored before import
date: 2026-05-06
category: docs/solutions/logic-errors
module: Slate v2 React runtime
problem_type: logic_error
component: testing_framework
symptoms:
  - Native selections that start outside Slate can be mistaken for editor-owned selections.
  - Parent editor selections that cross into nested editors can ask the wrong editor to resolve DOM points.
  - Browser rows can overclaim fixed issues when they only prove part of the native selection path.
root_cause: logic_error
resolution_type: test_fix
severity: high
tags: [slate-v2, dom-selection, nested-editor, browser-proof]
---

# Slate React foreign DOM selections must be ignored before import

## Problem

DOM selection crash issues like #4789 and #4984 are not solved by blindly
importing every native `Selection`. Some native ranges are partly foreign to the
current editor: they can start outside Slate, or cross from a parent editor into
a nested editor.

## Symptoms

- `Cannot resolve a Slate point from DOM point` appears after an outside-to-inside
  browser selection.
- Selecting from a parent editor into an editable void's nested editor can make
  the parent try to resolve child-editor DOM.
- A test that only calls a model handle can look green while skipping the native
  DOM selection shape that caused the bug.

## What Didn't Work

- Treating every DOM point under a visible editor wrapper as editor-owned is too
  broad. Nested editors and foreign selection anchors make that false.
- Expecting native keyboard text to insert while the active DOM selection starts
  outside the editor is the wrong proof. The defensible claim is: ignore the
  foreign selection without crashing, then prove the editor is usable after
  normal refocus.
- Claiming iOS/IME or generic stale-DOM variants from desktop Chromium rows is
  overreach. Keep those rows related or improves unless the exact repro is
  replayed.

## Solution

Lock the behavior with native DOM selection rows, not only semantic Slate
selection helpers:

```ts
await editor.root.evaluate((element: HTMLElement) => {
  const outside = element.ownerDocument.createElement('p')
  outside.textContent = 'outside selection source'
  element.parentElement?.insertBefore(outside, element)

  const editorText = element.querySelector('[data-slate-string]')?.firstChild
  const outsideText = outside.firstChild
  if (!editorText || !outsideText) {
    throw new Error('Cannot create outside-to-editor selection')
  }

  const range = element.ownerDocument.createRange()
  range.setStart(outsideText, 0)
  range.setEnd(editorText, 4)

  const selection = element.ownerDocument.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(range)
  element.ownerDocument.dispatchEvent(
    new Event('selectionchange', { bubbles: true })
  )
})

runtimeErrors.assertNone()
await editor.click()
await page.keyboard.type('Z')
await expect.poll(() => editor.get.modelText()).toContain('Z')
```

For nested editors, create the actual cross-editor native range:

```ts
const range = outerElement.ownerDocument.createRange()
range.setStart(outerText, 0)
range.setEnd(nestedText, 4)

const selection = outerElement.ownerDocument.getSelection()
selection?.removeAllRanges()
selection?.addRange(range)
outerElement.ownerDocument.dispatchEvent(
  new Event('selectionchange', { bubbles: true })
)
```

Then assert no runtime errors and prove follow-up input stays scoped to the
focused editor.

## Why This Works

The runtime selection bridge should import only selections whose endpoints
belong to the current editor's editable surface. Foreign anchors and nested
editor endpoints are boundary conditions; importing them corrupts ownership.

The browser rows prove the real failure mode: a native `Selection` object with
mixed ownership exists in the document, `selectionchange` fires, Slate does not
throw, and normal editor input still works after focus returns.

## Prevention

- For DOM point crash issues, build the native `Range` shape that the issue
  describes. Do not replace it with `editor.selection.select`.
- Assert runtime errors with `recordSlateBrowserRuntimeErrors(page)`.
- Separate "ignored safely" from "native typing inserted immediately." For a
  foreign selection, ignored safely plus usable after refocus is the honest
  browser contract.
- Keep mobile, IME, stale programmatic replacement, and vague text-node crash
  variants out of `Fixes` lines until their exact repro rows pass.

## Related Issues

- #4789: outside-to-inside native selection.
- #4984: parent editor selection crossing into a nested editor.
- #4564, #3723, #3834, #3836, #5711: related DOM point crash pressure, but not
  exact closure from these rows.
- [Slate browser proof must separate model-owned handles, root selection, and usable focus](./2026-04-24-slate-browser-proof-must-separate-model-owned-handles-root-selection-and-usable-focus.md)
- [Slate React internal controls must be native-owned](./2026-04-22-slate-react-internal-controls-must-be-native-owned.md)
