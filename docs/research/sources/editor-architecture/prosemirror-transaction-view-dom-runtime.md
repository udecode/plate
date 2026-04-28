---
title: ProseMirror transaction/view DOM runtime
type: source
status: accepted
updated: 2026-04-23
source_refs:
  - ../raw/prosemirror/packages/model/src/README.md
  - ../raw/prosemirror/packages/state/src/README.md
  - ../raw/prosemirror/packages/state/src/transaction.ts
  - ../raw/prosemirror/packages/state/src/selection.ts
  - ../raw/prosemirror/packages/transform/src/README.md
  - ../raw/prosemirror/packages/view/src/README.md
  - ../raw/prosemirror/packages/view/src/input.ts
  - ../raw/prosemirror/packages/view/src/selection.ts
related:
  - docs/research/entities/prosemirror.md
  - docs/research/decisions/slate-v2-read-update-runtime-architecture.md
---

# ProseMirror transaction/view DOM runtime

## Purpose

Compile the ProseMirror evidence that matters to Slate v2's transaction and DOM
selection discipline.

## Strongest Evidence

- editor state is updated by applying transactions.
- transactions subclass transforms and track document changes, selection
  changes, stored marks, scroll intent, and metadata.
- transaction selection is mapped through step mappings as document changes are
  accumulated.
- selections expose bookmarks that can map without the current document and
  resolve later.
- commands receive state, optional dispatch, and sometimes view.
- view/input owns DOM event handling, DOM observer flushing, composition flags,
  DOM selection import, and DOM selection export.
- decorations are a view data channel, not document content.

## What To Steal

### 1. Transaction owns composite local mutation

Slate already has operations and transactions. ProseMirror reinforces that the
transaction should own:

- document changes
- selection before/after
- mark state
- metadata
- scroll / UI event policy

For Slate v2, `editor.update` should create the transaction, and
`EditorCommit` should be the durable local record.

### 2. Selection mapping discipline

ProseMirror maps selection through transaction steps. Slate v2 should map
selection through operations and runtime ids instead of relying on stale public
fields or full snapshots.

### 3. Durable bookmarks

`SelectionBookmark` is the clean durable anchor model:

- map without needing the current document
- resolve later against current document

Slate v2 should preserve this as the public durable selection/anchor story for
history, collaboration, comments, and review systems.

### 4. One DOM bridge owner

ProseMirror's view code has explicit `selectionFromDOM`, `selectionToDOM`, DOM
observer flushing, and composition handling. Slate v2 should keep the same
discipline:

- DOM import has one owner
- DOM export/repair has one owner
- composition is an explicit mode
- app commands do not read DOM selection directly

### 5. Decorations as view data

ProseMirror decorations prove overlays should be mapped view data. Slate v2
should keep projection sources and dirty-source invalidation instead of
reviving render-time `decorate` as the primary API.

## What Not To Steal

- Do not copy integer document positions.
- Do not make schema-first content matching the Slate v2 core identity.
- Do not expose ProseMirror-style plugin complexity as the normal Plate/Slate
  extension API.
- Do not make React a wrapper around a ProseMirror-like view tree.

## Take For Slate v2

The ProseMirror lesson is not "be ProseMirror".

It is:

```txt
transactions own state changes
selection maps through mutations
DOM selection import/export is centralized
view overlays are data
```

Slate v2 should implement those disciplines with paths, runtime ids,
operations, commits, and a React-optimized renderer.
