---
title: Editor architecture landscape
type: system
status: partial
updated: 2026-04-15
related:
  - docs/research/sources/editor-architecture/decorations-annotations-overlay-corpus.md
  - docs/research/sources/editor-architecture/react-19-2-external-store-and-background-ui.md
  - docs/research/systems/slate-v2-perfect-plan-steal-reject-defer-map.md
  - docs/research/decisions/slate-v2-overlay-architecture-cuts.md
  - docs/research/decisions/slate-v2-overlay-superiority-vs-legacy-and-field.md
  - docs/research/decisions/slate-v2-react-19-2-perf-architecture-vs-field.md
  - docs/research/decisions/slate-v2-perfect-plan-should-steal-read-update-transaction-discipline-and-extension-dx.md
  - docs/analysis/editor-architecture-candidates.md
---

# Editor architecture landscape

## Purpose

This page is the compiled system map for the editor-architecture candidates
that mattered to the Slate v2 decorations / annotations architecture lane.

It is not a market map.

It is the answer to:

- which candidates actually changed the overlay design
- what each candidate is good for
- what should be copied
- what should be rejected

## Bottom line

- ProseMirror is still the benchmark for mapped overlay discipline and durable
  bookmark semantics.
- Lexical is the strongest runtime challenger because it already split mark ids,
  comment stores, and decorator UI into different lanes.
- Tiptap is the product-layer benchmark, not the engine winner.
- Premirror + Pretext own the future page-layout / measurement lane.
- Slate matters because it is the inheritance pressure and the local v2 proof
  substrate.
- edix, use-editable, and rich-textarea are the lower-bound warning:
  do not overbuild small surfaces.
- VS Code proves serious editors split visual channels aggressively.
- TanStack DB is the best non-editor model for annotation stores.
- EditContext is the future platform primitive to track, not a present-day
  spine.
- React 19.2 makes Slate v2 a first-class React-native runtime architecture,
  but does not by itself prove blanket superiority over ProseMirror, Lexical,
  or VS Code.

## Candidate roles

### ProseMirror

Role:

- overlay semantics benchmark
- durable bookmark benchmark

Take:

- steal child-scoped mapped decoration discipline
- steal bookmark semantics
- do not cargo-cult the whole ecosystem just because this part is right

### Lexical

Role:

- runtime/store split benchmark
- React-native portal benchmark

Take:

- split mark ids from comment/thread stores
- split decorator UI from text overlays
- split dirty invalidation from generic rerender churn

### Tiptap

Role:

- productization and packaging benchmark

Take:

- its comments, floating menus, and review surfaces matter as product evidence
- its engine lessons are mostly ProseMirror lessons wearing better docs

### Premirror + Pretext

Role:

- layout / pagination / measurement benchmark

Take:

- composition and measurement should stay derived
- layout belongs in a dedicated lane, not hacked into overlay semantics

### Slate

Role:

- inheritance pressure
- proof-of-ownership lane

Take:

- local Slate v2 already proves runtime ids, projection slices, bookmarks, and
  DOM bridge separation are the right direction
- legacy `decorate` remains the abstraction to escape, not the contract to
  protect

### edix, use-editable, rich-textarea

Role:

- lightweight-surface lower bound

Take:

- not every editable surface deserves a full editor runtime
- small surfaces want tight APIs, native behavior, and explicit caret/overlay
  seams

### VS Code + comment/decor channels

Role:

- typed overlay-channel benchmark
- external-service boundary benchmark

Take:

- comments and decorations are separate controller surfaces
- different visual channels should not be forced through one generic overlay API

### TanStack DB

Role:

- normalized client-store benchmark

Take:

- annotation metadata wants collection/store semantics, live subscriptions, and
  stable snapshots more than it wants array-registration hooks

### EditContext

Role:

- future IME/platform benchmark

Take:

- text services, geometry, selection, and IME-owned formatting are a real lane
- but EditContext is still a tracking item, not a current foundation

## What this means for Slate v2

The cross-editor landscape points to one architecture shape, not many:

- `Decoration`
  transient, overlap-friendly, mapped or externally indexed
- `Annotation`
  durable, id-bearing, bookmark-backed
- `Widget`
  anchored UI, geometry-derived, narrower public surface

And it points away from a bunch of bullshit:

- one legacy `decorate` callback as the center of the world
- public `RangeRef` as the preferred durable-anchor story
- public path-based widget anchors
- forcing all annotation metadata into the editor runtime
- callback/array-first APIs when store/controller APIs are more honest

## Current Slate v2 read

After implementation and doc closure, the current read is:

- clearly superior to legacy Slate on overlays
- convergent with the strongest overlay ideas in the field
- still not the overall winner over ProseMirror or Lexical as total engines

## Perf architecture read

On theory alone, the honest read is narrower than “we are better than all of
them”.

### Where Slate v2 is in the same class

- explicit overlay lanes
- durable anchors separate from transient visuals
- `useSyncExternalStore`-style selector/store subscriptions
- hidden/offscreen UI separated from urgent editing via React 19.2 primitives
- app-owned annotation stores and widget stores instead of callback soup

### Where Slate v2 is arguably better

- React-native integration ergonomics are cleaner than ProseMirror and VS Code
  for product teams already living in React
- overlay ownership is more explicit than legacy Slate and more app-owned than
  several engine-first systems

### Where Slate v2 is not honestly better yet

- ProseMirror still has the stronger explicit document-view diff and
  child-scoped mapped overlay propagation
- Lexical still has the stronger explicit dirty-node reconcile engine
- VS Code still has the stronger typed channel plus view-model/service split

### What React 19.2 changes

React 19.2 closes the React-side excuse surface:

- external store subscription is first-class
- non-urgent background UI is first-class
- hidden stateful panes are first-class

So if Slate v2 still loses the architecture argument after that, the remaining
problem is not “React is the wrong engine”.
It is deeper invalidation architecture.

## Best reshape pressure

If the goal is field-best perf architecture for decorations, the next reshape is
not “more React”.

It is:

- source-scoped invalidation
- dirtiness declarations per overlay source/store
- more child-scoped or indexed projection recompute below the React layer

That is the pressure coming from ProseMirror, Lexical, and VS Code together.

What Slate v2 now does especially well:

- explicit lane separation
- durable public anchors via `Bookmark`
- store/controller-style annotation ownership
- React-native consumption with narrow subscriptions
- corridor-scoped large-document overlay behavior

What it still does not claim:

- universal engine superiority
- page-layout leadership over Premirror + Pretext
- better productization than Tiptap

## What not to cargo-cult

- Do not copy ProseMirror’s whole plugin world just because its decoration
  discipline is excellent.
- Do not copy Lexical’s exact node model just because its lane split is sharper.
- Do not mistake Tiptap’s packaging win for a reason to inherit its whole stack.
- Do not turn Premirror/Pretext into an immediate blocker for the overlay lane.
- Do not use EditContext as an excuse to defer hard current-browser design.

## Remaining structure gaps

- most of this corpus still lives in local official clones under `../`, not
  normalized `../raw/<corpus>` families
- supporting references like Open UI, `urql`, and
  `@react-libraries/markdown-editor` still lack compiled pages for this lane
