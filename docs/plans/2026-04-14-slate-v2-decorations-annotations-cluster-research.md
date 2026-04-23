# Slate v2 decorations / annotations cluster research

## Goal

Write and then expand a control-repo doc that explains the legacy Slate decorations and annotations issue cluster, then turns it into an architecture-grade rewrite recommendation, grounded in:

- local `docs/slate-issues/**` research
- GitHub issue `#3383`
- PR `#4997` comments + changed files
- PR `#4993` comments + changed files
- local `docs/slate-v2/**` design docs and solutions
- `docs/analysis/editor-architecture-candidates.md`
- relevant local clones in `..`

The output should separate:

- API-model pressure
- render/projection architecture pressure
- selection/IME/browser fallout
- performance / invalidation breadth
- annotation/comment-anchor pressure

## Phases

- [completed] collect local issue-cluster evidence from `docs/slate-issues`
- [completed] read linked GitHub issue + both PR threads/files
- [completed] synthesize a new doc in `docs/slate-v2/`
- [completed] verify citations / factual claims against sources
- [completed] evaluate whether this produced reusable knowledge beyond the doc itself

## Findings

- Existing local issue docs already say decorations, render-time marks, and annotation anchors were flattened across too many macro themes and deserve a first-class cluster.
- Existing ledgers already point at issue families around cross-node decoration behavior, dynamic decoration invalidation cost, selection offset corruption, IME/composition failures, and annotation/comment-anchor demand.
- `#3383` is the clean semantic-model issue: flattening overlays into leaf props loses multiple same-semantic payloads.
- `#4993` is the “contract ambiguity + top-down invalidation explosion” PR.
- `#4997` is the “selector-style subscriptions help perf but still break under async/external redecorate timing” PR.
- The strongest durable read is that annotation-like anchors are a distinct ownership/lifetime problem, not just another decoration flavor.
- local `slate-v2` docs already support a projection-first split:
  core range semantics, React overlay store, transaction-aware range refs, and corridor-first huge-doc posture
- cross-editor scan says the winning synthesis is not one engine copied whole:
  mapped decoration discipline from ProseMirror, subscription and widget separation from Lexical, product-layer comments from Tiptap, derived layout from Premirror/Pretext, normalized overlay indexing from TanStack DB
- final recommendation: yes, do both decorations and annotations, but as separate first-class systems sharing projection plumbing
- React 19.2 sharpens the runtime posture:
  `useSyncExternalStore` for overlay subscriptions, `startTransition` only for non-urgent overlay work, `useDeferredValue` for lagging side panes not editor truth, `useEffectEvent` for stable bridge listeners, and `Activity` for hidden panes/page surfaces with preserved state but torn-down effects
- VS Code/Monaco-style editor architecture reinforces the split further:
  inline injected text, gutter/minimap/overview markers, and view zones are distinct visual channels, not one catch-all decoration primitive
- broad research has likely saturated; the remaining unknowns are now API/spec/prototype questions, not “find another repo” questions

## Progress

- Created this merged plan file per repo override for `planning-with-files`.
- Loaded workspace instructions, OMX state, and skill guidance.
- Indexed local `docs/slate-issues/**` files and grep hits for `decorat|annotat`.
- Read `issue-clusters.md`, `requirements-from-issues.md`, key ledger rows, and targeted open-issue dossiers covering cross-node decorate, IME/decorated selection failures, and async decorate caret jumps.
- Read full `#3383` thread.
- Read full `#4997` and `#4993` PR discussions plus changed-file diffs; both had zero inline review comments.
- Wrote `/Users/zbeyens/git/plate-2/docs/slate-v2/decorations-annotations-cluster.md`.
- Mined local `docs/slate-v2/**` docs and `docs/solutions/**` for projection, range-ref, decorated DOM bridge, clipboard, huge-doc, and annotation ideas already proved locally.
- Read focused local-clone sources from ProseMirror, Lexical, Tiptap, Premirror, Pretext, `use-editable`, `rich-textarea`, `edix`, TanStack DB, and EditContext.
- Queried official React 19.2 docs for `useSyncExternalStore`, transitions, `useDeferredValue`, `useEffectEvent`, and `Activity`.
- Expanded the doc from issue-cluster writeup into an explicit rewrite proposal with API shape, ownership split, huge-doc posture, and compatibility stance.
- Added a deeper-pass section covering child-scoped propagation, bookmark durability, Lexical's MarkNode/DecoratorNode/cursor split, Premirror invalidation ranges, and React 19.2-specific runtime rules.
- Added a final-pass section covering VS Code's split visual channels and explicit stop conditions for ending broad research and moving into design/spec work.
- Compiled the architecture lane into `docs/research`:
  - [decorations-annotations-overlay-corpus.md](/Users/zbeyens/git/plate-2/docs/research/sources/editor-architecture/decorations-annotations-overlay-corpus.md)
  - [editor-architecture-landscape.md](/Users/zbeyens/git/plate-2/docs/research/systems/editor-architecture-landscape.md)
  - [slate-v2-overlay-architecture.md](/Users/zbeyens/git/plate-2/docs/research/systems/slate-v2-overlay-architecture.md)
  - [slate-v2-overlay-architecture-cuts.md](/Users/zbeyens/git/plate-2/docs/research/decisions/slate-v2-overlay-architecture-cuts.md)
- Decompacted the research lane into narrower source clusters plus reusable
  concepts so future non-overlay editor research does not have to reuse one fat
  page:
  - ProseMirror mapped overlays and bookmarks
  - Lexical mark/store/decorator split
  - Tiptap comments/suggestions/node-range
  - local Slate v2 proof substrate
  - layout/measurement/IME lanes
  - lightweight editable lower-bound
  - service channels and live stores
- No separate `ce-compound` extraction needed because the requested deliverable is itself the durable knowledge capture.
