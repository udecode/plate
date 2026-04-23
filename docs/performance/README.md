# Performance Docs

This directory is the human-facing source of truth for Plate editor
performance work.

## Read Order

1. [editor-performance-master-plan.md](/Users/zbeyens/git/plate-2/docs/performance/editor-performance-master-plan.md)
   - the main program document
   - current state, key wins, remaining red lanes, and sequencing
2. [plate-vs-slate-benchmarks.md](/Users/zbeyens/git/plate-2/docs/performance/plate-vs-slate-benchmarks.md)
   - benchmark narrative and forensic history
   - use this when you need to understand why a cut mattered
3. [editor-performance-next-phase-consensus.md](/Users/zbeyens/git/plate-2/docs/performance/editor-performance-next-phase-consensus.md)
   - planning artifact for the earlier “what next” decision
   - useful for rationale, not for the latest numbers
4. [performance-benchmark-spec.md](/Users/zbeyens/git/plate-2/docs/performance/performance-benchmark-spec.md)
   - benchmark contract for the public Performance guide
   - defines scope, workloads, and claim boundaries
5. [2026-04-04-standalone-benchmark-gap-analysis.md](/Users/zbeyens/git/plate-2/docs/performance/2026-04-04-standalone-benchmark-gap-analysis.md)
   - why the standalone rich-markdown lab exposed a Plate mount gap
   - current diagnosis and next optimization targets
6. [2026-04-03-affinity-redesign-plan.md](/Users/zbeyens/git/plate-2/docs/performance/2026-04-03-affinity-redesign-plan.md)
   - plan for the hard-affinity code-mark redesign
7. [2026-04-03-remaining-basic-nodes-benchmark.md](/Users/zbeyens/git/plate-2/docs/performance/2026-04-03-remaining-basic-nodes-benchmark.md)
   - plan for the remaining `@platejs/basic-nodes` census extension

## Artifact Policy

- Durable markdown lives here.
- Raw benchmark JSON lives in [tmp/](/Users/zbeyens/git/plate-2/tmp/).
- Older docs may still mention `docs/plans/*.json` from before the raw
  artifact move. When that happens, prefer the matching file in `tmp/`.
- Internal one-off planning/proof notes belong under `docs/plans/`, not
  here, unless they are directly useful to understanding the performance story.

## Release Snapshot

As of `2026-04-03`:

- plain core is good enough versus Slate
- insert-text perf is good enough
- `nodeId` is no longer the cliff
- the dedicated `nodeId` paste/import lane now exists, and it shows:
  - raw import is basically cheap
  - duplicate-id paste is the only remaining meaningful `withNodeId` hotspot
- code-affinity redesign landed and materially improved the worst core-plugin
  lane
- newly benchmarked remaining `basic-nodes` plugins split cleanly:
  - green enough: `KbdPlugin`, `SubscriptPlugin`, `SuperscriptPlugin`
  - still red: `HighlightPlugin`, `StrikethroughPlugin`

## What Is Left After Release

If we ship now, the meaningful remaining performance work is:

1. `HighlightPlugin`
   - currently still well behind Slate on the activated lane
2. `StrikethroughPlugin`
   - same story; cheap mark path still too expensive
3. Table selection
   - still a separate real hotspot, not solved by core editor work
4. Performance-doc cleanup
   - some historical JSON artifact links still need cleanup/consolidation

## What Is Not Worth Chasing Right Now

- more cheap-mark surgery on bold/italic/underline
- insert-text perf
- more init-time `nodeId` surgery without a new duplicate-paste result
- chunking rhetoric without a new workload
- more code-affinity tuning unless behavior bugs appear
