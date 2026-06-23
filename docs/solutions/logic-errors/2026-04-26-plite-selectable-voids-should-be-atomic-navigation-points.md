---
title: Selectable voids should be atomic navigation points
category: logic-errors
problem_type: logic-error
component: plite
tags:
  - plite
  - selection
  - voids
  - keyboard-navigation
date: 2026-04-26
last_updated: 2026-05-06
---

# Selectable voids should be atomic navigation points

## Problem

In `/examples/embeds`, placing the caret at the end of the first paragraph and pressing ArrowRight skipped the embed void block and landed in the following paragraph.

That is wrong for a selectable block void. The void is not text content to traverse by default, but it is still a selectable document position.

## Root Cause

The traversal layer filtered out every path inside a void when `voids: false`.

That made sense for hiding void internals, but it also removed the void's atomic selection point. `Editor.after`, `Editor.before`, and `editor.move()` then saw no position between the previous paragraph and the following paragraph.

## Fix

Keep the contract in core `Editor.positions`:

- default traversal exposes selectable void/read-only ancestors as one atomic start point
- default traversal skips the descendants inside that atomic element
- `voids: true` enters the actual children

Do not special-case the embeds example or React keydown. The public traversal contract is the owner.

## Tests

Add a core query-contract test before browser work:

- `Editor.positions(editor, { at: [] })` returns one point for a selectable void
- `Editor.positions(editor, { at: [], voids: true })` returns the actual internal child offsets
- `Editor.after`, `Editor.before`, and `editor.move()` visit the void before the following block

Then add browser proof for `/examples/embeds`:

- select DOM at `[0,0]@177`
- press ArrowRight once and assert `[1,0]@0`
- press ArrowRight again and assert `[2,0]@0`

## 2026-05-03 Inline Void Character Movement Update

The same rule applies to inline voids during `unit: 'character'` movement.
`/examples/mentions` exposed the sharper failure: ArrowRight from before a
mention skipped the mention and consumed the first character after it, while
ArrowLeft from after the mention consumed the previous character before it.

The fix stayed in core traversal:

- keep void/read-only descendants hidden by default
- expose the atomic element itself as the next character stop
- map a second forward movement from that atom to the next text segment start
- map a second reverse movement from that atom to the previous text segment end

The regression test should cover both sides of at least two inline voids:

- `[1,0]@end` ArrowRight -> `[1,1,0]@0`
- `[1,1,0]@0` ArrowRight -> `[1,2]@0`
- `[1,2]@0` ArrowLeft -> `[1,1,0]@0`
- `[1,1,0]@0` ArrowLeft -> `[1,0]@end`
- `[1,2]@end` ArrowRight -> `[1,3,0]@0`
- `[1,3,0]@0` ArrowRight -> `[1,4]@0`
- `[1,4]@0` ArrowLeft -> `[1,3,0]@0`
- `[1,3,0]@0` ArrowLeft -> `[1,2]@end`

Do not collapse the two stops back into one. Skipping from the preceding text
straight to the following text makes the mention impossible to select with
plain arrow-key navigation.

## 2026-05-06 Block Void Delete And Enter Update

Atomic selection is not enough if model-owned Backspace and Enter still fall
through to generic text transforms.

Two browser rows locked the block-void command contract in `/examples/images`:

- Backspace from an empty paragraph immediately after a block void removes that
  empty paragraph and selects the void instead of deleting the void.
- Enter on a clicked selected block void inserts an editable paragraph after the
  void, matching the behavior users expect from an arrow-key selected void.

Keep this in the model-owned mutation path, not in the image example. The
React command layer owns the browser intent because it sees the selected void
and can repair the model selection after the structural operation.

## Prevention

When keyboard navigation skips a void, test `Editor.positions` first. If core traversal does not expose the void atomically, React keydown fixes are papering over the wrong layer.

For inline void regressions, also test `Editor.after` and `Editor.before` with
`unit: 'character'`; default `unit: 'offset'` can pass while human ArrowLeft and
ArrowRight still overshoot.

For destructive block-void regressions, replay both user paths: Backspace from
the adjacent empty block and Enter from a clicked selected void. The first
protects deletion ordering; the second protects click-selected and
arrow-selected void parity.
