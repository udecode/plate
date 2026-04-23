---
title: Slate range refs must rebase node ops before wrap-driven normalization
type: solution
date: 2026-04-09
status: completed
category: logic-errors
module: slate-v2
tags:
  - slate
  - slate-v2
  - range-ref
  - normalization
  - fallbackElement
  - wrapNodes
  - move_node
---

# Problem

Scoped `fallbackElement` recovery looked correct in snapshots but still broke
range refs during the same transaction.

# Symptoms

- the tree normalized correctly after wrapping stray block-only children
- `packages/slate/test/range-ref-contract.ts` rebased the ref to an impossible
  path like `[0, 1, 1]`
- the wrong ref path only appeared after the normalizer used `wrapNodes(...)`

# What Didn't Work

Treating the bug as a normalization problem was wrong.

The fallback wrapper logic was fine. The tree shape after normalization matched
the expected snapshot.

The broken part was the ref transform layer underneath it.

# Solution

Make the range-ref transformer honor `insert_node` and `remove_node` path
rebasing before later `move_node` ops run.

```ts
case 'insert_node': {
  return {
    path: PathApi.transform(point.path, op, { affinity })!,
    offset: point.offset,
  }
}

case 'remove_node': {
  const path = PathApi.transform(point.path, op, { affinity })

  if (!path) {
    return null
  }

  return {
    path,
    offset: point.offset,
  }
}
```

With that in place, the scoped `fallbackElement` normalizer can safely wrap
stray top-level or block-only text / inline children, and range refs still land
on the real surviving node after the wrapper insert + move sequence.

# Why This Works

`wrapNodes(...)` is not one operation. In this engine it becomes:

1. insert the wrapper
2. move the wrapped node into it

If range refs ignore the earlier `insert_node`, the later `move_node` rebases a
stale path and produces nonsense.

Once range refs track node-structure ops in order, the later `move_node`
operates on the right path and the final ref stays coherent.

# Prevention

- If a normalizer changes tree shape with `insertNodes`, `wrapNodes`, or
  `removeNodes`, re-run range-ref proof immediately.
- Do not blame normalization first when the snapshot is right but the ref is
  wrong. That usually means the op transformer is stale.
- Any new range-ref contract around structure-changing ops should prove both:
  - final tree shape
  - final ref path
