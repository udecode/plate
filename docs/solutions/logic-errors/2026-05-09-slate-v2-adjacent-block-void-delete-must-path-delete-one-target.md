---
title: Slate v2 adjacent block void delete must path-delete one target
date: 2026-05-09
category: docs/solutions/logic-errors
module: slate-v2 core delete
problem_type: logic_error
component: testing_framework
symptoms:
  - "Backspace after several adjacent block voids removed more than the nearest void."
  - "A Lexical #7319 harvest row exposed that repeated adjacent void deletion was not one step per keypress."
  - "The caret fallback could point at stale paths after a path delete shifted siblings."
root_cause: logic_error
resolution_type: code_fix
severity: high
tags: [slate-v2, delete, block-void, selection, lexical-harvest]
---

# Slate v2 adjacent block void delete must path-delete one target

## Problem

Collapsed backward delete after adjacent block voids treated the target as a
range delete. That let one Backspace remove more structure than the nearest
void target.

## Symptoms

- The focused fixture for repeated adjacent block voids failed red.
- The actual output kept only the first paragraph and one void instead of
  preserving the remaining adjacent voids plus the empty caret host.
- Lexical #7319's portable part was not the HR styling or NodeSelection UI; it
  was the one-void-per-delete behavior.

## What Didn't Work

- Treating the row as HR-specific. Slate core already has generic block voids,
  so inventing an HR owner would have been the wrong layer.
- Letting collapsed delete become a range from the adjacent void to the current
  caret block. The range machinery is allowed to normalize surrounding
  structure, which is too broad for a one-keypress atomic void delete.
- Returning a raw fallback point after deleting a path. Sibling shifts can make
  that point stale unless it is tracked through the operation.

## Solution

When collapsed delete resolves to an adjacent void or read-only element, delete
that element by path and preserve the original caret through a point ref.

The behavior lock is:

```tsx
// packages/slate/test/transforms/delete/voids-false/block-after-multiple-reverse.tsx
export const run = (editor) => {
  editor.text.delete({ reverse: true });
};
```

The fix is in `packages/slate/src/transforms-text/delete-text.ts`:

```ts
const targetNonEditable = voids
  ? undefined
  : getHighestNonEditable(editor, target);

if (targetNonEditable && !pathContainsPoint(targetNonEditable[1], at)) {
  return {
    kind: "path",
    path: targetNonEditable[1],
    fallbackPoint: at,
    initialAt,
  };
}
```

`deletePathTarget` creates a point ref for `fallbackPoint` before applying the
remove operation, then sets the selection from the transformed point.

## Why This Works

A void/read-only element is an atomic deletion target. Once the collapsed
delete target lands inside that atom, the editor should remove that atom, not
reinterpret the gesture as a structural range deletion across nearby siblings.

The point ref matters because the caret host usually sits after the removed
void. Removing the void shifts that host left, so the fallback point must move
with the operation before selection is restored.

## Prevention

- For collapsed delete rows that hit a void or read-only target, test path
  deletion behavior separately from expanded range deletion.
- If a path delete needs to keep a caret in a sibling after the removed node,
  use a point ref or equivalent operation-aware transform for the fallback.
- When harvesting editor tests around HRs, images, embeds, or decorators, split
  product selection styling from the portable atom-delete invariant.

## Related Issues

- [Slate v2 delete selection normalization must distinguish inline spacers from inline targets](2026-04-14-slate-v2-delete-selection-normalization-must-distinguish-inline-spacers-from-inline-targets.md)
- [Slate v2 empty inline backspace must path-delete the inline](2026-05-07-slate-v2-empty-inline-backspace-must-path-delete-the-inline.md)
- [Selectable voids should be atomic navigation points](2026-04-26-slate-v2-selectable-voids-should-be-atomic-navigation-points.md)
