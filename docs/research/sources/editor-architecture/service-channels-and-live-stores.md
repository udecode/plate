---
title: Service channels and live stores
type: source
status: partial
source_refs:
  - ../vscode/src/vscode-dts/vscode.d.ts
  - ../vscode/src/vs/editor/common/services/markerDecorationsService.ts
  - ../vscode/src/vs/editor/browser/widget/codeEditor/codeEditorWidget.ts
  - ../vscode/src/vs/editor/common/viewModel/viewModelImpl.ts
  - ../db/README.md
  - ../db/packages/react-db/src/useLiveQuery.ts
updated: 2026-04-15
related:
  - docs/research/entities/vscode.md
  - docs/research/entities/tanstack-db.md
  - docs/research/concepts/overlay-lane-separation.md
  - docs/research/decisions/slate-v2-overlay-architecture-cuts.md
---

# Service channels and live stores

## Purpose

Compile the non-editor references that mattered most to the overlay lane.

## Strongest evidence

- VS Code decorations and comment threads are separate controller/channel
  surfaces.
- VS Code also keeps editor shell, widgets, marker diffs, and the view model in
  separate layers.
- TanStack DB uses normalized collections, live queries, and
  `useSyncExternalStore`-driven snapshots.

## What this means

### 1. Typed channels beat one generic bucket

VS Code proves mature editors do not funnel:

- decorations
- comments
- commands
- other UI channels

through one generic surface.

That directly supports keeping `Decoration`, `Annotation`, and `Widget` split.

### 2. View-model separation is a real perf architecture move

VS Code does not ask one render layer to own:

- model state
- marker diffs
- content widgets
- overlay widgets
- visible-line projection

It splits them.

That matters because it is the strongest non-rich-text proof that typed lanes
and a detached view model are performance architecture, not just API aesthetics.

### 3. Store/controller APIs beat rerender-time arrays

TanStack DB shows the cleaner React posture:

- explicit collection/store identity
- stable snapshot reads
- explicit subscription

That is a much better analogy for annotation metadata than array-registration
hooks.

## Take for Slate v2

- use typed overlay lanes
- prefer store/controller surfaces for annotation metadata
- keep the public API honest about ownership instead of hiding it behind hooks
- if Slate v2 ever wants a stronger field-best perf claim, a deeper view-model
  or invalidation-routing layer is the next serious move, not another generic
  React refactor
