---
title: Slate v2 full-block delete fast path must stop at selection boundaries
date: 2026-05-09
category: docs/solutions/logic-errors
module: Slate v2 selection deletion runtime
problem_type: logic_error
component: slate
symptoms:
  - "A huge-document browser cut from block 2500 to block 2502 deleted only block 2500."
  - "After falling through to generic fragment deletion, the same cut left an empty heading at block 2500."
root_cause: logic_error
resolution_type: code_fix
severity: high
tags:
  - slate-v2
  - slate-react
  - delete-fragment
  - selection
  - multi-block
  - browser-stress
---

# Slate v2 full-block delete fast path must stop at selection boundaries

## Problem

The model-owned full-block delete fast path assumed that a selection from the
start of one block to the start of another block meant "remove the first
block." That is only true when the focus is at the immediate next sibling.

## Symptoms

- `huge-document-cut` expected block `2502` to shift into index `2500`.
- The browser actually showed old block `2501`, proving only one block was
  removed.
- A first local fix that disabled the one-block fast path for multi-block
  ranges left an empty heading, proving generic text deletion was also the wrong
  owner for full-block sibling selections.

## What Didn't Work

- Treating the assertion as a stale faker/text oracle. The expected and actual
  strings mapped exactly to source blocks `2502` and `2501`.
- Only narrowing the one-block fast path to adjacent siblings. That avoided the
  wrong one-block removal, but made the multi-block case fall through to text
  deletion and leave an empty start block.

## Solution

Return all fully selected sibling block paths, then remove them in reverse path
order:

```ts
if (
  !Path.isSibling(blockPath, endBlockPath) ||
  !Path.isBefore(blockPath, endBlockPath)
) {
  return null
}

const paths: Path[] = []
let path = blockPath

while (!Path.equals(path, endBlockPath)) {
  paths.push(path)
  path = Path.next(path)
}

editor.update((tx) => {
  for (const blockPath of [...blockPaths].reverse()) {
    tx.nodes.remove({ at: blockPath })
  }
})
```

## Why This Works

A start-to-start selection is exclusive of the focus block. For a selection from
block `N` start to block `N + 2` start, the fully selected sibling blocks are
`N` and `N + 1`, not just `N`, and not text inside `N`.

Reverse removal preserves path correctness while deleting multiple siblings.

## Prevention

- For delete fast paths, classify selection geometry first: same block, adjacent
  sibling boundary, multi-sibling boundary, or partial text range.
- Browser stress rows should assert the shifted block after cut, not just that a
  delete command trace happened.
- When optimizing structural delete, include a multi-block start-to-start row;
  adjacent-only coverage misses this bug.

## Related Issues

- [Slate v2 large paste fast path must still be a logical operation](../performance-issues/2026-05-05-slate-v2-large-paste-fast-path-must-still-be-a-logical-operation.md)
- [Remove range row points at expanded multiblock delete not another Android quirk](2026-04-12-remove-range-row-points-at-expanded-multiblock-delete-not-another-android-quirk.md)
