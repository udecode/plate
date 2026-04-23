---
title: Slate v2 local overlay proof substrate
type: source
status: partial
source_refs:
  - ../slate-v2/packages/slate-react/src/projection-store.ts
  - ../slate-v2/packages/slate-react/src/decoration-sources.ts
  - ../slate-v2/packages/slate-react/src/annotation-store.ts
  - ../slate-v2/packages/slate-react/src/widget-store.ts
  - ../slate-v2/packages/slate-react/test/projections-and-selection-contract.tsx
  - ../slate-v2/packages/slate/src/interfaces/bookmark.ts
  - ../slate-v2/packages/slate/src/interfaces/editor.ts
  - ../slate-v2/packages/slate/src/editor.ts
  - ../slate-v2/packages/slate/src/range-projection.ts
  - ../slate-v2/packages/slate/src/core/get-dirty-paths.ts
  - ../slate-v2/packages/slate/src/core/draft-helpers.ts
  - ../slate-v2/packages/slate/test/snapshot-contract.ts
updated: 2026-04-15
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
- `Bookmark` already exists as a public durable-anchor noun.
- snapshots already expose `idToPath` / `pathToId` runtime indexes.
- runtime ids survive important structural edits in the current proof subset.
- `Editor.getDirtyPaths(...)` already exists as a rough operation-to-path
  dirtiness primitive.
- current projection recompute still starts broad:
  `projection-store.ts` calls the source against the full snapshot, and
  `range-projection.ts` collects text entries across the snapshot before
  projecting a range.

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

That is why the next perf architecture tranche belongs below React, not in
another hook wrapper.

## Take for Slate v2

- promote the good local substrate
- stop protecting the bad legacy overlay surface
- use runtime identity for live node-local widget/UI anchoring
- add source-scoped invalidation before claiming field-best decoration perf
  architecture
