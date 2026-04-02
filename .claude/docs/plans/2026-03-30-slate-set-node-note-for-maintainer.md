# Slate `set_node` on wide sibling arrays: benchmark note

## Summary

I ran into a large perf cliff while benchmarking Plate against Slate on huge documents.

Plate had a bug on its side: initial `nodeId` normalization was using a live Slate transform once per missing id. That is now fixed in Plate by walking the initial value directly.

While isolating that, I benchmarked the same repeated exact-path update shape inside `slate` itself. The result is consistent:

- repeated `Transforms.setNodes(...)` on a flat huge document is dominated by the `set_node` transform path
- the dominant cost is not normalization
- the dominant cost is not path refs / range refs / dirty-path bookkeeping
- the dominant cost appears to be immutable ancestor-array rewriting in `modifyDescendant`, especially when the parent array is very wide

This is not a DOM benchmark. It is a pure transform benchmark.

## Repro

Benchmark file:

- `packages/slate/test/perf/set-nodes-bench.js`

Commands:

```bash
bun ./packages/slate/test/perf/set-nodes-bench.js --blocks=5000 --group-size=50 --repeats=5
bun ./packages/slate/test/perf/set-nodes-bench.js --blocks=10000 --group-size=50 --repeats=3
```

## What The Benchmark Compares

For the same total paragraph count, it compares:

1. flat document
   every paragraph is a top-level sibling
2. grouped document
   the same paragraphs are distributed under section parents of size `50`

For each shape, it measures:

1. `Transforms.setNodes(editor, { id }, { at: path })` per exact path
2. the same loop inside `Editor.withoutNormalizing(...)`
3. direct `editor.apply({ type: 'set_node', ... })` inside `Editor.withoutNormalizing(...)`
4. bare `modifyDescendant(...)`
5. a one-pass rewrite lower bound

The timed `apply` wrapper also splits:

- ref transforms
- dirty-path updates
- `Transforms.transform(...)`
- `Editor.normalize(...)`

## Source Path

The relevant code path looks like this:

- `packages/slate/src/transforms-node/set-nodes.ts`
  - loops matched nodes and calls `editor.apply({ type: 'set_node', ... })`
- `packages/slate/src/interfaces/transforms/general.ts`
  - `set_node` case calls `modifyDescendant(...)`
- `packages/slate/src/utils/modify.ts`
  - `modifyDescendant(...)` rebuilds ancestor chains with `replaceChildren(...)`
  - `replaceChildren(...)` uses array slicing/spreading

That makes repeated exact-path `set_node` operations sensitive to parent-array width.

## Results

### 5,000 paragraphs

| Case | Flat | Grouped |
|---|---:|---:|
| `setNodes` per path | `73.35 ms` | `22.09 ms` |
| `setNodes` inside outer `withoutNormalizing` | `52.96 ms` | n/a |
| direct `apply(set_node)` | `44.62 ms` | `9.11 ms` |
| bare `modifyDescendant` | `37.01 ms` | `2.38 ms` |
| one-pass rewrite | `0.15 ms` | `0.19 ms` |

### 10,000 paragraphs

| Case | Flat | Grouped |
|---|---:|---:|
| `setNodes` per path | `241.36 ms` | `66.19 ms` |
| `setNodes` inside outer `withoutNormalizing` | `169.07 ms` | n/a |
| direct `apply(set_node)` | `147.71 ms` | `22.16 ms` |
| bare `modifyDescendant` | `140.11 ms` | `7.25 ms` |
| one-pass rewrite | `0.35 ms` | `0.61 ms` |

### Timed `apply` breakdown

At `10,000` flat paragraphs:

- `applyTotalMs`: `146.12 ms`
- `transformMs`: `138.00 ms`
- `dirtyPathsMs`: `2.37 ms`
- `normalizeMs`: `1.76 ms`
- path/point/range refs combined: about `2.56 ms`

At `10,000` grouped paragraphs:

- `applyTotalMs`: `21.81 ms`
- `transformMs`: `12.51 ms`
- `dirtyPathsMs`: `3.78 ms`
- `normalizeMs`: `0.78 ms`

## Interpretation

The strongest signal is shape sensitivity.

The same number of paragraph nodes gets much cheaper as soon as wide top-level sibling arrays become smaller grouped arrays. That strongly suggests the main cost is not generic normalization overhead. It is the repeated immutable rewrite of ancestor chains, especially wide `children` arrays.

The `modifyDescendant(...)` numbers are the clearest evidence:

- `5,000` flat: `37.01 ms`
- `5,000` grouped: `2.38 ms`
- `10,000` flat: `140.11 ms`
- `10,000` grouped: `7.25 ms`

That is already most of the `apply(set_node)` cost.

So the current behavior seems to be:

- `setNodes(...)` itself adds some overhead
- `apply(...)` adds some overhead
- but most of the real cost is still the underlying immutable tree rewrite in the `set_node` transform path

## Why I Think This Is Worth Flagging

This does not mean Slate is doing something incorrect.

It does mean there may be an upstream optimization seam for workloads that need to set many exact-path node props on very wide sibling arrays.

The Plate bug is fixed locally by avoiding this pattern during initial-value normalization. But the underlying Slate transform shape still looks expensive enough that it may be worth considering an optimization for exact-path bulk updates.

## Possible Upstream Directions

These are just candidate ideas, not a fully baked proposal:

1. Add a batched exact-path `set_node` path.
   If the caller already has exact paths, shared ancestors could be rebuilt once instead of once per op.

2. Add an internal fast path for `setNodes` when:
   - `at` is an exact `Path`
   - there is no range splitting
   - there is no broad `match` traversal
   - the update is just property replacement

3. Add a lower-level “apply many node property updates” helper.
   This could preserve Slate semantics while avoiding repeated ancestor cloning for the same parent chain.

## Caveats

- This is a Node-side microbenchmark, not a browser mount benchmark.
- It does not say anything about Slate React rendering.
- It does not claim `normalize` is free in all cases, only that it is not the dominant cost in this specific repeated exact-path `set_node` workload.
- The Plate issue that triggered this investigation is already fixed on the Plate side. I am sharing this because the benchmark suggests a more general Slate-level seam.

## Ask

Does this line up with your understanding of the current transform costs?

If useful, I can also put together a smaller upstream-style benchmark or try a prototype batched exact-path implementation to compare against the current path.
