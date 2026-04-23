---
title: Slate v2 overlay architecture cuts
type: decision
status: accepted
updated: 2026-04-14
source_refs:
  - docs/research/sources/editor-architecture/decorations-annotations-overlay-corpus.md
  - docs/analysis/editor-architecture-candidates.md
  - docs/plans/2026-04-14-slate-v2-decorations-annotations-cluster-research.md
  - docs/slate-v2/decoration-roadmap.md
related:
  - docs/research/systems/editor-architecture-landscape.md
  - docs/research/entities/prosemirror.md
  - docs/research/entities/lexical.md
  - docs/research/entities/slate.md
---

# Slate v2 overlay architecture cuts

## Question

What architecture conclusions are strong enough to lock for Slate v2 after the
full decorations / annotations research pass?

## Decision

Accept the following cuts and design direction:

- split the overlay system into `Decoration`, `Annotation`, and `Widget`
  lanes
- cut legacy `decorate` as architecture
- make `Bookmark` the preferred durable public anchor noun
- demote `RangeRef` to lower-level runtime machinery
- allow canonical annotation metadata to stay in app-, collab-, or
  service-owned stores while `slate-react` mirrors/indexes anchors
- keep generic widget registration, public `WidgetPlacement`, and public
  bookmark registries out of the early public API
- reject public path-based widget anchors
- reject callback/array-first public APIs where store/controller surfaces are
  more honest

## Why

- ProseMirror proves mapped decoration data and bookmark durability are real,
  not aesthetic preferences.
- Lexical proves id-bearing marks, comment stores, and decorator UI want
  separate ownership.
- Tiptap proves product-layer comments, suggestions, and floating menus do not
  collapse into one engine primitive cleanly.
- VS Code proves typed visual channels and comment controllers scale better
  than one generic overlay bucket.
- TanStack DB proves annotation metadata wants normalized stores and stable
  subscriptions.
- local Slate v2 proof already supports runtime ids, projection slices,
  bookmarks, and DOM-bridge separation.

## What this overrules

- compatibility-first protection of legacy `decorate`
- equal-peer public `RangeRef` + `Bookmark`
- public path-based widget anchors
- forcing canonical thread/comment metadata into the editor runtime
- one `derive(snapshot)` callback as the only serious decoration-source shape
- render-time array replacement as the default annotation integration story

## Practical consequence

The best next implementation work is not “make old Slate decorations survive”.

It is:

- harden the overlay kernel
- connect store/controller-style annotation inputs
- expose the smallest honest public surface
- keep legacy baggage out unless real adoption pain later proves it is worth it
