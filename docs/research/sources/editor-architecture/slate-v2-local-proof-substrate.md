---
title: Slate v2 local overlay proof substrate
type: source
status: partial
source_refs:
  - ../slate-v2/packages/slate-react/src/projection-store.ts
  - ../slate-v2/packages/slate-react/src/annotation-store.ts
  - ../slate-v2/packages/slate-react/src/widget-store.ts
  - ../slate-v2/packages/slate-react/src/hooks/use-slate-projections.tsx
  - ../slate-v2/packages/slate-react/src/hooks/use-decoration-selector.tsx
  - ../slate-v2/packages/slate-react/test/projections-and-selection-contract.tsx
  - ../slate-v2/packages/slate-react/test/annotation-store-contract.tsx
  - ../slate-v2/packages/slate-react/test/widget-layer-contract.tsx
  - ../slate-v2/packages/slate/src/interfaces/bookmark.ts
  - ../slate-v2/packages/slate/src/interfaces/editor.ts
  - ../slate-v2/packages/slate/src/editor.ts
  - ../slate-v2/packages/slate/src/range-projection.ts
  - ../slate-v2/packages/slate/src/core/get-dirty-paths.ts
  - ../slate-v2/packages/slate/src/core/draft-helpers.ts
  - ../slate-v2/packages/slate/test/snapshot-contract.ts
  - ../slate-v2/scripts/benchmarks/browser/react/rerender-breadth.tsx
  - ../slate-v2/scripts/benchmarks/browser/react/huge-document-overlays.tsx
updated: 2026-04-28
related:
  - docs/research/entities/slate.md
  - docs/research/concepts/durable-anchor-vs-live-handle.md
  - docs/research/concepts/runtime-identity-vs-tree-address.md
  - docs/research/decisions/slate-v2-overlay-architecture-cuts.md
---

# Slate v2 local overlay proof substrate

## Purpose

Compile the local Slate v2 evidence that already supports the overlay rewrite.

## Strongest evidence

- `createSlateProjectionStore(...)` already projects ranges into runtime-id
  keyed slices with local subscription.
- `projection-store.ts` already has partial source controls:
  `dirtiness`, `runtimeScope`, `sourceId`, targeted refresh, source
  subscribers, runtime subscribers, and recompute metrics.
- `Bookmark` already exists as a public durable-anchor noun.
- snapshots already expose `idToPath` / `pathToId` runtime indexes.
- runtime ids survive important structural edits in the current proof subset.
- `Editor.getDirtyPaths(...)` already exists as a rough operation-to-path
  dirtiness primitive.
- `annotation-store-contract.tsx` and `widget-layer-contract.tsx` prove the
  annotation/widget lanes are real, not just docs claims.
- browser tests cover search focus, external decoration refresh, persistent
  annotation anchors, review comments, highlighted text, and large-document
  projection behavior.
- benchmark scripts capture projection recompute count for rerender breadth and
  huge-document overlay lanes.
- current projection recompute still starts broad:
  `projection-store.ts` calls the source against the full snapshot, and
  `range-projection.ts` collects text entries across the snapshot before
  projecting a range.
- live source does not currently have a separate `decoration-sources.ts` or
  `use-slate-decoration-sources.tsx` layer. Decoration source behavior lives in
  the lower-level projection store.
- annotation projection is weaker than plain projection sources: the annotation
  store resolves every annotation bookmark, projects every annotation range, and
  exposes a partial projection store without runtime/source subscription APIs.

## What this means

### 1. The overlay rewrite does not start from zero

Local v2 already proves:

- projection slices
- runtime-id keyed local subscriptions
- durable bookmark anchors
- DOM bridge/runtime-id boundaries

So the architecture work is a hardening/surface-design problem, not a blank
sheet.

### 2. Runtime identity is stronger than path for live node-local UI

The snapshot and test evidence shows runtime ids surviving moves and property
changes where paths do not stay stable as public identity.

That directly supports cutting public path-based widget anchors.

### 3. Bookmark is already the better durable public noun

The local `Bookmark` type is already much closer to the honest public durable
anchor than exposing raw live-ref state as the main API.

### 4. The next gap is below React

The local proof substrate is strong at the subscription edge.

It is weaker at source-scoped recompute:

- sources are refreshed as whole sources unless the caller explicitly controls
  refresh
- projection recompute does not yet receive a source-level dirty region
- range projection does not yet use an indexed local text-entry lookup
- annotation stores do not yet resolve/project by dirty annotation ids
- widget stores expose recompute count but not per-anchor or per-widget dirty
  accounting
- benchmark metrics count recomputes, but not source ids, runtime ids,
  projected ranges, or subscriber wakes

That is why the next perf architecture tranche belongs below React, not in
another hook wrapper.

## 2026-04-28 Refresh

The current live source keeps the original conclusion intact and sharpens it:

- consumer-edge subscriptions are good
- source identity and dirtiness exist, but as projection-store options
- there is not yet a dedicated public decoration-source layer
- annotation and widget stores are usable, but not the same perf grade as the
  projection store
- normal docs and examples still expose projection plumbing before the user
  concepts of decorations, annotations, and widgets

The next review should decide whether public Slate React should expose
decoration/annotation/widget source APIs above the projection store, while the
runtime keeps projection as internal transport.

## Take for Slate v2

- promote the good local substrate
- stop protecting the bad legacy overlay surface
- use runtime identity for live node-local widget/UI anchoring
- add source-scoped invalidation before claiming field-best decoration perf
  architecture
