---
title: Slate v2 overlay architecture
type: system
status: accepted
updated: 2026-04-15
related:
  - docs/research/sources/editor-architecture/decorations-annotations-overlay-corpus.md
  - docs/research/sources/editor-architecture/react-19-2-external-store-and-background-ui.md
  - docs/research/sources/editor-architecture/slate-v2-local-proof-substrate.md
  - docs/research/decisions/slate-v2-overlay-architecture-cuts.md
  - docs/research/decisions/slate-v2-overlay-superiority-vs-legacy-and-field.md
  - docs/research/decisions/slate-v2-react-19-2-perf-architecture-vs-field.md
  - docs/slate-v2/decoration-roadmap.md
---

# Slate v2 overlay architecture

## Purpose

This is the research-layer architecture map for the Slate v2 overlay system.

It is not the rollout plan.
It is the stable architecture read behind the plan.

## Shape

Three lanes:

- `Decoration`
  transient, overlap-friendly, mapped or externally indexed
- `Annotation`
  durable, id-bearing, bookmark-backed
- `Widget`
  anchored UI, geometry-derived, narrower public surface

## Ownership

- `slate`
  logical ranges, bookmarks, lower-level live-ref machinery, runtime identity
- `slate-react`
  overlay kernel, projection indexing, subscriptions, annotation mirrors,
  widget placement/runtime
- `slate-dom`
  DOM mapping, selection fidelity, clipboard/browser boundary

## Public-surface stance

- `Bookmark` is the durable public anchor noun
- `RangeRef` is lower-level runtime machinery
- annotation metadata may stay outside the editor runtime
- widget placement can stay internal at first
- generic widget registration can stay internal at first
- public path-based widget anchors are cut
- callback/array-first APIs are not the preferred flagship surface

## Runtime posture

- explicit refresh/invalidation
- narrow subscriptions
- active editing corridor stays urgent
- side panes and other non-visible work can lag safely

## React 19.2 posture

React 19.2 strengthens this architecture where it actually matters:

- `useSyncExternalStore` makes selector/store subscriptions first-class
- `startTransition` and `useDeferredValue` make non-urgent derived UI first-class
- `Activity` makes hidden panes a real preserved-state lane

That makes Slate v2 a credible React-native perf architecture.

It does not, by itself, make the system universally better than ProseMirror,
Lexical, or VS Code.

## Why this system shape won

- ProseMirror proved mapped overlay and bookmark discipline
- Lexical proved mark/store/decorator separation
- Tiptap proved product-layer comments and suggestions stay distinct
- VS Code proved typed channels
- TanStack DB proved store/controller APIs
- local Slate v2 proved runtime ids, bookmarks, and projection slices

## Why it beats legacy Slate

Legacy Slate treated `decorate` like the center of the overlay world.

That made one callback pretend it could own:

- transient highlighting
- durable anchors
- anchored widget UI
- browser-facing composition decoration
- large-document invalidation

Slate v2 is better because it stopped doing that.

It now has:

- separate `Decoration`, `Annotation`, and `Widget` lanes
- `Bookmark` as the durable public anchor story
- `RangeRef` demoted to lower-level runtime machinery
- store/controller-style annotation ownership
- widget UI that is not forced through text-decoration semantics
- explicit large-document overlay posture

## Relative to the field

- better than legacy Slate by a lot
- aligned with ProseMirror on mapped overlays and durable anchors
- aligned with Lexical on store/decorator lane separation
- informed by Tiptap on product-layer comment/suggestion separation
- informed by VS Code and TanStack DB on typed channels and stable stores
- not the universal winner over ProseMirror or Lexical as total engines

## Best next reshape if perfection matters

If this lane wants the strongest possible perf-architecture claim, the next
reshape should target invalidation below the React layer:

- source-scoped dirtiness
- more indexed projection recompute
- less full-source projection rebuild per committed snapshot

React 19.2 is already good enough for the UI side.
The remaining gap, if any, is deeper than React.
