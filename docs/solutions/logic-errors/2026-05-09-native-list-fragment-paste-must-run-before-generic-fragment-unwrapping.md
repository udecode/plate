---
title: Native list fragment paste must run before generic fragment unwrapping
date: 2026-05-09
category: docs/solutions/logic-errors
module: Slate v2 clipboard list fragment paste
problem_type: logic_error
component: documentation
symptoms:
  - "A partial list item plus following paragraph pasted into a list nested the paragraph inside the list item."
  - "A copied list pasted over selected paragraph text unwrapped list items into paragraphs."
  - "Copied paragraphs pasted inside a list item kept the tail paragraph inside the list."
root_cause: logic_error
resolution_type: code_fix
severity: high
tags: [slate-v2, clipboard, insert-fragment, list, lexical-harvest]
---

# Native list fragment paste must run before generic fragment unwrapping

## Problem

Lexical's native list copy/paste tests exposed shapes that Slate's generic
fragment insertion path could not model cleanly. The generic path was built to
merge inline/text leaves into the target block, so it either unwrapped copied
list items into paragraphs or left promoted paragraphs trapped inside a list.

## Symptoms

- A partial list item plus following paragraph inserted into an empty list item
  produced nested block children inside the list item.
- A copied list inserted over selected paragraph text became paragraph text
  like `12one` and `two45` instead of splitting the paragraph around the list.
- Two copied paragraphs inserted into `four` at offset `2` kept `Worldur` in
  the list instead of promoting it after the list.

## What Didn't Work

- Letting the generic `insertFragment` walk decide what to unwrap. It correctly
  handles many inline and simple block cases, but it loses the distinction
  between wrapper containers, sibling units, and promoted blocks.
- Adding only empty-editor list proof. That row passes through the existing
  empty-block replacement path and misses the harder populated-list geometry.
- Treating Lexical's DOM output as the target. The portable behavior is the
  model contract: which blocks stay in a list, which blocks move outside, and
  where the selection lands.

## Solution

Handle structural list fragment shapes explicitly before the generic unwrapping
path in `packages/slate/src/transforms-text/insert-fragment.ts`.

The fix added two replacement branches:

- top-level structural block fragments pasted into top-level text blocks split
  the surrounding text into before/fragment/after children;
- block fragments pasted from inside a structural container, such as a
  `bulleted-list`, replace the parent container window with head container,
  promoted middle blocks, and tail container.

The tests live in `packages/slate/test/clipboard-contract.ts` and lock the
portable Lexical rows:

- partial list item plus paragraph into an empty editor;
- partial list plus paragraph into an empty list item, splitting the list;
- copied list into selected paragraph text without swallowing surrounding text;
- two paragraphs into a list item, with the tail paragraph promoted;
- two paragraphs at the end of a list as one list item plus a following block.

Verification:

```bash
bun test ./packages/slate/test/clipboard-contract.ts -t "partial list|copied list|paragraph fragments into a list|paragraph fragments at the end"
bun test ./packages/slate/test/clipboard-contract.ts
bun run lint:fix
bun check
```

## Why This Works

The generic fragment path decides insertion by walking leaves and unwrapping
blocks at the first and last fragment boundaries. That is too late for native
list fragments because the unit of correctness is the structural window:

- a copied list is a block between the paragraph before/after text;
- copied list children that match the target list should become sibling list
  items;
- copied paragraphs inside a list item only keep the first paragraph inside the
  list, while later paragraphs promote outside and split the tail list.

Doing this with one `replace_children` operation also keeps history and
selection honest.

## Prevention

- Add red package rows for mixed list-plus-block fragments before touching
  generic fragment insertion.
- Assert the full tree and selection, not only inserted text.
- Keep native clipboard transport, DOM theme output, mobile, collaboration, and
  table claims out of package-only model proof.
- If a fragment contains both a structural wrapper and text blocks, classify the
  wrapper behavior before the generic leaf walk gets a chance to unwrap it.

## Related Issues

- [List-unit fragment proofs should treat list-item fragments as sibling units and assert real paste landings](2026-04-05-list-unit-fragment-proofs-should-treat-list-item-fragments-as-sibling-units-and-assert-real-paste-landings.md)
- [Single-block fragment replacement must preserve target block before full-document replace](2026-05-04-single-block-fragment-replacement-must-preserve-target-block-before-full-document-replace.md)
- [Slate v2 large paste fast path must still be a logical operation](../performance-issues/2026-05-05-slate-v2-large-paste-fast-path-must-still-be-a-logical-operation.md)
