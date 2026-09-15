---
title: Reads and demand-driven invalidation
type: decision
status: proposed
updated: 2026-09-11
review_scope: reads
current_review: 2026-09-11-reads-demand-driven-invalidation
review_history:
  - ../review-records/2026-09-11-reads-demand-driven-invalidation.json
source_refs:
  - ../../../packages/plitejs/src/core/commit.ts
  - ../../../packages/plitejs/src/core/public-state.ts
  - ../../../packages/plitejs/src/react/hooks/use-editor-selector.tsx
related:
  - ./slate-v2-read-update-runtime-architecture.md
  - ./performance-candidate-reuse.md
---

# Reads and demand-driven invalidation

**Pursue:** remove whole-root change analysis from a single-key invalidation
query. Keep that query and its memoized answer on the canonical commit. Route
mounted consumers by their actual dependencies; enumerate complete change sets
only when the consumer needs the complete set.

This is a direction for further work. The warm, primary-root membership probe
passes; the complete React dispatch architecture is still provisional.

## Required behavior and ideal ownership

A read must observe one coherent document/root and the correct active draft or
committed state. Installed extension methods preserve exact identity and pure
read guards. Retained snapshots keep their old values and node-key locations.
Subscriptions publish current values synchronously, preserve equality and
cleanup, and distinguish model changes from mounted DOM rendering needs.

The ideal is one document/change authority with explicit live and historical
read lifetimes. It answers a consumer's dependency without deriving unrelated
dependencies. React owns DOM synchronization and mounted-view retirement; Plate
owns feature policy. Those laws do not require a new signal, query descriptor,
store, public snapshot factory or public invalidation vocabulary.

## Current evidence

- `public-state.ts:getStateView` caches callable read topology by extension
  registry and transform generation. Its methods read live state, including the
  active draft. A document commit does not reconstruct extension methods.
- `snapshot-index.ts` maps node identities through canonical changes and retains
  immutable snapshot locations. It is an existing index owner, not evidence for
  a second public document model.
- `commit.ts:hasNodeKey` calls `getAggregateNodeKeys`, which calls `getRootDetails`
  for path and payload queries. After a prefix insertion, `getRootDetails`
  recursively compares shifted descendants even for one unchanged watched key.
- `use-editor-selector.tsx:onChange` requests root-order and aggregate node,
  path and selection information before it inspects listener demand.
  `Plite` also requests paths for DOM binding updates before selector dispatch.
  Changing `hasNodeKey` alone will not remove that consumer work.
- Plate `usePath` consumes Plite node selectors. Plate's general selector adapter
  consumes `useEditorRuntimeState`; the latter already uses canonical commits
  and the same generic selector owner. Table slice middleware has a separate
  policy job and is not a competing snapshot/subscription system.
- React's `runtime-live-state.ts` tries several lookup paths. This is additional
  evidence to reconcile canonical absence/root semantics during adoption, not
  permission to remove its fallbacks without proving view and draft behavior.

## Alternatives

| Direction | Judgment |
| --- | --- |
| Keep/configure current APIs | Keep direct and callback reads, configuration-scoped method topology and explicit snapshot lifetimes. Caller filters cannot avoid the aggregate work inside `hasNodeKey`. |
| Change the existing owner | Pursue query-specific membership on `EditorCommit.changed`, sharing positive and negative results per immutable commit. Split path membership from aggregate root details; adapt demand-sensitive dispatch and DOM binding consumers. |
| Add observed-read handles, automatic tracking or signals | Reject for this job. Existing node identity and commit queries can express the dependency. A new dependency graph adds lifetime and external-input rules without solving the proven owner defect. |
| Delete snapshots or merge them with live read views | Reject the consolidation. Historical values and live transaction/root reads have distinct jobs. Binding all methods to immutable revisions restores configuration work or requires another binding layer; exposing only live methods loses retained historical reads. |
| Delete the snapshot index into the token index | Not justified by this evidence. Canonical token changes and retained runtime-key locations differ; moving key mapping does not eliminate it. The disputed cost is unnecessary enumeration of existing information. |
| Move all subscription logic into core | Keep model invalidation at the commit owner, but retain DOM-sync suppression and view retirement in React. A core event bus cannot own native text rendering decisions. |
| Replace the generic selector store | Retain the earlier E06 Defer. The current probe isolates commit queries, not selector allocation, concurrent render behavior or Compiler cost. |

Proposed ownership flow, using the existing public call:

```text
commit.changed.hasNodeKey(key, 'path')
  -> commit-owned memoized membership
  -> canonical before/after identity indexes
  -> subscribers whose dependency changed
```

No new public signature is selected. Whole-set APIs remain available for
consumers whose actual job requires them; their work must not be an incidental
cost of a membership question.

## Proof and limits

The [probe contract](../../plans/2026-09-11-reads-api-review.md) was frozen before
measurement. It compares reconstructed canonical commits over the same
materialized snapshots, with 32/1,024/8,192 paragraphs and 0/1/32/all-paragraph
watchers. The single watcher reads the unchanged prefix, so the result includes
a known negative answer. Insert, removal, movement and text edits also compare
all before/after keys plus an absent key.

At 8,192 paragraphs, the first one-key query performs 32,788 index calls in the
current implementation and two in the proposed cached reader. Repeated reads
perform zero index calls in both. Boolean parity passes for all measured rows
and 70 guard-key observations. Dense follow-up satisfies the predeclared
regression bound. Raw timing and fingerprints are retained in the
[cached packet](../../plans/artifacts/reads-api-review/path-membership-cached.json).

The [direct packet](../../plans/artifacts/reads-api-review/path-membership-direct.json)
is preserved: its uncached reader loses repeated dense reads, which is why the
proposal keeps memoization at the commit owner. This is an isolated algorithm
comparison, not a measurement of React callbacks, cold indexes, native input,
mount performance, memory, or whole-editor latency.

Current-source proof: 19 read-view/node-key lifecycle tests, 10 middleware
tests, 21 commit metadata tests and six React selector tests pass. The browser
read regression/performance specs were inspected but not run. Their historical
green results are not current proof.

## Prior relation and next owner

This is the first immutable record for `reads`. It reaffirms the August 18
configuration-scoped read-topology decision after inspecting its current
implementation and replaying lifecycle tests. It preserves September 9 E06's
defer on replacing the generic selector adapter. The changed evidence is the
fresh membership comparison; neither older result measured this isolated query.

Next owner: Plite Plan. First bound the adoption across canonical changed
queries, React dispatch and DOM path bindings. Preserve inserted/deleted/moved
identity semantics, named roots, retained snapshots, draft/projection behavior,
selection/text-sync ordering and cleanup. Extend the same cost comparison to
cold/lazy indexes and real sparse/dense mounted consumers before locking that
broader runtime target. Public API doctrine repair is only required if that
owner selects a public contract change; none is implemented by this review.

```text
$plite-plan make commit invalidation queries demand-driven across changed.hasNodeKey, React selector dispatch and DOM path bindings; use docs/research/decisions/reads-demand-driven-invalidation.md
```
