# Performance Docs

This directory preserves benchmark contracts and dated performance narratives.
Use the [feature review ledger](../research/reviews.md) for current decisions
and the relevant feature hub for subsequent measurements. The April program
and release snapshot below do not certify present performance.

## Read Order

1. [editor-performance-master-plan.md](editor-performance-master-plan.md)
   - the main program document
   - recorded April state, wins, red lanes, and sequencing
2. [plate-vs-plite-benchmarks.md](plate-vs-plite-benchmarks.md)
   - benchmark narrative and forensic history
   - use this when you need to understand why a cut mattered
3. [editor-performance-next-phase-consensus.md](editor-performance-next-phase-consensus.md)
   - planning artifact for the earlier “what next” decision
   - useful for rationale, not for the latest numbers
4. [performance-benchmark-spec.md](performance-benchmark-spec.md)
   - benchmark contract for the public Performance guide
   - defines scope, workloads, and claim boundaries
5. [2026-04-04-standalone-benchmark-gap-analysis.md](2026-04-04-standalone-benchmark-gap-analysis.md)
   - why the standalone rich-markdown lab exposed a Plate mount gap
   - diagnosis and proposed targets at that date
6. [2026-04-03-affinity-redesign-plan.md](2026-04-03-affinity-redesign-plan.md)
   - plan for the hard-affinity code-mark redesign
7. [2026-04-03-remaining-basic-nodes-benchmark.md](2026-04-03-remaining-basic-nodes-benchmark.md)
   - plan for the remaining `platejs` basic-node census extension

## Artifact Policy

- Durable markdown lives here.
- Raw benchmark JSON may live in ignored `.tmp/` and may be unavailable in
  another checkout. A narrative alone does not recover missing samples.
- Older docs may still mention `docs/plans/*.json` from before the raw
  artifact move. When that happens, prefer the matching file in `.tmp/`.
- Internal one-off planning/proof notes belong under `docs/plans/`, not
  here, unless they are directly useful to understanding the performance story.

## Release Snapshot

As of `2026-04-03`:

- plain core is good enough versus Plite
- insert-text perf is good enough
- `nodeId` is no longer the cliff
- the dedicated `nodeId` paste/import lane now exists, and it shows:
  - raw import is basically cheap
  - duplicate-id paste is the only remaining meaningful `withNodeId` hotspot
- code-affinity redesign landed and materially improved the worst core-plugin
  lane
- newly benchmarked remaining `basic-nodes` plugins split cleanly:
  - green enough: `KbdPlugin`, `ScriptPlugin`
  - still red: `HighlightPlugin`, `StrikethroughPlugin`

## Recorded post-release targets

The April snapshot proposed these remaining targets:

1. `HighlightPlugin`
   - currently still well behind Plite on the activated lane
2. `StrikethroughPlugin`
   - same story; cheap mark path still too expensive
3. Table selection
   - still a separate real hotspot, not solved by core editor work
4. Performance-doc cleanup
   - some historical JSON artifact links still need cleanup/consolidation

## Rejected work in the April snapshot

- more cheap-mark surgery on bold/italic/underline
- insert-text perf
- more init-time `nodeId` surgery without a new duplicate-paste result
- chunking rhetoric without a new workload
- more code-affinity tuning unless behavior bugs appear
