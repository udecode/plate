---
title: Slate React Android marked inserts must not replay raw old-leaf selection
date: 2026-05-23
category: ui-bugs
module: Slate v2 slate-react Android input manager
problem_type: ui_bug
component: frontend_stimulus
symptoms:
  - Android marked collapsed typing inserted the marked leaf but restored selection to the old text path.
  - The package contract saw selection at [0,0]@2 instead of the inserted marked leaf [0,1]@1.
  - The source issue video showed keyboard dismissal after mark toggles on Android.
root_cause: logic_error
resolution_type: code_fix
severity: high
tags: [slate-v2, slate-react, android, ime, selection, marks, beforeinput]
---

# Slate React Android marked inserts must not replay raw old-leaf selection

## Problem

Android marked typing can be model-correct while the caret is still wrong. When
collapsed typing with active marks splits the current text leaf, any delayed
selection restoration based on the old DOM point must be normalized onto the new
marked leaf before it reaches the editor.

## Symptoms

- Text insertion produces the expected split text:
  `{ text: "a" }, { text: "w", bold: true }`.
- Selection incorrectly lands at raw `[0,0]@2`, outside the original leaf's
  length, instead of `[0,1]@1`.
- The upstream Android issue shows keyboard dismissal and cursor jumps after
  toggling bold on a collapsed selection.

## What Didn't Work

- Asserting only document text and marks. The text tree was correct while
  selection still pointed at the old leaf.
- Treating a package test as raw Android closure. It can prove the Slate input
  manager contract, not keyboard visibility or IME stability.

## Solution

Keep the Android manager's scheduled action so pending text diffs still flush,
but let the existing `at` normalization own selection placement. Do not run a
second raw selection write after `performAction()` normalizes the point.

```ts
scheduleAction(() => {}, {
  at: newPoint,
  preserveInsertPositionHint: true,
})
```

The focused contract belongs beside the Android input manager tests:

```ts
Editor.select(editor, range(1))
Editor.addMark(editor, 'bold', true)
EDITOR_TO_PENDING_INSERTION_MARKS.set(editor, { bold: true })

manager.handleDOMBeforeInput(beforeInputEvent('insertText', 'w'))
manager.flush()

expect(Editor.getSnapshot(editor).selection).toEqual({
  anchor: { path: [0, 1], offset: 1 },
  focus: { path: [0, 1], offset: 1 },
})
```

## Why This Works

`performAction()` already normalizes pending points through
`normalizePoint(editor, action.at)`. For old point `[0,0]@2`, normalization walks
past the old one-character leaf and lands on the inserted marked sibling at
`[0,1]@1`.

The previous scheduled action then immediately overwrote that normalized
selection by calling `tx.selection.set(...)` with the raw old point. Removing
that second write preserves the correct normalized result and keeps the flush
timing behavior.

## Prevention

- For Android/input-manager tests, assert both document text and selection.
- When a pending point is based on pre-diff DOM state, normalize once at the
  runtime owner and avoid later raw `selection.set(...)` writes.
- Do not promote this kind of package proof to Android issue closure without a
  raw Android Chrome/WebView lane for keyboard visibility and follow-up typing.

## Related Issues

- `#6022`: Android keyboard dismissal after collapsed mark toggle.
- `#6027`: upstream PR evidence for the same stale follow-up selection class.
- [Slate React model-owned insert must repair the DOM caret](./2026-04-22-slate-react-model-owned-insert-must-repair-dom-caret.md)
- [Slate React model-owned input must ignore stale DOM target ranges](./2026-04-21-slate-react-model-owned-input-must-ignore-stale-dom-target-ranges.md)
- [jsdom contenteditable composition is not a trustworthy IME proof](../logic-errors/2026-04-03-jsdom-contenteditable-composition-is-not-a-trustworthy-ime-proof.md)
