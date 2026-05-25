---
title: Slate React void keyboard navigation needs post-native sync and Shift model ownership
date: 2026-04-27
category: docs/solutions/ui-bugs
module: Slate v2 slate-react browser editing
problem_type: ui_bug
component: testing_framework
symptoms:
  - ArrowDown moved the DOM selection into an image while Slate selection stayed before it.
  - Shift+ArrowRight expanded DOM selection to wrapper elements while Slate selection stayed collapsed.
  - The image did not render selected even though the browser caret was inside its void spacer.
root_cause: logic_error
resolution_type: code_fix
severity: high
tags: [slate-v2, slate-react, voids, selection, keyboard, browser-editing, images]
---

# Slate React void keyboard navigation needs post-native sync and Shift model ownership

## Problem

`/examples/images` exposed DOM/model drift around selectable block voids. Plain
ArrowLeft/ArrowRight already moved through images correctly, but vertical native
movement and Shift-extended horizontal movement split the browser selection from
Slate selection.

## Symptoms

- `ArrowDown` from the end of the paragraph before an image put the DOM
  selection in the image spacer at `[1,0]@0`, while Slate stayed at
  `[0,0]@113`.
- The image did not show the selected box shadow because `useSelected()` still
  read the stale model selection.
- `Shift+ArrowRight` from `[0,0]@113` let the DOM expand to the image wrapper,
  but Slate stayed collapsed. A second press moved Slate to the image while the
  DOM focus had already moved to the following wrapper.

## What Didn't Work

- Checking plain ArrowRight/ArrowLeft only. Those paths were already model-owned
  and green, so they missed the broken native and Shift paths.
- Trusting the first `selectionchange` after ArrowDown. Chrome fired importable
  selectionchange work before the final native selection around the void spacer
  was stable.
- Treating Shift+ArrowRight as browser-native. For void/read-only boundaries,
  letting the browser extend selection produces wrapper endpoints instead of
  canonical Slate text points.

## Solution

Keep horizontal Shift movement model-owned:

```ts
if (Hotkeys.isExtendBackward(nativeEvent)) {
  return {
    axis: 'horizontal',
    extend: true,
    kind: 'move-selection',
    reverse: true,
  }
}
if (Hotkeys.isExtendForward(nativeEvent)) {
  return { axis: 'horizontal', extend: true, kind: 'move-selection' }
}
```

Then have the caret engine execute it through `editor.move({ edge: 'focus' })`
instead of native DOM extension:

```ts
if (Hotkeys.isExtendForward(nativeEvent)) {
  event.preventDefault()
  editor.update(() => {
    editor.move({ edge: 'focus', reverse: isRTL })
  })
  return caretMovementHandled()
}
```

For native vertical movement, keep the browser in charge of layout but import
the settled DOM selection after the keydown default action:

```ts
if (
  !readOnly &&
  decision.intent === 'native-selection-move' &&
  (event.key === 'ArrowUp' || event.key === 'ArrowDown')
) {
  setTimeout(() => {
    syncEditorSelectionFromDOM({ editor, inputController })
  })
}
```

Guard the behavior in `/examples/images` with browser rows for:

- ArrowRight into an image and out to the next paragraph.
- ArrowDown into an image with model selection, DOM selection, and selected
  image styling all aligned.
- Shift+ArrowRight from before an image with Slate focus and DOM focus both on
  the void text point.

## Why This Works

Block-void images have a real zero-width text spacer, but the browser can land
on wrapper-shaped DOM endpoints during native movement. Slate's model must only
accept canonical text points. Horizontal Shift movement does not need browser
layout, so model-owned `editor.move({ edge: 'focus' })` is the right owner.
Vertical movement does need native layout, so Slate must wait until the browser
settles the selection, then import the final DOM point.

## Prevention

- When a keyboard bug mentions voids, test plain movement, vertical movement,
  and Shift-extended movement. One green path does not prove the family.
- Browser rows for selectable voids should assert model selection, DOM
  selection, and visible selected state.
- If native movement is allowed, prove the post-native import timing in a real
  browser. A selectionchange trace can be too early around zero-width void
  spacers.

## Related Issues

- [Slate React keydown must import DOM selection before model-owned navigation](../ui-bugs/2026-04-22-slate-react-keydown-must-import-dom-selection-before-model-owned-navigation.md)
- [Selectable voids should be atomic navigation points](../logic-errors/2026-04-26-slate-v2-selectable-voids-should-be-atomic-navigation-points.md)
- [Slate positions must group character navigation by text-block boundaries](../logic-errors/2026-04-27-slate-positions-must-group-character-navigation-by-text-block-boundaries.md)
