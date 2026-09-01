---
title: Cursor, Find, and Widget geometry architecture
type: source
status: accepted
updated: 2026-08-30
source_refs:
  - platejs@494d90c495092d25941b6f57ca7ebf97b5db13dd:packages/plitejs/src/react/decoration-source.ts
  - platejs@494d90c495092d25941b6f57ca7ebf97b5db13dd:packages/plitejs/src/react/projection-store.ts
  - platejs@494d90c495092d25941b6f57ca7ebf97b5db13dd:packages/plitejs/src/react/widget-store.ts
  - platejs@494d90c495092d25941b6f57ca7ebf97b5db13dd:packages/plitejs/src/dom/plugin/editable-dom-runtime.ts
  - platejs@494d90c495092d25941b6f57ca7ebf97b5db13dd:packages/platejs/src/react/components/PlateContent.tsx
  - platejs@494d90c495092d25941b6f57ca7ebf97b5db13dd:packages/platejs/src/static/components/PlateStatic.tsx
  - platejs@494d90c495092d25941b6f57ca7ebf97b5db13dd:packages/platejs/src/yjs/core/awareness-adapter.ts
  - platejs@494d90c495092d25941b6f57ca7ebf97b5db13dd:packages/platejs/src/yjs/core/controller.ts
  - platejs@494d90c495092d25941b6f57ca7ebf97b5db13dd:packages/platejs/src/yjs/core/types.ts
  - platejs@494d90c495092d25941b6f57ca7ebf97b5db13dd:packages/platejs/src/yjs/react/useYjs.ts
  - prosekit@3fbfe7906c3448328e80c1c1333647d08e50907e:packages/extensions/src/search/index.ts
  - prosekit@3fbfe7906c3448328e80c1c1333647d08e50907e:packages/web/src/components/inline-popover/inline-popover-root.ts
  - prosekit@3fbfe7906c3448328e80c1c1333647d08e50907e:packages/web/src/components/inline-popover/virtual-selection-element.ts
  - tiptap@a4b939127821aac3a2139a467c5b257dd897da4e:packages/extension-bubble-menu/src/bubble-menu-plugin.ts
  - tiptap@a4b939127821aac3a2139a467c5b257dd897da4e:packages/extension-collaboration-caret/src/collaboration-caret.ts
  - lexical@1ca42f1d88140abfd929a854615705c035c5b99b:packages/lexical-yjs/src/SyncCursors.ts
  - lexical@1ca42f1d88140abfd929a854615705c035c5b99b:packages/lexical-yjs/src/SyncEditorStates.ts
  - y-prosemirror@9200946f0ea455c681a7496c364ee998a9f064f7:src/cursor-plugin.js
  - docs/research/sources/typora/navigation-search-outline-and-toc.md
related:
  - docs/plans/2026-08-30-cursor-find-overlay-architecture.md
  - docs/research/concepts/overlay-lane-separation.md
  - docs/research/concepts/source-scoped-overlay-invalidation.md
  - docs/research/sources/editor-architecture/prosemirror-mapped-overlays-and-bookmarks.md
  - docs/research/sources/editor-architecture/lexical-mark-store-and-decorator-split.md
---

# Cursor, Find, and Widget geometry architecture

## Question

What is the smallest architecture that can replace Plate's Cursor, FindReplace,
and Floating entrypoints without inventing a generic overlay framework or
hiding collaboration-scale work in React renders?

## Snapshot

- Plate/Plite: `494d90c495092d25941b6f57ca7ebf97b5db13dd`
- ProseKit: `3fbfe7906c3448328e80c1c1333647d08e50907e`
- ProseMirror: `c7f2f1d7bde70728dfedaa68ca8f5fc3dffa17cc`
- Lexical: `1ca42f1d88140abfd929a854615705c035c5b99b`
- Tiptap: `a4b939127821aac3a2139a467c5b257dd897da4e`
- y-prosemirror: `9200946f0ea455c681a7496c364ee998a9f064f7`

The Plate read used an immutable `origin/next` snapshot because the current
checkout did not contain the merged package topology.

## Verdict

The lifetime split survives external pressure:

- **Decoration** owns transient inline paint.
- **Annotation** owns durable anchors and metadata identity.
- **Widget** owns logical out-of-flow targets.
- A private mounted runtime projects subscribed Widget targets into immutable
  geometry snapshots scoped by the caller's exact Editable ref. Plite never
  chooses a focused, last-focused, or first-mounted view for the app.

There is no evidence for a public `Overlay`, geometry store/provider, or Plate
Floating wrapper. Product UI should compose Floating UI directly.

The Yjs target is exact: the Decoration and Widget APIs remain separate public
outputs, but they share the existing private controller-owned
`YjsAwarenessAdapter`. That DOM/React-free cache/index receives exact changed
client ids from the private awareness observer, retains raw Yjs endpoints plus
root-aware Plite Anchors, and fans one cached cursor entity into data,
Decoration, and Widget snapshots. Three independent resolution paths would be
indefensible at 1,000 cursors.

Find has the same one-owner constraint. One copied result owner retains
canonical ordered ranges for navigation and its Decoration source. The app
owns one stable Decoration-source array and explicitly composes copied Find and
Yjs segment renderers; neither feature may replace the other.

## Current Plite and Plate evidence

### Projection substrate

The merged Plite projection store already owns:

- source dirtiness and runtime scope
- stable projection ids
- per-runtime and per-source subscriptions
- changed-runtime and subscriber-wake metrics
- a central DOM phase scheduler elsewhere in the mounted runtime

This is enough to reject a second generic overlay store. It does not justify a
public changed-id API. Plate attaches a private keyed-delta
capability to its projection array. Plite consumes that capability inside the
existing store, maps only the named projections, and publishes only their
changed runtime buckets. Membership changes still take the honest full-list
path.

### Yjs cursor path

The awareness adapter consumes `added`, `updated`, and `removed` client ids,
decodes one changed client, and publishes stable membership plus keyed cursor
records. Aggregate `remoteCursors()` materializes lazily for imperative reads;
ordinary React and decoration work never depends on it.

`YjsPlugin` owns a private stable projection list. Membership changes rebuild
the list and its per-id subscriptions. Cursor changes replace one projection
and wake only its affected runtime bucket. Manual `decorate` consumers use the
adapter's path index instead of scanning the broad cursor list for every text
node.

Proven owner contract:

1. Route the private awareness event into the existing
   `YjsAwarenessAdapter`; keep public `subscribeAwareness(() => void)` scalar.
2. Decode one changed client once. When its selection changes, run at most one
   cursor-resolution pass containing at most two endpoint conversions, one per
   distinct endpoint; metadata-only updates reuse cached endpoints.
3. Map ordinary editor commits through root-aware Plite Anchors with zero Yjs
   endpoint conversions. Named lifecycle/error fallbacks re-resolve only the
   affected root bucket from retained raw endpoints.
4. Let keyed data hooks, the private Decoration source, and the Widget store
   read that same adapter cache. The copied cursor renderer uses Widget ids and
   per-id reads.
5. Keep client decode, cursor-resolution pass, endpoint conversion, item,
   id-list, geometry, fallback, and host-render counters distinct.

The internal keyed-delta primitive stays private. It does not justify a public
changed-id or geometry-store API.

## External evidence ledger

### ProseKit

ProseKit's inline popover is complete product UI. Its root owns selection,
focus, open state, and anchor resolution; its virtual-selection element exposes
Floating UI rectangles and contains a Safari-specific `contextElement` repair.
The web package directly owns Floating UI and accessibility dependencies.

That supports direct product composition, not a thin editor positioning
package.

ProseKit Search is also an honest full extension: it wraps
`prosemirror-search`, owns query modes, navigation, status, replace-current,
replace-all, and editor plugin state. Plate's current FindReplace package does
not own that behavior. For the accepted Find-only packet, copied registry UI
over `NodeApi.findTextRanges` is the smaller truthful owner. A later structural
Replace packet can reconsider a headless controller on its own evidence.

### Tiptap

Tiptap BubbleMenu earns publication by owning a complete Floating UI product
extension, including lifecycle, virtual elements, selection policy, resize,
scroll, and delayed updates. Its per-menu timers and listeners also show why
Plate should not clone positioning schedulers across cursor, link, toolbar, and
comment consumers.

Tiptap CollaborationCaret delegates to y-prosemirror. Remote selection paint is
an inline decoration; the caret is a widget decoration. The two outputs are
separate even though they share one awareness source.

### Lexical

Lexical Yjs renders multiline selection rectangles separately from its caret
and label. Cursor positions are synchronized after awareness changes and after
remote document imports. Awareness-only React subscription is therefore not a
correct resolved-range contract.

Lexical's direct DOM renderer is useful lifecycle evidence, not a public API to
copy. It does not justify a generic geometry provider.

### y-prosemirror

y-prosemirror rebuilds cursor decorations when awareness changes and maps the
existing `DecorationSet` through document transactions. This is the clearest
precedent for the Plate target: resolve changed external cursor facts once,
then map cached local projections through document edits.

It also keeps inline selection paint and the caret widget distinct.

### Typora

Typora treats current-document Find/Replace as document navigation, separate
from outline and TOC navigation. That supports copied Find product state rather
than schema or history state.

## Falsification results

| Candidate claim                                                    | Result          | Evidence-backed disposition                                                                                                                         |
| ------------------------------------------------------------------ | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| One generic Overlay surface should replace the three packages      | Falsified       | Every strong system splits paint, durable data, and UI or publishes a complete product extension.                                                   |
| Plite should expose a geometry store/provider                      | Falsified       | Consumers need one per-id immutable geometry read; no caller needs scheduler ownership.                                                             |
| Plate should retain a Floating wrapper                             | Falsified       | ProseKit and Tiptap product UI own positioning policy directly; Plate's thin wrapper owns no independent contract.                                  |
| Separate Yjs Decoration and Widget hooks may resolve independently | Falsified       | Current Plate already duplicates scans; y-prosemirror maps one shared cursor set and Lexical updates on both awareness and document changes.        |
| Find must be an editor plugin                                      | Not established | ProseKit needs plugin state for its complete Search/Replace contract; Plate's Find-only packet already has a pure matcher and copied product state. |
| Replace belongs in this cut                                        | Falsified       | The current package does not implement structural replacement; the behavior corpus keeps Replace as a separate deferred packet.                     |

## Performance law carried forward

For one changed remote client among 1,000:

- one client decode is allowed
- a changed selection permits at most one cursor-resolution pass containing at
  most two endpoint conversions; metadata-only updates permit none
- ordinary editor commits permit zero Yjs endpoint conversions and map cached
  Plite Anchors instead
- zero duplicate conversions across data, Decoration, and Widget outputs are
  allowed
- no host React render is allowed
- no unrelated item or geometry subscriber wake is allowed
- the id-list wakes only for membership or order change
- layout invalidation measures only actively subscribed Widget ids

Full rebuilds remain valid for connect, disconnect, provider replacement, or an
explicit correctness fallback. Ordinary fallback is affected-root scoped;
metrics must identify every rebuild and fallback.

## Remaining implementation proof

- Prove exact-ref geometry across duplicate Editables, portals, separate
  documents, ref replacement, virtualization, nested scroll, and SSR.
- Prove Plite Anchor mapping against direct Yjs resolution across randomized
  local/remote structural operations before enabling the zero-conversion commit
  path.
- Prove the existing singular/broad remote-cursor data hooks, Decoration source,
  and Widget store share the adapter cache without host React fan-out.
- Prove Find+Yjs source and segment-renderer coexistence, one scan per Find
  epoch, multiline/RTL cursor paint, 100/1,000-cursor counters, independent
  registry installation, and the packed runtime/declaration/bundle matrix.

There is no raw or compiled evidence gap for this decision pass. The missing
`docs/solutions/patterns/critical-patterns.md` path is stale workflow routing;
the current research-wiki owner files were present and fully read.
