---
title: NodeId paste/import work needs a dedicated `insertFragment` benchmark
date: 2026-04-03
category: docs/solutions/performance-issues
module: NodeId paste/import
problem_type: performance_issue
component: tooling
symptoms:
  - "`init-dissection` looked good, but it did not exercise the real `withNodeId` insert path used by paste/import flows"
  - "It was still unclear whether more `withNodeId` rewrites would buy anything meaningful for real fragment insertion"
  - "Static normalization numbers risked sending follow-up work in the wrong direction"
root_cause: inadequate_documentation
resolution_type: code_fix
severity: medium
tags:
  - plate
  - nodeid
  - withnodeid
  - insertfragment
  - paste
  - import
  - benchmark
  - performance
---

# NodeId paste/import work needs a dedicated `insertFragment` benchmark

## Problem

`NodeIdPlugin` already had a clean init-time story, but the expensive real-world
path for copy/paste and import lives inside `withNodeId` during fragment
insertion. The existing `init-dissection` lane did not touch that path.

That meant we could keep shaving the wrong seam and still have no honest answer
about whether `withNodeId` deserved more surgery.

## Symptoms

- `init-dissection` only timed construction, initialization, and pure
  `normalizeNodeId(...)`.
- The optimized `withNodeId` insert path still had no dedicated benchmark lane.
- Any argument about paste/import cost was half evidence and half vibes.

## What Didn't Work

- Treating init-time `nodeId` numbers as a proxy for paste/import cost. They are
  not the same path.
- Guessing from unit tests alone. Tests can prove correctness, not the shape of
  the runtime bill.
- Doing more blind `withNodeId` rewrites before measuring duplicate-id paste
  directly.

## Solution

Add a dedicated `nodeid-fragment` benchmark lane to
[`/dev/editor-perf`](/Users/zbeyens/git/plate-2/apps/www/src/app/dev/editor-perf/page.tsx).

The new lane times real `editor.tf.insertFragment(...)` work for four cases:

- NodeId off, raw import
- NodeId on, raw import
- NodeId off, duplicate-id paste
- NodeId on, duplicate-id paste

It also records the counters that actually explain the cost:

- ids assigned during insertion
- duplicate lookup count
- duplicate lookup time
- `insert_node` operation count

The fragment builder intentionally separates two shapes:

- raw import data with no ids
- seeded duplicate paste data whose ids already exist in the destination

The focused helper/spec lives in:

- [workloads.ts](/Users/zbeyens/git/plate-2/apps/www/src/app/dev/editor-perf/workloads.ts)
- [workloads.spec.ts](/Users/zbeyens/git/plate-2/apps/www/src/app/dev/editor-perf/workloads.spec.ts)

## Why This Works

It measures the real seam instead of a neighboring seam.

The first live `5k` run on `http://localhost:3020/dev/editor-perf` with a
`200`-block fragment showed:

- raw import baseline, NodeId off: `5.32 ms`
- raw import, NodeId on: `5.87 ms`
- duplicate paste baseline, NodeId off: `5.54 ms`
- duplicate paste, NodeId on: `20.06 ms`

That means:

- raw import is basically cheap now; enabling NodeId only adds about `0.55 ms`
  for `199` assigned ids
- the real remaining bill is duplicate-id paste, not raw import
- in the duplicate paste case, `199` duplicate lookups cost about `13.89 ms`,
  which explains almost all of the extra runtime

So the benchmark changed the conclusion:

- do not keep optimizing init-time NodeId because paste/import feels scary
- only do more `withNodeId` work if you are targeting duplicate lookup cost

## Prevention

- Do not use init-only benchmarks to justify paste/import rewrites.
- When a plugin has separate init and live-insert paths, benchmark both.
- For NodeId specifically, keep two fragment shapes in the benchmark:
  - raw import
  - duplicate-id paste
- If a future optimization claim does not move the duplicate lookup lane, it is
  probably not moving the real bottleneck.

## Related Issues

- Related learning: [2026-03-31-plate-nodeid-should-use-setnodesbatch-only-for-live-normalization.md](/Users/zbeyens/git/plate-2/.claude/docs/solutions/performance-issues/2026-03-31-plate-nodeid-should-use-setnodesbatch-only-for-live-normalization.md)
- Related reference: [editor-performance-master-plan.md](/Users/zbeyens/git/plate-2/.claude/docs/performance/editor-performance-master-plan.md)
