---
title: Slate React internal controls must be native-owned
date: 2026-04-22
category: docs/solutions/logic-errors
module: Slate v2 slate-react browser editing
problem_type: logic_error
component: testing_framework
symptoms:
  - Text typed into an input inside an editable void leaked into the outer editor or stopped after the first character.
  - Selectionchange events from embedded inputs could overwrite the outer editor selection.
  - Cut/delete rows looked green in Chromium but failed on Firefox, WebKit, or mobile transport.
root_cause: logic_error
resolution_type: code_fix
severity: high
tags:
  - slate-v2
  - slate-react
  - browser-editing
  - internal-controls
  - clipboard
  - mobile
---

# Slate React internal controls must be native-owned

## Problem

Interactive controls rendered inside a Slate editor, such as inputs, buttons,
selects, textareas, and nested editors, are app/native-owned targets. If the
root `Editable` treats their keyboard, beforeinput, input, mouse, or selection
events as editor-owned, it can steal focus, mutate Slate selection, or repair
DOM from the wrong target.

## Symptoms

- Typing into an `<input>` inside an editable void inserted into the outer
  editor or stopped after one character.
- A `selectionchange` from an embedded input could rewrite outer editor
  selection.
- WebKit needed more than a passive early return; event propagation had to be
  stopped for internal-control input paths.
- Firefox cut preserved text deletion but lost the restored collapsed Slate
  selection until cut became an explicit model-owned repair path.
- Mobile and WebKit clipboard APIs denied read/write access, so clipboard rows
  failed when tests treated navigator clipboard transport as universal.

## What Didn't Work

- DOM-shape checks alone. The input still sat under the editor root, so root
  handlers saw bubbled events and could treat them as editable events.
- Returning early in only `selectionchange`. WebKit still routed later input
  back through the root stack.
- Treating Playwright mobile hardware-keyboard insertion as mobile IME proof.
  It can reverse contenteditable insertion or fail to preserve DOM selection.
- Reading `navigator.clipboard` after every shortcut. WebKit and mobile can
  deny those APIs even when the editor behavior is correct.

## Solution

Add a shared target policy for interactive internal controls:

```ts
export const isInteractiveInternalTarget = (
  editor: ReactEditor,
  target: EventTarget | null
) => {
  const element = isDOMElement(target)
    ? target
    : isDOMText(target)
      ? target.parentElement
      : null

  const control = element?.closest(
    'input, textarea, select, button, [data-slate-editor="true"]'
  )

  return (
    control instanceof HTMLElement &&
    control !== ReactEditor.toDOMNode(editor, editor) &&
    ReactEditor.hasDOMNode(editor, control) &&
    !ReactEditor.hasEditableTarget(editor, control)
  )
}
```

Use that policy at every root-owned event boundary:

- mouse down / click selection policy
- keyboard policy
- native beforeinput
- native input repair
- React input and input capture
- layout selection synchronization

For keyboard and input paths, stop propagation when the target is internal:

```ts
if (isInteractiveInternalTarget(editor, event.target)) {
  event.stopPropagation()
  return
}
```

For native `beforeinput` / `input`, use `stopImmediatePropagation()` so root
native listeners do not continue participating in an app-owned control event.

Cut needs the same model-owned repair discipline as other model-owned edits:

```ts
Transforms.select(editor, { anchor: collapsePoint, focus: collapsePoint })
preferModelSelectionForInputRef.current = true
ReactEditor.focus(editor)
domRepairQueue.repairCaretAfterModelOperation()
```

## Why This Works

The editor root should only own events whose target is part of the editable
Slate surface. Internal controls may live in the editor DOM, but their input
semantics belong to the browser or app component. Separating those targets
prevents Slate from interpreting native control events as editor edits.

The cut repair works because the collapsed post-cut selection is a Slate model
decision. Marking it model-owned and repairing the DOM caret prevents a delayed
browser `selectionchange` from clearing the restored selection.

## Prevention

- Every browser-editing row should assert model text, visible DOM text, Slate
  selection, DOM selection, and follow-up typing where the platform transport is
  authoritative.
- For internal controls inside editor content, add rows that prove the control
  receives input and the outer editor selection is preserved.
- Do not treat mobile Playwright hardware-keyboard behavior as native mobile
  IME proof.
- Split clipboard assertions by capability:
  - Chromium can usually prove navigator clipboard read/write.
  - Firefox can often prove real shortcut payload via the `cut` event.
  - WebKit/mobile may need model/visible behavior proof when clipboard APIs are
    denied.

## Related Issues

- [Slate React cut proof must use real shortcut transport and assert selection](./2026-04-22-slate-react-cut-proof-must-use-real-shortcut-and-assert-selection.md)
- [Appium iOS Safari loads local Slate routes but XCUITest value does not drive contenteditable](../integration-issues/2026-04-12-appium-ios-safari-loads-local-slate-routes-but-xcuitest-value-does-not-drive-contenteditable.md)
- [jsdom contenteditable composition is not a trustworthy IME proof](./2026-04-03-jsdom-contenteditable-composition-is-not-a-trustworthy-ime-proof.md)
