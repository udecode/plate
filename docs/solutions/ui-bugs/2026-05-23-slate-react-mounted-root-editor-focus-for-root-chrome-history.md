---
title: Slate React root chrome and history focus must use mounted root editors
date: 2026-05-23
last_updated: 2026-05-23
category: docs/solutions/ui-bugs
module: slate-v2 slate-react multi-root focus
problem_type: ui_bug
component: testing_framework
symptoms:
  - "Clicking Header editor chrome left DOM focus on the main editable."
  - "Toolbar undo/redo changed header content but left focus on body or the toolbar button."
  - "The package hook created a root view editor that was not the mounted Editable root."
  - "DOMEditor.focus skipped refocus when its internal focused flag was stale."
  - "Inactive blank-root clicks imported a click-coordinate caret instead of restoring the root caret."
  - "A first footer text click after scrolling could leave DOM focus in the body until a second click."
  - "Clicking body editor padding after visiting another root restored the old body caret instead of moving to the clicked end."
root_cause: async_timing
resolution_type: code_fix
severity: high
tags: [slate-v2, slate-react, multi-root, focus, history, mounted-view]
---

# Slate React root chrome and history focus must use mounted root editors

## Problem

Package-owned multi-root hooks can still fail if they focus a freshly created
root view instead of the mounted `<Editable root>` view. The canonical example
looked clean, but browser proof showed chrome and toolbar history clicks did not
restore visible focus.

## Symptoms

- `useSlateRootChrome('header')` selected the header model root, but
  `document.activeElement` stayed on `#multi-root-main`.
- `useSlateHistory().undo()` removed the header text batch, but focus landed on
  `document.body` or the clicked toolbar button.
- `editor.api.dom.focus()` no-opped when `IS_FOCUSED` was still true even though
  the real DOM active element had moved.

## What Didn't Work

- Moving `requestAnimationFrame` from the example into the hook. Timing helped,
  but it still focused an unmounted view editor.
- Checking only whether a root view selection exists. A root view can read an
  implicit selection while the mounted DOM root is a different editor.
- Trusting the internal focused flag before checking the actual DOM active
  element.
- Calling `editor.api.dom.focus({ retries: 1 })` or `{ retries: 2 }` from
  root chrome/history. Small retry counts lose the race against dirty node maps.
- Letting inactive blank-root clicks use the browser's imported click
  coordinate. That can insert text in the middle of an existing paragraph when
  the intended chrome behavior is to restore that root's saved caret.

## Solution

Store mounted root editors in the Slate React runtime context and let hooks use
that mounted editor for DOM focus:

```ts
const focusEditor = getMountedViewEditor(root) ?? editor

focusSlateEditable(focusEditor)
```

Keep history mutations on the root view editor, but restore focus through the
mounted root editor:

```ts
editor.update((tx) => {
  tx.history.undo()
})

scheduleSlateReactFocus(() => {
  const focusEditor = getMountedViewEditor(root) ?? editor
  focusSlateEditable(focusEditor)
})
```

Make `DOMEditor.focus` treat the DOM active element as decisive:

```ts
if (IS_FOCUSED.get(editor) && root.activeElement === el) {
  return
}
```

For blank editable-root clicks, only intercept the click when that editable is
not already focused. Focus the concrete element first, then force root selection
restore so the browser's click-coordinate caret does not leak into the model:

```ts
if (target instanceof HTMLElement && isEditableRootTarget(target)) {
  target.focus({ preventScroll: true })
}

focusRoot({ forceSelection: true })
```

## Why This Works

`useSlateRootEditor(root)` is useful for model reads and writes, but it can
create a view editor that is not associated with a DOM node. DOM focus must go
through the editor instance registered by the mounted `<Slate root>` created
inside `<Editable root>`.

Toolbar buttons add another trap: by the time `onClick` runs, browser focus may
have already left the editor. The history hook must remember the last real
selection root and refocus the mounted root after the click settles.

Editable padding clicks are different from outer root chrome clicks. Text clicks
should stay native so the browser can place the caret. Clicks on the editable
root itself should first resolve a range from the event coordinates, because
right/bottom editor padding can still mean "put the caret at the visible body
end." Only fall back to the root restore policy when no event range can be
resolved.

There is a third target class between those two: a click on a Slate element line
box, for example the blank part of a paragraph's first line. That is not root
chrome and not a true blank-root click. Treat `[data-slate-node="element"]` as a
native editable descendant, just like `[data-slate-string]` and
`[data-slate-node="text"]`, so line-end clicks stay browser-owned:

```ts
const NATIVE_EDITABLE_TARGET =
  '[data-slate-string], [data-slate-zero-width], [data-slate-leaf], [data-slate-node="text"], [data-slate-node="element"]'
```

Native text clicks still need a narrow recovery path. After scrolling a sibling
root into view, the browser can deliver the click to the footer Slate string but
leave `document.activeElement` on the previous body editable. Root chrome should
remember that a native editable descendant was clicked, let the browser try
first, then on mouseup repair only if the clicked editable root still is not
focused:

```ts
if (isNativeEditableTarget(event.currentTarget, target)) {
  const editableRoot = findEditableRootTarget(event.currentTarget, target)

  if (editableRoot && !isAlreadyFocusedEditableRoot(editableRoot)) {
    pendingNativeEditableClickRef.current = true
  }

  return
}

// mouseup
if (pendingNativeEditableClickRef.current) {
  pendingNativeEditableClickRef.current = false
  recoverNativeEditableClick(event)
  return
}
```

The recovery should derive the Slate range from the real click coordinates and
focus the mounted root editor. That keeps the fallback equivalent to the native
text-click contract instead of reusing blank-root restore behavior:

```ts
const focusEditor = getMountedViewEditor(root) ?? editor
const range = focusEditor.api.dom.resolveEventRange(event.nativeEvent)

if (range) {
  focusEditor.update((tx) => {
    tx.selection.set(range)
  })
}

focusSlateEditable(focusEditor)
```

The same event-range-first policy should be used for direct editable-root
targets:

```ts
const range = focusEditor.api.dom.resolveEventRange(event.nativeEvent)

if (range) {
  focusEditor.update((tx) => {
    tx.selection.set(range)
  })
  focusSlateEditable(focusEditor)
  return
}

restoreRoot()
```

The regression should click header text, type, click the body paragraph line
box, then assert DOM focus, DOM selection root, exact body caret offset, and
follow-up typing:

```ts
await page.mouse.click(headerBox.x + 230, headerBox.y + 24)
await page.keyboard.type('Header native ')

await page.mouse.click(mainBox.x + mainBox.width - 16, mainBox.y + 24)

await expect
  .poll(() => readNativeSelection(page, 'multi-root-main'))
  .toMatchObject({
    activeElementId: 'multi-root-main',
    insideRoot: true,
    text: 'The body root carries the document content.',
  })
await expect
  .poll(async () => {
    const selection = await readNativeSelection(page, 'multi-root-main')

    return selection.anchorOffset
  })
  .toBe('The body root carries the document content.'.length)
```

## Prevention

- Browser-proof root chrome with `document.activeElement.id`, not just text
  changes.
- For toolbar history, assert content changes and focus restoration in the same
  browser row.
- If a hook wants to call DOM APIs for a root, first ask the runtime for the
  mounted root editor. Use newly created view editors for model operations, not
  DOM ownership.
- `DOMEditor.focus` should never early-return from internal focus state unless
  the DOM active element already matches the editor element.
- For inactive blank-root clicks, assert both focus ownership and the restored
  caret location with follow-up typing.
- For paragraph line-box clicks, assert the exact DOM caret offset. A test that
  only checks the selection belongs to the body can still miss a stale offset.
- For post-scroll sibling root clicks, assert `document.activeElement.id`, the
  native selection root, and follow-up typing in the clicked root on the first
  click.
- For editable padding clicks, first place a stale caret in the same root,
  focus a sibling root, then click the padding and assert the final text node and
  offset. This catches accidental selection restore.
- For history buttons, prove undoing a sibling-root batch keeps the current root
  focused and preserves follow-up typing in that root.

## Related Issues

- [Slate React multi-root Editable DX needs package-owned root views](../developer-experience/2026-05-23-slate-react-multi-root-editable-dx-needs-package-owned-root-views.md)
- [Slate v2 multi-root roots must stay natively editable for caret clicks](2026-05-21-slate-v2-multi-root-chrome-clicks-must-activate-root-before-focus.md)
