---
title: Single-block fragment replacement must preserve target block before full-document replace
date: 2026-05-04
category: docs/solutions/logic-errors
module: plite slate
problem_type: logic_error
component: documentation
symptoms:
  - Rich fragment paste into a fully selected heading replaced the heading with the fragment paragraph wrapper.
  - The focused core fragment insertion test failed with actual type `paragraph` instead of expected type `heading`.
root_cause: logic_error
resolution_type: code_fix
severity: medium
tags: [plite, clipboard, insert-fragment, target-block]
---

# Single-block fragment replacement must preserve target block before full-document replace

## Problem

Rich Plite fragment insertion could downgrade the receiving block when the
selection covered the entire single-block document. The full-document replace
fast path ran before target-block ownership had a chance to preserve the
receiving block wrapper.

## Symptoms

- A paragraph fragment inserted over selected heading text produced a paragraph.
- The post-insert selection still landed at the right text offset, which made
  the type regression easy to miss if tests only asserted selection.

## What Didn't Work

- Fixing only the normal empty-target insertion path was not enough. A
  single-block document with its full text selected is also a full-document
  range, so it bypassed the normal insertion path entirely.
- Treating every full-document rich fragment paste as a full document
  replacement was too broad for the single text-block replacement case.

## Solution

Handle the one-block text replacement case before the generic full-document
replace path.

```ts
if (
  editorChildren.length === 1 &&
  fragment.length === 1 &&
  isTextBlockElement(editor, onlyEditorNode) &&
  isTextBlockElement(editor, onlyFragmentNode)
) {
  replaceSnapshot(editor, {
    children: [
      {
        ...onlyEditorNode,
        children: onlyFragmentNode.children,
      },
    ],
    selection: getBlockChildrenEndSelection([0], onlyFragmentNode.children),
  })
  return
}
```

Then keep the normal empty-target path aligned by unwrapping a single
text-block fragment into the receiving empty block instead of inserting the
fragment wrapper as the new block.

## Why This Works

There are two different ownership policies:

- multi-block or structurally rich full-document paste lets the fragment own the
  document shape;
- single text-block replacement lets the target block own the wrapper and the
  fragment own the inline/text children.

The failing case looked like the first policy because the range covered the
whole document, but semantically it was the second policy. The fix checks that
small target-owned shape before the broad replace path.

## Prevention

- When fragment insertion has a full-document shortcut, add a one-block
  selected-target test before trusting the shortcut.
- Assert both tree shape and selection placement for clipboard/fragment fixes.
- Add DOM clipboard round-trip coverage when the issue is paste-visible, even
  if the core transaction test already proves the model path.

## Related Issues

- [V2 fragment proofs should preserve a nested block wrapper before chasing arbitrary tree support](2026-04-04-v2-fragment-proofs-should-preserve-a-nested-block-wrapper-before-chasing-arbitrary-tree-support.md)
- [List-unit fragment proofs should treat list-item fragments as sibling units and assert real paste landings](2026-04-05-list-unit-fragment-proofs-should-treat-list-item-fragments-as-sibling-units-and-assert-real-paste-landings.md)
- Plite issue #5151
