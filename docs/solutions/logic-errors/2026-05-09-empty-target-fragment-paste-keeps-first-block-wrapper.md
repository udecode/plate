---
title: Empty target fragment paste keeps first block wrapper
date: 2026-05-09
category: docs/solutions/logic-errors
module: Plite clipboard fragment insertion
problem_type: logic_error
component: documentation
symptoms:
  - A multi-paragraph fragment pasted into an empty block quote replaced the quote with paragraphs.
  - Lexical native CopyAndPaste keeps the first pasted paragraph inside the quote and promotes the tail paragraph.
  - Existing single-block paste policy still needed to preserve target wrappers.
root_cause: logic_error
resolution_type: code_fix
severity: medium
tags: [plite, lexical-harvest, clipboard, insert-fragment, block-quote]
---

# Empty target fragment paste keeps first block wrapper

## Problem

Lexical's native `CopyAndPaste.spec.mjs` includes a useful block-format row:
copy two paragraphs, paste them into an empty quote, keep the first paragraph in
the quote, and place the second paragraph after it.

Plite's single-empty-block fragment path replaced the target quote with the
incoming paragraph fragment, losing the target wrapper.

## Symptoms

- The new DOM clipboard proof expected a `block-quote` followed by a paragraph.
- The red run produced two paragraphs instead.
- Existing single text-block replacement policy still needed to stay
  target-owned, so the fix could not blindly make source wrappers win.

## Solution

Handle multi-text-block fragments before the generic block-fragment replacement
inside `getSingleEmptyBlockFragmentReplacement`:

```ts
if (
  fragment.length > 1 &&
  fragment.every((node) => isTextBlockElement(editor, node))
) {
  const [firstFragmentBlock, ...tailBlocks] = fragment as Element[]
  const children = [
    {
      ...onlyEditorNode,
      children: firstFragmentBlock.children.map(cloneDescendant),
    },
    ...tailBlocks.map(cloneDescendant),
  ] as Value

  return {
    children,
    previousChildren: editorChildren,
    selection: getFragmentEndSelection(children),
  }
}
```

## Why This Works

The target empty text block owns the first pasted text block wrapper. After that
first landing, remaining pasted blocks should keep their source shape and live
after the target block.

This preserves the already-documented single text-block policy: when a single
text block replaces a target text block, the target wrapper wins. The new rule
only extends that policy to the first block of a multi-block fragment.

## Prevention

- For fragment insertion into formatted empty blocks, assert both first-block
  wrapper ownership and tail promotion.
- Do not use source-wrapper preservation for single text-block fragments unless
  a future block-format paste owner explicitly changes the policy.
- Keep native transport flake tags, product decorator rows, raw mobile,
  collaboration, and table-model claims out of package-only fragment proof.

## Related Issues

- [Single-block fragment replacement must preserve target block before full-document replace](./2026-05-04-single-block-fragment-replacement-must-preserve-target-block-before-full-document-replace.md)
- [Native list fragment paste must run before generic fragment unwrapping](./2026-05-09-native-list-fragment-paste-must-run-before-generic-fragment-unwrapping.md)
- [V2 fragment proofs should preserve a nested block wrapper before chasing arbitrary tree support](./2026-04-04-v2-fragment-proofs-should-preserve-a-nested-block-wrapper-before-chasing-arbitrary-tree-support.md)
