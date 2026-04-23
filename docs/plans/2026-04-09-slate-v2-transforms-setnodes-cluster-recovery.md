---
date: 2026-04-09
topic: slate-v2-transforms-setnodes-cluster-recovery
---

# Slate V2 Transforms SetNodes Cluster Recovery

## Scope

Recover the deleted `packages/slate/test/transforms/setNodes/inline/**`
cluster on the current engine instead of leaving `Transforms.setNodes(...)` as a
path-only helper.

## Recovered Contract

- `Transforms.setNodes(...)` now supports:
  - exact `Path`
  - current-selection / explicit `Location`
  - `Span`
  - `match`
  - `mode`
  - `voids`
- default mode is `lowest`
- the helper applies one transaction across all matched nodes
- runtime ids stay stable because the helper still routes through raw
  `set_node`

## Direct Proof

- [transforms-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/transforms-contract.ts)

Current direct rows:

- selected inline element updates through `match` without an explicit path
- block-spanning selection updates matched inline elements across blocks
- nested inline matches default to the lowest matching inline
- inline void props are preserved while adding the new prop
- explicit `Point`, `Range`, and `Span` targets are proved directly
- non-default `mode: 'highest'` is proved directly

## Why This Was Worth Restoring

- the deleted `setNodes/inline/**` cluster still mapped to real current-value
  command usage
- the live walkthroughs were already teaching `Transforms.setNodes(editor, props, { match })`
  even though the implementation only accepted `{ at: Path }`
- recovering the seam is better than pretending the docs or the deleted tests
  were wrong

## Code Change

- [interfaces.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces.ts)
  widens `SetNodesOptions`
- [transforms-node.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-node.ts)
  now resolves matched nodes through `Editor.nodes(...)` and applies one
  transaction across them

## Docs Synced

- [transforms.md](/Users/zbeyens/git/slate-v2/docs/api/transforms.md)
- [replacement-candidate.md](/Users/zbeyens/git/slate-v2/docs/general/replacement-candidate.md)
- [04-applying-custom-formatting.md](/Users/zbeyens/git/slate-v2/docs/walkthroughs/04-applying-custom-formatting.md)
- [05-executing-commands.md](/Users/zbeyens/git/slate-v2/docs/walkthroughs/05-executing-commands.md)
