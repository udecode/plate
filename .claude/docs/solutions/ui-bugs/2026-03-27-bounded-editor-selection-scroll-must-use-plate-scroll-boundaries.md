---
title: Bounded editor selection scroll must use Plate scroll boundaries
date: 2026-03-27
category: ui-bugs
module: core dom scrolling
problem_type: ui_bug
component: editor scrolling
symptoms:
  - Pressing Enter inside a blockquote in a bounded editor can jump the viewport upward and push the active line off screen.
  - The same jump can show up on repeated soft-break flows such as Shift+Enter.
  - The bug is easiest to reproduce in the docs editor previews where the editor lives inside a fixed-height scroll container.
root_cause: logic_error
resolution_type: code_fix
severity: high
tags:
  - plate
  - slate
  - scrolling
  - bounded-editor
  - blockquote
  - scrollSelectionIntoView
  - scroll-boundary
---

# Bounded editor selection scroll must use Plate scroll boundaries

## Problem

Plate already tracked the correct bounded scroll container through `containerRef` and `scrollRef`, but selection scrolling never used that information. In the docs previews, repeated Enter inside a blockquote let the browser scroll the wrong ancestor, so the active edit point could jump upward and disappear from view.

## Symptoms

- On `platejs.org/editors`, open the AI editor preview and scroll down to the blockquote near the bottom.
- Press Enter in the middle of the sentence, move the caret back to that split point, then press Enter again.
- The bounded editor jumps upward instead of keeping the active blockquote lines in view.
- The same class of jump can show up on soft-break paths such as Shift+Enter because the root bug is selection scrolling, not blockquote rules.

## What Didn't Work

- Treating this as a blockquote rule bug was a red herring. Blockquotes only made the repro easy because they use line-break behavior by default.
- Looking only at `DOMPlugin.withScrolling(...)` was also incomplete. That path handles explicit Plate auto-scroll batches, but manual Enter in the editor still flowed through Slate React selection scrolling.

## Solution

Make Plate own selection scrolling in React, and make the shared scroll helper honor the editor's bounded scroll container.

First, teach `scrollIntoView(...)` to use the store-backed `scrollRef` or `containerRef` as the `scroll-into-view-if-needed` boundary when one exists:

```ts
const getScrollBoundary = (editor: Editor) => {
  const store = (editor as any).store;

  if (!store?.get) return;

  return store.get('scrollRef')?.current ?? store.get('containerRef')?.current;
};

const resolvedOptions =
  typeof options === 'object' && options
    ? {
        ...options,
        boundary: options.boundary ?? getScrollBoundary(editor),
      }
    : options;

scrollIntoViewIfNeeded(leafEl, resolvedOptions);
```

Then stop relying on Slate React's default selection scrolling. In `useEditableProps(...)`, provide a default `scrollSelectionIntoView` handler that routes selection changes back through Plate's own API:

```ts
const scrollSelectionIntoView = React.useCallback(
  (_editor, domRange) => {
    editor.api.scrollIntoView(domRange);
  },
  [editor]
);

const _props: EditableProps = {
  decorate,
  renderChunk,
  renderElement,
  renderLeaf,
  renderText,
  scrollSelectionIntoView:
    editableProps.scrollSelectionIntoView ?? scrollSelectionIntoView,
};
```

That keeps both explicit Plate scrolling and normal caret-driven selection scrolling on the same bounded path.

## Why This Works

`scroll-into-view-if-needed` will happily walk up through scrollable ancestors unless you give it a boundary. Plate already knew which element should own scrolling, but that information stopped at the React store. Once selection scrolling started calling `editor.api.scrollIntoView(...)`, and that helper started defaulting to the store's bounded scroll root, the caret stayed inside the editor's real viewport instead of bubbling scroll decisions to the wrong ancestor.

This is why the fix is durable: it solves the shared scroll contract instead of adding a special case for blockquotes, Enter, or one docs page.

## Prevention

- If Plate tracks a DOM ref for viewport ownership, selection scrolling should use it by default.
- When a bug only reproduces inside fixed-height editors, check scroll boundaries before touching node-specific rules.
- Keep one unit test on the React side proving `scrollSelectionIntoView` routes through Plate, and one low-level test proving `scrollIntoView(...)` respects `scrollRef` and `containerRef`.
- If a caller passes an explicit boundary, preserve it. Plate should supply the safe default, not override deliberate caller behavior.

## Related Issues

- GitHub: `#4589`
- Related learning: `.claude/docs/solutions/logic-errors/2026-03-24-withscrolling-must-map-temporary-options-to-domplugin-keys-and-always-restore-state.md`
