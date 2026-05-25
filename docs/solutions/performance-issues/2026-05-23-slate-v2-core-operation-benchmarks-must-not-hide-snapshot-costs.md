---
title: Slate v2 core operation benchmarks must not hide snapshot costs
date: 2026-05-23
category: docs/solutions/performance-issues
module: Slate v2 core benchmark suite
problem_type: performance_issue
component: tooling
symptoms:
  - "Core huge-document text inserts looked document-sized even after transaction snapshot work was narrowed"
  - "Observation and normalization compare rows stayed red because helpers read `Editor.getSnapshot(editor).children` after every write"
  - "A legacy-vs-v2 benchmark failed because the script destructured legacy `Node` while v2 exports `NodeApi`"
root_cause: logic_error
resolution_type: code_fix
severity: high
tags:
  - slate-v2
  - performance
  - benchmarks
  - snapshots
  - transactions
  - node-api
---

# Slate v2 core operation benchmarks must not hide snapshot costs

## Problem

The core operation lane was measuring the right user path, but some benchmark
assertion helpers were reading full snapshots after each operation. That made
small text writes look document-sized and hid whether the transaction fast lane
actually helped.

## Symptoms

- `core-huge-document-compare-local` originally showed simple typing at tens of
  milliseconds for 1000 blocks.
- `core-observation-compare-local` ran but reported
  `readChildrenLengthAfterEachMs` around `36ms` for 500 blocks after the first
  transaction fix.
- `normalization-compare-local` reported `insertTextReadAfterEachMs` around
  `49ms` even though the row only needed live children length after each insert.
- `core-observation-compare-local` failed in v2 with `Node.nodes` undefined
  because v2 exposes `NodeApi` while legacy Slate exposes `Node`.

## What Didn't Work

- Treating every red benchmark row as core runtime cost. Some rows were
  measuring the helper's snapshot materialization, not the operation.
- Fixing transaction setup alone. That helped the true write path, but benchmark
  helpers could still reintroduce O(document) reads after the write.
- Assuming benchmark scripts can use only legacy Slate exports. Compare scripts
  must run against both legacy and v2 packages.

## Solution

Keep snapshot reads explicit. When a benchmark row only needs live children for
assertions, prefer the live public API and fall back to snapshots only for older
surfaces:

```js
const getChildren = (editor) =>
  typeof Editor.getChildren === 'function'
    ? Editor.getChildren(editor)
    : typeof Editor.getSnapshot === 'function'
      ? Editor.getSnapshot(editor).children
      : typeof editor.getChildren === 'function'
        ? editor.getChildren()
        : editor.children
```

For compare scripts that traverse nodes, support both API names:

```js
const NodeApi =
  Slate.NodeApi ?? Slate.Node ?? SlateInternal.NodeApi ?? SlateInternal.Node

assert.ok(NodeApi?.nodes, 'Slate Node API with nodes() is required')
```

Lock the benchmark contract in tests by asserting that the helper checks
`Editor.getChildren` before `Editor.getSnapshot`, and that observation compare
uses the `NodeApi` fallback instead of destructuring `Node`.

## Why This Works

Snapshot materialization is a valid thing to measure when the row is about
snapshots. It is not valid when the row is supposed to measure text writes,
children reads, normalization, or observation traversal.

Keeping live children reads first made the benchmark isolate the actual owner:
transaction/write cost. After the fix, the observation children row dropped from
about `36ms` to about `2.8ms`, and the normalization read-after-each row dropped
from about `49ms` to about `3.6ms`.

The `NodeApi` fallback keeps the same compare script runnable against legacy
Slate and v2 without making the benchmark package-specific.

## Prevention

- In core performance benchmarks, name snapshot rows honestly and keep other
  rows out of `Editor.getSnapshot`.
- Add contract tests for benchmark helper order when a helper can accidentally
  choose an expensive API first.
- Compare scripts should resolve renamed v2 APIs through explicit fallbacks
  instead of assuming the legacy export name.
- When a benchmark row stays red after a runtime fix, inspect the benchmark
  helper before changing product code.

## Related Issues

- [Slate v2 text snapshots should be path-stable for large-document typing](/Users/zbeyens/git/plate-2/docs/solutions/performance-issues/2026-05-01-slate-v2-text-snapshots-should-be-path-stable-for-large-document-typing.md)
- [Slate v2 huge-document typing needs selector-fanout cuts before islands](/Users/zbeyens/git/plate-2/docs/solutions/performance-issues/2026-04-11-slate-v2-huge-document-typing-needs-selector-fanout-cuts-before-islands.md)
