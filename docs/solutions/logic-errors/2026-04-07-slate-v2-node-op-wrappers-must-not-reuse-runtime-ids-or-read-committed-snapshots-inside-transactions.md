---
date: 2026-04-07
problem_type: logic_error
component: slate
root_cause: logic_error
title: Slate v2 node-op wrappers must not reuse runtime ids or read committed snapshots inside transactions
tags:
  - slate-v2
  - operations
  - transforms
  - runtime-id
  - transactions
severity: medium
---

# Slate v2 node-op wrappers must not reuse runtime ids or read committed snapshots inside transactions

## What happened

The first core op-family slice added real `insert_node` / `remove_node`
operations and matching `Transforms.insertNodes(...)` /
`Transforms.removeNodes(...)` wrappers to the replacement-candidate `slate`
package.

Two easy mistakes showed up immediately:

1. inserted nodes reused runtime ids from the existing tree
2. `removeNodes(...)` tried to read from the committed snapshot while an outer
   transaction was still open

Both bugs looked harmless at first. Neither was.

## Why the first attempt was wrong

### Reusing runtime ids on insert

`insert_node` initially built its draft node with the current tree's lookup
index.

That reused the runtime id from the node already sitting at the insertion path.
The snapshot test caught it right away: after inserting before `alpha`, the new
node at path `[0]` inherited `alpha`'s runtime id instead of getting a fresh
one.

That breaks the core rule:

- existing logical nodes keep their ids when siblings shift
- newly inserted logical nodes get fresh ids

If inserted nodes can steal old ids, selector subscriptions and path/id
reasoning become garbage.

### Reading the committed snapshot inside an active transaction

`removeNodes(...)` initially tried to resolve the node payload from
`Editor.getSnapshot(editor)` before dispatching `remove_node`.

That is wrong inside an outer `Editor.withTransaction(...)` block.

`Editor.getSnapshot(...)` is the committed snapshot, not the live draft. So
after a same-transaction insert, resolving path `[3]` from the committed
snapshot failed even though the draft tree already had that node.

The rule is simple:

- wrappers that dispatch draft-time operations must not depend on committed
  snapshot reads for same-transaction correctness

## What fixed it

The honest fix was narrow:

1. `insert_node` now creates the inserted draft subtree without reusing the
   existing index
2. `remove_node` keeps the payload optional for now, so `removeNodes(...)` can
   dispatch by path without probing the committed snapshot

That keeps the slice honest:

- fresh inserted nodes get fresh runtime ids
- shifted existing siblings keep their previous ids
- transaction-local wrapper behavior does not depend on stale committed state

## Reusable rule

For Slate v2 core node operations:

- inserted descendants must allocate fresh runtime ids
- existing siblings may shift paths, but must keep their ids
- transform wrappers must not read `Editor.getSnapshot(...)` to resolve data
  that should come from the live draft inside the same transaction

If a wrapper needs live tree data and only the committed snapshot can answer
it, the wrapper is wired to the wrong seam.
