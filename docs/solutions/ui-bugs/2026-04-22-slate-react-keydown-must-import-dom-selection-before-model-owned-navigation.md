---
title: Slate React keydown must import DOM selection before model-owned navigation
date: 2026-04-22
category: docs/solutions/ui-bugs
module: Slate v2 slate-react browser editing
problem_type: ui_bug
component: testing_framework
symptoms:
  - ArrowDown moved the visible caret to the next paragraph while Slate selection stayed in the first paragraph.
  - Pressing ArrowRight after ArrowDown snapped the caret back to the first paragraph.
  - Existing green tests used browser handles that bypassed real DOM selection setup.
root_cause: logic_error
resolution_type: code_fix
severity: high
tags:
  - slate-v2
  - slate-react
  - keydown
  - selection
  - dom-selection
  - browser-editing
---

# Slate React keydown must import DOM selection before model-owned navigation

## Problem

Browser-native vertical movement and Slate/model-owned horizontal movement can
fight if Slate does not import the current DOM selection before handling the
next keydown.

## Symptoms

- `ArrowDown` moved the visible DOM caret from paragraph 1 to paragraph 2.
- Slate's model selection remained in paragraph 1.
- `ArrowRight` then used stale model selection and snapped the DOM caret back to
  paragraph 1.
- Handle-based tests stayed green because they set model selection without
  proving DOM selection.

## What Didn't Work

- Flushing only the throttled `onDOMSelectionChange` handler. The actual
  selectionchange was queued through the debounced scheduler.
- Adding more isolated ArrowLeft/ArrowRight rows. They did not combine a
  browser-native movement followed by a model-owned movement.
- Trusting `selectRange` as browser setup. It is useful, but it is not raw DOM
  selection proof unless the helper also places the DOM selection.

## Solution

Add a central DOM-to-model import before model-owned key handling:

```ts
if (!isInteractiveInternalTarget(editor, event.target)) {
  syncEditorSelectionFromDOM({
    editor,
    preferModelSelectionForInputRef,
  })
}
```

The helper reads the current DOM selection and selects the equivalent Slate
range unless the editor is explicitly in model-owned mode:

```ts
if (range && (!selection || !Range.equals(selection, range))) {
  Transforms.select(editor, range)
}
```

Also fix browser helpers that were model-only. If a test claims browser
navigation, setup must place DOM selection too, not just call the Slate browser
handle.

## Why This Works

The browser is allowed to own vertical caret movement. Slate is allowed to own
some horizontal or structural navigation. The boundary between those two modes
must be explicit.

Before a model-owned key reads `Editor.getLiveSelection(editor)`, Slate must
import the current in-editor DOM selection unless a model-owned operation is
already the active source of truth.

This mirrors the discipline used by better editor architectures:

- ProseMirror flushes DOM observer/selection state before key handling.
- Lexical updates DOM selection inside one update lifecycle.
- Edix syncs selection at the start of input handling.
- VS Code owns cursor movement in a cursor/view-model controller instead of
  mixing DOM and model selection ad hoc.

## Prevention

- Add navigation gauntlets that chain browser-native movement and model-owned
  movement.
- Test `ArrowDown` followed by `ArrowRight`, not only ArrowLeft/ArrowRight in a
  single line.
- Require handle helpers used in browser tests to place DOM selection too.
- Keep internal-control guards before DOM-to-model import so inputs, buttons,
  selects, textareas, and nested editors stay app/native-owned.

## Related Issues

- [Slate React model-owned input must ignore stale DOM target ranges](./2026-04-21-slate-react-model-owned-input-must-ignore-stale-dom-target-ranges.md)
- [Slate React internal controls must be native-owned](../logic-errors/2026-04-22-slate-react-internal-controls-must-be-native-owned.md)
