# Slate v2 Search Highlighting DX Ralplan

Status: `implemented`
Runtime id: `019e3627-238b-7993-a8cf-26be45504c47`
Requested surface: `apps/www/src/app/(app)/examples/slate/_examples/search-highlighting.tsx`
Current pass: `ralph-implementation-and-proof`
Prior final score: `0.93`
Final score: `0.94`
Hook completion state: `done`
Review state: `ralph execution complete`

## Verdict

The current search highlighting example is too low-DX for a canonical Slate v2
example. It proves the projection runtime is powerful, but it exposes too much
of that runtime to a normal app author.

Hard take: this should not ship as the primary search-highlighting shape. Keep
`createDecorationSource` / `useSlateDecorationSource` as the power API, but add
one range-decoration helper and one text-range finder so common text overlays do
not require users to build projection splitting, keys, source ids, and runtime
scope by hand.

Do not add `editor.api.search.*`. That would be too product-shaped for raw
Slate. Add generic range/text primitives that make search, markdown preview,
hashtags, lint highlights, and simple diagnostics readable.

Provisional score after source-read pass: `78/100`.

Passing closure target: `90/100` after issue discovery, API stress tests,
performance proof, and browser proof are explicitly planned.

## Intent And Boundaries

Intent: make the canonical search-highlighting example teach the right Slate v2
authoring model for transient text overlays. The real complaint is not "search
needs a feature API"; it is that a normal author must currently understand
projection objects, runtime ids, scoped invalidation, hand-built keys, cross-leaf
splitting, and DOM input listeners before they can highlight text.

Desired outcome: search highlighting should be readable as React state plus a
generic text-range finder plus a range-decoration source. The low-level
projection source stays available, but examples should not make it look like the
default path for search, hashtags, markdown preview, code tokens, lint marks, or
diagnostics.

In scope:

- Add a generic `slate` text-range primitive for node trees.
- Add a `slate-react` range-decoration source helper over the existing
  projection substrate.
- Update examples that currently hand-build generic range-to-projection plumbing.
- Preserve the existing low-level decoration source API for external stores,
  custom invalidation, and metric-heavy integrations.
- Add unit, React runtime, browser, and benchmark proof rows for the later
  implementation pass.

Non-goals:

- No `editor.api.search`, `SearchApi`, search plugin, query UI abstraction, or
  opinionated product feature in raw Slate.
- No fixed issue claim for search/highlight issues until browser or benchmark
  proof matches the exact report.
- No replacement of `createDecorationSource` or `useSlateDecorationSource`.
- No claim that IME, Firefox selection, void/entity highlight, placeholder
  select-all, or replacement-like decoration text are solved by this API.
- No word-boundary, locale collation, fuzzy search, or ranking policy in core.
  Callers can use `RegExp` or a matcher callback for those.

Decision boundaries:

- This ralplan may decide the public API target, package ownership, naming
  convention, issue classifications, and implementation acceptance tests.
- This ralplan may reject product-shaped search APIs even if the example request
  mentions search.
- This ralplan must not edit `Plate repo root` implementation or examples.
- A later `ralph` implementation may adjust helper internals only if it keeps
  the same public intent and updates this plan when the public shape changes.

Unresolved user-decision points: none for planning. The user asked for harsh
architecture/DX review; the repo evidence is enough to proceed without asking a
new question.

Weakest assumption pressure test: if only `search-highlighting.tsx` needed this,
adding API would be overreach. It does not. The same range-to-decoration shape
shows up in search, hashtags, markdown preview, code highlighting, diagnostics,
and lint-like overlays. That makes a generic helper defensible; a raw search API
would still be wrong.

## Decision Brief

Principles:

- Slate core exposes generic document/range primitives, not product features.
- React helpers hide repetitive source lifecycle mechanics, not performance
  policy.
- Power APIs stay visible in advanced examples, but canonical examples teach the
  simple path first.
- Issue claims stay conservative until proof matches the exact browser,
  benchmark, or runtime report.

Top drivers:

- DX: canonical example code should fit in an app author's head.
- Runtime: helpers must preserve source-owned projection and bounded refresh
  behavior.
- Layering: `slate` owns text range discovery; `slate-react` owns render-time
  decoration source projection.

Viable options:

| Option                                                                 | Pros                                                                                                  | Cons                                                                                                                       | Decision                      |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| Keep only `useSlateDecorationSource` and rewrite examples locally      | No new API.                                                                                           | Repeats projection/key/scope boilerplate across examples and leaves the public DX bad.                                     | Reject.                       |
| Add `editor.api.search` or `useSlateSearchSource`                      | Very easy for search demos.                                                                           | Product-shaped, hard to generalize, wrong for raw Slate.                                                                   | Reject.                       |
| Overload `useSlateDecorationSource` with a range mode                  | Fewer exported names.                                                                                 | Worse TypeScript discoverability; `read` returning projections or ranges becomes ambiguous; power API gets magic branches. | Reject for the first tranche. |
| Add `createRangeDecorationSource` plus `useSlateRangeDecorationSource` | Clear typed layer over existing projection source; works for React hooks and non-hook creation/tests. | One more exported helper pair.                                                                                             | Choose.                       |
| Add `NodeApi.findTextRanges` only                                      | Solves path math.                                                                                     | Still leaves users to build projection objects, keys, refresh defaults, and source lifecycle.                              | Reject as incomplete.         |
| Teach `Editable.decorate` as the primary path                          | Familiar to Slate users.                                                                              | Re-centers legacy callback-array behavior and weakens the v2 source-owned projection story.                                | Reject as canonical path.     |

Chosen shape:

- `NodeApi.findTextRanges(root, query, options)` in `slate`.
- `useSlateDecorationSource(editor, options)` gets a React-only `deps` option
  so low-level source users do not need memoized option objects or DOM listener
  effects to refresh external data.
- `createRangeDecorationSource(editor, options)` in `slate-react`.
- `useSlateRangeDecorationSource(editor, options)` in `slate-react`.

Refinement from intent pass: drop `wholeWord` from the first-tranche
`NodeApi.findTextRanges` options. Word-boundary policy is search-product
behavior. Use `RegExp` or a matcher callback instead.

Consequences:

- `search-highlighting.tsx` gets the simple canonical path.
- `external-decoration-sources.tsx` remains the explicit low-level source demo.
- Low-level `useSlateDecorationSource` stays a power API but gets the same hook
  lifecycle ergonomics as the range helper.
- `code-highlighting.tsx` and `markdown-preview.tsx` can keep tokenizer logic
  while outsourcing generic range-source plumbing.
- Performance proof must show the helper does not broaden recompute or rerender
  behavior versus the current source-owned path.

Follow-ups:

- Issue-sync pass must update the PR reference wording after this accepted shape.

## Steelman Pass

Steelman status: `complete`.

### Decision 1: Add `NodeApi.findTextRanges`

Strongest fair objection: this is a search API wearing a fake mustache. Core
Slate should not grow case sensitivity, word boundaries, fuzzy matching, locale
rules, or query semantics just because an example is ugly.

Steelman antithesis: keep the search algorithm in the example, extract a local
`collectTextRanges` helper, and let users compose `NodeApi.texts`,
`NodeApi.string`, and `Range` themselves.

Tradeoff tension: core gets one more helper to specify forever. Edge cases get
expensive fast: block boundaries, inline boundaries, voids, marks splitting text
nodes, regex zero-length matches, and normalization policy.

Viable alternatives:

- Local example helper: least API risk, worst DX lesson.
- `TextApi.findRanges`: too narrow; it cannot span adjacent text siblings.
- `RangeApi.findText`: wrong owner; the root node owns traversal and path math.
- `EditorApi.search`: too product-shaped and contradicts the hard cut away from
  editor namespaces for non-editor utilities.

Why the chosen option wins: live source already puts tree traversal,
`NodeApi.texts`, and offset-oriented `NodeApi.string` under `NodeApi`. The
missing piece is not product search; it is converting matched text spans in a
node tree into valid Slate ranges. That is a generic node/range primitive.

Accepted revisions:

- Keep `NodeApi.findTextRanges`.
- Keep first-tranche options deliberately thin: `string | RegExp | matcher`,
  and `caseSensitive`.
- Keep `wholeWord`, locale collation, fuzzy search, ranking, and custom
  normalization out of core.
- Default behavior should search adjacent text siblings inside one text-flow
  parent and never cross block boundaries. Do not expose `across:
'text-siblings'` unless implementation proof shows a real author need.

Adoption answer: existing users can ignore it. New examples use it when they
need text ranges, while advanced apps still use `NodeApi.texts` directly.

Docs/example answer: search, hashtags, markdown preview, and diagnostics should
show `NodeApi.findTextRanges` only when they are matching text. Tokenizers like
Prism can still emit exact ranges directly.

Proof required: unit tests for same-leaf, adjacent-sibling, block-boundary,
regex, callback, empty-query, and zero-length-regex behavior.

Verdict: `keep`, with the thin-options revision.

### Decision 2: Add `createRangeDecorationSource` and `useSlateRangeDecorationSource`

Strongest fair objection: this is API bloat. `createDecorationSource` already
exists; another helper pair creates two paths to learn and another naming
surface to maintain.

Steelman antithesis: overload `useSlateDecorationSource` so `read` can return
either projections or ranges, or just document a small `ranges.map(...)`
snippet.

Tradeoff tension: a helper pair costs exports, docs, tests, and support. If the
helper hides too much, users may stop learning source dirtiness and refresh
semantics.

Viable alternatives:

- Overload `useSlateDecorationSource`: fewer names, worse TypeScript and worse
  mental model because `read` silently changes meaning.
- `useSlateDecorationRanges`: slightly shorter, but less aligned with
  `DecorationSource`.
- Local `rangesToDecorations`: helps examples but leaves lifecycle, keys,
  source id refresh, and hook deps scattered.

Why the chosen option wins: the existing low-level source remains the power API.
The helper pair is a typed convenience layer over the same projection source,
not a second runtime. It removes generic boilerplate without hiding the
important source knobs: `id`, `dirtiness`, `deps`, `runtimeScope`, `data`, and
manual `refresh`.

Accepted revisions:

- Factory signature must mirror the existing source factory:
  `createRangeDecorationSource(editor, options)`.
- Hook signature stays `useSlateRangeDecorationSource(editor, options)`.
- The helper should use `read` for consistency with `createDecorationSource`,
  but its `read` returns ranges or range entries, not projections.
- `source.refresh()` should default `sourceId` to its own `id`.
- `deps` belongs on the hook. It should refresh source data without recreating
  the source object.

Adoption answer: beginners get the range helper; advanced external stores and
metrics keep `createDecorationSource`.

Docs/example answer: `external-decoration-sources.tsx` remains the low-level
manual source example. `search-highlighting.tsx`, hashtag highlighting, and
simple diagnostics use the helper.

Proof required: type tests for range data generics, refresh default source id,
deps refresh without source recreation, manual runtime scope pass-through, and
existing `useSlateDecorationSource` behavior unchanged.

Verdict: `keep`, with the factory-signature correction.

### Decision 3: Do not infer `runtimeScope` automatically

Strongest fair objection: the plan says DX is too hard, but still leaves one of
the hardest performance knobs visible.

Steelman antithesis: the helper could inspect returned ranges, infer affected
runtime ids, and avoid full refreshes automatically.

Tradeoff tension: inferred scope can be wrong when a query change creates or
removes matches elsewhere, when a regex depends on surrounding text, or when
cross-leaf matches shift. A wrong optimization here is worse than visible
complexity because it produces stale highlights.

Why the chosen option wins: the helper should hide projection object shape and
key generation, not pretend it can know invalidation semantics for every text
matcher. The existing projection store already tracks changed runtime buckets
after recompute. First tranche should expose `runtimeScope` as an escape hatch
and require performance proof before adding smarter scope inference.

Accepted revisions:

- No automatic runtime-scope inference in the first tranche.
- Keep `runtimeScope` pass-through for advanced users.
- Simple examples omit `runtimeScope`; performance-sensitive docs show the
  external/ref variant and source metrics.

Proof required: benchmark or metrics row comparing recompute count and rerender
breadth against the current manual source path.

Verdict: `keep`.

### Decision 4: Canonical example uses React state, not a DOM input listener

Strongest fair objection: a controlled search input rerenders the example
component on every keystroke, which may make the simple example slower than the
current ref-plus-DOM-listener path.

Steelman antithesis: keep an uncontrolled input and call `source.refresh()` from
an event handler to avoid React renders.

Tradeoff tension: the current DOM listener is too alien for a React example,
but controlled state can become the wrong lesson for huge editors.

Why the chosen option wins: canonical examples should use normal React input
state unless measured proof says it is harmful. The editor instance and source
must stay stable; the helper's `deps` refresh should update source data without
recreating the source object. The plan already keeps an advanced ref/event
variant for perf-sensitive UI.

Accepted revisions:

- Canonical example uses `useState` and `onChange`.
- Advanced docs/example note can show the ref/event-handler variant, but not a
  `useEffect` DOM listener.
- Browser proof must verify query updates do not remount the editor or lose
  selection.

Verdict: `keep`.

### Steelman Summary

The helper direction survives, but only with hard limits:

- no raw search API
- no `wholeWord`
- no automatic runtime-scope inference
- no overload on `useSlateDecorationSource`
- no fixed issue claim without exact proof
- factory signature corrected to `createRangeDecorationSource(editor, options)`

Dropped choices from this pass: product search APIs, overload-only design,
first-tranche word-boundary option, and automatic scope inference.

## Absolute-Best DX Skepticism Pass

Status: `complete`.

Harsh answer: the public shape is still the right direction, but the previous
plan had one avoidable asymmetry. `deps` should not exist only on
`useSlateRangeDecorationSource`. The low-level hook is still public and still
used by advanced examples, so its React lifecycle should be equally explicit.

Accepted refinement:

- Add `deps?: readonly unknown[]` to
  `useSlateDecorationSource(editor, options)`.
- Keep `createDecorationSource(editor, options)` unchanged; factories are not
  React hooks and should not learn React dependency arrays.
- Make `useSlateRangeDecorationSource` use the same hook lifecycle contract,
  plus range-to-projection mapping.
- If `deps` is omitted, the implementation may preserve current
  options-identity refresh behavior for power users, but canonical examples
  must pass `deps` when external data drives the source.

Naming pressure:

| Candidate                 | Verdict | Reason                                                                                                                                                             |
| ------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `NodeApi.findTextRanges`  | keep    | Best call-site clarity. The plural `Ranges` makes all-match materialization visible, and `NodeApi` is the right owner because cross-leaf matches need a tree root. |
| `NodeApi.textRanges`      | reject  | Reads like "all ranges for every text node" unless the query argument is visible. Worse autocomplete.                                                              |
| `NodeApi.matchTextRanges` | reject  | Avoids `find`/first-match tension, but it is clunkier and less Slate-close than a direct "find text ranges" phrase.                                                |
| `NodeApi.findTextMatches` | reject  | Better for metadata, worse for the canonical decoration example because callers must map matches back to ranges.                                                   |
| `TextApi.findRanges`      | reject  | Too narrow; it cannot own cross-leaf path math.                                                                                                                    |

Return-shape pressure:

- Keep `Range[]` as the return type for `NodeApi.findTextRanges`.
- Do not return `{ range, text, match }[]` in the first tranche. That is useful
  for product search, but the generic core need is "give me Slate ranges."
- The matcher callback should return offset spans, not decoration data. Per-range
  `data` belongs to `createRangeDecorationSource` / caller mapping, not core
  `NodeApi`.
- Tokenizers like Prism should emit range entries directly into
  `createRangeDecorationSource`; `NodeApi.findTextRanges` is for text matching,
  not syntax token identity.

Hook lifecycle pressure:

- Current live `useSlateDecorationSource` refreshes on `options` identity. That
  is acceptable as a fallback, but it is not the best teaching shape for
  app-owned query state.
- Adding `deps` to the low-level hook fixes the root DX issue once, then the
  range hook can mirror it instead of inventing special lifecycle behavior.
- This also keeps `external-decoration-sources.tsx` honest: power users learn
  the same hook dependency model as the canonical range examples.

No-change defenses:

- Keep a separate range helper instead of overloading `useSlateDecorationSource`;
  overloads make `read` return type ambiguous and hurt TypeScript
  discoverability.
- Keep `NodeApi.findTextRanges` in raw `slate`, not `slate-react`; path math is
  not a React concern.
- Keep `editor.api.search` rejected; Plate can own product search UI and policy.

Plan delta:

- Public API target now includes `deps` on `useSlateDecorationSource`.
- Type-surface polish pass refined that hook option from React's
  `DependencyList` alias to Slate v2's existing `readonly unknown[]` selector
  convention, matching
  `packages/slate-react/src/hooks/use-editor-selector.tsx`.
- PR reference section `6.3 React Decoration Source Hook` must mention that the
  low-level hook and range hook share the explicit dependency-refresh contract.
- Closure score needs a recheck because a public hook option changed.

## Current Source Evidence

- `apps/www/src/app/(app)/examples/slate/_examples/search-highlighting.tsx:46` creates a
  `useSlateDecorationSource` directly.
- `apps/www/src/app/(app)/examples/slate/_examples/search-highlighting.tsx:49` asks the app to
  return projections from a snapshot.
- `apps/www/src/app/(app)/examples/slate/_examples/search-highlighting.tsx:51` asks the app to
  compute `runtimeScope`.
- `apps/www/src/app/(app)/examples/slate/_examples/search-highlighting.tsx:54` wires a DOM
  `input` listener in `useEffect` instead of using normal React input code.
- `apps/www/src/app/(app)/examples/slate/_examples/search-highlighting.tsx:63` repeats
  `sourceId: 'search-highlighting'` even though the source already has that id.
- `apps/www/src/app/(app)/examples/slate/_examples/search-highlighting.tsx:133` to `201` hand
  rolls cross-leaf text-search projection splitting.
- `apps/www/src/app/(app)/examples/slate/_examples/search-highlighting.tsx:204` to `230` hand
  rolls runtime-id collection for every text node.

This is not just verbose. It teaches the wrong default. A user trying to build
search highlighting should learn:

```tsx
query -> text ranges -> decoration source -> render highlighted segment
```

The example currently teaches:

```tsx
query ref -> projection object builder -> path math -> key policy ->
runtime ids -> imperative input listener -> force refresh -> segment slices
```

That is framework internals cosplay.

## Current API Shape

`createDecorationSource` is intentionally low-level:

- `packages/slate-react/src/decoration-source.ts:19` requires
  `read(context) => SlateDecoration[]`.
- `packages/slate-react/src/decoration-source.ts:111` wraps the
  read callback into `createSlateProjectionStore`.
- `packages/slate-react/src/projection-store.ts:52` exposes
  `runtimeScope` as raw runtime ids or a function.
- `packages/slate-react/src/projection-store.ts:343` to `390`
  proves recompute is source-driven and scoped by dirtiness/runtime scope.

That is a good substrate. It is a bad beginner API.

`useSlateDecorationSource` also has a footgun:

- `packages/slate-react/src/hooks/use-slate-decoration-source.ts:43`
  refreshes on `options` identity.

Inline options in examples are common. If this stays, the hook should either
accept explicit `deps` or document that callers must memoize options when parent
rerenders matter. For search, a helper can own this instead.

## Ecosystem Pressure

### ProseMirror

Evidence:

- `docs/research/sources/editor-architecture/prosemirror-mapped-overlays-and-bookmarks.md:27`
  describes `DecorationSource` / `DecorationSet` as persistent mapped overlay
  data.
- `docs/research/sources/editor-architecture/prosemirror-mapped-overlays-and-bookmarks.md:29`
  calls `forChild(...)` the scaling trick.
- `docs/research/sources/editor-architecture/prosemirror-mapped-overlays-and-bookmarks.md:83`
  says Slate should keep mapped/child-scoped overlay discipline and avoid one
  callback-array public shape.

Take: Slate should keep projection stores, but normal authors should not be
forced to manually build projection stores for text-range overlays.

### Lexical

Evidence:

- `docs/research/sources/editor-architecture/lexical-mark-store-and-decorator-split.md:31`
  records explicit subscription helpers for render-facing state.
- `docs/research/sources/editor-architecture/lexical-mark-store-and-decorator-split.md:33`
  records dirty leaf / dirty element reconciliation.
- `docs/research/sources/editor-architecture/lexical-mark-store-and-decorator-split.md:83`
  says Slate should prefer store/subscription surfaces over array replacement.

Take: Slate should not make React effects and full-array replacement feel like
the only serious route. The helper must still leave the power API available for
external stores.

### Tiptap

Evidence:

- `docs/research/sources/editor-architecture/tiptap-extension-command-react-dx.md:27`
  records centralized extension/editor setup.
- `docs/research/sources/editor-architecture/tiptap-extension-command-react-dx.md:45`
  says feature packaging should feel like define extension, add extension, get
  methods/handlers/UI outputs.
- `docs/research/sources/editor-architecture/tiptap-extension-command-react-dx.md:82`
  calls out composable UI as good product DX.

Take: Tiptap is not the engine model here; it is the DX warning. If a Slate
example needs 90 lines of projection plumbing for search highlighting, Tiptap
wins the adoption story by default.

## Ecosystem Strategy Synthesis

| System      | Source                                                                                                        | Mechanism                                                                                        | Avoids                                                                        | Steal                                                                                                                                   | Reject                                                                           | Slate target                                                                                                                   | Verdict   |
| ----------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | --------- |
| ProseMirror | `docs/research/sources/editor-architecture/prosemirror-mapped-overlays-and-bookmarks.md`                      | Persistent mapped overlay data plus child-scoped `forChild(...)` propagation.                    | Whole-tree callback-array decoration churn.                                   | Keep source-owned overlay data and child/runtime-scoped projection delivery.                                                            | ProseMirror plugin/view ceremony and integer-position model as raw Slate DX.     | Range helper over projection sources, with benchmark proof for bounded source reads and runtime bucket changes.                | `agree`   |
| Lexical     | `docs/research/sources/editor-architecture/lexical-mark-store-and-decorator-split.md`                         | Dirty leaf/element reconcile plus explicit subscription helpers and separate decorator lane.     | Generic context churn and mixed metadata/render ownership.                    | Keep selector/subscription posture and separate text overlay, node UI, annotation, and widget lanes.                                    | Lexical class node model and full custom DOM reconciler as Slate's public model. | Range helper must feed the existing projection store and preserve runtime-id subscriptions.                                    | `partial` |
| Tiptap      | `docs/research/sources/editor-architecture/tiptap-extension-command-react-dx.md`                              | Productized extension packaging and React selector guidance over ProseMirror.                    | Raw engine primitives leaking into every app example.                         | Better example ergonomics and product-grade composition expectations.                                                                   | Product search API, command-chain ceremony, or ProseMirror leakage in raw Slate. | Raw Slate gets generic range/source helpers; Plate can package search UI later.                                                | `partial` |
| React 19.2  | `docs/research/sources/editor-architecture/react-19-2-external-store-and-background-ui.md`; `react-useeffect` | External-store subscriptions, deferred/transitioned derived UI, event-handler-first effects law. | Input lag from expensive derived renders and effect-driven interaction logic. | Use event handlers for query changes, optional `useDeferredValue` for large search UI, and React Performance Tracks for render breadth. | Treating React scheduling as a replacement for editor invalidation.              | Canonical example uses React state and no DOM listener effect; large/stress guidance may defer query-driven highlight updates. | `agree`   |

## Chosen API Target

Add two primitives.

### 1. `NodeApi.findTextRanges`

Package: `slate`

Purpose: turn text search/match logic into Slate ranges without exposing path
math in examples.

Target shape:

```ts
const ranges = NodeApi.findTextRanges({ children: snapshot.children }, query, {
  caseSensitive: false,
});
```

Required behavior:

- returns `Range[]`, not a generator, because decoration sources need all ranges
  to build projections and example DX matters here
- handles matches across adjacent text leaves inside the same text-flow parent
- supports `string | RegExp | ((text, entry) => Iterable<TextMatch>)`
- never returns zero-length ranges
- skips empty query
- keeps block boundaries explicit
- leaves word-boundary and locale policy to `RegExp` or matcher callbacks
- keeps lazy traversal APIs on `NodeApi.texts` / `NodeApi.nodes`; this helper is
  a materializing matcher, not the replacement for all tree queries
- lives in `slate`, not `slate-react`

Rejected names:

- `TextApi.findRanges`: too narrow; cross-leaf matching needs a node root.
- `EditorApi.search`: too product-shaped.
- `SearchApi`: too special-case for a generic editor core.

### 2. `createRangeDecorationSource` and `useSlateRangeDecorationSource`

Package: `slate-react`

Purpose: turn ranges into decoration projections with stable keys and source
lifecycle defaults.

Target shape:

```ts
const searchSource = useSlateRangeDecorationSource(editor, {
  id: "search",
  data: { highlight: true },
  deps: [query],
  dirtiness: ["text", "external"],
  read: ({ snapshot }) =>
    NodeApi.findTextRanges({ children: snapshot.children }, query, {
      caseSensitive: false,
    }),
});
```

Required behavior:

- accepts `Range[]` or `{ range, data?, key? }[]`
- auto-generates stable keys when the caller omits `key`
- generated keys are deterministic from source id, range geometry, and match
  index; callers that need durable identity across structural moves provide
  their own keys
- supports static `data` or per-range `data(range, index)`
- defaults `source.refresh()` to its own `sourceId`
- supports explicit `deps` so the hook refreshes from dependencies, not raw
  options identity
- leaves `runtimeScope` available but removes it from simple examples
- preserves `createDecorationSource` for advanced external data and metrics

Rejected alternatives:

- Replace `useSlateDecorationSource`: unnecessary. The low-level API is real.
- Teach `Editable.decorate` as the main scalable path: too close to legacy
  global callback semantics.
- Add `useSlateSearchSource`: too product-specific for raw Slate.

### 3. `deps` on `useSlateDecorationSource`

Package: `slate-react`

Purpose: make React-owned source refresh explicit for both the low-level hook
and the range helper.

Target shape:

```ts
const source = useSlateDecorationSource(editor, {
  id: "external",
  deps: [query],
  dirtiness: ["text", "external"],
  read: ({ snapshot }) => readExternalDecorations(snapshot, query),
});
```

Required behavior:

- `deps` is a hook-only option; it does not belong to
  `createDecorationSource`.
- Public type spelling is `deps?: readonly unknown[]`, matching the existing
  `useEditorSelector` options surface instead of exposing React's
  `DependencyList` alias in Slate docs.
- Changing `deps` refreshes source data without recreating the source object.
- Changing structural source options such as `id`, `dirtiness`, or
  `runtimeScope` may recreate the source when needed.
- Omitted `deps` may preserve current options-identity refresh behavior, but
  canonical examples should pass `deps` for external state.
- `useSlateRangeDecorationSource` must share this lifecycle model rather than
  inventing a second hook contract.

## Before / After

Current canonical shape:

```tsx
const searchInputRef = useRef<HTMLInputElement | null>(null);
const searchRef = useRef("");
const searchSource = useSlateDecorationSource<{ highlight: true }>(editor, {
  id: "search-highlighting",
  dirtiness: ["text", "external"],
  read: ({ snapshot }) =>
    collectSearchProjections(snapshot.children, searchRef.current),
  runtimeScope: ({ snapshot }) => collectTextRuntimeScope(snapshot),
});

useEffect(() => {
  const input = searchInputRef.current;
  if (!input) return;

  const handleSearchInput = () => {
    searchRef.current = input.value;
    searchSource.refresh({
      forceInvalidate: true,
      reason: "external",
      sourceId: "search-highlighting",
    });
  };

  input.addEventListener("input", handleSearchInput);
  return () => input.removeEventListener("input", handleSearchInput);
}, [searchSource]);
```

Target canonical shape:

```tsx
const [query, setQuery] = useState("");
const searchSource = useSlateRangeDecorationSource(editor, {
  id: "search",
  data: { highlight: true },
  deps: [query],
  dirtiness: ["text", "external"],
  read: ({ snapshot }) =>
    NodeApi.findTextRanges({ children: snapshot.children }, query, {
      caseSensitive: false,
    }),
});

return (
  <>
    <input
      onChange={(event) => setQuery(event.currentTarget.value)}
      type="search"
      value={query}
    />
    <Slate decorationSources={[searchSource]} editor={editor}>
      <Editable
        renderSegment={(segment, children) =>
          segment.slices.some((slice) => slice.data?.highlight) ? (
            <mark>{children}</mark>
          ) : (
            children
          )
        }
      />
    </Slate>
  </>
);
```

Advanced external-state shape stays possible without `useEffect` DOM listener
ceremony:

```tsx
const queryRef = useRef('')
const searchSource = useSlateRangeDecorationSource(editor, {
  id: 'search',
  data: { highlight: true },
  dirtiness: ['text', 'external'],
  read: ({ snapshot }) =>
    NodeApi.findTextRanges({ children: snapshot.children }, queryRef.current),
})

<input
  onInput={(event) => {
    queryRef.current = event.currentTarget.value
    searchSource.refresh({ forceInvalidate: true, reason: 'external' })
  }}
  type="search"
/>
```

## Example Cleanup Target

After the helper lands:

- `search-highlighting.tsx`: use `NodeApi.findTextRanges` plus
  `useSlateRangeDecorationSource`.
- `highlighted-text.tsx`: use `useSlateRangeDecorationSource` for hashtag
  ranges.
- `markdown-preview.tsx`: keep tokenizer code, but use the range-decoration
  helper so it does not hand-build `SlateProjection`.
- `code-highlighting.tsx`: keep Prism/token normalization, but do not hand-roll
  generic source lifecycle or runtime scope in the example body.
- `external-decoration-sources.tsx`: keep the low-level API example. That is the
  one place where `createDecorationSource` / manual refresh should be visible.

## Architecture North Star And Migration Backbone

Source-backed north star:

- Core `slate` owns document traversal, point/range construction, and
  unopinionated node utilities.
- `slate-react` owns render-time projection, external-store subscriptions, and
  source lifecycle helpers.
- Examples should show the shortest honest app-author path first, then leave
  power APIs in advanced examples.

Internal runtime target:

- `createRangeDecorationSource` must build on the existing
  `createDecorationSource` / projection-store substrate.
- It must not add a second decoration runtime.
- It must not convert source-owned overlays back into an `Editable.decorate`
  callback-array mental model.
- It must preserve `dirtiness`, `runtimeScope`, metrics, and manual refresh for
  advanced callers.

Hook/render DX target:

- Canonical examples use React state/event handlers for app-owned query state.
- The hook owns source stability and dependency refresh.
- Render code stays at `renderSegment`; examples do not expose projection
  object construction, source ids, or runtime-id collection.

Plate migration-backbone target:

- Plate can wrap these generic helpers into a product search/highlight plugin
  later without raw Slate growing `editor.api.search`.
- Plate can keep plugin-level query state, UI options, colors, ranking,
  whole-word policy, and search commands outside raw Slate.
- The raw helper is still useful to Plate because it gives stable range-to-source
  plumbing instead of copying projection code into each plugin.

slate-yjs migration-backbone target:

- This plan does not change operations, snapshots, commits, selection rebase, or
  collaboration metadata.
- Decoration sources remain local render state. They do not become persisted
  document state and should not create sync traffic.
- Cross-leaf text matching must be deterministic from the current snapshot so a
  collab-aware app can recompute locally after remote edits.

## Performance, DX, And Research Synthesis

Performance synthesis status: `complete`.

Accepted API refinements:

- `NodeApi.findTextRanges` returns `Range[]`, not a generator.
- Remove `across: 'text-siblings'` from the first-tranche public options.
  Sibling text-flow matching is the default; block/element boundaries stop the
  match.
- Keep `caseSensitive` plus `RegExp` / matcher callback. Do not add `wholeWord`
  or locale policy.
- Add React-only `deps` to `useSlateDecorationSource` so the low-level hook and
  range hook share one explicit refresh model.
- `createRangeDecorationSource(editor, options)` mirrors
  `createDecorationSource(editor, options)`.
- `useSlateRangeDecorationSource(editor, options)` owns `deps` refresh without
  source recreation.

Why array return beats generator here:

- Existing traversal APIs like `NodeApi.texts` stay lazy for arbitrary tree
  queries.
- Decoration projection needs the complete result set anyway.
- `Range[]` keeps example code readable and avoids making app authors learn
  generator materialization before they can highlight text.
- If benchmark proof later shows range-array allocation is hot, add a separate
  lazy matcher. Do not make the canonical helper harder before proof.

Performance model:

- `NodeApi.findTextRanges`: `O(textLength + matchCount)` per searched text-flow
  parent; memory `O(matchCount)`.
- `createRangeDecorationSource`: adds one `O(matchCount)` projection mapping
  pass; it must not add a second tree traversal.
- Query changes are external refreshes and may be full-source recomputes; do not
  hide that cost.
- Text edits use the existing projection-store dirtiness and runtime-bucket
  metrics.

Required performance proof:

| Proof                       | Required evidence                                                                                                                                                                                                                                                                             |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Manual source parity        | Compare current manual `useSlateDecorationSource` search source with the helper source on the same document and query. `sourceReadCount`, `recomputeCount`, `fullFallbackCount`, `changedRuntimeBucketCount`, `runtimeSubscriberWakeCount`, and `globalSubscriberWakeCount` must not regress. |
| Render breadth              | Existing `benchmarks/slate-v2/donor/browser/react/rerender-breadth.tsx` records projection metrics and decoration-source toggle breadth; add a search/range-source lane beside `decorationSourceToggleBreadth`.                                                                        |
| Large overlay lane          | `benchmarks/slate-v2/donor/browser/react/huge-document-overlays.tsx` records decoration-source metrics; add range-source mode or reuse it if implementation can parameterize source creation.                                                                                          |
| Runtime-scope no-regression | Existing projection tests prove scoped recompute can skip missed runtime ids. Helper tests must prove manual `runtimeScope` pass-through keeps that behavior.                                                                                                                                 |
| Browser interaction         | `/examples/search-highlighting`: query typing, editor typing inside a highlight, select highlighted text, select-all, copy, paste, and follow-up typing.                                                                                                                                      |

Performance cohorts:

| Cohort       | Document                                         | Decoration pressure                                                     | Required claim                                                                                                               |
| ------------ | ------------------------------------------------ | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| normal       | 0-500 blocks                                     | search/hashtag/simple diagnostics                                       | Helper must be simpler with no measurable interaction regression.                                                            |
| medium       | 500-2000 blocks                                  | moderate matches                                                        | Event-to-paint and rerender breadth must stay within current manual-source path.                                             |
| large        | 2000-10000 blocks                                | many matches, mixed marks                                               | Must record projection metrics and DOM/render breadth. Optional `useDeferredValue` for query-driven highlighting is allowed. |
| stress       | 10000-50000 blocks                               | dense matches                                                           | No release-quality speed claim without benchmark output and memory/DOM tags.                                                 |
| pathological | tables, voids, IME, mobile, overlapping metadata | Related only; exact browser/device proof required before issue closure. |

Repeated-unit budget:

- repeated unit: runtime text node / projected slice
- per-unit DOM nodes: no additional wrappers beyond existing segment splitting
  and render output
- per-unit effects: `0`
- per-unit global listeners: `0`
- per-unit subscriptions: existing runtime-id projection subscriptions only
- per-interaction allocations: proportional to matches plus changed projection
  buckets, not document-size React rerenders
- degradation contract: none for normal/medium/large; stress claims may use
  deferred query highlights but must preserve native selection, copy, paste,
  browser find, IME, and follow-up typing before being called complete

React/DX decisions:

- Canonical search example uses `useState` and `onChange`.
- It does not use a DOM `input` listener in `useEffect`; query changes are a
  user event, not external synchronization.
- For large/stress docs, implementation may use `useDeferredValue(query)` for
  the source `deps`, with visible input staying urgent and highlight projection
  allowed to lag.
- The editor instance and source object must stay stable while query changes.
- Do not use `Activity`, server APIs, or page-load Core Web Vitals as proof for
  editor overlay performance. React Performance Tracks are useful only for
  render breadth evidence.

Applicable implementation-review matrix:

| Lens                          | Applicability | Findings                                                                                                                                                                                                                                                               | Plan delta                                                                                                                          |
| ----------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `vercel-react-best-practices` | applied       | `rerender-move-effect-to-event`, `rerender-dependencies`, `rerender-use-deferred-value`, `rerender-use-ref-transient-values`, `client-event-listeners`, `js-early-exit`, `js-hoist-regexp`, `js-combine-iterations`, and `js-index-maps` are the relevant micro-rules. | Remove DOM listener effect from canonical example; keep event-handler/ref variant only for perf-sensitive docs; add benchmark rows. |
| `performance-oracle`          | applied       | Complexity must stay `O(textLength + matchCount)`; no nested per-match tree scans or repeated full string joins per match.                                                                                                                                             | Require unit tests and benchmark metrics for large match sets.                                                                      |
| `performance`                 | applied       | Cohorts, repeated-unit budget, interaction matrix, memory tags, and native-behavior rows are required before any perf claim.                                                                                                                                           | Added cohort and budget tables.                                                                                                     |
| `tdd`                         | applied       | Tests must prove public behavior through `NodeApi`, source factory/hook, examples, and browser routes.                                                                                                                                                                 | Keep vertical slices: core range finder first, factory second, hook third, example/browser last.                                    |
| `react-useeffect`             | applied       | Current DOM listener effect is the wrong default because it handles a user input event.                                                                                                                                                                                | Canonical example uses `onChange`; no effect for input.                                                                             |
| `build-web-apps:shadcn`       | skipped       | These are raw Slate examples, not a shadcn component surface.                                                                                                                                                                                                          | No UI kit import or component rewrite.                                                                                              |

PR and issue sync status: `complete`.

- Updated `docs/slate-v2/references/pr-description.md` section
  `6.3 React Decoration Source Hook` with the accepted range-source helper
  shape.
- Added `#4076` to `docs/slate-v2/ledgers/issue-coverage-matrix.md` as
  `Not claimed`.
- Fixed issue lists stay unchanged.
- Manual v2 sync ledger stays unchanged because the existing `#4076`
  `issue-reviewed` row already says docs/example behavior only.
- Fork dossier stays unchanged because no exact issue classification changed.

## Related Issue Accounting

No fixed issue claim from this planning pass.

Related issue discovery pass: `complete`.

Issue-ledger pass: `complete`.

ClawSweeper status: `already covered by completed pass`. Existing generated
and manual ledgers already classify the decoration/projection surface, so this
pass did not run live GitHub and did not write new dossier sections.

Generated live rows read from
`docs/slate-issues/gitcrawl-live-open-ledger.md`:

- `#5987`: async decorate callback caret jump, live cluster `10`.
- `#4483`: flexible/performant dynamic decorations.
- `#4392`: cross-node decorate.
- `#3309`: decorated text cannot be selected.
- `#3162`: decorate with IME input.
- `#3383`: overlapping marks/decorations with same semantic meaning but
  different metadata.
- `#3382`: `Text.decorations` assumes ranges are for the current node.
- `#3352`: cannot decorate siblings in decorator callback.
- `#4712`: decoration range with `text` field interferes with selection.
- `#4581`: Firefox deletion of void/text decoration then typing.
- `#4076`: search-highlighting example color and case-sensitivity feature
  request.
- `#5411`, `#4221`: same keyword noise for highlight/selection, but owned by
  DOM bridge or placeholder selection proof, not search-range DX.

Manual v2 sync rows read from
`docs/slate-issues/gitcrawl-v2-sync-ledger.md`:

- `#5987`: `improves-claimed`; projection store reduces async
  decoration/caret pressure, exact async app repro not auto-closed.
- `#4483`: `improves-claimed`; projection stores/local subscriptions address
  dynamic decoration rerender pressure, exact legacy API proposal not closed.
- `#4392`: `improves-claimed`; cross-node projection represented by runtime
  range projection, no legacy decorate parity claim.
- `#3382`: `improves-claimed`; runtime text slices survive structural moves,
  no legacy `Text.decorations` API closure.
- `#3352`: `improves-claimed`; sibling/cross-node pressure represented by
  range-to-text-slice projection, no callback parity claim.
- `#3383`: `cluster-synced`; related metadata/overlap pressure, but not a
  direct search-range helper closure.
- `#3309`: `cluster-synced`; exact Firefox decorated-selection closure still
  needs browser proof.
- `#3162`, `#4712`, `#4581`: related/future proof pressure; browser, IME, or
  DOM-selection closure needs matching proof.
- `#4076`: `issue-reviewed`; docs/example behavior only. This plan may improve
  the example DX, but should not turn example color/case options into a core
  search API.
- `#5411`, `#4221`: `cluster-synced`; reviewed as same-keyword noise and left
  under their existing DOM/selection ownership.

Coverage matrix rows read from
`docs/slate-v2/ledgers/issue-coverage-matrix.md`:

| Issue   | Cluster                                     | Claim            | Discovery decision                                                                                                                |
| ------- | ------------------------------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `#4483` | `react-decoration-subscription-performance` | `Improves`       | Keep. The range-source helper makes the API easier but does not benchmark-fix the original perf report.                           |
| `#5987` | `react-decoration-and-selection-stability`  | `Improves`       | Keep. No exact async app/browser closure from a planning/API helper.                                                              |
| `#4392` | `decoration-cross-node-and-void-access`     | `Improves`       | Keep. `NodeApi.findTextRanges` strengthens the public authoring story for cross-leaf search, but no legacy decorate parity claim. |
| `#3382` | `react-decoration-and-selection-stability`  | `Improves`       | Keep. Helper should preserve runtime projection behavior, not resurrect legacy `Text.decorations`.                                |
| `#3352` | `react-decoration-and-selection-stability`  | `Improves`       | Keep. Helper can expose sibling-spanning ranges cleanly; exact callback parity stays rejected.                                    |
| `#3383` | `singleton-react-runtime`                   | `Related`        | Keep as related API pressure. Per-range `data` helps authoring, but overlap merge semantics are a separate contract.              |
| `#3309` | `singleton-react-runtime`                   | `Related`        | Keep. Needs decorated-selection browser proof.                                                                                    |
| `#3162` | matrix-only future proof                    | `Related/future` | Keep. Needs IME/browser/device proof.                                                                                             |
| `#4712` | matrix-only future proof                    | `Related/future` | Keep. Replacement-like decoration text remains out of scope.                                                                      |
| `#4581` | `singleton-dom-selection`                   | `Related`        | Keep. Needs Firefox DOM selection proof.                                                                                          |
| `#4076` | `docs-example-and-support-noise`            | `Not claimed`    | Keep as docs/example review. This plan can make the example readable, but raw Slate should not grow `editor.search`.              |
| `#5101` | `decoration-example-expectation-mismatch`   | `Not claimed`    | Frozen historical keyword match only; current contract says docs-only and not a direct red-test target.                           |
| `#5411` | `void-selection-fix-regressions`            | `Related`        | Same highlight keyword, different problem: void/entity DOM selection proof.                                                       |
| `#4221` | `placeholder-and-empty-editor-selection`    | `Related`        | Same highlight keyword, different problem: Firefox placeholder select-all behavior.                                               |

Full issue matrix for this plan:

| Issue   | Cluster                                     | Claim                            | Why                                                                                                                              | Proof route                                                   | V2 sync ledger                      | PR line                                                                            |
| ------- | ------------------------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------- |
| `#4483` | `react-decoration-subscription-performance` | `Improves`, after implementation | Range sources make the scalable decoration path canonical, but the original performance report still needs benchmark proof.      | React projection tests plus `rerender-breadth` benchmark.     | No change; keep `improves-claimed`. | Related matrix only: keep `Improves #4483`; do not auto-close.                     |
| `#5987` | `react-decoration-and-selection-stability`  | `Improves`, after implementation | Source-owned decorations reduce async decorate/caret pressure; this helper does not prove the exact async app repro.             | React projection/caret tests plus browser selection proof.    | No change; keep `improves-claimed`. | Related matrix only: keep `Improves #5987`; do not auto-close.                     |
| `#4392` | `decoration-cross-node-and-void-access`     | `Improves`, after implementation | `NodeApi.findTextRanges` covers cross-leaf text ranges without reviving legacy decorate callback parity.                         | `slate` range unit tests plus `slate-react` projection tests. | No change; keep `improves-claimed`. | Related matrix only: keep `Improves #4392`; do not auto-close.                     |
| `#3382` | `react-decoration-and-selection-stability`  | `Improves`, after implementation | Range-source projection avoids exposing per-leaf `Text.decorations` assumptions in public examples.                              | Projection-slice tests and structural move tests.             | No change; keep `improves-claimed`. | Related matrix only: keep `Improves #3382`; do not auto-close.                     |
| `#3352` | `react-decoration-and-selection-stability`  | `Improves`, after implementation | Sibling-spanning ranges become a normal helper path instead of callback plumbing.                                                | Cross-sibling range tests and projection tests.               | No change; keep `improves-claimed`. | Related matrix only: keep `Improves #3352`; do not auto-close.                     |
| `#3383` | `singleton-react-runtime`                   | `Related`                        | Per-range `data` helps metadata authoring, but overlapping decoration merge precedence is not solved here.                       | No-claim row; future overlap/merge contract tests.            | No change; keep `cluster-synced`.   | Related matrix only.                                                               |
| `#3309` | `singleton-react-runtime`                   | `Related`                        | Decorated text selection remains a browser behavior claim, not an API-DX claim.                                                  | Firefox/browser decorated-selection proof.                    | No change; keep `cluster-synced`.   | Related matrix only.                                                               |
| `#3162` | matrix-only future proof                    | `Related/future`                 | IME decoration behavior needs composition/browser proof.                                                                         | IME/browser proof.                                            | No change; keep `cluster-synced`.   | Related matrix only.                                                               |
| `#4712` | matrix-only future proof                    | `Related/future`                 | Replacement-like decoration text is explicitly out of this helper.                                                               | No-claim row; separate input/selection proof if pursued.      | No change; keep `cluster-synced`.   | Related matrix only.                                                               |
| `#4581` | `singleton-dom-selection`                   | `Related`                        | Firefox void/decorated deletion belongs to DOM selection repair.                                                                 | Firefox browser proof.                                        | No change; keep `cluster-synced`.   | Related matrix only.                                                               |
| `#4076` | `docs-example-and-support-noise`            | `Not claimed`                    | Search-highlighting example options are reviewed, but raw Slate should expose generic range helpers, not product search options. | Docs/example proof only.                                      | No change; keep `issue-reviewed`.   | Added `Not claimed #4076` row in `docs/slate-v2/ledgers/issue-coverage-matrix.md`. |
| `#5101` | `decoration-example-expectation-mismatch`   | `Not claimed`                    | Historical docs-only keyword match; current contract says not a direct red-test target.                                          | No-claim row.                                                 | No current live-row change.         | Related matrix only if mentioned.                                                  |
| `#5411` | `void-selection-fix-regressions`            | `Related`                        | Same highlight keyword, but it is a void/entity selection bug.                                                                   | DOM bridge/browser proof, separate from this helper.          | No change; keep `cluster-synced`.   | Related matrix only.                                                               |
| `#4221` | `placeholder-and-empty-editor-selection`    | `Related`                        | Same highlight keyword, but it is Firefox placeholder selection behavior.                                                        | Firefox browser proof, separate from this helper.             | No change; keep `cluster-synced`.   | Related matrix only.                                                               |

Issue-ledger conclusion:

- Fixed issues: none.
- Materially improved after implementation: `#4483`, `#5987`, `#4392`,
  `#3382`, `#3352`.
- Related but not fixed: `#3383`, `#3309`, `#3162`, `#4712`, `#4581`,
  `#5411`, `#4221`.
- Not claimed after keyword review: `#4076`, `#5101`.
- Manual sync ledger writes: deferred. Existing rows already contain the
  correct conservative statuses for this planning pass.
- Fork dossier writes: deferred. No claim changed and no new exact issue thread
  evidence was needed.
- PR reference writes: complete. Section `6.3 React Decoration Source Hook`
  includes the range-source helper and explicitly keeps `#4076` as
  example/docs, not a core search feature.

Test candidate rows read:

- `docs/slate-issues/test-candidate-map/5994-5918.md` keeps `#5987` as a
  ready async decorate/caret red-test surface.
- `docs/slate-issues/test-candidate-map/4541-4392.md` keeps `#4483` as a
  benchmark lane and `#4392` as API-shape pressure.
- `docs/slate-issues/test-candidate-map/3433-3317.md` keeps `#3382` as a
  ready decoration-range red-test surface while `#3383` and `#3352` stay
  architecture/API pressure.
- `docs/slate-issues/test-candidate-map/4160-4074.md` keeps `#4076` as
  `site/examples` and `not-a-test-candidate`.
- `docs/slate-issues/test-candidate-map/5129-5066.md` keeps `#5101` as
  docs-only and not a direct red-test target.
- `docs/slate-issues/test-candidate-map/5479-5403.md` keeps `#5411` as a
  void-highlight regression surface outside this API helper.
- `docs/slate-issues/test-candidate-map/4268-4162.md` keeps `#4221` as a
  Firefox placeholder-selection surface outside this API helper.

`docs/slate-v2/references/pr-description.md` status:
`updated`. Section `6.3 React Decoration Source Hook` now records
`NodeApi.findTextRanges`, `createRangeDecorationSource(editor, options)`, and
`useSlateRangeDecorationSource(editor, options)`, while preserving
`createDecorationSource` / `useSlateDecorationSource` as power APIs.

Related existing pressure:

- `#4483`: dynamic decorations perf. Current rows already say projection stores
  improve this, but the exact legacy API proposal is not closed.
- `#5987`: async decoration/caret instability. Current rows already say
  projection-owned decoration state improves this, but no exact async app
  closure.
- `#4392`, `#3382`, `#3352`: cross-node and sibling decoration pressure. The
  proposed `NodeApi.findTextRanges` makes the public example story match the
  projection capability.
- `#3309`, `#3162`, `#4712`, `#4581`: decorated selection, IME, replacement-like
  decoration text, and Firefox decorated/void selection remain browser/input
  proof work, not API-DX closure.
- `#4076` and `#5101`: search-highlight keyword pressure stays docs/example
  scope. This is evidence against adding a raw `SearchApi`.

Ledger action: complete for this planning lane. Fixed issue claims remain
unchanged; `#4076` is recorded only as `Not claimed`.

## Test Plan For Ralph Execution

Unit tests in `slate`:

- `NodeApi.findTextRanges` finds simple matches in one text node.
- It finds matches spanning adjacent text siblings.
- It does not cross block or element boundaries.
- It handles case sensitivity and regex/matcher options.
- It returns no zero-length ranges.
- It works against `{ children }` snapshot roots, not only live editors.

React tests in `slate-react`:

- `useSlateRangeDecorationSource` maps `Range[]` to stable projected slices.
- Data generic flows into `renderSegment`.
- `source.refresh()` uses the source id by default.
- `deps` on `useSlateDecorationSource` refreshes source data without recreating
  the source object.
- `useSlateRangeDecorationSource` shares the same `deps` lifecycle contract.
- Manual `runtimeScope` remains accepted for advanced callers.
- Existing `useSlateDecorationSource` tests stay green.

Browser tests:

- `/examples/search-highlighting` highlights query matches.
- Query changes update highlights without remounting the editor.
- Selecting decorated text still works.
- Typing inside highlighted text does not lose the caret.
- IME remains not-claimed unless a real composition test is added.

Performance proof:

- Recompute count for text edits does not regress versus current
  `useSlateDecorationSource` path.
- Rerender breadth stays bounded for unaffected text nodes.
- `#4483` benchmark lane remains `Improves`, not `Fixes`.

## Review Pass Status

| Pass                                    | Status   | Notes                                                                                                                                                            |
| --------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Source-read pass                        | complete | Live example and API substrate inspected.                                                                                                                        |
| Related issue discovery pass            | complete | Existing live/manual ledgers already cover the decoration/projection surface; no new fixed claims or dossier writes.                                             |
| Issue-ledger pass                       | complete | Full fixed/improved/related/not-claimed matrix recorded; no sync-ledger or PR-reference writes yet because the API shape still needs steelman.                   |
| Intent/boundary and decision-brief pass | complete | Intent, outcome, scope, non-goals, decision boundaries, viable options, and the first-tranche `wholeWord` rejection are recorded.                                |
| Steelman pass                           | complete | Helper direction survives with limits: no raw search API, no `wholeWord`, no overload-only design, no automatic runtime-scope inference, factory takes `editor`. |
| Ecosystem pass                          | complete | Strategy table recorded for ProseMirror, Lexical, Tiptap, and React 19.2 after steelman revisions.                                                               |
| Performance/DX/research synthesis pass  | complete | Array return, no `across` option, perf cohorts, metric gates, review-lens matrix, and PR-reference readiness recorded.                                           |
| TDD pass                                | complete | Implementation handoff test families are recorded; actual red-green execution belongs to `ralph`.                                                                |
| Issue-sync accounting pass              | complete | PR reference updated and `#4076` added as a `Not claimed` matrix row; fixed claims unchanged.                                                                    |
| Closure pass                            | complete | Final scorecard, gates, implementation phases, fast driver gates, and user-review handoff are recorded.                                                          |
| Absolute-best DX skepticism pass        | complete | Kept the range helper and `NodeApi.findTextRanges` names, but added `deps` to low-level `useSlateDecorationSource`; closure recheck is required.                 |
| Deps type-surface polish pass           | complete | Refined public hook option spelling from `DependencyList` to `readonly unknown[]` to match live `useEditorSelector`; closure recheck is required.                |

## Plan Deltas From Review

- Source-read pass changed the verdict from "example cleanup" to "public helper
  needed"; the current example leaks projection internals into app code.
- Intent pass rejected raw search/product APIs and locked the target to generic
  text-range and range-decoration primitives.
- Steelman pass cut `wholeWord`, `useSlateDecorationSource` overloads,
  automatic `runtimeScope` inference, and a first-tranche public `across`
  option.
- Ecosystem pass kept ProseMirror-style source-owned overlays, Lexical-style
  subscription discipline, Tiptap-level example ergonomics, and React event-first
  query updates.
- Performance pass added metric gates before any `#4483` performance claim.
- Issue-sync pass added `#4076` as `Not claimed` and updated the PR reference
  with the accepted helper shape.
- Absolute-best DX skepticism pass kept the main API shape but revised the hook
  lifecycle target: `deps` belongs on low-level `useSlateDecorationSource` too,
  not only the range helper.
- Deps type-surface polish pass kept the lifecycle decision but changed the
  documented type to `readonly unknown[]`, matching the current Slate React
  selector options convention.

## Maintainer Objections

Objection: “This is just a nicer example. Why add API?”

Answer: because the complexity is not example-specific. Search, markdown,
hashtags, code tokens, and diagnostics all repeat the same range-to-projection
boilerplate. Repeating it teaches every user to write a fragile mini engine.

Objection: “Search is product code.”

Answer: agreed. That is why the target is `NodeApi.findTextRanges` plus a
range-decoration source helper, not `editor.search`.

Objection: “The helper hides performance details.”

Answer: the helper should hide keys and projection object shape, not hide
refresh policy. It still exposes `dirtiness`, `deps`, and advanced
`runtimeScope`.

Objection: “Why not just use `Editable.decorate`?”

Answer: `Editable.decorate` is good for tiny local cases, but it re-centers the
legacy callback model. Canonical examples should teach provider-owned sources
for overlays that toolbars, sidebars, and external UI may share.

## Implementation Phases With Owners

1. Core owner: add `NodeApi.findTextRanges` in
   `packages/slate/src/interfaces/node.ts`, export it through the
   public surface, and add focused unit tests under
   `packages/slate/test/interfaces/Node/`.
2. React owner: add `createRangeDecorationSource(editor, options)` beside
   `packages/slate-react/src/decoration-source.ts`, plus
   `useSlateRangeDecorationSource(editor, options)` beside the existing hook.
   Add React-only `deps` to `useSlateDecorationSource` and have the range hook
   share that lifecycle contract.
3. Example owner: update `apps/www/src/app/(app)/examples/slate/_examples/search-highlighting.tsx`
   to the canonical state-plus-range-source shape; update highlighted text,
   markdown preview, and code highlighting only where they currently repeat
   generic range/source plumbing.
4. Proof owner: add focused package tests, existing example Playwright rows, and
   benchmark lanes before upgrading any issue claim.
5. Ledger owner: after implementation proof, update the PR reference and issue
   matrix only for claims proven by the new tests or benchmarks.

## Fast Driver Gates

| Gate                   | Cwd             | Command                                                                                                                                                                                                                                                                      | Purpose                                                                                                                                  |
| ---------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Core range helper      | `Plate repo root` | `bun test ./packages/slate/test/find-text-ranges-contract.ts ./packages/slate/test/query-contract.ts`                                                                                                                                                                        | Prove `NodeApi.findTextRanges` behavior and public query contracts.                                                                      |
| React source hooks     | `Plate repo root` | `bun test packages/slate-react/test/projections-and-selection-contract.test.tsx packages/slate-react/test/app-owned-customization.test.tsx`                                                                                                                                  | Prove projected slices, source refresh defaults, low-level hook `deps`, range hook `deps`, and no regression to app-owned customization. |
| Example browser proof  | `Plate repo root` | `playwright test playwright/integration/examples/search-highlighting.test.ts playwright/integration/examples/highlighted-text.test.ts playwright/integration/examples/markdown-preview.test.ts playwright/integration/examples/code-highlighting.test.ts --project=chromium` | Prove examples remain interactive after helper adoption.                                                                                 |
| React rerender breadth | `Plate repo root` | `bun run bench:react:rerender-breadth:local`                                                                                                                                                                                                                                 | Prove no broader rerender pattern than the manual source path.                                                                           |
| Huge overlay pressure  | `Plate repo root` | `bun run bench:react:huge-document-overlays:local`                                                                                                                                                                                                                           | Prove large overlay metrics before any performance claim.                                                                                |
| Planning state         | `plate-2`       | `node tooling/scripts/completion-check.mjs`                                                                                                                                                                                                                                  | Prove this ralplan closure file is complete.                                                                                             |

## Confidence Scorecard

| Dimension                                                | Weight | Score | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| -------------------------------------------------------- | -----: | ----: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance                           |   0.20 |  0.94 | `Performance, DX, And Research Synthesis`; `Absolute-Best DX Skepticism Pass`; `packages/slate-react/src/hooks/use-slate-decoration-source.ts`; `packages/slate-react/src/projection-store.ts`; `benchmarks/slate-v2/donor/browser/react/rerender-breadth.tsx`; `benchmarks/slate-v2/donor/browser/react/huge-document-overlays.tsx`; `docs/research/sources/editor-architecture/react-19-2-external-store-and-background-ui.md`. |
| Slate-close unopinionated DX                             |   0.20 |  0.96 | `Intent And Boundaries`; `Decision Brief`; `Chosen API Target`; `Steelman Pass`; `Absolute-Best DX Skepticism Pass`; `Deps type-surface polish pass`; live source pointers for `search-highlighting.tsx`, `use-slate-decoration-source.ts`, `use-editor-selector.tsx`, and `decoration-source.ts`.                                                                                                                                                                          |
| Plate and slate-yjs migration-backbone shape             |   0.15 |  0.90 | `Architecture North Star And Migration Backbone`; `Related Issue Accounting`; rejected raw `SearchApi` / `editor.api.search` product layer.                                                                                                                                                                                                                                                                                                                                 |
| Regression-proof testing strategy                        |   0.20 |  0.93 | `Test Plan For Ralph Execution`; `Fast Driver Gates`; issue matrix rows for `#4483`, `#5987`, `#4392`, `#3382`, `#3352`, `#4076`.                                                                                                                                                                                                                                                                                                                                           |
| Research evidence completeness                           |   0.15 |  0.94 | `Ecosystem Strategy Synthesis`; ProseMirror, Lexical, Tiptap, and React 19.2 research pages cited in the plan.                                                                                                                                                                                                                                                                                                                                                              |
| shadcn-style composability and hook/component minimalism |   0.10 |  0.93 | `Applicable implementation-review matrix`; `Before / After`; canonical hook stays small and no UI-kit/product component is added.                                                                                                                                                                                                                                                                                                                                           |

Weighted total: `0.94`.

No dimension is below `0.85`.

## Final Completion Gates

| Gate                            | Status | Evidence                                                                                                                                                                                                           |
| ------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Scheduled passes complete       | pass   | Review pass table has every row complete.                                                                                                                                                                          |
| Score threshold                 | pass   | Weighted score is `0.94`; no dimension below `0.85`.                                                                                                                                                               |
| Intent and decision boundaries  | pass   | `Intent And Boundaries` and `Decision Brief` are explicit.                                                                                                                                                         |
| Major options and rejections    | pass   | Decision brief and steelman pass name viable options and dropped alternatives.                                                                                                                                     |
| Ecosystem strategy              | pass   | ProseMirror, Lexical, Tiptap, and React strategy table recorded.                                                                                                                                                   |
| Issue-ledger accounting         | pass   | Full issue matrix recorded; `#4076` added as `Not claimed`; fixed issue claims unchanged.                                                                                                                          |
| PR reference sync               | pass   | `docs/slate-v2/references/pr-description.md` section `6.3 React Decoration Source Hook` updated with shared `deps` hook lifecycle.                                                                                 |
| Acceptance criteria             | pass   | Unit, React, browser, and benchmark gates listed.                                                                                                                                                                  |
| Public API language             | pass   | Accepted names and rejected alternatives are explicit; no undecided public API remains.                                                                                                                            |
| Implementation review lenses    | pass   | Vercel React, performance-oracle, performance, tdd, react-useeffect, and shadcn rows recorded.                                                                                                                     |
| Migration backbone              | pass   | Plate and slate-yjs targets recorded without requiring current adapter compatibility.                                                                                                                              |
| Verification workspace          | pass   | This skill changed planning/ledger/reference files only; no `Plate repo root` behavior is claimed complete. Slate v2 commands are recorded as implementation gates.                                                  |
| Post-skepticism closure recheck | pass   | Deps type-surface polish changed only the public hook type spelling to match live Slate React selector options; score remains `0.94`, PR reference is synced, and no `Plate repo root` behavior is claimed complete. |
| Final handoff                   | pass   | Final user-review outline below is updated; completion file records `final_handoff_status: complete`.                                                                                                              |

## Final User-Review Handoff Outline

- Public API add: `NodeApi.findTextRanges(root, query, options)` in `slate`;
  before is app-local path math in `search-highlighting.tsx`, after is a generic
  range finder.
- Public API add: `createRangeDecorationSource(editor, options)` in
  `slate-react`; before is hand-built `SlateProjection[]`, after is
  range-to-projection helper over the existing source runtime.
- Public API add: `useSlateRangeDecorationSource(editor, options)` in
  `slate-react`; before is low-level `useSlateDecorationSource` for common
  text overlays, after is a hook that owns source stability and `deps` refresh.
- Public hook revise: add `deps?: readonly unknown[]` to
  `useSlateDecorationSource(editor, options)` too; before the low-level hook
  refreshes from `options` identity, after it has the same explicit dependency
  contract as the range hook.
- Public API keep: `createDecorationSource` and `useSlateDecorationSource`
  remain power APIs for external stores, custom metrics, and manual refresh.
- Hard cut: no `editor.api.search`, `SearchApi`, `useSlateSearchSource`,
  first-tranche `wholeWord`, overload-only source API, or automatic
  `runtimeScope` inference.
- Example revise: canonical search highlighting uses `useState` and
  `onChange`; no DOM input listener in `useEffect`.
- Runtime keep: projection store remains the substrate; helper does not create a
  second decoration runtime.
- Performance gate: no `#4483` fix claim without focused metrics from
  rerender-breadth and huge-overlay benchmarks.
- Issue accounting: fixed issues none; improves after implementation
  `#4483`, `#5987`, `#4392`, `#3382`, `#3352`; related but not fixed
  `#3383`, `#3309`, `#3162`, `#4712`, `#4581`, `#5411`, `#4221`; not claimed
  `#4076`, `#5101`.
- Ralph execution target: implement core helper, React helper, example cleanup,
  tests, browser proof, benchmarks, and then ledger/PR claim updates.

## Ralph Handoff Ready

Next pass: none for Slate Ralplan. The plan is ready for explicit `ralph`
execution after user review.

## Ralph Execution State

Status: `complete`
Started by: `ralph`
Current owner: none
Current slice: complete
Completion file: `active goal state`
Continue file: `active goal state`

Completed slice:

- `packages/slate/src/interfaces/node.ts`: added
  `NodeApi.findTextRanges(root, query, options)`.
- `packages/slate/test/find-text-ranges-contract.ts`: added
  focused contract coverage.

Completed implementation:

- `packages/slate-react/src/decoration-source.ts`: added
  `createRangeDecorationSource(editor, options)` and range-entry normalization.
- `packages/slate-react/src/hooks/use-slate-decoration-source.ts`:
  added hook-level `deps` and `useSlateRangeDecorationSource`.
- `apps/www/src/app/(app)/examples/slate/_examples/search-highlighting.tsx`: switched to
  `useState`, `onChange`, `NodeApi.findTextRanges`, and the range source hook;
  hoisted source dirtiness and memoized the editor shell to preserve input
  focus/render proof.
- `apps/www/src/app/(app)/examples/slate/_examples/highlighted-text.tsx`,
  `apps/www/src/app/(app)/examples/slate/_examples/markdown-preview.tsx`, and
  `apps/www/src/app/(app)/examples/slate/_examples/code-highlighting.tsx`: moved to range
  decoration sources.
- `benchmarks/slate-v2/donor/browser/react/rerender-breadth.tsx` and
  `benchmarks/slate-v2/donor/browser/react/huge-document-overlays.tsx`:
  refreshed stale benchmark API usage so the planned benchmark gates run.

Verification:

- `bun test ./packages/slate/test/find-text-ranges-contract.ts ./packages/slate/test/query-contract.ts`
- `bun test ./packages/slate-react/test/projections-and-selection-contract.tsx ./packages/slate-react/test/app-owned-customization.tsx`
- `bun --filter slate typecheck`
- `bun --filter slate-react typecheck`
- `cd ./site && bun tsc --project tsconfig.json`
- `bun lint`
- `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/search-highlighting.test.ts playwright/integration/examples/highlighted-text.test.ts playwright/integration/examples/markdown-preview.test.ts playwright/integration/examples/code-highlighting.test.ts --project=chromium`
- `bun run bench:react:rerender-breadth:local`
- `bun run bench:react:huge-document-overlays:local`

Verification note:

- `bun lint` exits `0` and reports one existing warning in
  `packages/slate-react/src/components/slate.tsx` for
  `reactEditor` in a hook dependency array. This lane did not touch that file.

## Dirtiness API Review Pass

Status: `complete`
Trigger: user asked whether the `searchHighlightingDirtiness` verdict is
absolute-best following `slate-ralplan`.

Verdict: the current example API is not absolute-best. The best call site for
search highlighting is `dirtiness: 'text'`, not a hoisted
`const searchHighlightingDirtiness = ['text', 'external'] as const`.

Evidence:

- `apps/www/src/app/(app)/examples/slate/_examples/search-highlighting.tsx:17` currently hoists
  `['text', 'external']`; `:49` passes that tuple into the range hook.
- `packages/slate-react/src/hooks/use-slate-decoration-source.ts:35`
  and `:77` read raw `options.dirtiness`; `:58` and `:104` put that raw value
  in the source identity deps. That makes inline array dirtiness recreate the
  source and forces examples toward a hoisted tuple workaround.
- `packages/slate-react/src/hooks/use-slate-decoration-source.ts:61`
  and `:107` refresh the source from `deps` with `reason: 'external'` and no
  `change`.
- `packages/slate-react/src/projection-store.ts:147-164` maps
  dirtiness to editor subscription sources; `external` adds no editor source.
- `packages/slate-react/src/projection-store.ts:206-229` treats a
  no-change refresh as dirty before checking the dirtiness class, so the hook
  `deps` refresh already recomputes for `dirtiness: 'text'`.

Accepted API target:

- Search example: `dirtiness: 'text'`.
- Hook internals: normalize/canonicalize list dirtiness into a stable structural
  source-identity key, so `dirtiness: ['text', 'node']` can be written inline
  without recreating the source.
- Keep `dirtiness` visible. It is the editor invalidation policy, not a detail
  to hide behind `deps`.
- Keep `deps` as hook-only closure freshness / external refresh control, not a
  replacement for editor dirty-source policy.
- Do not add another public prop for this; the better API is a smaller
  call-site plus internal source-identity hardening.

Score impact:

- Current implemented example API: `0.88`; the hoisted tuple is a teachability
  smell and implies users must understand source identity internals.
- Target after cleanup: `0.95`; `dirtiness: 'text'` teaches the real policy,
  while structural dirtiness identity removes the array-hoisting trap for
  genuinely multi-class sources.

## Range Decoration Snippet Review Pass

Status: `complete`
Trigger: user asked whether this call shape is absolute-best:
`useSlateRangeDecorationSource(editor, { data, deps: [search], id, dirtiness:
'text', read })`.

Verdict: yes for the public search-highlighting call site. This is the
absolute-best public API shape for the example because it shows the three real
concerns without leaking runtime implementation detail:

- `dirtiness: 'text'` = editor invalidation policy.
- `deps: [search]` = hook closure freshness / external refresh.
- `read: ({ snapshot }) => ...` = pure projection read from editor state.

Rejected alternatives:

- Add `external` to dirtiness: rejected; hook refresh has no `change`, so
  `dirtiness: 'text'` already recomputes on external `deps` refresh.
- Hide `dirtiness`: rejected; it erases the performance contract from the
  example and encourages broad invalidation.
- Add a search-specific hook/API: rejected; search is app behavior, while
  range decoration is the reusable Slate primitive.
- Split `deps` into another public option name: rejected; no new concept is
  needed.

Remaining best-API work: internal-only. The hook should canonicalize list
dirtiness for source identity so multi-class sources can inline
`dirtiness: ['text', 'node']` without source churn. That does not change the
search example call site.

## Ralph Dirtiness Cleanup Execution State

Status: `complete`
Started by: `ralph`
Current owner: none

Scope:

- Replace the search example tuple workaround with `dirtiness: 'text'`.
- Harden hook source identity so structurally identical dirtiness lists do not
  recreate decoration sources.
- Add focused regression coverage.
- Keep public API shape unchanged.

No-rerun issue sweep decision:

- ClawSweeper is not rerun for this slice. The touched issue surface and claim
  set stay inside the already-reviewed search-highlighting / range-decoration
  surface; this cleanup only implements the final call-site/internal identity
  target recorded above.

Planned focused gates:

- `bun test ./packages/slate-react/test/app-owned-customization.tsx`
- `bun --filter slate-react typecheck`
- `cd ./site && bun tsc --project tsconfig.json`
- `node tooling/scripts/completion-check.mjs`

Completed implementation:

- `apps/www/src/app/(app)/examples/slate/_examples/search-highlighting.tsx`: removed
  `searchHighlightingDirtiness` and uses `dirtiness: 'text'` directly.
- `packages/slate-react/src/hooks/use-slate-decoration-source.ts`:
  added structural dirtiness-list identity for both decoration-source hooks.
- `packages/slate-react/test/app-owned-customization.tsx`: added
  inline multi-class dirtiness coverage to both low-level and range hook source
  stability tests.
- `docs/slate-v2/references/pr-description.md`: recorded that structurally
  identical dirtiness class lists keep hook source identity stable.

Verification:

- `bun test ./packages/slate-react/test/app-owned-customization.tsx`
- `bun test ./packages/slate-react/test/projections-and-selection-contract.tsx`
- `bun test ./packages/slate-react/test/app-owned-customization.tsx ./packages/slate-react/test/projections-and-selection-contract.tsx`
- `bun --filter slate-react typecheck`
- `bun tsc --project tsconfig.json` from `apps/www`
- `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/search-highlighting.test.ts --project=chromium`
- `bun lint`
- `bun check`

Verification note:

- `bun lint` and `bun check` exit `0` with the existing
  `packages/slate-react/src/components/slate.tsx` exhaustive-deps
  warning only. This lane did not touch that file.

Completion:

- `ce-compound`: skipped. No new reusable repo pattern beyond the already
  recorded custom-deps/dirtiness plan decision; the implementation evidence is
  captured in this plan.
- Next owner: none.

## Code Highlighting Path Cleanup

Status: `complete`
Trigger: user observed that `const path = useElementPath()` in
`apps/www/src/app/(app)/examples/slate/_examples/code-highlighting.tsx` subscribes during render
even though the path is only needed by the language-select callback.

Implementation:

- `apps/www/src/app/(app)/examples/slate/_examples/code-highlighting.tsx`: removed
  `useElementPath`; `setLanguage` now finds the current rendered code-block
  entry inside `editor.update` with `tx.nodes.find(...)`, then sets the
  language at that path.
- `apps/www/tests/slate-browser/donor/examples/code-highlighting.test.ts`:
  added browser coverage that changes the language select from `jsx` to
  `typescript`.

Verification:

- `bun tsc --project tsconfig.json` from `apps/www`
- `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/code-highlighting.test.ts --project=chromium`
- `bunx biome check site/examples/ts/code-highlighting.tsx playwright/integration/examples/code-highlighting.test.ts && bunx eslint site/examples/ts/code-highlighting.tsx playwright/integration/examples/code-highlighting.test.ts`

Verification note:

- Full `bun lint` / `bun check` is currently blocked by unrelated formatting
  drift in `packages/slate/src/core/editor-extension.ts` and
  `packages/slate/src/index.ts`. The touched files pass targeted
  Biome/ESLint, site typecheck, and focused browser proof.
