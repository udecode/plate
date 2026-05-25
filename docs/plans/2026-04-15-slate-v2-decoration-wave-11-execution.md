---
date: 2026-04-15
topic: slate-v2-decoration-wave-11-execution
status: in_progress
source_repos:
  - /Users/zbeyens/git/plate-2
  - /Users/zbeyens/git/slate-v2
---

# Goal

Execute Wave 11 from the decoration roadmap:
indexed or child-scoped projection recompute.

# Scope

- core range projection locality
- projection-store incremental recompute locality
- benchmark counters for recomputed source ids and runtime ids
- targeted proofs and docs only where this wave forces them

# Constraints

- no scope reduction
- keep current public usage working
- full traversal/full refresh stay as safe fallbacks
- no fake ProseMirror clone; this is a focused local projection-engine cut
- must end with fresh verification, architect review, deslop, and post-deslop
  re-verification

# Phases

- [x] Ground context and wave scope
- [x] Choose the smallest Wave 11 implementation seam
- [x] Implement Wave 11 projection-engine locality
- [x] Verify with targeted and package-level evidence
- [x] Architect review
- [x] Deslop + post-deslop re-verification

# Findings

- Wave 10 is complete and gives this wave source dirtiness declarations
- current core still collects all text entries per `projectRange(...)` call
- current projection store still reprojects from the full returned projection
  list after a dirty recompute
- current benchmarks do not count source/runtime recompute locality yet
- the smallest honest core cut is:
  - same-text fast path
  - same-top-level-block fast path
  - lazy global ordered text-entry index only for broader cross-block ranges
- the smallest honest store cut is:
  - incremental projection diff by source+key+occurrence
  - conservative range/data identity reuse
  - runtime-id-local slice rebuild only for touched runtime ids
  - fail-closed empty projection for invalid/out-of-snapshot range projection
- current benchmarks needed explicit recompute metrics surfaces
- `docs/shared/agent-tiers.md` is missing in this repo

# Progress

## 2026-04-15

- created the Ralph context snapshot and execution note
- read the locked Wave 11 contract and the perf-architecture decision pages
- confirmed the current core hotspot in `packages/slate/src/range-projection.ts`
- confirmed the current projection-store hotspot in
  `packages/slate-react/src/projection-store.ts`
- mapped the current React and replacement benchmark seams for later metric
  integration
- stress-tested the design with an architect sidecar:
  - keep Wave 11 as an internal projection-runtime optimization
  - require same-text/block-local fast paths in core
  - require conservative diffing, deleted-anchor fail-closed behavior, and
    benchmark-visible metrics
- landed the core range projection cut in:
  - `packages/slate/src/range-projection.ts`
  - same-text fast path
  - same-top-level-block fast path
  - lazy per-snapshot ordered text-entry index for broader ranges
- landed the projection runtime cut in:
  - `packages/slate-react/src/projection-store.ts`
  - `packages/slate-react/src/decoration-sources.ts`
  - `packages/slate-react/src/annotation-store.ts`
  - `packages/slate-react/src/widget-store.ts`
  - `packages/slate-react/src/hooks/use-slate-range-ref-projection-store.tsx`
  - `packages/slate-react/src/hooks/use-slate-projections.tsx`
  - `packages/slate-react/src/index.ts`
- added Wave 11 proof rows in:
  - `packages/slate-react/test/projections-and-selection-contract.tsx`
    - local projection recompute preserves unrelated runtime-id slice identity
    - deleted range-ref projections fail closed when the anchor is removed
- extended benchmark surfaces in:
  - `scripts/benchmarks/browser/react/rerender-breadth.tsx`
  - `scripts/benchmarks/browser/replacement/huge-document-overlays.mjs`
  - `site/examples/ts/huge-document.tsx`
- updated docs to distinguish:
  - subscription locality
  - source invalidation locality
  - projection recompute locality
  in:
  - `docs/walkthroughs/09-performance.md`
  - `docs/libraries/slate-react/hooks.md`
- fresh evidence so far:
  - `pnpm install`
  - `pnpm turbo build --filter=./packages/slate --filter=./packages/slate-react`
  - `pnpm turbo typecheck --filter=./packages/slate --filter=./packages/slate-react`
  - `pnpm lint:fix`
  - `pnpm --filter slate-react test` → `101 passed`
  - `pnpm exec mocha --require ./config/babel/register.cjs ./packages/slate/test/snapshot-contract.ts`
    → `188 passing`
  - `pnpm exec tsc --project site/tsconfig.json --noEmit`
  - targeted projection contract rerun →
    `15 passed`
  - `REACT_BREADTH_BENCH_ITERATIONS=1 REACT_BREADTH_SELECTION_OPS=2 pnpm bench:react:rerender-breadth:local`
    → recompute counters emitted in JSON
  - `REPLACEMENT_BENCH_ITERATIONS=1 REPLACEMENT_HUGE_BLOCKS=200 pnpm bench:replacement:huge-document:overlays:local`
    → overlay / annotation / widget recompute counters emitted in JSON
  - `lsp_diagnostics` on affected Slate / slate-react / benchmark / example
    files → `0 errors`
- architect review then caught one correctness hole in the incremental cache:
  - unchanged projection identity alone was not enough for reuse because a
    touched runtime id inside a stable multi-text range can still change the
    projected interior segment length
- fixed the reuse guard in:
  - `packages/slate-react/src/projection-store.ts`
  - cached projections now reproject when the current `SnapshotChange`
    touches one of their previously projected runtime ids, or when dirtiness is
    broad/unknown
- added the exact regression row in:
  - `packages/slate-react/test/projections-and-selection-contract.tsx`
    → `multi-text projections reproject touched interior runtime ids even when the range is unchanged`
- architect review then caught one integration hole:
  - decoration-source and annotation-store wrappers rebuilt cached projections
    with `SnapshotChange`, but passed that refresh into the inner projection
    store without a reason override, so the inner `external` dirtiness gate
    could skip the recompute entirely
- fixed the wrapper integration in:
  - `packages/slate-react/src/projection-store.ts`
  - `packages/slate-react/src/decoration-sources.ts`
  - `packages/slate-react/src/annotation-store.ts`
- added the exact integration regression row in:
  - `packages/slate-react/test/projections-and-selection-contract.tsx`
    → `decoration source stores preserve multi-text projection correctness across touched interior runtime ids`
- final benchmark smoke values after the fix:
  - react rerender breadth:
    - decoration source ids recomputed: `1`
    - decoration runtime ids touched: `2`
    - decoration runtime ids with changed slice identity: `2`
    - annotation source ids recomputed: `1`
    - annotation runtime ids touched: `1`
    - annotation runtime ids with changed slice identity: `1`
  - huge-document overlays:
    - overlay source recompute count: `1`
    - annotation source recompute count: `2`
    - widget recompute count: `2`
    - runtime ids touched count: `2`
    - runtime ids changed count: `2`
    - type-after-overlay-toggle: `10.89ms`
- architect review then caught one overlap-precedence hole:
  - order-only projection changes were not invalidating runtime ids, so
    overlapping slice precedence could stay stale
- fixed order invalidation in:
  - `packages/slate-react/src/projection-store.ts`
- added the exact regression row in:
  - `packages/slate-react/test/projections-and-selection-contract.tsx`
    → `projection store updates runtime slice order when overlapping projection order changes`
- architect review then caught one last invalid-cache hole:
  - invalid empty cached projections were never retried when later text changes
    made the same range valid
- fixed invalid-cache recovery in:
  - `packages/slate-react/src/projection-store.ts`
- added the exact regression row in:
  - `packages/slate-react/test/projections-and-selection-contract.tsx`
    → `invalid cached projections reproject when later text changes make the range valid`
- fixed the unchanged-range annotation integration hole in:
  - `packages/slate-react/src/annotation-store.ts`
- added the exact regression row in:
  - `packages/slate-react/test/annotation-store-contract.tsx`
    → `annotation projection store reprojects touched interior runtime ids even when the resolved range is unchanged`
- final architect outcome:
  - `APPROVED`
- deslop re-audit result:
  - no further dead code, duplicate logic, or cleanup worth changing inside the
    Ralph-owned file scope
- post-deslop re-verification:
  - `pnpm turbo build --filter=./packages/slate --filter=./packages/slate-react`
  - `pnpm turbo typecheck --filter=./packages/slate --filter=./packages/slate-react`
  - `pnpm lint:fix`
  - `pnpm --filter slate-react test` → `103 passed`
  - `pnpm exec mocha --require ./config/babel/register.cjs ./packages/slate/test/snapshot-contract.ts`
    → `188 passing`
  - `pnpm exec tsc --project site/tsconfig.json --noEmit`
  - `REACT_BREADTH_BENCH_ITERATIONS=1 REACT_BREADTH_SELECTION_OPS=2 pnpm bench:react:rerender-breadth:local`
  - `REPLACEMENT_BENCH_ITERATIONS=1 REPLACEMENT_HUGE_BLOCKS=200 pnpm bench:replacement:huge-document:overlays:local`

# Errors

- the explorer sidecar died from context pressure; local grounding was already
  sufficient so work continued without it
- package build initially failed because the fallback store in
  `use-slate-projections.tsx` no longer matched the expanded
  `SlateProjectionStore` interface
  - fixed by adding an empty `getMetrics()` implementation
- the benchmark smoke run initially failed because:
  - `useEffect` was missing from the rerender-breadth imports
  - the decoration-source store was not forwarding `getMetrics()`
- first architect review rejected the batch because multi-text ranges could
  reuse stale cached segments when the range/data identity stayed stable but a
  touched interior runtime id changed text length
- second architect review rejected the batch because the decoration-source
  wrapper lost editor-change context before the inner projection-store refresh
- third architect review rejected the batch because order-only projection
  changes could leave overlapping slice precedence stale
- fourth architect review rejected the batch because invalid empty cached
  projections were never retried when later text changes made the range valid
- fifth architect review rejected the batch because unchanged-range multi-text
  annotations were skipping projection refresh when the sidebar snapshot did not
  change
