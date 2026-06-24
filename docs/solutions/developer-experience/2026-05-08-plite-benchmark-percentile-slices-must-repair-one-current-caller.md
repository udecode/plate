---
title: Plite benchmark percentile slices must repair one current caller
date: 2026-05-08
category: docs/solutions/developer-experience
module: plite benchmark tooling
problem_type: developer_experience
component: tooling
symptoms:
  - "Benchmark artifacts exposed mean and median but no p75, p95, or p99"
  - "Several documented core benchmark commands failed on removed Plite write aliases"
  - "A shared helper change had no proof until at least one current core and one React benchmark produced artifacts"
root_cause: wrong_api
resolution_type: tooling_addition
severity: medium
tags: [plite, benchmarks, percentiles, performance, tooling]
---

# Plite Benchmark Percentile Slices Must Repair One Current Caller

## Problem

Performance planning needed p75/p95/p99 in repeated-sample artifacts before any
threshold could be honest. Adding the shared summary fields was not enough,
because several benchmark callers had drifted behind the current Plite write
API and could not produce artifacts.

## Symptoms

- `bench:core:editor-store:local` failed on `Editor.setChildren`.
- Other core benchmark commands failed on removed aliases such as
  `Editor.withTransaction`, `editor.insertText`, and `editor.select`.
- Compare benchmarks failed earlier in legacy repo build setup.
- React benchmark artifacts used the shared React summary helper and were a
  clean proof target.

## What Didn't Work

- Treating the plan's benchmark command list as automatically runnable. It was
  stale against the current transaction-first API.
- Trying multiple core benchmark commands hoping one would pass. That exposed
  broad benchmark API drift, not a reason to expand the first percentile slice.
- Smuggling a full benchmark migration into the shared percentile patch. That
  would make the slice too wide and make failures hard to attribute.

## Solution

Keep the shared helper change small, then repair one current core caller enough
to prove the schema.

In `scripts/benchmarks/shared/stats.mjs` and
`scripts/benchmarks/shared/react-benchmark.tsx`, add one percentile helper and
emit additive fields:

```ts
const percentile = (sorted: number[], ratio: number) => {
  if (sorted.length === 0) return 0

  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil(sorted.length * ratio) - 1)
  )

  return sorted[index]
}
```

Then include:

```ts
p75: round(percentile(sorted, 0.75)),
p95: round(percentile(sorted, 0.95)),
p99: round(percentile(sorted, 0.99)),
```

For the core proof caller, update `editor-store.mjs` to the current API:

```js
editor.update((tx) => {
  tx.text.insert(text, options)
})
```

Use internal state helpers only where the benchmark is intentionally measuring
low-level state mechanics:

```js
import { Editor, setEditorChildren } from '../../../../packages/plite/src/internal/index.ts'

setEditorChildren(editor, createChildren(blockCount, `children-${index}`))
const children = Editor.getSnapshot(editor).children
```

Proof commands:

```bash
bun run bench:core:editor-store:local
bun run bench:react:huge-document-overlays:local
bun check
```

Inspect the emitted JSON artifacts, not just command success:

- `.tmp/slate-editor-store-benchmark.json`
- `packages/plite-react/tmp/slate-react-huge-document-overlays-benchmark.json`

## Why This Works

The shared helpers carry the artifact schema for many benchmark families. One
core artifact and one React artifact prove both helper paths without migrating
the whole benchmark suite.

Repairing exactly one stale core caller preserves slice boundaries: percentile
artifact shape is done, while broader benchmark API drift remains a separate
bounded owner.

## Prevention

- For benchmark infrastructure slices, prove one current core artifact and one
  current React artifact.
- Do not trust benchmark command lists blindly after public editor API cuts.
- If multiple benchmark commands fail on removed aliases, record benchmark API
  drift and split it into a later slice.
- Do not add release thresholds in the same patch as percentile schema. First
  collect repeated current and legacy baselines.

## Related Issues

- [Plite hard cuts must run explicit contract files](./2026-04-29-plite-hard-cuts-must-run-explicit-contract-files.md)
- [Plite migration must take transaction seams from real draft source, not reference proposals](./2026-04-18-plite-migration-must-take-transaction-seams-from-real-draft-source-not-reference-proposals.md)
- [Plite huge document typing needs selector fanout cuts before islands](../performance-issues/2026-04-11-plite-huge-document-typing-needs-selector-fanout-cuts-before-islands.md)
