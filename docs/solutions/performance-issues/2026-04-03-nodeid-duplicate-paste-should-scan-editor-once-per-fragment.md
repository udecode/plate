---
title: NodeId duplicate-id paste should scan the editor once per fragment
date: 2026-04-03
category: docs/solutions/performance-issues
module: NodeId duplicate-id paste
problem_type: performance_issue
component: tooling
symptoms:
  - "Duplicate-id paste in `withNodeId` stayed much slower than raw import even after init-time NodeId work was fixed"
  - "A 200-block seeded duplicate paste spent most of its runtime in repeated duplicate-existence checks"
  - "The hot path still called `editor.api.some(...)` once per duplicate candidate during `insert_node`"
root_cause: logic_error
resolution_type: code_fix
severity: medium
tags:
  - plate
  - nodeid
  - withnodeid
  - insert-node
  - insertfragment
  - paste
  - duplicate-id
  - performance
---

# NodeId duplicate-id paste should scan the editor once per fragment

## Problem

`withNodeId` handled duplicate pasted ids correctly, but it paid for that
correctness in the dumbest possible way: one `editor.api.some(...)` scan per
candidate id during `insert_node`.

On a seeded duplicate paste, that turned one fragment insert into a pile of
full-editor duplicate checks.

## Symptoms

- Raw import was already cheap.
- Duplicate-id paste was still the only meaningful `withNodeId` hotspot.
- The dedicated `nodeid-fragment` benchmark showed the live `5k` duplicate-paste
  lane at `20.06 ms`, with `199` duplicate lookups costing about `13.89 ms`.

## What Didn't Work

- Treating the existing `idExistsCache` as enough. It only deduplicated repeated
  checks for the same id. It did nothing for the common case where a pasted
  fragment contains many distinct ids.
- More init-time `nodeId` work. The problem was not initialization anymore.

## Solution

Keep the single-pass inserted-node normalization, but replace per-id editor
queries with one bounded prepass:

1. walk the inserted subtree once and collect the candidate ids that might need
   duplicate checks
2. scan the editor tree once and record which of those ids already exist
3. normalize the inserted subtree against that precomputed duplicate-id set

The implementation lives in:

- [withNodeId.ts](/Users/zbeyens/git/plate-2/packages/core/src/lib/plugins/node-id/withNodeId.ts)
- [withNodeId.spec.ts](/Users/zbeyens/git/plate-2/packages/core/src/lib/plugins/node-id/withNodeId.spec.ts)

The important constraint is behavioral: the rewrite keeps the same duplicate-id
semantics for inserted nodes and `_id` overrides.

## Why This Works

The old path was roughly:

- `O(candidateIds * editorSize)` duplicate existence work

The new path is:

- one inserted-subtree pass
- one editor scan
- one inserted-subtree normalization pass

So the repeated full-editor existence checks disappear.

On the same live `5k` / `200`-block duplicate-paste benchmark:

- duplicate paste with NodeId: `20.06 ms -> 13.79 ms`
- duplicate lookup calls: `199 -> 0`
- duplicate lookup time: `13.89 ms -> 0`

That cut about `6.27 ms` from the real duplicate-paste lane without changing
the public NodeId API.

## Prevention

- If a pasted fragment can contain many distinct ids, do not call a full-editor
  existence query once per id.
- Benchmark raw import and duplicate-id paste separately. They are not the same
  cost shape.
- When the benchmark says the time is in duplicate lookup, attack lookup first
  before touching unrelated initialization or rendering paths.

## Related Issues

- Related learning: [2026-04-03-nodeid-paste-import-needs-insertfragment-benchmark.md](/Users/zbeyens/git/plate-2/.claude/docs/solutions/performance-issues/2026-04-03-nodeid-paste-import-needs-insertfragment-benchmark.md)
- Related learning: [2026-03-31-plate-nodeid-should-use-setnodesbatch-only-for-live-normalization.md](/Users/zbeyens/git/plate-2/.claude/docs/solutions/performance-issues/2026-03-31-plate-nodeid-should-use-setnodesbatch-only-for-live-normalization.md)
