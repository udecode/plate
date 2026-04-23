---
title: Mark bundle tax comes from inactive leaf and text renderer fan-out
date: 2026-04-04
category: docs/solutions/performance-issues
module: marks mount path
problem_type: performance_issue
component: tooling
symptoms:
  - "Standalone `10k` mark-heavy mount lanes were materially slower than Slate even after earlier plain-mark fast paths"
  - "`BasicMarksPlugin` was much slower than the matching single-mark lane"
  - "The DOM shape looked roughly identical, but Plate still paid a larger mount bill"
root_cause: logic_error
resolution_type: code_fix
severity: medium
tags:
  - plate
  - performance
  - marks
  - pipeRenderLeaf
  - pipeRenderText
  - benchmark
  - render
---

# Mark bundle tax comes from inactive leaf and text renderer fan-out

## Problem

The standalone editor benchmark exposed a red `10k` bold lane even after the
earlier cheap-mark fast paths.

The deceptive part was that the mounted DOM was already basically the same as
Slate:

- `10,000` `<strong>` nodes
- `30,000` leaf nodes
- `30,000` string nodes
- `90,000` `<span>` nodes

So the extra runtime was not a "Plate mounts more DOM" story.

## Symptoms

Current standalone rows on the rich benchmark lab:

- `86_mount-10k-bold-basic`: Plate `585.90 ms`, Slate `375.90 ms`
- `90_mount-10k-bold-single`: Plate `424.50 ms`, Slate `343.20 ms`
- `94_mount-10k-bold-direct`: Plate `406.00 ms`, Slate `333.90 ms`

That split says:

- the direct lower bound is already fine
- the single mark path still pays extra runtime above that floor
- the full basic bundle pays a much larger extra tax above the single mark path

## What Didn't Work

- Treating the earlier instrumentation as if it had proven inactive plugin work
  was gone. It only counted the active keyed work we instrumented.
- Focusing on DOM size. The DOM shape was already basically equivalent.
- Chasing `strikethrough` alone before proving the shared mark path.

## Solution

Key the shared mark render pipes by active mark instead of visiting every mark
renderer on every leaf/text node.

Kept cuts:

- in
  [pipeRenderLeaf.tsx](/Users/zbeyens/git/plate-2/packages/core/src/react/utils/pipeRenderLeaf.tsx),
  store leaf renderers by mark key and only call the renderer when that key is
  present on the current leaf
- in
  [pipeRenderText.tsx](/Users/zbeyens/git/plate-2/packages/core/src/react/utils/pipeRenderText.tsx),
  do the same for text-side mark renderers
- still in
  [pipeRenderLeaf.tsx](/Users/zbeyens/git/plate-2/packages/core/src/react/utils/pipeRenderLeaf.tsx),
  handle simple active leaf marks directly inside the pipe instead of routing
  them back through `pluginRenderLeaf(...)`

Targeted regression coverage:

- [pipeRenderLeaf.spec.tsx](/Users/zbeyens/git/plate-2/packages/core/src/react/utils/pipeRenderLeaf.spec.tsx)

The new tests prove inactive leaf/text renderers are skipped instead of being
invoked and returning the original children.

## Why This Works

Before the cut:

- `pipeRenderLeaf(...)` still walked every leaf renderer for every leaf
- `pipeRenderText(...)` still walked every text renderer for every text node

On a `10k` bold-only fixture, that means the basic mark bundle was paying for a
pile of irrelevant sibling mark work on every node even though only `bold` was
active.

After the cut, the cost splits cleanly:

- bundle tax shrinks to the real active mark work
- the remaining single-mark gap is the shared active mark runtime itself

The second kept cut moved those rows again:

- `48_mount-10k-marks-basic`: about `1387 ms -> 1310 ms`
- `86_mount-10k-bold-basic`: about `673 ms -> 597 ms`
- `90_mount-10k-bold-single`: about `439 ms -> 428 ms`

The next kept cut stayed in the same shared pipes, but fixed a subtler bill:

- the naive fast path that walked every simple mark entry on every leaf helped
  marked leaves and hurt plain leaves inside rich paragraphs
- the kept version first checks whether the current leaf/text node owns any
  relevant mark keys
- only then does it walk the already ordered simple or complex mark arrays

That keeps plain leaves cheap while still removing the per-render
`Object.keys(...).flatMap(...).sort(...)` churn on marked leaves.

Focused reruns on the kept hybrid path landed here:

- `48_mount-10k-marks-basic`: Plate `1244.70 ms`, Slate `903.00 ms`
- `86_mount-10k-bold-basic`: Plate `557.20 ms`, Slate `335.60 ms`
- `90_mount-10k-bold-single`: Plate `399.90 ms`, Slate `342.50 ms`
- `91_mount-10k-italic-single`: Plate `388.30 ms`, Slate `349.90 ms`
- `93_mount-10k-strikethrough-single`: Plate `439.80 ms`, Slate `339.60 ms`

Widening the decomposition to the remaining special marks showed that no single
plugin was secretly causing the whole remaining wall:

- `98_mount-10k-code-basic`: Plate `418.70 ms`, Slate `387.00 ms`
- `100_mount-10k-subscript-basic`: Plate `410.90 ms`, Slate `382.80 ms`
- `102_mount-10k-superscript-basic`: Plate `395.30 ms`, Slate `384.20 ms`

So the remaining `marks-basic` lane is mostly the aggregate cost of many marked
leaves in the same workload, not one hidden special-mark disaster.

That gives a clean optimization order:

1. remove inactive bundle fan-out
2. then attack the active shared mark path if the single-mark lane is still red

## Prevention

- When a benchmark says "bundle is much slower than single", check whether the
  runtime still visits inactive sibling renderers.
- Do not use DOM-size parity as proof that runtime overhead is gone.
- For rich editor performance work, always keep three rows:
  - bundle
  - single plugin
  - direct lower bound

## Related Issues

- Related analysis: [2026-04-04-standalone-benchmark-gap-analysis.md](/Users/zbeyens/git/plate-2/docs/performance/2026-04-04-standalone-benchmark-gap-analysis.md)
- Related reference: [editor-performance-master-plan.md](/Users/zbeyens/git/plate-2/docs/performance/editor-performance-master-plan.md)
