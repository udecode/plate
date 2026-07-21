---
title: Plate `nodeId` should queue live normalization in the active transaction
date: 2026-03-31
category: docs/solutions/performance-issues
module: NodeId normalization
problem_type: performance_issue
component: tooling
symptoms:
  - "Plate has a pure initial-value `nodeId` normalization path and a live path that must publish through the active transaction"
  - "Applying each missing id through a separate editor update would create unnecessary history and publication work"
  - "Routing initial-value normalization through editor updates would manufacture runtime work while the plugin already owns the value"
root_cause: wrong_api
resolution_type: code_fix
severity: high
tags:
  - plate
  - slate
  - nodeid
  - set-node
  - batching
  - history
  - normalization
  - performance
---

# Plate `nodeId` should queue live normalization in the active transaction

## Problem

`nodeId` has two different workloads:

- initial-value normalization, where the plugin already owns the value
- live normalization, where the plugin uses an active update transaction

Those workloads look similar on paper, but only live normalization belongs in
an editor transaction. Initialization already owns the value and should stay
pure.

## Symptoms

- `nodeId` already had a good pure initial-value path through
  `transformInitialValue`.
- The live `normalize()` transaction method can discover many missing ids in one
  traversal.
- Those writes need one history policy and one active transaction, not a
  separate editor update per node.

## What Didn't Work

- Replacing the `nodeId` initial-value transform with
  `editor.tf.setNodesBatch(...)`. That would manufacture operations, history
  boundaries, and change notifications during initialization even though the
  plugin already owns the initial value.
- Pretending the local `@platejs/plite` package could safely deep-import Plite
  private internals for dirty-path updates. The published `slate` package ships
  a bundled runtime, not a clean public deep-import surface for those helpers.

## Solution

Keep the abstractions honest.

### 1. Queue live updates in `NodeIdPlugin.extendTx`

`NodeIdPlugin.extendTx` gives its `normalize()` method the active transaction.
The transform traverses the document first and queues each missing id as an
exact path plus its new properties.

That keeps discovery separate from mutation without inventing another public
batch transform.

### 2. Apply one history policy

Before applying the queue, the transform marks the active transaction as
history-skipped and writes each exact path through the transaction primitive:

```ts
tx.tags.add('history-skip');

for (const { at, props } of updates) {
  tx.nodes.set(props, { at });
}
```

All id assignments therefore share one transaction, one history decision, and
one publication boundary.

### 3. Keep initial-value normalization pure

`transformInitialValue` stays on its returned-value path, controlled by the
`initialValueIds` option.

That split matters:

- live normalization is transaction work, so the active `tx` is the owner
- initial normalization is a value-ownership problem, so a pure value transform
  is the owner

## Why This Works

The live path performs ordinary, observable node writes without paying for a
separate public update around every id. The transaction owns normalization,
history policy, and publication for the whole queue.

The initial-value path never enters that machinery. It returns a normalized
value directly while the plugin still owns construction.

## Prevention

- If a plugin already owns `editor.children` during initialization, do not
  route that work back through editor operations just to reuse a runtime API.
- Collect repeated live writes before mutating, then apply them through the
  active transaction.
- Put history policy on that transaction once instead of wrapping every write.
- Keep focused tests around history behavior. Undo bugs are where "fast"
  optimizations go to die.

## Related Issues

- Related learning: [2026-03-31-slate-applybatch-should-own-the-exact-path-set-node-fast-path.md](/Users/zbeyens/git/plate-2/docs/solutions/performance-issues/2026-03-31-slate-applybatch-should-own-the-exact-path-set-node-fast-path.md)
- Related learning: [plate-vs-slate-benchmarks.md](/Users/zbeyens/git/plate-2/docs/performance/plate-vs-slate-benchmarks.md)
