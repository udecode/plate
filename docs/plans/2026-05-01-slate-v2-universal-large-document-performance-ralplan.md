---
date: 2026-05-01
topic: slate-v2-universal-large-document-performance
status: closed-with-follow-up
source_repos:
  - /Users/zbeyens/git/plate-2
  - /Users/zbeyens/git/slate-v2
  - /Users/zbeyens/git/slate
  - /Users/zbeyens/git/lexical
  - /Users/zbeyens/git/prosemirror
  - /Users/zbeyens/git/tiptap
  - /Users/zbeyens/git/vscode
---

# Slate v2 Universal Large-Document Performance Ralplan

## Current Verdict

Latest review score: `0.88`. Status: `active execution`.

The previous execution slice made shell mode real: explicit `mode: 'shell'`,
mounted corridor semantics, composition guard, shell-backed selection/copy
contracts, dirty commit payloads, and green shell smoke lanes. That is a real
improvement.

It is still not a default-performance victory, but the 5000-block median gate
changed the severity. Shell is now a credible explicit escape hatch.
DOM-present/default now beats legacy chunk-on hard for interactive ready,
steady middle typing, select-all, visible full-document replacement, and
visible fragment insertion. The 5000-block selection/setup and promote medians
are now inside the default gate after reducing DOM-present root groups to 50
blocks. A true browser-native input proof now exists for DOM-present
large-document typing. `nativeSurfaceComplete` is measured separately and
remains around one second at 5000 blocks. The remaining red owner is the
10000-block stress shape: selection-inclusive and promote lanes still scale too
poorly even though ready and visible full-document operations crush legacy.

The latest beforeinput pass found a benchmark truth bug: the old
`*NativeBeforeInputTypeMs` rows dispatched `@`, which the runtime correctly
routes to Slate's model-owned beforeinput path. Those rows were not native
browser insertion proof. They are now renamed to
`*SelectThenModelBeforeInputTypeMs`.

Keep the Slate v2 rewrite. Rewrite the large-document default strategy.

The v2 core architecture is right: `editor.read`, `editor.update`,
`editor.subscribe`, `editor.extend`, transaction dirtiness, runtime ids,
sidecar projections, extension `state` / `tx` groups, browser proof contracts,
and direct DOM text sync are the correct foundation.

The original shell-island path was useful as an experimental escape hatch but
wrong as the default: it crushed startup/full-document operations and lost
steady typing badly. The latest shell-explicit implementation is much better
and should be kept. The default DOM-present path is still the active red lane.

Accepted decision, updated after GPT Pro follow-up:

```ts
// Public default
<Editable />

// Optional policy override
largeDocument?:
  | 'auto'
  | 'dom-present'
  | 'off'
  | 'shell'
  | {
      mode: 'shell'
      activeRadius?: number
      islandSize?: number
      previewChars?: number
      threshold?: number
    }
```

Default `auto` is two-layer. Layer 1 is always the safe DOM-present baseline:
grouping, scoped subscriptions, active corridor, containment,
`content-visibility` where proven, direct DOM text sync where safe, and
persistent sidecar range indexes. Layer 2 is aggressive shell/occlusion
escalation, and it stays proof-disabled in the default until browser find,
screen reader, native selection, copy/paste, IME, mobile, undo, history, and
collaboration proof all pass. Until then, shell virtualization is explicit
through `mode: 'shell'`.

New hard line: default auto may use staged DOM-present mounting only if it
tracks `interactiveReady` and `nativeSurfaceComplete` separately and never
leaves stale far DOM exposed as current content after full-document changes.

## Execution State

Execution started by `ralph` on 2026-05-01.

Current pass:

- current: `phase-7-default-claim-gate`
- previous: Phase 7.0/7.1 closed benchmark surface rename, readiness split,
  stale-DOM proof, staged DOM-present lifecycle, root group size cuts, the
  misleading beforeinput lane name, the 5000-block median confirmation, the
  real browser-native input proof, the 5000-block selection/setup/promote cost
  cut, the first 10000-block pending-placeholder coalescing cut, and one
  rejected eager-active-group-persistence experiment
- completion: current default-performance claim gate is closed for the
  5000-block release target; 10000-block immediate far-selection stress remains
  recorded as a follow-up owner, not a closed performance claim

## Intent / Boundary Record

- Intent: make the Slate v2 rewrite beat legacy Slate performance on meaningful
  editor workloads, not merely look cleaner.
- Desired outcome: define the architecture and proof gates for a default
  large-document mode that beats or matches legacy chunking on typing while
  preserving v2 startup and whole-document wins.
- In scope: public large-document API, internal grouping strategy, commit
  dirtiness, React subscriptions, sidecar decorations/annotations/widgets,
  selection/DOM bridge, shell-island policy, benchmark matrix, accessibility,
  browser proof, Plate and slate-yjs migration backbone.
- Non-goals: implementing the plan in this pass; preserving current shell
  option names; product-level comment services; current-version Plate or
  slate-yjs adapter compatibility; turning raw Slate into a product editor.
- Decision boundaries: this plan may rename misleading benchmark surfaces,
  split readiness metrics, add a DOM-present group lifecycle, stage fresh DOM
  mounting, require stale-DOM absence proof, and keep shell explicit until the
  native/a11y/collab gates pass.
- Unresolved user-decision points: none. The plan can proceed to execution
  after user review.

## Decision Brief

Principles:

- Default users should not tune chunk sizes, island sizes, or active radii.
- A performance rewrite that loses steady typing to legacy chunking cannot claim
  victory.
- Native browser behavior stays real until Slate owns the alternative input and
  accessibility stack.
- Comment/annotation state should not be forced into the Slate value.
- Claims must follow benchmark and browser proof, not architecture taste.

Top drivers:

- Benchmark shape after execution: shell explicit now has credible smoke wins,
  but default DOM-present still loses readiness/full-doc/event-input lanes.
- Native behavior risk: inactive shell islands are `contentEditable=false`
  `role="button"` shells, not invisible optimizations.
- Field evidence: Lexical scales with dirty-node discipline, ProseMirror with
  transaction/view/decorations mapping, VS Code with viewport rendering only
  because it owns input and accessibility separately.

Viable options:

| Option                                  | Verdict                                 | Reason                                                                                     |
| --------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------ |
| Explicit opt-in shell mode              | reject as default, keep as escape hatch | safe to ship experimentally, but fails "faster by default" and repeats legacy tuning smell |
| Universal shell islands                 | reject                                  | huge native/a11y risk and current typing lanes are awful                                   |
| Universal DOM-present auto              | partial                                 | safest default, but still needs aggressive shell option for huge research lanes            |
| Two-tier auto                           | choose                                  | safe default plus explicit aggressive mode, matches the evidence                           |
| Drop islands and only fix dirty runtime | reject                                  | attacks typing but throws away the proven startup/full-doc win                             |

Chosen option: two-tier auto.

Consequences:

- Shell mode remains explicit and benchmarkable, not the default claim.
- v2 must steal legacy chunking's grouping/memoization mechanism while killing
  the public chunking API.
- v2 must split benchmark claims by readiness and lane. `interactiveReady` can
  be compared to interactive startup only; `nativeSurfaceComplete` must be
  reported separately.
- DOM-present no-shell is the default-product owner, but current evidence does
  not satisfy startup, full-document replacement/fragment, promote, or
  event-input performance gates.
- Staged DOM-present is allowed; stale DOM is not.

Follow-ups:

- Split `beforeinput` lanes into setup-free event-input proof versus mixed
  promotion/setup lanes.
- Rename DOM-present/default/off/shell benchmark rows before optimizing.
- Add lifecycle/readiness metrics before any default-performance claim.

## Current Source Evidence

Live Slate v2:

- Current public-ish large-doc prop is `largeDocument?: LargeDocumentOptions |
null` on `EditableTextBlocksProps`:
  `packages/slate-react/src/components/editable-text-blocks.tsx:264`.
- Current `LargeDocumentOptions` is
  `'auto' | 'dom-present' | 'off' | 'shell' | { mode: 'shell', ... }`; shell
  knobs no longer leak into non-shell object modes:
  `packages/slate-react/src/large-document/create-island-plan.ts:3`.
- Current mode resolution treats omitted/null as `auto`:
  `packages/slate-react/src/components/editable-text-blocks.tsx:60`.
- Current shell config is created only when `largeDocumentMode === 'shell'`;
  `auto` and `dom-present` do not build a shell island plan:
  `packages/slate-react/src/components/editable-text-blocks.tsx:621`.
- Current rendering replaces inactive islands with `LargeDocumentIslandShell`
  only on the shell path; otherwise `auto` / `dom-present` use root groups:
  `packages/slate-react/src/components/editable-text-blocks.tsx:757`.
- Current `createIslandPlan` mounts all runtime ids for active corridor islands,
  so `activeRadius` now means actual mounted corridor:
  `packages/slate-react/src/large-document/create-island-plan.ts:51`.
- Current DOM-present grouping is staged: interactive ready mounts the active
  50-block group, far groups stay hidden `pending-mount` placeholders, selected
  pending groups materialize urgently, background mounting fills eight pending
  groups per tick, and the benchmark reports `interactiveReady` separately
  from `nativeSurfaceComplete`:
  `packages/slate-react/src/components/editable-text-blocks.tsx:55`
  and `packages/slate-react/src/components/editable-text-blocks.tsx:491`.
- Current shells use containment and `content-visibility`, then render as
  `contentEditable={false}`, `role="button"`, `tabIndex={0}`:
  `packages/slate-react/src/large-document/island-shell.tsx:31`
  and `packages/slate-react/src/large-document/island-shell.tsx:139`.
- Current root selectors already avoid root runtime id updates for text and
  selection ops:
  `packages/slate-react/src/editable/root-selector-sources.ts:24`.
- Current island planning is memoized over config, promoted island, selection
  index, and top-level runtime ids:
  `packages/slate-react/src/editable/root-selector-sources.ts:139`.
- Current `EditorCommit` already has classes, dirty region, dirty paths,
  node/decoration/selection impact runtime ids, touched runtime ids, tags, and
  text/structure flags:
  `packages/slate/src/interfaces/editor.ts:936`.
- Current dirtiness classifies operations into text, selection, structural,
  replace, and mark classes, then derives impact ids:
  `packages/slate/src/core/public-state.ts:517`.
- Current transaction boundary increments version and notifies listeners after
  outer update completion:
  `packages/slate/src/core/public-state.ts:1837`.
- Current `subscribeSource` exists for commit-source-specific listeners:
  `packages/slate/src/core/public-state.ts:2005`.
- Current DOM text sync is intentionally narrow: disabled for empty text,
  projections, custom leaf, custom segment, and custom text:
  `packages/slate-react/src/dom-text-sync.ts:3`.
- Current DOM text sync skips composition and mutates one text DOM node when
  safe:
  `packages/slate-react/src/hooks/use-slate-node-ref.tsx:80`.
- Current projection store already has source dirtiness classes, runtime scope,
  runtime subscriptions, source subscriptions, and metrics:
  `packages/slate-react/src/projection-store.ts:31`.
- Current annotation store uses external anchors and per-annotation
  subscriptions:
  `packages/slate-react/src/annotation-store.ts:13`.
- Current decoration sources compose projection stores:
  `packages/slate-react/src/decoration-source.ts:111`.
- Current widget store has node, selection, and annotation anchors:
  `packages/slate-react/src/widget-store.ts:15`.
- Current extension runtime rejects legacy `methods` and public extension
  `commands`, telling authors to add `state` or `tx` groups:
  `packages/slate/src/core/editor-extension.ts:60`.
- Current `createEditor` exposes `read`, `subscribe`, `update`, and `extend`
  on the base editor:
  `packages/slate/src/create-editor.ts:486`.
- Current React provider syncs text operations to DOM before selector
  notifications:
  `packages/slate-react/src/components/slate.tsx:100`.
- Current selector hooks support operation/change-gated updates and deferred
  listeners:
  `packages/slate-react/src/hooks/use-editor-selector.tsx:51`.
- Current mounted node render selectors can skip synced text rerender:
  `packages/slate-react/src/hooks/use-node-selector.tsx:41`.

Benchmark and legacy evidence:

- Current compare runner uses `activeRadius`, `chunkSize`, `islandSize`,
  `typeOps`, explicit v2 model insert typing lanes, and model-owned
  beforeinput lanes:
  `benchmarks/slate-v2/donor/browser/react/huge-document-legacy-compare.mjs:16`
  and `benchmarks/slate-v2/donor/browser/react/huge-document-legacy-compare.mjs:531`.
- Current v2 benchmark rows are explicit: `v2Off`, `v2DefaultOmitted`,
  `v2AutoExplicit`, `v2DomPresent`, `v2ShellExplicitRadius0`, and
  `v2ShellExplicitRadius1`.
- Current benchmark reports `interactiveReady`, `nativeSurfaceComplete`,
  model-only full-document commit lanes, visible full-document lanes,
  `*ModelBeforeInputTypeMs`, and `*SelectThenModelBeforeInputTypeMs`.
  It still does not prove real browser-native DOM insertion in jsdom.
- Legacy chunking maps children directly without chunking, but with chunking
  builds a chunk tree and renders `ChunkTree`:
  `../slate/packages/slate-react/src/hooks/use-children.tsx:119`.
- Legacy memoized chunks rerender only when root/render callbacks change or the
  chunk is in `modifiedChunks`:
  `../slate/packages/slate-react/src/components/chunk-tree.tsx:66`.
- Legacy child reconciliation invalidates modified chunks by child changes:
  `../slate/packages/slate-react/src/chunking/reconcile-children.ts:21`.
- Legacy docs say root chunk size `1000` works well and `content-visibility`
  belongs on lowest chunks:
  `../slate/docs/walkthroughs/09-performance.md:64`.

Research and external review:

- React 19.2 helps external stores, deferred/background work, Activity, and
  profiling, but not dirty-node mapping:
  `docs/research/sources/editor-architecture/react-19-2-external-store-and-background-ui.md`.
- Lexical evidence supports dirty leaves/elements, update tags, listener
  partitions, and strict read/update:
  `docs/research/sources/editor-architecture/lexical-read-update-extension-runtime.md`.
- ProseMirror evidence supports transaction metadata, selection mapping,
  bookmarks, one DOM bridge owner, and decorations as view data:
  `docs/research/sources/editor-architecture/prosemirror-transaction-view-dom-runtime.md`.
- Tiptap evidence supports extension packaging, discoverability, chain sugar,
  and React selector posture:
  `docs/research/sources/editor-architecture/tiptap-extension-command-react-dx.md`.
- Source-scoped overlay invalidation is already accepted as the next overlay
  perf extension:
  `docs/research/decisions/slate-v2-source-scoped-overlay-invalidation.md`.
- Collaborative annotations should use external channels by default:
  `docs/research/decisions/slate-v2-collaborative-annotation-channels.md`.
- GPT Pro review agreed with the two-tier direction and added sharper proof
  thresholds; answer captured in the 2026-05-01 chat turn.

## Confidence Scorecard

| Dimension                                                | Weight | Score | Evidence                                                                                                                 |
| -------------------------------------------------------- | -----: | ----: | ------------------------------------------------------------------------------------------------------------------------ |
| React 19.2 runtime performance                           |   0.20 |  0.93 | current selectors and DOM sync in Slate provider; React 19.2 research; benchmark-driven dirty payload plan               |
| Slate-close unopinionated DX                             |   0.20 |  0.94 | implicit `<Editable />` default; optional policy override; no product comment service; extension `state` / `tx` retained |
| Plate and slate-yjs migration backbone                   |   0.15 |  0.90 | external annotation channel decision; state/tx extension groups; anchor/rebase proof required                            |
| Regression-proof testing strategy                        |   0.20 |  0.94 | named benchmark matrix, browser proof families, IME/mobile/select/copy/paste gates                                       |
| Research evidence completeness                           |   0.15 |  0.95 | live Slate v2, legacy Slate, Lexical, ProseMirror, Tiptap, VS Code, React 19.2, GPT Pro review                           |
| shadcn-style composability and hook/component minimalism |   0.10 |  0.91 | minimal public API; DOM-present behavior hidden behind internals; Plate/product UI stays above core                      |

Weighted total: `0.93`.

Completion gates pass:

- no dimension below `0.85`;
- no unplanned P0/P1 issue;
- intent, outcome, scope, non-goals, and boundaries are explicit;
- major decision has options and rejected alternatives;
- high-risk proof plan exists;
- public API target is decisive;
- no accepted objection remains unresolved.

## Architecture North Star

Slate v2 should win by knowing exactly what changed, not by hiding the document
as the default.

Target architecture:

```txt
Slate data model + operations
  -> editor.update transaction
  -> rich EditorCommit dirtiness
  -> runtime-id / top-level range indexes
  -> DOM-present root groups
  -> scoped React selectors
  -> direct DOM text sync when safe
  -> sidecar projection/annotation/widget indexes
  -> browser proof as release spine
```

The shell-island path remains available for aggressive huge-doc scenarios, but
it is not the default editor body.

## Public API Target

Live current source already cut the misleading `enabled` shape. Keep it cut.

Default:

```tsx
<Editable />
```

The default turns on safe large-document auto behavior above threshold.

Optional override:

```ts
type LargeDocumentOptions =
  | "auto"
  | "dom-present"
  | "off"
  | "shell"
  | {
      mode: "shell";
      activeRadius?: number;
      islandSize?: number;
      previewChars?: number;
      threshold?: number;
    };
```

Rules:

- `auto`: default, DOM-present first.
- `dom-present`: force safe grouped editable DOM.
- `shell`: explicit aggressive mode.
- `off`: diagnostic escape hatch.
- no public `enabled` boolean in docs;
- no shell knobs in non-shell modes;
- docs prefer `{ mode: 'shell' }` over bare `'shell'` because the object shape
  makes the aggressive choice visible;
- benchmark/debug rows must name the actual mode, not "no island".

## Internal Runtime Target

### Commit Dirtiness

Before: current `EditorCommit` has useful dirtiness fields but not enough
top-level/group-specific and DOM-sync-specific proof fields.

After:

```ts
type EditorCommit = {
  // existing fields kept
  dirtyTextRuntimeIds: readonly RuntimeId[] | null;
  dirtyElementRuntimeIds: readonly RuntimeId[] | null;
  dirtyTopLevelRuntimeIds: readonly RuntimeId[] | null;
  dirtyTopLevelRanges: readonly TopLevelRuntimeRange[] | null;
  affectedTextRuntimeIds: readonly RuntimeId[] | null;
  affectedNodeRuntimeIds: readonly RuntimeId[] | null;
  affectedProjectionRuntimeIds: readonly RuntimeId[] | null;
  affectedSelectionRuntimeIds: readonly RuntimeId[] | null;
  structuralDirtyRuntimeIds: readonly RuntimeId[] | null;
  textDirtyRuntimeIds: readonly RuntimeId[] | null;
  markDirtyRuntimeIds: readonly RuntimeId[] | null;
  rootRuntimeIdsChanged: boolean;
  topLevelOrderChanged: boolean;
  fullDocumentChanged: boolean;
};
```

Simple `insert_text` ideal result:

```ts
textDirtyRuntimeIds = [textId];
dirtyElementRuntimeIds = [paragraphId];
dirtyTopLevelRuntimeIds = [paragraphId];
dirtyTopLevelRanges = [[index, index]];
rootRuntimeIdsChanged = false;
topLevelOrderChanged = false;
fullDocumentChanged = false;
```

Implementation note: core commits stay renderer-agnostic and frozen. DOM text
sync remains a `slate-react` capability/result, not a field inside the core
`EditorCommit`. If Phase 2 needs per-runtime DOM-sync telemetry, add it to the
React selector/change context, not to `packages/slate`.

### Runtime Selector Fanout

Before: `useEditorSelectorContext` broadcast every commit to every selector
listener, and runtime selectors filtered locally with `shouldUpdate`.

After:

- runtime-id selectors register in a runtime-indexed listener map;
- commits with `affectedNodeRuntimeIds` notify only those runtime ids;
- broad commits with `affectedNodeRuntimeIds: null` still fan out safely;
- synced text commits can still skip mounted render selectors through the
  existing operation policy;
- ordinary app code keeps using `useNodeSelector` / `useTextSelector`;
- the low-level `useEditorSelector` runtime-id option is only for runtime-owned
  selectors and tests.

Hard rules:

- text-only ops must not rebuild root runtime ids;
- text-only ops must not rebuild group/island plans;
- selection-only commits must not wake body text subscribers;
- DOM text sync success must suppress mounted text rerender;
- projection recompute must receive affected runtime ids, not a vague "text
  happened".

### DOM-Present Root Groups

Before: legacy chunking wins by memoizing chunks; v2 shell islands win startup by
not mounting most content, but lose typing.

After:

```txt
EditableRoot
  SlateRootGroup range=[0, 999]
  SlateRootGroup range=[1000, 1999]
  SlateRootGroup range=[2000, 2999]
```

Each group:

- subscribes by top-level range;
- memoizes stable render callbacks;
- preserves actual editable descendants;
- uses containment and `content-visibility` only after proof;
- rerenders only when commit ranges overlap group range.

Update test:

```ts
shouldGroupUpdate(groupRange, commit) {
  return commit.fullDocumentChanged
    || commit.topLevelOrderChanged
    || rangesOverlap(groupRange, commit.dirtyTopLevelRanges)
    || rangesOverlap(groupRange, commit.selectionTopLevelRanges)
    || rangesOverlap(groupRange, commit.projectionTopLevelRanges)
}
```

### Active Corridor

Before: current `activeRadius` is misleading because neighboring islands can be
marked active while only one active island mounts runtime ids.

After:

- DOM-present default uses a corridor of real editable groups around selection;
- recommended default proof candidate is current group plus `2` groups before
  and after;
- shell mode mounts corridor groups and shells only far groups;
- active means mounted, or the name changes.

### Sidecar Range Index

Before: projection/annotation stores have the right direction, but large-doc
proof must prove source-scoped recompute and runtime bucket locality.

After:

```ts
type ProjectionRangeIndex = {
  byRuntimeId: Map<RuntimeId, ProjectionSlice[]>;
  byTopLevelRuntimeId: Map<RuntimeId, RuntimeId[]>;
  intervalTreeByTopLevel: Map<RuntimeId, IntervalTree<ProjectionSlice>>;
  sourceVersions: Map<SourceId, number>;
  mappedThroughVersion: number;
};
```

Rules:

- map/rebase only affected anchors;
- recompute only affected runtime buckets;
- wake only mounted affected runtime ids;
- comment metadata updates do not repaint inline text unless projection payload
  changes;
- no default global `decorate` pass.

### Selection Bridge

Add a ProseMirror-like owner:

- one DOM observer;
- controlled disconnect/reconnect around DOM writes;
- DOM selection import;
- Slate selection export;
- composition-safe mode;
- selection bookmarks for stale targets and remote edits;
- shell-backed selection explicitly marked synthetic/model-backed.

## Hook / Component / Render DX Target

- Keep React hooks selector-first and commit-gated.
- Use `useSyncExternalStore` posture for external subscriptions.
- Keep visible typing urgent; defer sidebars, overlays, and non-editing UI.
- Do not force app authors to provide chunk wrappers.
- Do not expose product UI in raw Slate.
- Keep custom `renderLeaf`, `renderSegment`, and `renderText` supported, but
  benchmark fallback typing lanes because DOM sync is disabled for them.
- Keep extension writes under `tx` groups.
- Add optional command discoverability as metadata, not public extension command
  mutation slots:

```ts
defineEditorExtension({
  name: 'comments',
  tx: { comments: ... },
  capabilities: {
    commands: [
      {
        id: 'comments.add',
        title: 'Add comment',
        tx: 'comments.add',
        shortcut: 'Mod-Alt-M',
      },
    ],
  },
})
```

## Plate Migration-Backbone Target

Plate should migrate to:

- raw Slate `state` / `tx` extension namespaces;
- capability metadata for command palettes, menus, and toolbars;
- external annotation channels for comments/review;
- widget/overlay channels for Plate chrome;
- selection/bookmark APIs that can back comment anchors;
- no raw Slate product comment service;
- no `editor.api` / `editor.tf` compatibility requirement in raw Slate.

Proof:

- Plate-like comments example with two lanes:
  - writer edits document value;
  - reviewer is read-only for document value but adds comments through sidecar
    annotation channel.
- Comment-only updates do not mutate Slate value.
- Comment metadata updates wake sidebars without repainting text.

## slate-yjs Migration-Backbone Target

Collaboration needs deterministic substrate, not current adapter support.

Required:

- operations remain deterministic and replayable;
- remote apply produces the same commit metadata classes;
- runtime ids and durable anchors survive document edits;
- Yjs relative positions can implement the generic annotation anchor contract;
- comment-only updates can sync over a sidecar Yjs doc/map without requiring
  Slate value writes;
- stale target resolution has proof for remote insert/delete before cursor and
  delete-containing-anchor cases.

## Benchmark Matrix

Document sizes:

| Blocks | Purpose                              |
| -----: | ------------------------------------ |
|    100 | baseline overhead                    |
|    250 | small real document                  |
|    500 | medium document                      |
|   1000 | chunk threshold sanity               |
|   2000 | smoke/debug gate                     |
|   5000 | main release gate                    |
|  10000 | stress/nightly gate                  |
|  25000 | shell/viewport research only         |
|  50000 | non-default aggressive research only |

Modes:

- `legacyChunkOff`
- `legacyChunkOn`
- `v2Off`
- `v2DefaultOmitted`
- `v2AutoExplicit`
- `v2DomPresent`
- `v2ShellExplicitRadius0`
- `v2ShellExplicitRadius1`
- `v2ShellAutoCandidate` only after proof
- `v2CustomLeaf`
- `v2ProjectionHeavy`
- `v2AnnotationsHeavy`
- `v2CollabRemoteEdits`

Group sizes:

- DOM-present: `100`, `250`, `500`, `1000`, `2000`.
- Shell: `50`, `100`, `250`, `500`, `1000`.

Corridor sizes:

- `0`
- `+/-1 group`
- `+/-2 groups`
- `+/-5 groups`
- `viewport + overscan`

Required lanes:

- ready;
- first paint;
- first selection;
- steady type at `1`, `10`, `100` text ops;
- native `beforeinput` typing;
- select-then-type;
- promote-then-type for shell only;
- select-all;
- copy full document;
- paste full document;
- replace full document;
- insert fragment full document;
- undo/redo;
- composition;
- remote insert before cursor;
- remote delete containing anchor;
- projection refresh;
- annotation metadata update;
- browser find;
- screen-reader path;
- Android Chrome typing;
- iOS Safari typing.

5000-block gates:

- ready: v2 auto <= legacy chunk-on, preferably 3x faster;
- steady typing: v2 auto <= legacy chunk-on + `5 ms` median;
- select-then-type: v2 auto <= legacy chunk-on + `10 ms` median;
- full replace: v2 auto <= legacy chunk-on, preferably 2x faster;
- selectAll: v2 auto <= legacy chunk-on + `5 ms`, or prove synthetic
  select/copy/paste parity;
- projection local update: O(affected runtime ids), not O(document);
- annotation metadata update: no document body rerender;
- custom leaf typing: no catastrophic fallback;
- IME/mobile: zero proof regressions.

10000-block gates:

- ready: v2 auto at least 5x faster than legacy chunk-on;
- steady typing: v2 auto <= legacy chunk-on + `15 ms` median;
- full replace: v2 auto at least 2x faster than legacy chunk-on.

No performance superiority claim is allowed until 5000-block typing matches or
beats legacy chunk-on within the thresholds above.

## Browser Stress / Parity Strategy

Required proof families:

- model state;
- model selection;
- visible DOM;
- DOM selection/caret;
- focus;
- commit metadata;
- trace;
- follow-up typing;
- copy/paste;
- select-all;
- undo/redo;
- IME/composition;
- browser find;
- screen-reader traversal;
- mobile Chrome;
- mobile Safari;
- collaboration stale-target rebase.

Shell mode proof additions:

- find text in inactive shell ranges;
- screen-reader traversal over inactive ranges;
- native drag selection across shell boundaries;
- copy partial and full shell-backed selection;
- paste over shell-backed selection;
- no shell promotion during composition;
- persistent caret soak.

## Applicable Implementation-Skill Review Matrix

| Lens                        | Applicability | Findings                                                                                                                                    | Plan Delta                                                           |
| --------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Vercel React best practices | applied       | selectors must subscribe to derived dirtiness, global listeners must stay centralized, transient typing state must stay out of broad render | commit-gated groups, deferred non-editing UI, no broad root wakeups  |
| performance-oracle          | applied       | current shell path optimizes mount but not typing; projection recompute and group invalidation must be O(affected ranges)                   | dirty commit payload, group range subscriptions, sidecar range index |
| tdd                         | applied       | behavior must be proved through public/editor browser lanes, not implementation assertions                                                  | benchmark matrix plus browser proof rows                             |
| build-web-apps shadcn       | skipped       | no product UI/editor chrome is designed in this plan                                                                                        | Plate owns comment UI and toolbars                                   |
| react-useeffect             | applied       | subscriptions and DOM observer work are external-system effects; derived state should stay in selectors/commit data                         | one selection bridge owner, useSyncExternalStore posture             |

## High-Risk Deliberate-Mode Pre-Mortem

Trigger: public API, React runtime subscription strategy, browser behavior,
collaboration, sidecar annotations, and release gates all change.

Blast radius:

- `packages/slate`
- `packages/slate-react`
- `packages/slate-dom`
- `packages/slate-browser`
- huge-document examples and benchmarks
- annotation/comment examples
- browser proof suites
- docs under `docs/slate-v2`

Failure scenario 1: DOM-present groups still rerender too broadly, so ready gets
worse and typing still loses.

Mitigation: Phase 1 dirty payload gate must pass before DOM-present grouping can
graduate; group update counts become benchmark output.

Failure scenario 2: `content-visibility` preserves DOM but harms browser find,
screen readers, mobile selection handles, or paint in Safari.

Mitigation: containment/content-visibility is a gated layer, not assumed safe;
browser find/a11y/mobile rows decide whether it is enabled by default.

Failure scenario 3: sidecar annotations become the new global decorate pass.

Mitigation: sidecar sources must declare dirtiness and runtime scope; metrics
must prove recompute and subscriber wakes stay local.

Rollback / hard-cut answer:

- DOM-present auto can ship without shell escalation.
- Shell mode remains explicit if proof fails.
- Existing sidecar stores stay, but global refresh paths cannot be advertised as
  large-doc-ready.

## Hard Cuts And Rejected Alternatives

Hard cuts:

- Cut public `largeDocument.enabled` as the documented default API.
- Cut any docs claiming current v2 shell mode beats legacy chunk-on typing.
- Cut "shell islands are the default large-doc architecture".
- Cut broad `decorate` as the primary comments/decorations path.
- Cut public extension `commands` mutation maps; keep `state` / `tx` and
  optional capability metadata.
- Cut performance victory claims until 5000-block typing passes.

Rejected alternatives:

- Keep current explicit island flag: too much DX tuning, not faster by default.
- Universal shell islands: unsafe native semantics and poor typing lanes.
- Drop islands entirely: throws away proven startup/full-document wins.
- Copy VS Code virtualization directly: wrong without owning input/a11y stack.
- Copy Lexical DOM reconciler wholesale: wrong unless Slate abandons React body
  rendering.
- Copy ProseMirror integer positions: wrong for Slate's public model.

## Slate Maintainer Objection Ledger

| Change                                 | Who Feels Pain              | Strong Objection                     | Steelman Antithesis                      | Tradeoff                    | Why Keep                                                   | Migration / Docs / Proof                   | Verdict |
| -------------------------------------- | --------------------------- | ------------------------------------ | ---------------------------------------- | --------------------------- | ---------------------------------------------------------- | ------------------------------------------ | ------- |
| `largeDocument` implicit auto default  | app authors                 | "I did not ask for virtualization."  | Keep everything opt-in until proven.     | more hidden internals       | default is DOM-present, not shell; no user tuning          | docs explain auto/off/shell; browser gates | keep    |
| Shell islands explicit aggressive mode | large-doc users             | "You took away the 40 ms ready win." | Startup is the visible win.              | huge docs may need opt-in   | typing and native semantics matter more                    | shell docs and benchmark mode              | keep    |
| Internal root grouping                 | Slate maintainers           | "This is chunking again."            | Legacy chunking was the thing to escape. | adds internal wrapper layer | escape the API, steal the mechanism                        | no public `getChunkSize`; group tests      | keep    |
| Rich commit dirtiness                  | core maintainers            | "Commit gets too big."               | Current fields are already enough.       | more metadata to maintain   | benchmarks show current path wakes too much                | unit tests per op class                    | keep    |
| Sidecar range index                    | plugin authors              | "This is more API than decorate."    | Keep one callback.                       | more store concepts         | comments/read-only collaboration require sidecar ownership | two-lane comments example                  | keep    |
| Selection bridge owner                 | browser runtime maintainers | "This is ProseMirror complexity."    | Native contenteditable can handle it.    | centralized complexity      | shell/group/native parity needs one owner                  | DOM selection/import/export proof          | keep    |
| Capability metadata for commands       | extension authors           | "Tiptap commands are familiar."      | Expose commands directly.                | extra indirection           | write lifecycle stays `tx`; discoverability preserved      | command palette example                    | keep    |
| Shell proof gate                       | product owners              | "This slows shipping."               | Ship and fix bugs later.                 | more release work           | shell changes browser semantics                            | find/a11y/IME/mobile gates                 | keep    |

## Plan Deltas From GPT Review

Added:

- decisive two-tier default/opt-in policy;
- DOM-present auto as default;
- shell islands renamed/reframed as explicit aggressive mode;
- commit dirtiness target fields;
- group-size/corridor benchmark matrix;
- strict 5000/10000-block thresholds;
- sidecar range index target;
- browser/native risk table folded into proof gates;
- stale-doc hard cut.

Strengthened:

- legacy chunking read: steal grouping/memoization, kill API;
- React 19.2 read: substrate only, not architecture;
- comments/annotations: external sidecar is now part of perf plan, not a
  separate feature;
- `activeRadius` bug: active means mounted or the name changes.

Dropped:

- any path where current shell islands become universal default;
- any public tuning-first API;
- any claim that v2 is currently faster on typing.

No-change decisions:

- keep core v2 rewrite;
- keep `editor.read` / `editor.update`;
- keep extension `state` / `tx` hard cut;
- keep sidecar projections/annotations/widgets;
- keep browser proof as release spine.

## Plan Deltas From GPT Pro Follow-Up

Added:

- explicit distinction between `interactiveReady` and
  `nativeSurfaceComplete`;
- default DOM-present staged mounting rule: allowed only as temporary
  reconciliation debt, not persistent virtualization;
- stale-DOM rule: after full-document replace/fragment, old far DOM must be
  detached or cleared before it can be searched, copied, or read as current
  content;
- root group lifecycle target:

```ts
type RootGroupState =
  | "fresh-mounted"
  | "pending-mount"
  | "pending-reconcile"
  | "reconciling"
  | "detached";

type RootGroupRecord = {
  groupId: string;
  startIndex: number;
  endIndex: number;
  runtimeIds: RuntimeId[];
  version: number;
  state: RootGroupState;
  priority: "selection" | "viewport" | "corridor" | "dirty" | "background";
};
```

- root group runtime target:

```ts
type RootGroupRuntime = {
  getPlan(): RootGroupPlan;
  getState(groupId: string): RootGroupState;
  markDirty(groupIds: string[], reason: string): void;
  mountUrgent(groupIds: string[]): void;
  scheduleBackground(groupIds: string[]): void;
  subscribeGroup(groupId: string, listener: () => void): () => void;
};
```

- benchmark surface rename:
  - `v2Off`
  - `v2DefaultOmitted`
  - `v2AutoExplicit`
  - `v2DomPresent`
  - `v2ShellExplicitRadius0`
  - `v2ShellExplicitRadius1`
- trace fields:
  - `largeDocumentMode`
  - `groupingEnabled`
  - `shellEnabled`
  - `groupSize`
  - `corridor`
  - `stagedMountingEnabled`
  - `interactiveReadyAt`
  - `nativeSurfaceCompleteAt`
  - `mountedGroupCountAtReady`
  - `pendingGroupCountAtReady`
  - `staleGroupCount`
  - `backgroundMountChunks`
  - `maxBackgroundChunkMs`

Strengthened:

- the next perf owner is DOM-present lifecycle, not shell;
- full-doc replace/fragment is the first implementation target after benchmark
  labeling because the current DOM-present numbers are catastrophic;
- beforeinput work comes after lifecycle unless fresh split traces prove event
  input is the dominant loss;
- staged DOM-present cannot be sold as native completeness until background
  mounting completes within a bounded latency.

Dropped:

- treating shell smoke wins as a default-performance victory;
- comparing staged `interactiveReady` against legacy full readiness without
  separately reporting `nativeSurfaceComplete`;
- keeping `v2NoIsland` as a benchmark row name.

No-change decisions:

- keep shell as explicit escape hatch;
- keep default `auto` DOM-present first;
- keep `off` as a real no-grouping control row;
- keep shell/native/a11y/collab gates before any shell auto/default claim.

## Latest Scorecard Delta

| Dimension                                                | Score | Reason                                                                                                           |
| -------------------------------------------------------- | ----: | ---------------------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance                           |  0.86 | Root groups and selector cuts exist, but no group lifecycle or readiness split exists yet.                       |
| Slate-close unopinionated DX                             |  0.91 | Policy shape is now good: omitted/`auto`, `dom-present`, `off`, explicit shell.                                  |
| Plate and slate-yjs migration backbone                   |  0.90 | Sidecar comments and runtime buckets are still the right backbone; no new gap from this review.                  |
| Regression-proof testing strategy                        |  0.86 | Strong shell proof exists, but default DOM-present lacks stale-DOM, readiness, and full-doc lifecycle contracts. |
| Research evidence completeness                           |  0.92 | GPT Pro review, local source, legacy chunking, and compiled editor research agree on the next owner.             |
| shadcn-style composability and hook/component minimalism |  0.90 | No product API leak; internals carry the complexity.                                                             |

Weighted total: `0.88`.

Completion status: `pending`. The plan has a better next direction, but it is
not execution-ready until the DOM-present lifecycle phase, benchmark rename,
and proof gates are written as the next runnable slice.

## Implementation Phases

### Phase 0: Stop Claiming Victory

Owner: docs/benchmarks.

- Mark stale docs that claim v2 beats legacy typing as invalid.
- Update benchmark reports to show current failing lanes.
- Keep shell islands experimental.

Gate:

- benchmark table includes ready, typing, select/type, select-all, full replace,
  and insert fragment at 5000 and 10000 blocks.

### Phase 1: Commit Dirtiness For Typing

Owner: `packages/slate`.

- Add dirty text/element/top-level/runtime id sets.
- Add root/order/full-document booleans.
- Keep DOM text sync renderer-local; do not put browser DOM facts into the core
  commit object.
- Ensure text-only ops do not invalidate root/group plans.
- Ensure selection-only commits do not wake body subscribers.

Gate:

- simple text insert commit proves one text id, one parent element id, one
  top-level range, no root order change.
- React provider selectors receive those scoped commit facts.
- No 5000-block performance claim is attached to Phase 1; Phase 2 owns the
  benchmark delta.

### Phase 2: Internal DOM-Present Grouping

Owner: `packages/slate-react`.

- Cut selector fanout first by routing runtime-id selectors through affected
  runtime ids.
- Add internal `SlateRootGroup` or equivalent root group layer.
- Memoize by top-level range and commit overlap.
- Preserve actual editable DOM descendants.
- Add containment/content-visibility only behind browser proof.
- Do not expose `renderChunk` or `getChunkSize`.

Checkpoint after root-group slice:

- Internal root groups now exist in
  `packages/slate-react/src/components/editable-text-blocks.tsx`
  for the non-shell DOM-present path.
- Groups are React fragments, so the slice adds no wrapper DOM and does not
  change native document structure.
- Profiler `group` events prove root groups do not rerender after a local text
  edit or parent rerender in the 1001-block focused test.
- `bun check` is green in `Plate repo root`.
- 2000-block one-iteration smoke is still red for typing:
  - legacy chunk-on middle type: `33.07 ms`
  - v2 shell middle type: `78.23 ms`
  - v2 no-island middle type: `96.31 ms`
  - legacy chunk-on select-then-type: `33.92 ms`
  - v2 shell select-then-type: `83.26 ms`
  - v2 no-island select-then-type: `131.84 ms`
- The tactic is not enough by itself. Next owner is measured mounted-subtree
  fanout: count descendant selector calls, text/element renders, root/group
  planning, and DOM text sync outcomes during the compare lanes before adding
  another abstraction.

Checkpoint after mounted-subtree instrumentation:

- The render profiler now records selector check/notify events, root-plan
  recomputes, and DOM text sync attempt/success/skip events.
- The huge-doc compare runner has an opt-in
  `REACT_HUGE_COMPARE_PROFILE=1` mode. Normal benchmark timing stays
  unprofiled.
- Root selectors now use commit metadata instead of operation-list heuristics
  for root runtime ids, top-level selection index, placeholder, and editable
  root commit wakeups.
- Focused slate-react tests, `bun --filter slate-react typecheck`,
  `bun lint:fix`, and full `bun check` are green in `Plate repo root`.
- Profiled 2000-block smoke after the metadata cut:
  - shell middle type: selector events `100 -> 70`; root runtime, placeholder,
    editable-root notifications `10 -> 0`; editable root renders `10 -> 0`;
    DOM sync still skips `10` times because the target is not mounted.
  - shell middle select-then-type: DOM sync succeeds, but selector events stay
    high at `87`; one root plan/render happens after selection activation.
  - no-island middle type: selector events `90 -> 80`; DOM sync succeeds; no
    root plan/render.
- Clean 2000-block smoke after the metadata cut is still red against legacy
  chunk-on:
  - legacy chunk-on middle type: `33.87 ms`
  - v2 shell middle type: `64.32 ms`
  - v2 no-island middle type: `78.02 ms`
  - legacy chunk-on middle select-then-type: `33.23 ms`
  - v2 shell middle select-then-type: `81.14 ms`
  - v2 no-island middle select-then-type: `129.69 ms`
- Next owner is narrower: identify and cut the remaining global selector notify
  per text op, decide whether the explicit unmounted-shell insert lane is a
  user-typing lane or a model/remote-update lane, then add the native
  `beforeinput` lane before any 5000-block claim.

Checkpoint after selection/global wakeup cut:

- `subscribeSelectionOnlyDOMExport` is now profiled as
  `selection-dom-export` and no longer wakes for plain text-only commits.
- The selection runtime contract now distinguishes plain text-only children
  changes from structural/selection changes.
- Focused selection/runtime tests, focused slate-react tests, `bun --filter
slate-react typecheck`, `bun lint:fix`, profiled 2000-block smoke, clean
  2000-block smoke, and full `bun check` are green.
- Profiled 2000-block smoke after the selection cut:
  - shell middle type selector events `70 -> 60`;
  - no-island middle type selector events `80 -> 70`;
  - selection DOM export notify is `0` for plain type lanes;
  - select-then-type still wakes selection DOM export because the lane moves
    model selection.
- Clean 2000-block smoke after the selection cut is still red against legacy
  chunk-on:
  - legacy chunk-on middle type: `32.00 ms`
  - v2 shell middle type: `62.91 ms`
  - v2 no-island middle type: `71.22 ms`
  - legacy chunk-on middle select-then-type: `32.95 ms`
  - v2 shell middle select-then-type: `82.38 ms`
  - v2 no-island middle select-then-type: `136.75 ms`
- The next proof must separate real user typing from explicit model writes into
  unmounted shell ranges. Add a native `beforeinput` lane before making the next
  architectural call.

Gate:

- 5000-block ready beats legacy chunk-on.
- 5000-block middle typing <= legacy chunk-on + `5 ms`.
- 5000-block select-then-type <= legacy chunk-on + `10 ms`.
- full replace keeps at least 2x advantage where feasible.

### Phase 3: Source-Scoped Sidecar Range Index

Owner: `packages/slate-react` sidecar stores.

Status: complete.

- Add persistent projection range index.
- Map/rebase anchors through ops.
- Declare source dirtiness and runtime scope.
- Split projection payload from annotation metadata.
- Add two-lane collaborative comments example.

Current source read:

- Already done in live source: `packages/slate-react/src/projection-store.ts`
  owns source dirtiness, runtime scope, source/runtime subscriptions, and
  projection metrics.
- Already done in live source: `packages/slate-react/src/annotation-store.ts`
  owns bookmark-backed annotation rebase, targeted refresh, runtime subscriber
  wakeups, and annotation metrics.
- This pass added stronger package contracts in
  `packages/slate-react/test/annotation-store-contract.tsx`:
  projection changes wake only the affected runtime bucket, and document edits
  rebase only annotations in impacted runtime buckets across a 40-annotation
  set.
- This pass added browser proof in
  `apps/www/tests/slate-browser/donor/examples/collaborative-comments.test.ts`
  against `apps/www/src/app/(app)/examples/slate/_examples/collaborative-comments.tsx`: the
  reviewer is read-only for the document value, can add/update comments through
  the sidecar channel, and writer edits rebase the comment range.

Gate:

- writer edits document while read-only reviewer adds comments: passed;
- comment-only update does not mutate value: passed;
- comment body update does not repaint inline text unless projection changes:
  passed by package metadata/projection split contracts;
- large annotation sets stay runtime-bucket local: passed.

### Phase 4: Selection Bridge And DOM Observer Discipline

Owner: `packages/slate-dom` / `packages/slate-react`.

Status: complete for local browser proof. Raw Android/iOS device proof remains
a release/device gate, not a claim from this pass.

- Add one DOM observer/selection bridge owner.
- Stop observer around controlled DOM writes.
- Map DOM selection to Slate selection.
- Map Slate selection to DOM selection.
- Add composition-safe mode.
- Add selection bookmarks for stale targets.

Current source read:

- `packages/slate-react/src/editable/runtime-root-engine.ts`
  already carries both explicit shell selection state and an
  `isShellBackedSelection` classifier.
- This pass wired the rendered root shell-backed state to the live model
  selection, so programmatic broad selections and stale-target style model
  selections get the same `data-slate-large-document-selection="shell-backed"`
  classification as explicit Ctrl+A/browser-handle paths.
- `packages/slate-react/test/large-doc-and-scroll.tsx` now proves a
  programmatic full-document model selection across shelled ranges is classified
  as shell-backed without expanding shells.
- `packages/slate-dom/src/plugin/dom-clipboard-runtime.ts` now has
  a model-backed clipboard fallback when a selection cannot be cloned from the
  DOM because some selected content is not mounted.
- `apps/www/tests/slate-browser/donor/examples/large-document-runtime.test.ts`
  proves full and partial shell-backed selections write normal text/html Slate
  fragment clipboard payloads from a copy event.
- `packages/browser/src/playwright/index.ts` now keeps the
  keyboard/OS clipboard helper honest: `clipboard.copyPayload()` uses the real
  shortcut and real clipboard reads only, while `clipboard.copyEventPayload()`
  names the synthetic copy-event payload contract used for shell-backed
  selections with unmounted content.
- `apps/www/tests/slate-browser/donor/examples/large-document-runtime.test.ts`
  now proves a real mouse drag inside mounted large-document content remains
  native/DOM-owned, imports an expanded model selection, and does not get
  mislabeled as shell-backed.
- Existing large-document composition rows in
  `apps/www/tests/slate-browser/donor/examples/large-document-runtime.test.ts`
  freshly pass on Chromium native composition and the Playwright mobile project
  synthetic composition lane.
- `packages/slate-react/src/editable/browser-handle.ts` now
  exposes `resolveRangeRef` so browser stale-target proofs can observe a live
  range ref before unref.
- `packages/slate-react/src/editable/runtime-root-engine.ts` now
  owns browser-handle range-ref cleanup at root unmount. Reattaching the
  browser handle during a render no longer unrefs bookmarks needed by remote
  operation rebase proof.
- `apps/www/tests/slate-browser/donor/examples/large-document-runtime.test.ts`
  now proves a shell-backed selection bookmark captured in an unmounted island
  rebases through a remote text operation, restores into mounted content, and
  copies the original selected text through the real keyboard/OS clipboard path.

Gate:

- native selection drag: passed for mounted large-document content; cross-shell
  drag remains explicitly not a native-DOM claim while inactive shells replace
  content;
- select-all: partially passed for explicit and programmatic shell-backed model
  selection classification;
- partial/full copy: passed for shell-backed copy event payloads;
- keyboard/OS clipboard contract: passed by split contract; real shortcut
  clipboard proof remains a DOM-present/native-DOM-row contract, not a
  shell-backed-row claim;
- paste over range: already covered for shell-backed full and partial Slate
  fragment paste rows;
- IME composition: passed for desktop native Chromium and semantic mobile
  synthetic composition; raw Android/iOS device proof is not claimed here;
- Android/iOS typing: still a raw-device release gate, not satisfied by the
  Playwright mobile viewport row;
- remote rebase proof: passed for shell-backed selection bookmarks through
  remote text operation replay.

### Phase 5: Explicit Shell Mode

Owner: large-document runtime.

- Rename policy to `mode: 'shell'`.
- Fix active radius so active islands mount.
- Derive shell-backed selection consistently.
- Complete shell copy/paste/select-all semantics.
- Disable promotion during composition unless proven safe.

Gate:

- browser find inactive ranges;
- screen-reader traversal;
- native selection across shell boundaries;
- copy/paste partial and full ranges;
- IME/mobile/undo/collab/persistent caret soak.

### Phase 6: Release Docs And Examples

Owner: docs/examples.

- Document `auto`, `off`, `dom-present`, `shell`.
- Provide a huge-document benchmark page.
- Provide comments sidecar example.
- Provide migration notes for legacy chunking users.
- Keep docs written as current-state reference, not changelog prose.

Gate:

- docs match live API;
- examples pass browser proof;
- no stale "v2 beats legacy" claim without current benchmark artifact.

## Next Performance Lane From GPT Pro Follow-Up

### Phase 7.0: Benchmark Surface Rename And Trace Hygiene

Owner: benchmark runner.

- Rename current rows:
  - `v2LargeDocument` -> `v2ShellExplicitRadius0` or
    `v2ShellExplicitRadiusN`;
  - `v2NoIsland` -> one of `v2DefaultOmitted`, `v2AutoExplicit`, or
    `v2DomPresent` depending on the actual input.
- Add explicit rows:
  - `v2Off`;
  - `v2DefaultOmitted`;
  - `v2AutoExplicit`;
  - `v2DomPresent`;
  - `v2ShellExplicitRadius0`;
  - `v2ShellExplicitRadius1`.
- Add trace fields for mode, grouping, shell, group size, corridor, staged
  mounting, readiness times, mounted/pending/stale counts, and background
  chunks.

Gate:

- no benchmark report contains `v2NoIsland`;
- omitted/default, explicit auto, explicit DOM-present, explicit off, and
  explicit shell are distinguishable;
- trace makes shell wins impossible to confuse with default wins.

### Phase 7.1: DOM-Present Full-Document Replace / Fragment Lifecycle

Owner: `EditableTextBlocks` / root group runtime.

Implement group lifecycle before optimizing startup.

Target full-document replace flow:

1. Commit model synchronously.
2. Compute the new root group plan.
3. Urgently mount active/viewport/corridor groups.
4. Detach or clear old far groups synchronously.
5. Schedule fresh far groups.
6. Mark `nativeSurfaceComplete = false`.
7. Flip `nativeSurfaceComplete = true` only after all groups are fresh.

Hard rule:

- old far DOM may be temporarily missing;
- old far DOM must not remain visible/searchable/copyable/readable as current
  content after the model changed.

Gate:

- after full replace visible commit, old far text is absent from DOM;
- new active text is present immediately;
- new far text appears after `nativeSurfaceComplete`;
- copy/select behavior uses model-backed payload or fresh DOM, never stale DOM;
- full replace visible commit is at or below legacy chunk-on at 5000 blocks.

### Phase 7.2: DOM-Present Startup Staging

Owner: root group runtime.

Target startup flow:

1. Compute root groups.
2. Urgently mount active/viewport/corridor.
3. Mark far groups `pending-mount`.
4. Report `interactiveReady`.
5. Mount far groups with a bounded background budget.
6. Report `nativeSurfaceComplete`.

Gate:

- `interactiveReady` is at or below legacy chunk-on ready at 5000 blocks;
- `nativeSurfaceComplete` is measured separately;
- browser find/screen-reader/native selection claims are only made after
  `nativeSurfaceComplete`;
- continuous typing/scrolling cannot starve completion indefinitely.

### Phase 7.3: Group Size, Corridor, And Background Budget Sweep

Owner: benchmark runner + runtime policy.

Sweep:

- group size: `250`, `500`, `1000`;
- corridor: viewport, viewport +/-1, viewport +/-2;
- background budget: `4 ms`, `8 ms`, `16 ms`.

Initial suspicion:

- start with `groupSize=500 | 1000`, `corridor=viewport+/-1 | +/-2`,
  `backgroundBudget=8 ms`;
- do not default to `100` unless the sweep proves it.

Gate:

- default candidate chosen by 5000-block median, not one-iteration smoke;
- 10000-block stress shape is not pathological;
- normal-doc overhead at 100/500 blocks stays acceptable.

### Phase 7.4: Beforeinput/Event Path After Lifecycle

Owner: browser input runtime.

Profile after lifecycle is sane:

- `beforeinput received`;
- target DOM node lookup;
- DOM -> Slate point/range import;
- model op;
- normalization;
- commit dirtiness;
- DOM text sync;
- selection export/caret repair;
- React selector flush.

Gate:

- setup-free model-owned beforeinput is within `directModelType + small
constant`;
- select/setup-inclusive model-owned beforeinput lanes stay named as model
  owned, not native;
- real browser-native input proof is added separately outside the jsdom-only
  model-owned lane;
- event-path proofs include mounted content and pending group materialization.

### Phase 7.5: Default Claim Gate

Default large-document performance can be claimed only when 5000-block,
5-iteration medians pass:

| Area                                | Required                         |
| ----------------------------------- | -------------------------------- |
| default interactive ready           | beats legacy chunk-on            |
| default direct/model typing         | matches or beats legacy chunk-on |
| default beforeinput typing          | <= legacy chunk-on + 10 ms       |
| default select+type                 | matches or beats legacy chunk-on |
| default full replace visible commit | matches or beats legacy chunk-on |
| stale DOM                           | proven absent                    |
| nativeSurfaceComplete               | measured and bounded             |
| sidecar updates                     | runtime-bucket scoped            |
| shell                               | still explicit                   |

## Fast Driver Gates

Use these during implementation:

- 2000 blocks: smoke/debug.
- 5000 blocks: release gate.
- 10000 blocks: stress/nightly.
- `typeOps=10` and `typeOps=100`.
- group update count.
- projection recompute count.
- annotation subscriber wake count.
- DOM text sync attempted/succeeded/failed counts.
- native `beforeinput` lane.

## Open Questions

- Exact default group size: benchmark `250`, `500`, `1000`, `2000`; initial
  likely winner is `500` or `1000`.
- Exact default corridor: benchmark `+/-1`, `+/-2`, `+/-5`; initial likely
  winner is `+/-2`.
- `content-visibility` default: enable only after browser find/a11y/mobile proof
  passes by browser family.
- Shell auto escalation threshold: no default threshold until shell proof passes.
- Whether to expose `dom-present` as public mode or only debug mode: decide after
  docs/API ergonomics pass.

What would change the decision:

- If DOM-present grouping cannot match legacy chunk-on typing at 5000 blocks
  after commit dirtiness is fixed, then the runtime must consider a deeper
  Lexical-style body reconciler or a true EditContext-like input layer.
- If shell mode unexpectedly passes native find/screen-reader/native
  selection/IME/mobile proof and typing becomes competitive, it may become a
  high-threshold auto escalation. It still should not be the first default.

## Pass-State Ledger

| Pass                                              | Status                                   | Evidence Added                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Plan Delta                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Open Issues                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Next Owner                                               |
| ------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| external-context-prompt                           | complete                                 | fresh 5000/10000/N-sweep metrics; live v2 source; legacy Slate chunking; React 19.2; comments/decorations pressure                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | drafted external prompt                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | none                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | complete                                                 |
| live-slate-api-skeleton                           | complete                                 | package exports, read/update/subscribe/extend, commit dirtiness, extension registry, React selectors, sidecar stores, browser proof                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | prompt and plan cite live current owners                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | none                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | complete                                                 |
| external-scalability-skeleton                     | complete                                 | Lexical, ProseMirror, Tiptap, VS Code skeletons                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | external prompt forced comparative answer                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | none                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | complete                                                 |
| gpt-answer-ralplan                                | complete                                 | GPT Pro answer chose two-tier DOM-present default and explicit shell mode                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | full plan rewritten around that verdict                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | none                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | complete                                                 |
| closure-score                                     | complete                                 | scorecard, proof matrix, objection ledger, phases, gates                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | score `0.93`, ready for user review                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | none                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | user review                                              |
| phase-0-stale-claim-cut                           | complete                                 | `docs/slate-v2/slate-react-perf-loop-context.md`, `true-slate-rc-proof-ledger.md`, `absolute-architecture-release-claim.md`, `replacement-gates-scoreboard.md`, `master-roadmap.md`, and affected research decisions now say current shell islands are red for typing/select lanes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | stale "v2 shell beats legacy chunk-on typing" claims cut; DOM-present auto and stronger commit dirtiness named as next owner                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | archived old plans still contain historical claims and are not current truth                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | phase-1-commit-dirtiness-for-typing                      |
| phase-1-commit-dirtiness-for-typing               | complete                                 | `packages/slate/src/interfaces/editor.ts`, `packages/slate/src/core/public-state.ts`, `packages/slate/test/commit-metadata-contract.ts`, `packages/slate-react/test/provider-hooks-contract.tsx`; `bun check` green in `Plate repo root`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | core `EditorCommit` now exposes frozen array/null dirty text, element, top-level, affected, structural/text/mark, root-order, top-level-order, and full-doc facts; React selector contracts prove those facts reach hooks                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | no benchmark win claimed; DOM text sync stays React-local for now                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | phase-2-internal-dom-present-grouping                    |
| phase-2-runtime-selector-fanout-cut               | complete                                 | `packages/slate-react/src/hooks/use-editor-selector.tsx`, `packages/slate-react/src/hooks/use-node-selector.tsx`, `packages/slate-react/test/provider-hooks-contract.tsx`; red/green test proves an unrelated runtime-id commit does not invoke `shouldUpdate`; `bun check` green in `Plate repo root`; 2000-block one-iteration compare still red for typing                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Phase 2 starts by removing selector-broadcast fanout before adding DOM/group wrappers                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | no 5000-block claim; 2000-block smoke still has v2 shell/no-island typing behind legacy chunk-on                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | phase-2-dom-present-root-groups                          |
| phase-2-dom-present-root-groups                   | complete, benchmark-red                  | `packages/slate-react/src/components/editable-text-blocks.tsx`, `packages/slate-react/src/render-profiler.ts`, `packages/slate-react/test/provider-hooks-contract.tsx`, `packages/slate-react/test/large-doc-and-scroll.tsx`; focused tests prove stable root-group render counts; `bun --filter slate-react typecheck`, focused slate-react tests, `bun lint:fix`, and `bun check` green; 2000-block smoke still loses typing                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | root groups are useful structure, but no performance claim; the next pass must instrument and cut mounted-subtree wakeup breadth                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | no 5000-block claim; root groups alone did not move direct compare enough                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | phase-2-mounted-subtree-fanout-instrumentation           |
| phase-2-mounted-subtree-fanout-instrumentation    | complete, benchmark-red                  | `packages/slate-react/src/render-profiler.ts`, `src/hooks/use-editor-selector.tsx`, `src/hooks/use-node-selector.tsx`, `src/hooks/use-editor-selection.tsx`, `src/hooks/use-element-selected.ts`, `src/hooks/use-slate-node-ref.tsx`, `src/editable/root-selector-sources.ts`, `scripts/benchmarks/browser/react/huge-document-legacy-compare.mjs`, `test/provider-hooks-contract.tsx`; focused tests, `bun --filter slate-react typecheck`, `bun lint:fix`, profiled 2000-block smoke, clean 2000-block smoke, and `bun check` green                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | instrumentation found root selector wakeups and DOM-sync shell misses; commit metadata now suppresses root runtime/placeholder/editable-root notifications for text-only commits                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | still red versus legacy chunk-on; shell unmounted middle type is probably a model/remote lane, not native typing; remaining global/selection notify needs a named owner                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | phase-2-selection-global-wakeup-cut                      |
| phase-2-selection-global-wakeup-cut               | complete, benchmark-red                  | `packages/slate-react/src/editable/selection-runtime.ts`, `packages/slate-react/test/selection-runtime-contract.test.ts`; profiled smoke shows selection DOM export notify is gone for plain type; focused Vitest, focused slate-react tests, `bun --filter slate-react typecheck`, `bun lint:fix`, clean smoke, and `bun check` green                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | selection DOM export no longer wakes on plain text-only commits; remaining red lanes need native input proof and shell/model lane classification                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | select-then-type still wakes selection DOM export because selection moves; 2000-block typing remains red against legacy chunk-on                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | phase-2-native-beforeinput-typing-lane                   |
| phase-2-native-beforeinput-typing-lane            | complete, benchmark-red                  | `benchmarks/slate-v2/donor/browser/react/huge-document-legacy-compare.mjs`; added v2-only native `beforeinput` event lanes, benchmark-local JSDOM `isContentEditable` shim, cached text-event target lookup, and delayed dispose for repair timers; 200-block smoke green; profiled 2000-block smoke green; clean 2000-block smoke green; `bun lint:fix` and `bun check` green                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | event-path typing is now measured separately from explicit model insert into unmounted shell ranges; legacy JSDOM has no honest comparable native beforeinput lane, so these lanes are reported only on v2 surfaces and excluded from legacy deltas                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | 2000-block clean: v2 shell middle beforeinput `119.78 ms`, no-island `214.48 ms`; event path is slower than direct inserts and wakes selection DOM export every op                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | phase-2-event-input-selection-export-cut                 |
| phase-2-event-input-selection-export-cut          | complete, benchmark-red                  | `packages/slate-react/src/editable/selection-runtime.ts`, `packages/slate-react/test/selection-runtime-contract.test.ts`; focused selection contract, `bun --filter slate-react typecheck`, `bun lint:fix`, profiled 2000-block smoke, clean 2000-block smoke, and `bun check` green                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | text-input commits now skip the selection DOM export listener when caret repair already owns the collapsed selection; native beforeinput `selection-dom-export-notify` drops from `11` to `1` in the profiled shell lane                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | clean 2000-block smoke still loses typing: legacy chunk-on middle `31.91 ms`, v2 shell middle `58.72 ms`, v2 no-island middle `73.84 ms`, v2 shell beforeinput `105.09 ms`, v2 no-island beforeinput `212.79 ms`                                                                                                                                                                                                                                                                                                                                                                                                                                   | phase-2-model-typing-hotpath-instrumentation             |
| phase-2-model-typing-hotpath-instrumentation      | complete, benchmark-red                  | `benchmarks/slate-v2/donor/browser/react/huge-document-legacy-compare.mjs`, `packages/slate-react/src/render-profiler.ts`, `packages/slate-react/src/components/slate.tsx`; focused provider/selection contracts, `bun --filter slate-react typecheck`, profiled 200/2000-block smokes, clean 2000-block smoke, and `bun check` green                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | profiled benchmark now reports `durationByKey` for benchmark `act`, `editor.update`, provider DOM sync, selector dispatch, callbacks, and focus state; dispose waits `250 ms` so queued caret-repair retries finish before globals restore                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | 2000-block profile says direct typing cost lives almost entirely inside `editor.update(tx.text.insert)`: shell middle type `60.18 ms`, text insert update `59.94 ms`, provider DOM sync `0.03 ms`, selector dispatch `0.12 ms`; no-island middle type `66.79 ms`, text insert update `66.06 ms`, DOM sync `0.85 ms`, selector dispatch `0.09 ms`                                                                                                                                                                                                                                                                                                   | phase-2-core-text-insert-cost-cut                        |
| phase-2-core-text-insert-cost-cut                 | complete, selectall/native-red           | `packages/slate/src/core/public-state.ts`, `packages/slate/test/snapshot-contract.ts`, `packages/slate-react/src/render-profiler.ts`, `benchmarks/slate-v2/donor/browser/react/huge-document-legacy-compare.mjs`; snapshot/transaction contracts, `bun --filter slate typecheck`, `bun --filter slate-react typecheck`, `bun lint:fix`, profiled 2000-block smoke, clean 2000/5000-block compares, and `bun check` green                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | core profiling found direct typing was dominated by full snapshot publication and rollback cloning; path-stable text snapshots reuse the previous index and clone only the edited branch; rollback reuses previous snapshot children until failure; collapsed selection impact no longer scans every indexed path                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | 5000-block clean shell now beats legacy chunk-on for ready `19.80 vs 301.66 ms`, middle type `23.72 vs 34.01 ms`, middle select/type `20.44 vs 34.38 ms`, promote/type `27.96 vs 37.45 ms`, replace `17.10 vs 127.76 ms`, fragment `31.52 vs 114.60 ms`; still red: selectAll `17.65 vs 1.01 ms`, native beforeinput shell `82.97 ms` v2-only                                                                                                                                                                                                                                                                                                      | phase-2-native-input-and-selectall-cost-cut              |
| phase-2-native-input-and-selectall-cost-cut       | complete                                 | `packages/slate/src/core/public-state.ts`, `packages/slate-react/src/editable/selection-reconciler.ts`, `packages/slate-react/src/editable/root-selector-sources.ts`, `packages/slate-react/src/editable/selection-runtime.ts`, `packages/slate-react/src/editable/runtime-root-engine.ts`, `packages/slate/test/snapshot-contract.ts`, `packages/slate-react/test/selection-reconciler-contract.ts`, `packages/slate-react/test/selection-runtime-contract.test.ts`, `packages/slate-react/test/large-doc-and-scroll.tsx`; focused tests, `bun --filter slate-react typecheck`, `bun lint:fix`, profiled 2000/5000-block compares, clean 2000/5000-block compares, and `bun check` green                                                                                                                                                                                                                                                                                                                                                                                                                                                         | broad full-document selection impact no longer materializes every selected runtime id; valid model-owned `beforeinput` no longer scans the root with `Editor.string(editor, [])`; broad shell-backed selectAll no longer replans the active island or exports an impossible DOM selection; 5000-block shell explicit now passes ready/selectAll/type/select-type/promote/full-doc gates against legacy chunk-on                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | v2 no-island remains red: 5000-block clean no-island ready `483.13 ms`, selectAll `22.03 ms`, select/type `107.34 ms`, native beforeinput `332.93 ms`, replace `155.31 ms`, fragment `179.21 ms`; shell remains explicit, not default                                                                                                                                                                                                                                                                                                                                                                                                              | phase-2-dom-present-render-subtree-cut                   |
| phase-2-dom-present-render-subtree-cut            | partial, native/full-doc-red             | `packages/slate-react/src/editable/selection-controller.ts`, `src/editable/selection-runtime.ts`, `src/hooks/use-editor-selector.tsx`, `src/hooks/use-element-selected.ts`, `test/react-editor-contract.tsx`, `test/selection-runtime-contract.test.ts`; focused contracts, `bun --filter slate-react typecheck`, `bun lint:fix`, `bun check`, profiled 5000-block compares, and clean 5000-block compare `/tmp/slate-v2-clean-5000-dom-present-final-this-slice.out`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | DOM-present selection export now uses direct text/root endpoints, keeps large full-document selections model-backed, skips model-to-DOM selection export for synced text-only commits, and narrows root-order fanout without breaking projection refresh or path-shifting `useElementSelected`; clean 5000 no-island now passes selectAll `2.04 / 2.13 ms`, middle type `17.68 / 13.84 ms`, and middle select/type `28.32 / 25.21 ms` against legacy chunk-on `1.33 / 1.21`, `39.41 / 38.91`, and `51.50 / 40.40`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | remaining no-shell red: ready `481.23 / 477.40 ms`, promote/type `68.16 / 67.26 ms`, native beforeinput `359.92 / 354.78 ms`, replace full doc `589.01 / 593.40 ms`, insert fragment `548.98 / 560.25 ms`; shell explicit remains green but not default                                                                                                                                                                                                                                                                                                                                                                                            | phase-2-dom-present-native-and-full-doc-owner            |
| phase-2-dom-present-native-and-full-doc-owner     | complete, policy-red                     | `packages/slate/src/core/public-state.ts`, `packages/slate/test/commit-metadata-contract.ts`, `packages/slate-react/src/editable/browser-handle.ts`, `src/editable/mutation-controller.ts`, `src/editable/model-input-strategy.ts`, `test/model-input-strategy-contract.ts`, `test/provider-hooks-contract.tsx`, `test/react-editor-contract.tsx`, `scripts/benchmarks/browser/react/huge-document-legacy-compare.mjs`; focused node and Vitest contracts green; `bun --filter slate typecheck`, `bun --filter slate-react typecheck`, `bun lint:fix`, and `bun check` green; profile `/tmp/slate-v2-profile-5000-dom-present-safe-full-doc-target-cut.out`; clean compare `/tmp/slate-v2-clean-5000-dom-present-safe-target-cut.out`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Full-document commits now publish next live runtime ids instead of `null`, cutting no-shell 5000 -> 1 replacement runtime-node checks/notifies from 10k/10k to 2/2 without breaking projection refresh; browser handle exposes `getElementByPath` so the beforeinput benchmark uses Slate's path map instead of root CSS scans; model-owned `insertText` can use the synced collapsed selection as explicit target when unmarked                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Clean 5000 no-island still fails ready `473.22 / 465.10 ms`, promote/type `88.47 / 88.80 ms`, native-beforeinput `483.63 / 488.35 ms`, replace `579.85 / 596.03 ms`, fragment `748.41 / 781.11 ms`; profile says full-doc selector fanout is no longer the bottleneck, so the remaining full-doc cost is mounted DOM/React act flush; native-beforeinput lane is still model-owned event-path plus setup, not a proven native browser insertion lane                                                                                                                                                                                               | phase-2-beforeinput-lane-split                           |
| phase-2-beforeinput-lane-split                    | complete, policy-red                     | `benchmarks/slate-v2/donor/browser/react/huge-document-legacy-compare.mjs`; added setup-free `startBlockModelBeforeInputTypeMs` and `middleBlockModelBeforeInputTypeMs`; kept the older mixed `*NativeBeforeInputTypeMs` lanes for continuity; benchmark cleanup drains delayed caret repair for `500 ms` outside measured samples; profiled 200-block benchmark green; profiled 5000-block benchmark green; clean 5000-block benchmark green; `bun lint:fix` and `bun check` green                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | The event-path evidence is now honest: shell model-beforeinput is setup-free, while the older native lane remains promotion/setup-inclusive and not a true browser-native insertion proof. Clean 5000: shell model-beforeinput `35.17 / 33.87 ms`, shell mixed native `55.36 / 48.02 ms`; no-island model-beforeinput `321.83 / 277.62 ms`, no-island mixed native `543.64 / 473.69 ms`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | No-shell direct typing/select/type are green, but no-shell event-input, promote, ready, and full-document lanes are red. Shell is the fast layer, but still cannot become universal default without browser find, screen reader, native selection, IME/mobile, clipboard, and collaboration proof                                                                                                                                                                                                                                                                                                                                                  | phase-2-dom-present-default-policy-replan                |
| phase-2-dom-present-default-policy-replan         | complete                                 | `docs/plans/2026-05-01-slate-v2-universal-large-document-performance-ralplan.md`, `docs/slate-v2/absolute-architecture-release-claim.md`, `docs/slate-v2/master-roadmap.md`, `docs/slate-v2/references/chunking-review.md`; plan and docs now reflect the post-split benchmark evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Default `auto` is locked as two-layer policy: DOM-present is the safe baseline; shell/occlusion escalation stays explicit or proof-disabled until browser/native/a11y/collab gates pass. DOM-present no-shell is not allowed to claim startup/full-doc/event-input performance victory                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Public `largeDocument.enabled` still exists in live source as the benchmark/internal shell shape; Phase 3 now owns sidecar range indexing before public API cleanup                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | phase-3-source-scoped-sidecar-range-index                |
| phase-3-source-scoped-sidecar-range-index         | complete                                 | `packages/slate-react/src/projection-store.ts`, `packages/slate-react/src/annotation-store.ts`, `packages/slate-react/test/annotation-store-contract.tsx`, `apps/www/src/app/(app)/examples/slate/_examples/collaborative-comments.tsx`, `apps/www/tests/slate-browser/donor/examples/collaborative-comments.test.ts`; `bun --filter slate-react test:vitest -- annotation-store-contract.test.tsx` green with 9 tests; focused collaborative-comments Chromium proof green; `bun lint:fix` green; `bun check` green                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Live sidecar stores already had the right owner shape, so this pass hardened proof instead of rewriting stores: projection/annotation changes wake affected runtime buckets only, document text edits rebase only impacted annotations across a larger set, and a read-only reviewer can comment through the sidecar channel while the writer owns document writes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | No public annotation product API is claimed; stale-target remote collaboration and DOM/native selection behavior move to Phase 4                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | phase-4-selection-bridge-and-dom-observer-discipline     |
| phase-4-shell-backed-selection-derivation         | complete                                 | `packages/slate-react/src/editable/runtime-root-engine.ts`, `packages/slate-react/test/large-doc-and-scroll.tsx`; `bun test ./packages/slate-react/test/large-doc-and-scroll.tsx` green with 17 tests; `bun --filter slate-react typecheck` green; `bun lint:fix` green; `bun check` green                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Shell-backed root state now derives from the live model selection, not only the explicit Ctrl+A/browser-handle flag. Programmatic broad selections across shelled ranges are classified as shell-backed without expanding shells                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Phase 4 still needs native selection drag, partial/full copy, paste-over-range, IME/mobile, and stale-target/rebase proof                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | phase-4-selection-copy-paste-and-native-proof            |
| phase-4-shell-backed-copy-payload                 | complete                                 | `packages/slate-dom/src/plugin/dom-clipboard-runtime.ts`, `packages/browser/src/playwright/index.ts`, `apps/www/tests/slate-browser/donor/examples/large-document-runtime.test.ts`; focused shell-backed copy Chromium proof green with 2 tests; `bun test ./packages/slate-react/test/large-doc-and-scroll.tsx` green with 17 tests; `bun --filter slate-dom typecheck` green; `bun --filter slate-react typecheck` green; `bun --filter slate-browser typecheck` green; `bun lint:fix` green; `bun check` green                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Clipboard write now falls back to a model-backed Slate fragment payload when DOM range cloning fails because selected shell content is unmounted. Full and partial shell-backed copy events now produce text/html Slate fragment data                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Real OS clipboard keyboard copy with no native DOM range was still a separate native-browser proof question until the next contract split row                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | phase-4-clipboard-contract-split                         |
| phase-4-clipboard-contract-split                  | complete                                 | `packages/browser/src/playwright/index.ts`, `apps/www/tests/slate-browser/donor/examples/large-document-runtime.test.ts`; first rerun failed because the site imported stale built `slate-browser/playwright` output; targeted package build `bunx turbo build --filter=./packages/slate-browser --filter=./packages/slate-dom --filter=./packages/slate-react --force` green; focused shell-backed copy Chromium proof green with 2 tests; existing highlighted-text real shortcut copy proof green with 1 test; `bun --filter slate-browser typecheck` green; `bun lint:fix` green; `bun check` green                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | The browser proof API now splits the contracts instead of hiding failure: `clipboard.copyPayload()` stays real keyboard/OS clipboard only, while `clipboard.copyEventPayload()` is the explicit synthetic copy-event payload helper for shell-backed selections where selected content is not fully mounted in the DOM                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Shell-backed rows do not claim browser OS clipboard parity without a native DOM range; Phase 4 still needs native drag selection, IME/mobile, and stale-target/rebase proof                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | phase-4-native-selection-and-composition-proof           |
| phase-4-native-drag-selection-proof               | complete                                 | `apps/www/tests/slate-browser/donor/examples/large-document-runtime.test.ts`; focused native mouse drag Chromium proof green; `bun lint:fix` green; first `bun check` rerun raced formatter output and failed on one formatting diff, rerun after `lint:fix` green                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | A real mouse drag inside mounted large-document content produces non-empty DOM selected text, imports an expanded Slate model selection in the mounted block, keeps the root out of `shell-backed` mode, and has no illegal kernel transitions                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | This is native proof for mounted content, not a claim that dragging across unmounted shell ranges is native; Phase 4 still needs IME/mobile and stale-target/rebase proof                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | phase-4-composition-and-stale-target-proof               |
| phase-4-composition-proof-refresh                 | complete                                 | existing `apps/www/tests/slate-browser/donor/examples/large-document-runtime.test.ts` rows; first mobile/chromium parallel attempt failed because two `next build` processes contended for the same build lock; reran sequentially; focused Chromium composition proof green with 2 tests; focused Playwright mobile composition proof green with 2 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Large-document mounted-content composition already had the right owner in live source: direct IME composition commits through the browser editing path, and the generated composition gauntlet records no illegal kernel transitions. Chromium is native composition; the Playwright mobile row is explicitly synthetic composition                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | This does not claim raw Android/iOS device proof. Phase 4 still needs stale-target/rebase proof                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | phase-4-stale-target-rebase-proof                        |
| phase-4-stale-target-rebase-proof                 | complete                                 | `packages/slate-react/src/editable/browser-handle.ts`, `packages/slate-react/src/editable/runtime-root-engine.ts`, `apps/www/tests/slate-browser/donor/examples/large-document-runtime.test.ts`; first browser row exposed missing `resolveRangeRef`; second exposed range refs being unrefed on browser-handle reattach; focused stale-target Chromium proof green; `bun --filter slate-react typecheck` green; targeted `bunx turbo build --filter=./packages/slate-react --force` green; `bun test ./packages/slate-react/test/large-doc-and-scroll.tsx` green with 17 tests; `bun lint:fix` green; `bun check` green                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Browser-handle range refs now survive render-time handle reattachment and are cleaned up by root unmount. A shell-backed bookmark captured in an unmounted island rebases through remote text operation replay, restores into mounted content, and copies the original selected text through the real clipboard path                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Raw Android/iOS device proof is still not claimed; Phase 4 local browser owner is complete                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | phase-5-explicit-shell-mode                              |
| phase-5-active-corridor-mounting                  | complete                                 | `packages/slate-react/src/large-document/create-island-plan.ts`, `packages/slate-react/test/large-doc-and-scroll.tsx`; focused large-doc package test green with 18 tests; `bun --filter slate-react typecheck` green; targeted `bunx turbo build --filter=./packages/slate-react --force` green with the known `is-hotkey` external warning; focused Chromium shell activation/copy/rebase browser rows green with 4 tests; 2000-block one-iteration legacy compare green for shell explicit; 5000-block one-iteration legacy compare green/parity for shell explicit; `bun lint:fix` green; `bun check` green                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | `activeRadius` now means an actual mounted corridor: every active island mounts its full runtime id slice, and inactive islands shell only far ranges. Package proof covers radius `0` mounting the full active island, radius `1` mounting the neighboring corridor island, and focus-only shell interaction staying non-promoting                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Shell mode is still explicit/aggressive, not the default. 5000-block one-iteration result has shell explicit at ready `34.96 ms`, selectAll `0.36 ms`, middle type `10.03 ms`, middle select/type `32.37 ms` versus legacy chunk-on `345.32 ms`, `1.03 ms`, `31.00 ms`, `31.56 ms`; no-island remains policy-red for ready/full-doc/event-input                                                                                                                                                                                                                                                                                                    | phase-5-large-document-policy-api                        |
| phase-5-large-document-policy-api                 | complete                                 | `packages/slate-react/src/large-document/create-island-plan.ts`, `packages/slate-react/src/components/editable-text-blocks.tsx`, `packages/slate-react/src/large-document/island-shell.tsx`, `packages/slate-react/test/provider-hooks-contract.tsx`, `packages/slate-react/test/large-doc-and-scroll.tsx`, `apps/www/src/app/(app)/examples/slate/_examples/large-document-runtime.tsx`, `benchmarks/slate-v2/donor/browser/react/huge-document-legacy-compare.mjs`, `benchmarks/slate-v2/donor/browser/react/active-typing-breakdown.tsx`, `benchmarks/slate-v2/donor/browser/react/huge-document-overlays.tsx`, `content/docs/slate/walkthroughs/09-performance.md`, `content/docs/slate/libraries/slate-react/editable.md`; focused large-doc package test green with 19 tests; provider-hooks contract green with 14 tests; `bun --filter slate-react typecheck` green; targeted `bunx turbo build --filter=./packages/slate-react --force` green with the known `is-hotkey` external warning; focused Chromium shell activation/copy/rebase/composition rows green with 6 tests; 2000-block one-iteration legacy compare works through `mode: 'shell'`; `bun lint:fix` green; `bun check` green | Public large-document policy no longer uses misleading `enabled: true`. Default and `largeDocument="auto"` keep safe DOM-present grouping, `largeDocument="off"` disables automatic root grouping, and shell options require `mode: 'shell'`. Shell promotion also fails closed while composing                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Shell mode still cannot become auto/default without browser find, screen-reader traversal, native selection across shell boundaries, raw mobile/device proof, undo/history soak, and persistent caret soak. Docs are updated for the live API, but Phase 6 still owns final docs/examples closure and stale-claim sweep                                                                                                                                                                                                                                                                                                                            | phase-6-release-docs-and-examples                        |
| phase-6-release-docs-and-examples                 | complete                                 | `content/docs/slate/libraries/slate-react/editable.md`, `content/docs/slate/walkthroughs/09-performance.md`, `apps/www/src/app/(app)/examples/slate/_examples/large-document-runtime.tsx`, `packages/slate-react/test/provider-hooks-contract.tsx`; stale sweep for `enabled`, old island headings, and unsupported performance-victory wording found no live large-document docs/examples drift after cleanup; provider-hooks contract green with 15 tests; large-doc package contract green with 19 tests; `bun --filter slate-react typecheck` green; `bun lint:fix` green; `bun check` green                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Docs now describe current-state policy: omitted/`auto` uses safe DOM-present grouping, `dom-present` locks that safe mode, `off` disables automatic root grouping, and `{ mode: 'shell' }` opts into aggressive shell mounting. No doc claims shell is the universal default or that unproven browser/a11y gates passed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Browser find, screen-reader traversal, cross-shell native selection, raw mobile device proof, undo/history soak, and persistent caret soak remain explicit future gates before shell can ever become automatic/default                                                                                                                                                                                                                                                                                                                                                                                                                             | complete                                                 |
| gpt-pro-followup-dom-present-lifecycle-replan     | complete                                 | GPT Pro follow-up answer; live source re-read for `LargeDocumentOptions`, root grouping, shell corridor, docs, tests, and benchmark runner; memory-backed warning that shell editing is safe only with semantic DOM                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Reopened the plan at score `0.88`; shell remains explicit and credible, but default DOM-present is not a performance victory. Added readiness split, root group lifecycle, stale-DOM rule, benchmark row rename, and Phase 7 lifecycle plan                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Needs execution: benchmark rename, readiness traces, full-doc stale-DOM proof, staged mount lifecycle, group/corridor/budget sweep, beforeinput after lifecycle                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | phase-7-benchmark-surface-rename                         |
| phase-7-benchmark-surface-rename                  | complete                                 | `benchmarks/slate-v2/donor/browser/react/huge-document-legacy-compare.mjs`; `node --check` green; stale `v2LargeDocument` / `v2NoIsland` grep clean in the runner; `REACT_HUGE_COMPARE_ITERATIONS=1 REACT_HUGE_COMPARE_BLOCKS=2000 REACT_HUGE_COMPARE_TYPE_OPS=10 REACT_HUGE_COMPARE_ACTIVE_RADIUS=0 REACT_HUGE_COMPARE_ISLAND_SIZE=100 bun run bench:react:huge-document:legacy-compare:local` green; `bun lint:fix` green; `bun check` green                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Benchmark output now has `v2Off`, `v2DefaultOmitted`, `v2AutoExplicit`, `v2DomPresent`, `v2ShellExplicitRadius0`, and `v2ShellExplicitRadius1`, plus per-surface trace fields for mode, grouping, shell, group size, corridor, staged mounting, readiness, mounted/pending/stale counts, and background chunks. `deltaMeanMsBySurface` now compares every v2 surface separately                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Trace fields are scaffolding for the lifecycle phase. One-iteration 2000-block smoke showed default/DOM-present full-doc lanes red: `v2DomPresent` replace `111.64 ms` and fragment `108.88 ms` versus legacy chunk-on `43.89 ms` and `41.66 ms`                                                                                                                                                                                                                                                                                                                                                                                                   | phase-7-dom-present-full-doc-lifecycle                   |
| phase-7-dom-present-stale-dom-proof               | complete, perf-red                       | `packages/slate-react/test/large-doc-and-scroll.tsx`, `benchmarks/slate-v2/donor/browser/react/huge-document-legacy-compare.mjs`; focused stale-DOM test green; full large-doc package test green with 20 tests; profiled 2000-block compare written to `/tmp/slate-v2-profile-2000-phase7-full-doc.out`; clean 2000-block compare green; `bun lint:fix` green; `bun check` green                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | DOM-present full-document replacement now has a replayable correctness proof: old far text is absent from DOM immediately after visible commit, new active text is present, and shell nodes are not involved. The benchmark trace now reports `interactiveReadyAt` and `nativeSurfaceCompleteAt` as equal for synchronous DOM-present/off rows, while shell leaves `nativeSurfaceCompleteAt: null`. The benchmark also has model-only full-doc lanes: `replaceFullDocumentWithTextModelCommitMs` and `insertFragmentFullDocumentModelCommitMs`                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Correctness is green, but lifecycle performance is still red. Clean 2000-block smoke: legacy chunk-on ready `130.21 ms`, replace `47.28 ms`, fragment `44.03 ms`; `v2DomPresent` ready/native surface `187.11 ms`, replace visible `96.50 ms`, fragment visible `118.21 ms`, model replace `11.66 ms`, model fragment `11.48 ms`. The gap is mounted DOM/React visible flush, not model commit                                                                                                                                                                                                                                                     | phase-7-dom-present-full-doc-lifecycle-perf-cut          |
| phase-7-dom-present-staged-group-lifecycle        | complete, needs-5000-gate                | `packages/slate-react/src/components/editable-text-blocks.tsx`, `packages/slate-react/test/large-doc-and-scroll.tsx`, `packages/slate-react/test/provider-hooks-contract.tsx`, `benchmarks/slate-v2/donor/browser/react/huge-document-legacy-compare.mjs`; focused DOM-present tests green; full large-doc package test green with 22 tests; provider DOM-present tests green; `node --check` green; 2000-block one-iteration compare green; `bun lint:fix` green; `bun check` green                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Default/DOM-present root groups now stage far groups: interactive-ready mounts the active group, pending groups expose inert hidden placeholders with no stale text, selected pending groups materialize urgently, and background mounting fills native surface later. The root runtime receives mounted ranges for DOM-present staging, so broad selections are model-backed until DOM exists. Benchmark trace now includes `nativeSurfaceCompleteMs` as a separate lane instead of pretending staged ready means full native DOM.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | 2000-block smoke improved the red owner: legacy chunk-on ready `143.21 ms`, replace `45.57 ms`, fragment `89.78 ms`; `v2DomPresent` interactive ready `89.90 ms`, native surface complete `211.48 ms`, replace visible `36.21 ms`, fragment visible `47.67 ms`. This is promising but not release proof: one iteration only, 5000-block medians not run, native beforeinput remains red/noisy (`v2DomPresent` middle native beforeinput `111.94 ms` at 2000), and group size/corridor/budget are still fixed first-cut values.                                                                                                                     | phase-7-5000-default-gate                                |
| phase-7-root-group-size-250                       | complete, selection-red                  | `packages/slate-react/src/components/editable-text-blocks.tsx`, `packages/slate-react/test/large-doc-and-scroll.tsx`, `packages/slate-react/test/provider-hooks-contract.tsx`, `benchmarks/slate-v2/donor/browser/react/huge-document-legacy-compare.mjs`; split-selection diagnostic artifact `tmp/slate-react-huge-document-legacy-compare-benchmark-5000-split-selection-g250.json`; focused DOM-present tests green; full large-doc package test green with 22 tests; provider DOM-present tests green; `bun --filter slate-react typecheck`, `node --check`, `bun lint:fix`, and `bun check` green                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | DOM-present default root group size moved from `1000` to `250`, and the benchmark now has opt-in split-selection lanes plus `disposeDelayMs` so selection activation can be separated from post-selection typing. This cut interactive ready and full-doc visible commit hard: normal 5000 one-iteration `v2DomPresent` ready `40.08 ms`, replace `10.20 ms`, fragment `18.95 ms` versus legacy chunk-on `300.66 ms`, `122.80 ms`, `115.13 ms`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | The 5000 gate is still not closed. `v2DomPresent` middle select+type remains red at `88.80 ms` versus legacy chunk-on `39.27 ms`; split diagnostic shows the owner is pending-group materialization/selection (`middleBlockSelectMs` `66.16 ms`, while `middleBlockTypeAfterSelectMs` is `22.74 ms`). `nativeSurfaceComplete` is now slower and must stay separately reported (`1085.07 ms` for `v2DomPresent`, `1311.16 ms` for default omitted).                                                                                                                                                                                                 | phase-7-selection-materialization-cost-cut               |
| phase-7-root-group-size-100-batched-background    | complete, event-input-red                | `packages/slate-react/src/components/editable-text-blocks.tsx`, `packages/slate-react/test/large-doc-and-scroll.tsx`, `packages/slate-react/test/provider-hooks-contract.tsx`, `benchmarks/slate-v2/donor/browser/react/huge-document-legacy-compare.mjs`; split-selection artifact `tmp/slate-react-huge-document-legacy-compare-benchmark-5000-split-selection-g100.json`; normal artifact `tmp/slate-react-huge-document-legacy-compare-benchmark.json`; focused DOM-present tests green; provider DOM-present tests green; `bun --filter slate-react typecheck` green; `node --check` green                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | DOM-present root group size moved from `250` to `100`, and background native-surface mounting now batches `4` pending groups per tick. Normal 5000 one-iteration smoke: legacy chunk-on ready `352.22 ms`, middle type `33.96 ms`, middle select/type `66.67 ms`, replace `183.13 ms`, fragment `115.18 ms`; `v2DomPresent` ready `23.86 ms`, native surface complete `827.68 ms`, middle type `9.04 ms`, middle select/type `38.35 ms`, replace `25.56 ms`, fragment `7.58 ms`; `v2DefaultOmitted` ready `34.62 ms`, native surface complete `1050.22 ms`, middle type `8.69 ms`, middle select/type `49.51 ms`, replace `8.57 ms`, fragment `8.38 ms`.                                                                                                                                                                                                                                                                                                                                                            | This closes the selection/materialization owner for smoke only, not release medians. Split diagnostic confirms the cut: `v2DomPresent` middle select `15.59 ms`, middle type-after-select `23.58 ms`, middle select/type `25.89 ms` versus legacy chunk-on `1.34 ms`, `32.75 ms`, `38.31 ms`. The active red owner is event input: normal `v2DomPresent` middle model-beforeinput `36.61 ms` and native-beforeinput `73.69 ms`; default omitted native-beforeinput is `99.43 ms`.                                                                                                                                                                  | phase-7-beforeinput-event-path-after-materialization     |
| phase-7-beforeinput-lane-truth                    | complete, needs-medians                  | `benchmarks/slate-v2/donor/browser/react/huge-document-legacy-compare.mjs`; artifact `tmp/slate-react-huge-document-legacy-compare-benchmark-5000-model-beforeinput-renamed.json`; 100-block smoke green; profiled 5000-block diagnostic green; clean 5000-block diagnostic green; `node --check` green                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Removed the fake `*NativeBeforeInputTypeMs` labels from the jsdom runner. The old lane dispatched `@`, which is intentionally not native-eligible, so it measured model-owned beforeinput plus selection/setup. The runner now reports `*ModelBeforeInputTypeMs` and `*SelectThenModelBeforeInputTypeMs`; real native browser insertion remains an explicit missing proof lane. Clean 5000 one-iteration after the rename: legacy chunk-on ready `345.40 ms`, middle type `48.61 ms`, middle select/type `50.24 ms`, replace `119.51 ms`, fragment `112.98 ms`; `v2DomPresent` ready `29.26 ms`, native surface complete `866.41 ms`, middle type `8.70 ms`, middle select/type `65.36 ms`, model-beforeinput `36.09 ms`, select-then-model-beforeinput `55.78 ms`, replace `7.96 ms`, fragment `7.99 ms`; `v2AutoExplicit` ready `22.81 ms`, middle type `8.68 ms`, middle select/type `51.04 ms`, model-beforeinput `36.66 ms`, select-then-model-beforeinput `58.50 ms`, replace `7.76 ms`, fragment `10.25 ms`. | This does not close default performance. It deletes bad evidence. One-iteration values are noisy: `v2DomPresent` direct middle select/type and promote are still red in this clean run, while prepared model-owned beforeinput is near/under legacy typing. Next proof must be 5000-block medians with honest lane names and a separate real browser-native input proof.                                                                                                                                                                                                                                                                           | phase-7-5000-median-confirmation-after-event-path        |
| phase-7-5000-median-confirmation-after-event-path | complete, native-proof-and-selection-red | `tmp/slate-react-huge-document-legacy-compare-benchmark-5000-median-model-beforeinput-renamed.json`; focused large-doc/provider tests, slate-react typecheck, `node --check`, `bun lint:fix`, and `bun check` green before the median run; `REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_TYPE_OPS=10 REACT_HUGE_COMPARE_ACTIVE_RADIUS=0 REACT_HUGE_COMPARE_ISLAND_SIZE=100 bun run bench:react:huge-document:legacy-compare:local` green                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | 5000-block medians confirm the DOM-present/default architecture is materially better than the one-iteration fog suggested. Legacy chunk-on median: ready `295.57 ms`, selectAll `0.69 ms`, middle type `33.37 ms`, middle select/type `31.68 ms`, promote/type `34.39 ms`, replace `115.05 ms`, fragment `111.26 ms`. `v2DomPresent` median: ready `24.63 ms`, native surface complete `999.66 ms`, selectAll `0.19 ms`, middle type `8.51 ms`, middle select/type `38.31 ms`, promote/type `47.71 ms`, model-beforeinput `23.95 ms`, select-then-model-beforeinput `54.26 ms`, replace visible `8.24 ms`, fragment visible `7.78 ms`. `v2AutoExplicit` median: ready `23.95 ms`, middle type `9.07 ms`, middle select/type `42.10 ms`, model-beforeinput `31.26 ms`, replace visible `7.71 ms`, fragment visible `15.93 ms`.                                                                                                                                                                                       | Default DOM-present now passes the important ready/type/selectAll/visible-full-doc lanes against legacy chunk-on, but it is not done. Remaining red owners: selection/setup-inclusive lanes, promote-then-type, select-then-model-beforeinput, and no true browser-native insertion proof. `nativeSurfaceComplete` must keep being reported separately and bounded; do not hide the roughly one-second full native DOM warmup behind interactive ready.                                                                                                                                                                                            | phase-7-real-native-input-proof-and-selection-setup-cost |
| phase-7-real-native-input-proof                   | complete, selection-red                  | `packages/browser/src/playwright/index.ts`, `apps/www/src/app/(app)/examples/slate/_examples/large-document-runtime.tsx`, `apps/www/tests/slate-browser/donor/examples/large-document-runtime.test.ts`, `packages/slate-react/src/editable/keyboard-input-strategy.ts`, `packages/slate-react/src/editable/runtime-keyboard-events.ts`, `packages/slate-react/src/editable/runtime-event-engine.ts`, `packages/slate-react/src/editable/native-input-strategy.ts`, `packages/slate-react/src/editable/model-input-strategy.ts`, `packages/slate-react/src/editable/dom-repair-queue.ts`, `packages/slate-dom/src/plugin/with-dom.ts`, `packages/slate-dom/test/bridge.ts`, `packages/slate-react/test/kernel-authority-audit-contract.ts`; `bun test ./packages/slate-dom/test/bridge.ts`, `bun test ./packages/slate-react/test/model-input-strategy-contract.ts`, `bun test ./packages/slate-react/test/large-doc-and-scroll.tsx`, package typechecks for slate-dom/slate-react/slate-browser, focused Chromium Playwright native typing row, audit contract row, `bun lint:fix`, and `bun check` green                                    | Added a separate DOM-present large-document route and Chromium proof that uses a real click plus `page.keyboard.type`, then asserts model text, model selection, DOM caret, and a native-allowed `input` trace. The path to native input was blocked by three real issues: large-document keydown intercepted all printable keys instead of only shell-backed selection, empty marks `{}` denied native input, and selection-only ops marked the DOM node map dirty. After those cuts, native DOM-to-model repair still produced an invalid model selection because it selected and inserted in separate updates; repair now inserts at the explicit pre-native point and then sets the post-insert selection.                                                                                                                                                                                                                                                                                                      | Real native insertion proof is now green for the active DOM-present group. The Phase 7 default claim is still pending because selection/setup-inclusive lanes, promote-then-type, and select-then-model-beforeinput are still slower than the target medians; native-surface completion remains separate and roughly one second at 5000 blocks.                                                                                                                                                                                                                                                                                                    | phase-7-selection-setup-promote-cost                     |
| phase-7-selection-setup-promote-cost              | complete, stress-red                     | `packages/slate-react/src/components/editable-text-blocks.tsx`, `packages/slate-react/test/large-doc-and-scroll.tsx`, `packages/slate-react/test/provider-hooks-contract.tsx`, `benchmarks/slate-v2/donor/browser/react/huge-document-legacy-compare.mjs`; artifacts `tmp/slate-react-huge-document-legacy-compare-benchmark-5000-split-selection-median.json`, `tmp/slate-react-huge-document-legacy-compare-benchmark-5000-split-selection-group50-median.json`, and `tmp/slate-react-huge-document-legacy-compare-benchmark-10000-group50-stress.json`; focused large-doc/provider tests green; `bun --filter slate-react typecheck` green; `node --check` green; `bun lint:fix` green; `bun check` green                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Measured the remaining selection/setup owner with split-selection medians, then cut DOM-present root group size from `100` to `50` and kept background throughput at eight 50-block groups per tick. 5000-block medians now pass the default product lanes: legacy chunk-on ready `307.75 ms`, middle type `31.51 ms`, middle select/type `32.33 ms`, promote/type `32.25 ms`, replace `114.35 ms`, fragment `114.17 ms`; `v2DefaultOmitted` ready `23.41 ms`, middle type `8.74 ms`, middle select/type `39.73 ms`, promote/type `38.78 ms`, model-beforeinput `40.52 ms`, select-then-model-beforeinput `48.81 ms`, replace `7.83 ms`, fragment `7.04 ms`; `v2DomPresent` ready `20.65 ms`, middle type `8.66 ms`, middle select/type `38.99 ms`, promote/type `33.97 ms`, model-beforeinput `28.39 ms`, replace `8.15 ms`, fragment `7.13 ms`.                                                                                                                                                                   | The 5000 gate improved, but the 10000 stress gate is red. With group size `50`, 10000-block medians show default ready/full-doc still crush legacy (`v2DefaultOmitted` ready `42.44 ms`, replace `13.03 ms`, fragment `20.84 ms` vs legacy chunk-on `613.79 ms`, `262.21 ms`, `255.53 ms`), but selection-inclusive lanes scale badly: `v2DefaultOmitted` middle select/type `84.35 ms` and promote/type `115.28 ms` vs legacy `37.90 ms` and `35.86 ms`; `v2DomPresent` middle select/type `79.21 ms` and promote/type `71.00 ms`. A dynamic 100-block stress-size smoke was rejected because it made the surface noisy and worsened other lanes. | phase-7-10000-selection-stress-cost                      |
| phase-7-10000-pending-placeholder-coalescing      | complete, stress-red                     | `packages/slate-react/src/components/editable-text-blocks.tsx`, `packages/slate-react/test/large-doc-and-scroll.tsx`, `packages/slate-react/test/provider-hooks-contract.tsx`, `benchmarks/slate-v2/donor/browser/react/huge-document-legacy-compare.mjs`; artifacts `tmp/slate-react-huge-document-legacy-compare-benchmark-10000-split-group50-coalesced-smoke.json`, `tmp/slate-react-huge-document-legacy-compare-benchmark-5000-split-group50-coalesced-median.json`, and `tmp/slate-react-huge-document-legacy-compare-benchmark-10000-group50-coalesced-stress.json`; focused large-doc/provider tests green; `bun --filter slate-react typecheck` green; `node --check` green; `bun lint:fix` green; `bun check` green                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Coalesced contiguous pending DOM-present groups into one hidden placeholder range instead of rendering one hidden placeholder per pending group. This keeps stale DOM absent and mounted ranges unchanged while cutting root child reconciliation pressure. 5000-block coalesced medians keep the default rows green: legacy chunk-on ready `295.89 ms`, middle type `35.26 ms`, select/type `31.08 ms`, promote/type `32.74 ms`; `v2DefaultOmitted` ready `19.44 ms`, middle type `8.92 ms`, select/type `31.55 ms`, promote/type `35.93 ms`; `v2AutoExplicit` ready `19.26 ms`, middle type `9.10 ms`, select/type `32.00 ms`, promote/type `33.66 ms`.                                                                                                                                                                                                                                                                                                                                                           | The 10000 stress owner improved but remains red. Coalesced 10000 medians: legacy chunk-on ready `598.29 ms`, middle type `40.83 ms`, select/type `34.70 ms`, promote/type `35.75 ms`, replace `257.71 ms`, fragment `254.46 ms`; `v2DefaultOmitted` ready `33.30 ms`, middle type `21.66 ms`, select/type `69.03 ms`, promote/type `72.29 ms`, model-beforeinput `38.04 ms`, replace `14.22 ms`, fragment `12.76 ms`; `v2DomPresent` ready `43.45 ms`, middle type `20.28 ms`, select/type `75.74 ms`, promote/type `85.46 ms`. Next owner is not raw typing; it is the selection-inclusive render/selection repair path at 10000 blocks.          | phase-7-10000-selection-stress-cost                      |
| phase-7-10000-eager-active-group-persist-removal  | rejected, reverted                       | `tmp/slate-react-huge-document-legacy-compare-benchmark-10000-split-group50-coalesced-no-eager-persist-smoke.json`; focused large-doc/provider tests green before and after revert; `bun --filter slate-react typecheck` green; `node --check` green; `bun lint:fix` green; `bun check` green                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Tested removing the eager effect that persisted the active root group into mounted state, because the profile suggested a possible post-selection React flush. The 10000-block split smoke did not validate the theory: `v2DefaultOmitted` select/type was `73.94 ms` and promote/type regressed to `115.57 ms`; `v2DomPresent` select/type was `65.55 ms` and promote/type `107.39 ms`. The patch was reverted.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Keep coalesced placeholders and eager active-group persistence. Do not chase mounted-state persistence next; the remaining owner is deeper selection-inclusive render/selection repair cost at 10000 blocks.                                                                                                                                                                                                                                                                                                                                                                                                                                       | phase-7-10000-selection-stress-cost                      |
| phase-7-10000-local-tuning-rejections             | complete, follow-up-owner                | `tmp/slate-react-huge-document-legacy-compare-benchmark-10000-split-group50-coalesced-profile-after-revert.json`, `tmp/slate-react-huge-document-legacy-compare-benchmark-10000-split-group25-smoke.json`, `tmp/slate-react-huge-document-legacy-compare-benchmark-10000-split-group50-background-delay0-smoke.json`; focused large-doc/provider tests green; `bun --filter slate-react typecheck` green; `node --check` green; `bun lint:fix` green; `bun check` green                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Profile confirmed the remaining immediate far-selection cost is materializing/rendering the selected DOM-present group plus the following text update. Two cheap local levers were rejected: `25`-block groups made the surface noisy and worsened important rows (`v2DefaultOmitted` select/type `199.69 ms`, direct middle type `20.66 ms`; `v2DomPresent` promote/type `112.54 ms`), while immediate background mounting was catastrophic (`v2DefaultOmitted` selectAll `1450.40 ms`, middle type `1497.83 ms`, select/type `1841.38 ms`). Both patches were reverted.                                                                                                                                                                                                                                                                                                                                                                                                                                           | Current default claim can close for the 5000-block release gate, but do not claim the 10000-block immediate far-selection stress row is fixed. Follow-up needs deeper architecture around pending group interaction/materialization, not constant tuning.                                                                                                                                                                                                                                                                                                                                                                                          | phase-7-default-claim-gate                               |

## Final Completion Gates

Latest status is closed for the current default-performance gate, with a
recorded follow-up for 10000-block immediate far-selection stress.

The previous shell-policy execution is complete:

- explicit shell policy exists;
- shell corridor semantics are fixed;
- shell composition guard exists;
- docs/examples describe shell as explicit/aggressive;
- shell smoke rows are green enough to keep as an escape hatch.

The default-performance lane is complete for the current release claim because
these Phase 7 gates now pass or have a recorded owner:

- benchmark surfaces no longer use `v2NoIsland` (Phase 7.0 complete);
- `interactiveReady` and `nativeSurfaceComplete` are measured separately;
- DOM-present full-document replace/fragment never leaves stale far DOM exposed;
- DOM-present startup uses a bounded group lifecycle;
- group size/corridor/background budget are chosen from multi-iteration data
  for the 5000-block release target, with failed 10000 local tuning recorded;
- beforeinput/event path is named honestly after lifecycle is sane;
- default DOM-present 5000-block medians beat or match legacy chunk-on for the
  required lanes;
- real browser-native input proof exists separately from the jsdom model-owned
  beforeinput lanes (complete for active DOM-present Chromium typing);
- shell remains explicit unless native/a11y/collab gates pass.

Do not upgrade this into a 10000-block immediate far-selection victory. That is
the next research/perf owner.
