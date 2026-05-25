---
title: Slate v2 editor query reverse must reverse emitted matches
date: 2026-05-07
category: docs/solutions/logic-errors
module: slate-v2 editor queries
problem_type: logic_error
component: tooling
symptoms:
  - "state.nodes.match({ reverse: true }) returned the parent before deeper matching children"
  - "The reverse result was not the exact inverse of the forward matched result"
root_cause: logic_error
resolution_type: code_fix
severity: high
tags: [slate-v2, editor-query, reverse, traversal, node-entries]
---

# Slate v2 editor query reverse must reverse emitted matches

## Problem

`state.nodes.match({ reverse: true })` was using reverse raw traversal, so nested
matches could come back in a different structural order than callers expect.
For the public editor query contract, reverse means the exact inverse of the
forward matched entries.

## Symptoms

- Forward matched paths were `["0", "0.1", "0.3", "1"]`.
- Reverse matched paths were `["1", "0", "0.3", "0.1"]`.
- Expected reverse matched paths were `["1", "0.3", "0.1", "0"]`.

## What Didn't Work

- Driving `Node.nodes(..., { reverse: true })` directly through editor-query
  filtering changed the order that parents and children reached `match`,
  `mode`, `pass`, and `universal` logic.
- Patching raw `Node.nodes` would have widened the change into structural
  iterator behavior even though the bug was in the public editor query result
  contract.
- Treating unrelated full-suite transform failures as evidence against the
  query fix was misleading. The same delete/insertFragment failures reproduced
  with the old `editor/nodes.ts` traversal restored.

## Solution

Traverse the normalized forward range through the existing editor-query filter
pipeline, buffer emitted matches when `reverse` is requested, and reverse that
emitted list at the end.

```ts
const nodeEntries = Node.nodes(editor, {
  from,
  to,
  pass,
})

const matches: NodeEntry<T>[] = []
const shouldBuffer = reverse || universal

for (const [node, path] of nodeEntries) {
  const emit = mode === 'lowest' ? hit : ([node, path] as NodeEntry<T>)

  if (emit) {
    if (shouldBuffer) {
      matches.push(emit)
    } else {
      yield emit
    }
  }
}

if (shouldBuffer) {
  yield* reverse ? matches.reverse() : matches
}
```

Add a public query-contract test that asserts reverse output is exactly the
inverse of the forward output:

```ts
const forward = paths()

assert.deepEqual(forward, ['0', '0.1', '0.3', '1'])
assert.deepEqual(paths({ reverse: true }), [...forward].reverse())
```

## Why This Works

The editor query helper owns public `match`, `mode`, `pass`, `voids`, and
`universal` behavior. Forward traversal keeps those behaviors on one proven
path. Reversing only the emitted matches changes caller-visible order without
forking the filter engine or changing lower-level raw traversal semantics.

The buffer is also bounded to emitted matches, not every visited node. That is
the right cost for exact reverse query output.

## Prevention

- For editor query regressions, test the public `state.nodes.match(...)` path
  before changing raw iterators.
- Assert reverse query output as `forward.reverse()` when the contract is about
  caller-visible match order.
- If a broad check fails, reproduce the failure with the patch owner restored
  before accepting it as in-scope breakage.

## Related Issues

- `#5080`: public reverse editor query order.
- `#5684`: related/repro-first traversal pressure, not claimed by this fix.
- `#5028`: adjacent traversal API pressure, not claimed by this fix.
