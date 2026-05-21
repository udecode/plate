# Slate v2 Non-Node Editor State Architecture Ralplan

status: complete
created: 2026-05-20
closed: 2026-05-21
reopened: 2026-05-21
completion_id: 019e3627-238b-7993-a8cf-26be45504c47
current_pass: header-focus-regression
current_pass_status: complete
next_pass: none
previous_score: 0.92
score: 0.92
final_handoff_status: complete
ralplan_lane_status: complete

## Current Verdict

Hard take: do not store document title, document settings, comments, or
non-content metadata as invisible Slate nodes. That repeats the legacy
`editor.children` trap: every durable thing becomes fake editable content, and
selection/rendering/history/collab all start lying.

Best architecture after the latest API refresh:

1. Use canonical `Value = { roots, state? }` in the runtime and persistence
   layer.
2. Keep the 99% single-root authoring path ergonomic with `initialValue:
   { children, state? }`, normalized to `roots.main`.
3. Add atom-like state fields for persisted non-node document state.
4. Keep root identity on content locations and committed operations, not inside
   numeric Slate paths.
5. Commit state field writes through a first-class, transaction-aware
   `statePatches` channel.
6. Keep comments and product annotations in external anchored channels by
   default.
7. Treat editable header/footer/global regions as content roots, not as state
   fields.
8. Treat multi-editor shared history as one shared document runtime with
   multiple root-bound views, never shared node object identity.

Jotai reopen verdict: a "single flexible store" is correct only as one editor
state container/registry. It is wrong as one arbitrary object blob. Jotai's good
idea is one immutable descriptor per independent value, with granular reads,
writes, equality, persistence, and subscription. Slate should expose that as
state fields, not as public `atom` naming and not as multi-store-first DX.

Naming note: this pass supersedes the previous `defineEditorStateStore` and
`defineEditorStateField` naming. The current public descriptor factory is
`defineStateField`. Older plan sections that still say state store,
`initialDocument`, `state.fields`, or `tx.fields` are historical unless the
section explicitly says it is current authority.

Latest API refresh, 2026-05-20: the previous closeout is reopened because the
accepted API moved from conservative `initialDocument` / `Value = children`
compatibility to canonical `Value = { roots, state? }`, input normalization,
rooted operations, and document runtime/editor view separation. This activation
refreshes authority and syncs issue/reference/proof rows with no issue-count
claim change.

Ralplan compliance reopen, 2026-05-20: the previous closeout batched multiple
state-field follow-up passes and wrote top-level done. That was wrong. The
reopened lane may only close after required follow-up passes and a fresh
final-gates pass. The latest final-gates pass is now complete.

Runtime provider reopen, 2026-05-21: the source implementation has core
runtime/view APIs, but the React public provider shape is not good enough for
multi-root examples yet. Live source shows:

- core already has `createEditorRuntime` and `createEditorView` in
  `.tmp/slate-v2/packages/slate/src/editor-runtime-view.ts`;
- `createEditorView` currently exposes root/read-only/focus policy over one
  runtime, but it is core-only and not a React provider API;
- `useSlateEditor` still creates one React editor from `createReactEditor` in
  `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-editor.ts`;
- `<Slate>` still takes `editor` and creates one editor context plus one
  selector bus in `.tmp/slate-v2/packages/slate-react/src/components/slate.tsx`;
- no public `SlateRuntime`, `useSlateRuntime`, `useSlateViewState`, or
  `<Slate root="...">` API exists in live `slate-react`;
- the current `Document State` example is correctly single-root and should
  stay focused on state fields.

Current verdict for the new pass: add an optional common React runtime provider
for multi-view documents, but keep `<Slate>` as the public view provider. Do
not expose `SlateViewProvider` as public API. It is an internal implementation
name at most.

This is a public API and data-model change. It needs a real plan before
implementation.

## Final Architecture Authority

This section is the current source of truth for the architecture. Older
store-first, `initialDocument`, `EditorDocumentSnapshot`, `state.fields`, and
`tx.fields` wording in dated pass notes is superseded unless it clearly refers
to external/product stores such as comments, annotations, presence, or
service-owned metadata.

Public API target:

```ts
const documentTitle = defineStateField({
  key: 'document.title',
  collab: 'shared',
  initial: () => 'Untitled',
  history: 'push',
  persist: true,
})

const spellcheck = defineStateField({
  key: 'document.settings.spellcheck',
  collab: 'shared',
  initial: () => true,
  history: 'push',
  persist: true,
})

const editor = createEditor({
  extensions: [documentTitle, spellcheck],
  initialValue: {
    children,
    state: {
      [documentTitle.key]: 'Q2 Plan',
      [spellcheck.key]: true,
    },
  },
})

const title = editor.read((state) => state.getField(documentTitle))

editor.update((tx) => {
  tx.setField(documentTitle, 'Q3 Plan')
})
```

React DX target:

```ts
const title = useStateFieldValue(documentTitle)
const setTitle = useSetStateField(documentTitle)
```

React multi-root DX target:

```tsx
const runtime = useSlateRuntime({
  extensions: [documentTitle, spellcheck],
  initialValue: {
    roots: { header, main, footer },
    state: {
      [documentTitle.key]: 'Q2 Plan',
      [spellcheck.key]: true,
    },
  },
})

<SlateRuntime runtime={runtime}>
  <Slate root="header">
    <Editable aria-label="Header" />
  </Slate>

  <Slate root="main">
    <Editable aria-label="Body" />
  </Slate>

  <Slate root="footer">
    <Editable aria-label="Footer" />
  </Slate>
</SlateRuntime>
```

Provider naming decision:

- `SlateRuntime` is the optional common provider for shared value, history,
  collab, state fields, and runtime selector bus.
- `Slate` remains the public view provider. In a `SlateRuntime`, `root` selects
  the view root. Outside a `SlateRuntime`, `Slate editor={editor}` remains the
  single-editor path.
- `SlateViewProvider` is not public API. If implementation needs that name
  internally, keep it unexported.

Cross-view hook target:

```ts
const editor = useEditor()
const currentRoot = useEditorState((state) => state.view.root())

const title = useSlateRuntimeState((state) => state.getField(documentTitle))

const headerText = useSlateViewState('header', (state) =>
  state.text.string([])
)
```

Hook boundary:

- `useEditor` and `useEditorState` read the current `<Slate>` view.
- `useSlateRuntime` creates or returns the shared runtime.
- `useSlateRuntimeState` subscribes to runtime-level data such as state fields,
  history, collab export state, and cross-document counters.
- `useSlateViewState(root, selector)` subscribes to another root view through
  the shared runtime selector bus, not by reaching into a sibling React
  provider.
- Cross-view hooks must be unavailable without `SlateRuntime`; throwing there
  is better than silently binding to the wrong editor.

Internal target:

- canonical runtime/persisted value:
  `Value = { roots: Record<RootKey, Element[]>, state?: Record<string, unknown> }`.
- input convenience only:
  `InitialValue = Element[] | { children: Element[]; state? } | { roots; state? }`.
- single-root input normalizes to `{ roots: { main: children }, state }`.
- one document-runtime-owned state container.
- many immutable field descriptors.
- content operations are root-explicit while `Path` remains numeric and
  root-local.
- `Point` / `Range` are root-aware.
- `EditorCommit.statePatches`.
- `EditorCommit.dirtyStateKeys`.
- `EditorCommitSource` literal `'state'`.
- `EditorRuntime` owns value, roots, state fields, operations, history, and
  collaboration.
- editor views bind a runtime to one root and own selection, DOM bridge, focus,
  and read-only state.
- React runtime provider owns the shared `editor.subscribe` bridge and selector
  bus once per runtime. Nested `<Slate root>` providers derive root-bound views
  from that runtime.
- A single `<Slate editor>` remains valid and should internally behave like the
  one-view shortcut, not force users into a runtime provider for normal docs.
- Sibling view subscriptions go through the runtime selector bus. They must not
  depend on sibling provider lookup, prop-drilled editors, or shared node object
  identity.
- descriptor-level `persist`, `history`, `collab`, `equals`, `serialize`,
  `deserialize`, and optional `diff/applyPatch/invertPatch`.
- `history` and `collab` use string shorthands in normal examples. Object
  policies are escape hatches for future policy metadata, not required
  boilerplate.

Naming rules:

- Use `state field` for durable non-node editor/document values.
- Use `external store` only for product-owned services such as comments,
  annotations, presence, permissions, and audit trails.
- Do not expose public `atom` naming in raw Slate; the design is atom-inspired,
  not Jotai-branded.
- Do not collapse durable state into one arbitrary object blob. One field per
  independently persisted/subscribed value is the default DX.
- Do not expose runtime `Value` as a union. Union shapes are only accepted at
  the creation/input boundary.
- Do not nest state under roots by default. Per-root state is a field policy,
  not a separate root-owned state container.

## Intent And Boundary Record

- intent: support durable editor/document state that is not visible contiguous
  body content, without abusing hidden nodes.
- desired outcome: title/settings/document metadata can be persisted, serialized,
  collaborated, and optionally included in history with the same transaction
  discipline as body edits.
- in scope: document title, document settings, state field descriptors, history
  policy, persistence, collab routing, dirty/source subscriptions, comments as
  external anchors, multi-root pressure, shared-history pressure.
- non-goals:
  - no product comment service in raw Slate.
  - no fake hidden root nodes for document metadata.
  - no same node object mounted in two editors.
  - no current-version Plate/slate-yjs adapter work in this plan.
  - no Slate v2 source edits from this Ralplan pass.
- decision boundary: the plan may define raw Slate substrate and API target; a
  later Ralph pass owns implementation.
- open user question: none.

## Decision Brief

### Principles

- Content is content. Metadata is metadata.
- Every durable change must have a replayable commit record.
- History policy belongs at the transaction/state-field boundary, not inside React
  components.
- Raw Slate stays unopinionated. Product stores stay product-owned.
- Future multi-root editing must not be blocked by today's title/settings API.

### Drivers

- legacy Slate only serializes `editor.children`, which forces fake node hacks.
- current Slate v2 already has `editor.read`, `editor.update`, extension state
  groups, update metadata, and commit listeners.
- current operations only model node/text/selection/fragment changes.
- history currently consumes operation-only commits.
- comments/annotations already have external store pressure.

### Viable Options

| Option | Pros | Cons | Verdict |
| --- | --- | --- | --- |
| Hidden/invisible nodes | uses current `children` and operations | corrupts selection/content model, teaches bad practice, bad for title/settings | drop |
| Runtime WeakMap state only | already possible with extension `runtimeState` | not persisted, not replayable, not collab-safe, not history-safe | drop for durable state |
| Extend `Operation` with arbitrary app ops | one replay stream | risks turning operation model into an app-state dump | partial |
| Add first-class `statePatches` beside document operations | honest model, serializable, history/collab ready, does not fake nodes | new commit/history/collab plumbing | keep |
| External app store only | best for comments/presence/product data | cannot solve document title/settings as raw document metadata | partial |

Chosen option: `EditorCommit = document operations + statePatches + metadata`.
History and collab consume the commit record. Adapters may flatten into one
transport stream, but raw Slate should not pretend a title change is a node op.

## Current Source Evidence

| Surface | Current live shape | Implication |
| --- | --- | --- |
| Update metadata | `EditorUpdateMetadata` has `history`, `collab`, `origin`, `selection`; history mode is `merge | push | skip` in `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts:147` and `:162`. | The policy channel exists. Extend it, do not invent ad hoc setter flags. |
| State/tx groups | `EditorStateExtensionGroups` and `EditorTxExtensionGroups` exist in `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts:454` and `:462`; `BaseEditor.read/update` is public at `:515`. | Store APIs should appear as extension/state/tx groups. |
| Operations | operation union is node/text/selection/replace only in `.tmp/slate-v2/packages/slate/src/interfaces/operation.ts:130`. | No durable non-node state operation exists today. |
| Operation law | operation docs say operations are what enable history/collab in `.tmp/slate-v2/packages/slate/src/interfaces/operation.ts:142`. | Any persisted state change needs equivalent replay law. |
| History state | slate-history uses WeakMaps for history/control state in `.tmp/slate-v2/packages/slate-history/src/history-extension.ts:54`. | Runtime state already exists, but it is not a persisted document-state model. |
| History policy | historic updates use `metadata: { history: { mode: 'skip' } }` in `.tmp/slate-v2/packages/slate-history/src/history-extension.ts:131`; merge/push logic reads metadata/tags at `:265`. | Store history defaults can compose with existing update metadata. |
| Dirtiness | `getOperationDirtiness` computes classes from operations in `.tmp/slate-v2/packages/slate/src/core/public-state.ts:667`. | A state patch channel must add state dirtiness, or React will miss field-specific subscriptions. |
| Transaction snapshot | current transaction snapshot stores children, marks, metadata, operations, selection, and tags in `.tmp/slate-v2/packages/slate/src/core/public-state.ts:2810`. | Add state patch capture here, not after commit. |
| Runtime extension state | extension setup has `context.runtimeState(initialValue)` in `.tmp/slate-v2/packages/slate/src/core/editor-extension.ts:429`. | Keep for ephemeral extension runtime. Do not overload it for persisted title/settings. |
| Annotation store | `SlateAnnotation` has external `anchor`, `data`, `id`, `projection` in `.tmp/slate-v2/packages/slate-react/src/annotation-store.ts:18`; store source can be array or function at `:787`. | Comments already point to external anchored channels. |

## Ecosystem Strategy

| Editor | Observed mechanism | Slate target | Verdict |
| --- | --- | --- | --- |
| ProseMirror | Transactions track doc, selection, marks, metadata; decorations are view data; bookmarks anchor durable selection. See `docs/research/sources/editor-architecture/prosemirror-transaction-view-dom-runtime.md:27` and `:41`. | Steal transaction-owned metadata and bookmark discipline. Add state patches as commit records. Keep Slate paths/runtime ids, not PM integer positions. | agree |
| ProseMirror StateField | State fields define `init`, `apply`, optional `toJSON`, optional `fromJSON` in `../raw/prosemirror/packages/state/src/plugin.ts:95`; `EditorState.toJSON/fromJSON` serialize mapped plugin fields in `../raw/prosemirror/packages/state/src/state.ts:217`; history skips undo with transaction metadata in `../raw/prosemirror/packages/history/src/history.ts:277` and documents `addToHistory: false` at `:388`. Context7 `/websites/prosemirror_net` confirmed the same API. | Steal descriptor-level `init/apply/serialize/deserialize` and transaction metadata policy. Do not copy plugin complexity as public DX. | agree |
| Lexical read/update/tags | Lexical docs require synchronous read/update contexts in `../raw/lexical/repo/packages/lexical-website/docs/intro.md:64`; update tags cover history push/merge, collaboration, skip-collab, skip-scroll, skip-DOM-selection in `../raw/lexical/repo/packages/lexical-website/docs/concepts/updates.md:67`; source constants match at `../raw/lexical/repo/packages/lexical/src/LexicalUpdateTags.ts:10`. Context7 `/facebook/lexical` confirmed the read/update evidence. | Steal lifecycle tags and context discipline. Slate should keep typed metadata plus tags, not `$` helpers. | agree |
| Lexical NodeState | NodeState can attach ad-hoc JSON state to any node and even RootNode metadata in `../raw/lexical/repo/packages/lexical-website/docs/concepts/node-state.md:3` and `:15`; it serializes non-default values at `:116`, is copy-on-write at `:147`, and still has Yjs/listener gaps at `:190`. | Steal parse-backed JSON, default elision, equality, and copy-on-write lessons. Reject RootNode metadata as Slate's durable-document-state answer; it is still metadata stored through content. | partial |
| Tiptap | Extension storage is namespaced and exposed via `editor.storage` in `../raw/tiptap/docs/src/content/editor/extensions/custom-extensions/create-new/extension.mdx:146`; commands are extension-defined at `:204`; editor exposes `storage`, `commands`, and `chain()` in `../raw/tiptap/repo/packages/core/src/Editor.ts:223`; React docs push `useEditorState` selectors and transaction rerender control in `../raw/tiptap/docs/src/content/guides/performance.mdx:92` and `:139`. Context7 `/ueberdosis/tiptap-docs` confirmed the same selector/storage posture. | Steal easy extension authoring, namespaced field discoverability, and selector subscriptions. Reject chain-first/product-service APIs as raw Slate core. | partial |
| Jotai | Official docs model an immutable atom config as the unit of state, with primitive, derived, and write functions; a Store/Provider is only the container. `selectAtom`, `focusAtom`, and `splitAtom` prove property/item-level granularity, equality, and stable keys are the actual performance story. Context7 `/websites/jotai` confirmed this. | Steal atom-like field descriptors and one shared editor container. Do not copy `atom` naming into raw Slate, and do not collapse everything into one object value. | agree |
| Slate v2 overlay research | Existing landscape rejects forcing annotation metadata into editor runtime and callback/array APIs in `docs/research/systems/editor-architecture-landscape.md:174`. | Keep comments external; expose field/controller APIs for durable state. | agree |

### Jotai Atom-Granularity Reopen Pass - 2026-05-20

Status: complete for this single pass only. The broader Ralplan lane remains
pending because issue discovery, objection review, and final gates have not
been rerun after the naming change.

Evidence read:

- current plan target and live Slate v2 source for editor state, transaction
  snapshots, commit sources, and annotations.
- solution notes on derived lint decorations, Yjs readiness, projection stores,
  and stable annotation store inputs.
- Context7 official Jotai docs for atom configs, Store/Provider,
  `selectAtom`, `focusAtom`, and `splitAtom`.

Decision:

- Replace `defineEditorStateStore` as the primary public concept with
  `defineEditorStateField`.
- Keep one editor-owned state container internally. The public unit is a typed
  field descriptor, not many user-created store instances and not one mutable
  `editor.state` object.
- Keep object-valued fields legal for coarse document domains, but make scalar
  fields first-class. Persisting only `document.title` must not require a
  `{ title, settings }` object value.
- Keep `statePatches` as the commit channel. Current target names are
  `dirtyStateKeys`, source `'state'`, and document snapshot `state`.
- React hooks should mirror Jotai's ergonomic split: a read hook for one field,
  and a setter hook for simple cases, while `editor.update` remains the
  transaction API for grouped changes.

Historical provisional API from this pass. It is superseded by the latest
`defineStateField` / `initialValue` / `state.getField` authority above:

```ts
const documentTitle = defineEditorStateField({
  key: 'document.title',
  collab: { default: 'shared' },
  initial: () => 'Untitled',
  history: { default: 'push' },
  persist: true,
})

const spellcheck = defineEditorStateField({
  key: 'document.settings.spellcheck',
  collab: { default: 'shared' },
  initial: () => true,
  history: { default: 'push' },
  persist: true,
})

const editor = createEditor({
  extensions: [documentTitle, spellcheck],
  initialDocument: {
    children,
    state: {
      [documentTitle.key]: 'Q2 Plan',
      [spellcheck.key]: true,
    },
  },
})

const title = editor.read((state) => state.fields.get(documentTitle))

editor.update(
  (tx) => {
    tx.fields.set(documentTitle, 'Q3 Plan')
  },
  {
    metadata: {
      history: { mode: 'push' },
    },
  }
)
```

React DX target:

```tsx
function DocumentTitleInput() {
  const title = useEditorStateFieldValue(documentTitle)
  const setTitle = useSetEditorStateField(documentTitle)

  return (
    <input
      value={title}
      onChange={(event) => {
        setTitle(event.target.value, {
          metadata: { history: { mode: 'merge' } },
        })
      }}
    />
  )
}
```

Selector target for object-valued fields:

```ts
const margins = defineEditorStateField({
  key: 'document.layout',
  initial: () => ({
    margins: { bottom: 72, left: 72, right: 72, top: 72 },
  }),
  persist: true,
})

const topMargin = useEditorStateFieldValue(
  margins,
  (layout) => layout.margins.top
)
```

### Research/Ecosystem Refresh Pass - 2026-05-20

Status: complete.

Evidence read:

- compiled research index/log and editor-architecture summaries:
  `docs/research/index.md`,
  `docs/research/log.md`,
  `docs/research/sources/editor-architecture/prosemirror-transaction-view-dom-runtime.md`,
  `docs/research/sources/editor-architecture/lexical-read-update-extension-runtime.md`,
  `docs/research/sources/editor-architecture/tiptap-extension-command-react-dx.md`,
  `docs/research/decisions/slate-v2-state-tx-public-api-and-extension-namespaces.md`,
  `docs/research/decisions/slate-v2-collaborative-annotation-channels.md`, and
  `docs/research/systems/editor-architecture-landscape.md`.
- current local Slate v2 source:
  `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts`,
  `.tmp/slate-v2/packages/slate/src/interfaces/operation.ts`,
  `.tmp/slate-v2/packages/slate/src/core/public-state.ts`,
  `.tmp/slate-v2/packages/slate-history/src/history-extension.ts`, and
  `.tmp/slate-v2/packages/slate-react/src/annotation-store.ts`.
- raw official source/docs for ProseMirror, Lexical, and Tiptap under
  `../raw/prosemirror`, `../raw/lexical`, and `../raw/tiptap`.
- Context7 official-doc checks for `/websites/prosemirror_net`,
  `/facebook/lexical`, and `/ueberdosis/tiptap-docs`.

Current-source result:

- Slate v2 already has update metadata for history/collab/selection
  (`.tmp/slate-v2/packages/slate/src/interfaces/editor.ts:162`), commit
  sources including `decoration`, `annotation`, and `external` (`:1081`), and
  commit records with operations/metadata/dirtiness (`:1623`).
- Slate v2 operations remain node/text/selection/replace only
  (`.tmp/slate-v2/packages/slate/src/interfaces/operation.ts:130`), and the
  current transaction snapshot captures children/marks/metadata/operations/tags
  but no state patches
  (`.tmp/slate-v2/packages/slate/src/core/public-state.ts:65` and `:2810`).
- Commit dirtiness is derived from operations and maps to dirty paths/runtime
  ids (`.tmp/slate-v2/packages/slate/src/core/public-state.ts:667`). A document
  state field channel must add keyed state dirtiness instead of widening all state
  writes to `dirtyScope: all`.
- Slate history already uses metadata/tag policy for `push`, `merge`, and
  `skip` (`.tmp/slate-v2/packages/slate-history/src/history-extension.ts:131`
  and `:265`), but it currently consumes committed operations, not state
  patches (`:233`).
- Slate annotations are already external anchored stores with id/data/projection
  and per-id subscriptions
  (`.tmp/slate-v2/packages/slate-react/src/annotation-store.ts:13` and `:71`).

Ecosystem decision changes:

- ProseMirror strengthens the descriptor model: state fields own `init/apply`
  plus optional JSON, and history opt-out is transaction metadata. That maps
  directly to `defineEditorStateField({ initial, apply?, serialize?,
  deserialize?, history })`.
- Lexical strengthens tag/dirtiness policy, but its RootNode `NodeState` path is
  not the Slate answer. For Slate, title/settings should be document state fields
  beside `children`, not RootNode payloads hidden inside the content model.
- Tiptap strengthens DX expectations: named extension storage and selector
  subscriptions are table stakes. Raw Slate should provide the substrate;
  Plate can provide product-friendly wrappers and menus.

Research-layer action:

- No new compiled research page is needed. Existing compiled pages remain
  correct after local raw and Context7 refresh.
- `docs/research/log.md` records this maintain pass.

## Public API Target

This is directional API, not implementation spec. After the latest API refresh,
the primary public noun is state field, not state store. The canonical runtime
value is multi-root; the common single-root authoring shape is input
convenience only.

```ts
const documentTitle = defineStateField({
  key: 'document.title',
  collab: 'shared',
  initial: () => 'Untitled',
  history: 'push',
  persist: true,
})

const spellcheck = defineStateField({
  key: 'document.settings.spellcheck',
  collab: 'shared',
  initial: () => true,
  history: 'push',
  persist: true,
})

const editor = createEditor({
  extensions: [documentTitle, spellcheck],
  initialValue: {
    children,
    state: {
      [documentTitle.key]: 'Q2 Plan',
      [spellcheck.key]: true,
    },
  },
})

const title = editor.read((state) => state.getField(documentTitle))

editor.update(
  (tx) => {
    tx.setField(documentTitle, 'Q3 Plan')
  },
  {
    metadata: {
      history: { mode: 'push' },
    },
  }
)
```

For typing in a title input:

```ts
const title = useStateFieldValue(documentTitle)
const setTitle = useSetStateField(documentTitle)

setTitle(nextTitle, {
  metadata: {
    history: { mode: 'merge' },
  },
})
```

For non-document preferences:

```ts
const editorZoom = defineStateField({
  collab: 'local',
  key: 'runtime.zoom',
  history: 'skip',
  initial: () => 1,
  persist: false,
})
```

React hook target:

- `useStateFieldValue(field, selector?, options?)` subscribes by field key
  and uses selector equality.
- `useSetStateField(field)` handles simple one-field updates through
  `editor.update`.
- `useEditorState` remains the broad editor snapshot hook.
- Field selectors must be driven by `dirtyStateKeys`, not by `dirtyScope`.

Input normalization rule:

```ts
type RootKey = string

type Value = {
  roots: Record<RootKey, Element[]>
  state?: Record<string, unknown>
}

type InitialValue =
  | Element[]
  | {
      children: Element[]
      state?: Record<string, unknown>
    }
  | {
      roots: Record<RootKey, Element[]>
      state?: Record<string, unknown>
    }
```

- `Value` is canonical runtime/persisted shape and must not be a union.
- `InitialValue` is the only union boundary.
- `createEditor({ initialValue: children })` remains valid and normalizes to
  `{ roots: { main: children } }`.
- `createEditor({ initialValue: { children, state } })` is the best 99%
  single-root document-state DX and normalizes to `{ roots: { main: children },
  state }`.
- `createEditor({ initialValue: { roots, state } })` is the advanced multi-root
  path.

## Internal Runtime Target

Add a state field descriptor registry:

```ts
type CollabPolicy =
  | 'external'
  | 'local'
  | 'shared'
  | false
  | {
      default: 'external' | 'local' | 'shared'
      // Future policy metadata lives here, not in the simple path.
    }

type HistoryPolicy =
  | 'merge'
  | 'push'
  | 'skip'
  | false
  | {
      default: 'merge' | 'push' | 'skip'
      // Future policy metadata lives here, not in the simple path.
    }

type StateField<T> = {
  key: string
  collab?: CollabPolicy
  diff?: (previous: T, next: T) => unknown
  initial: () => T
  history?: HistoryPolicy
  invertPatch?: (patch: unknown, previous: T, next: T) => unknown
  applyPatch?: (previous: T, patch: unknown) => T
  persist?: boolean
  serialize?: (value: T) => unknown
  deserialize?: (json: unknown) => T
  equals?: (a: T, b: T) => boolean
  scope?: 'document' | 'root'
}
```

Policy rule: `persist`, `history`, and `collab` are universal axes, but the
simple path must stay terse:

```ts
defineStateField({
  key: 'document.title',
  initial: () => 'Untitled',
  persist: true,
  history: 'push',
  collab: 'shared',
})
```

Expanded policy objects are allowed only when the policy needs extra metadata:

```ts
defineStateField({
  key: 'document.layout',
  initial: defaultLayout,
  persist: true,
  history: { default: 'push' },
  collab: { default: 'shared' },
  diff,
  applyPatch,
  invertPatch,
})
```

Do not add more top-level policy axes preemptively. Future migration,
authorization, conflict resolution, or adapter-specific behavior should first
try `deserialize`, `serialize`, `collab`, or extension-owned metadata before
becoming a universal field option.

Add root identity to committed content operations, without putting root identity
inside `Path`:

```ts
type RootedPath = {
  root: RootKey
  path: Path
}

type Point = {
  root: RootKey
  path: Path
  offset: number
}

type Range = {
  anchor: Point
  focus: Point
}

type InsertTextOperation = {
  type: 'insert_text'
  root: RootKey
  path: Path
  offset: number
  text: string
}

type MoveNodeOperation = {
  type: 'move_node'
  root: RootKey
  path: Path
  newRoot: RootKey
  newPath: Path
}
```

Single-root views default the root at the command layer:

```ts
tx.insertText('x', { at: [0, 0] })
```

The committed operation is still root-explicit:

```ts
{
  type: 'insert_text',
  root: 'main',
  path: [0, 0],
  offset: 3,
  text: 'x',
}
```

Add state patches to the transaction and commit model. State changes do not
become content operations:

```ts
type StatePatch =
  | {
      key: string
      next: unknown
      previous: unknown
      type: 'set_state'
    }
  | {
      inversePatch: unknown
      key: string
      patch: unknown
      type: 'patch_state'
    }

type EditorCommit = {
  dirtyPaths: readonly RootedPath[]
  dirtyStateKeys: readonly string[]
  operations: Operation[]
  statePatches: StatePatch[]
  metadata: EditorUpdateMetadata
  tags: EditorUpdateTag[]
}
```

Add document runtime / view separation:

```ts
const runtime = createEditorRuntime({ initialValue })

const mainEditor = createEditorView(runtime, { root: 'main' })
const headerEditor = createEditorView(runtime, { root: 'header' })
```

- `runtime` owns value, roots, state fields, operations, history, and collab.
- `view` owns root binding, selection, DOM bridge, focus, and read-only policy.
- `createEditor(...)` remains the 99% shortcut that creates a runtime and a
  `main` view.

Implementation owners:

- transaction capture: extend `.tmp/slate-v2/packages/slate/src/core/public-state.ts:2810`.
- commit dirtiness: extend `.tmp/slate-v2/packages/slate/src/core/public-state.ts:667`.
- public types: extend `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts:80`,
  `:454`, `:462`, and `:1005`.
- source listeners: add an `EditorCommitSource` for state fields around
  `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts:1081`; recommended
  literal is `'state'`, not another use of `'external'`. Then key
  subscriptions by field key rather than waking all source subscribers.
- history: teach `.tmp/slate-v2/packages/slate-history/src/history-extension.ts:233` to batch state patches plus operations.
- serialization: hard-break `Value` to canonical `{ roots, state? }`; keep
  `InitialValue` convenience for old `Element[]` and `{ children, state? }`
  inputs.

Descriptor rule: small fields may use whole-value previous/next patches. A
large field that opts into history or shared collab must provide
`diff/applyPatch/invertPatch`; otherwise core should reject that policy
combination instead of creating huge undo/collab payloads.

## History Policy Target

Yes, provide history opt-in/out, with defaults. This should behave like
`isSelectable` / `isReadonly` in spirit: a descriptor declares the default, and a
transaction can override it.

DX rule: use `history: 'push' | 'merge' | 'skip' | false` and
`collab: 'shared' | 'local' | 'external' | false` in normal field definitions.
Use `{ default: ... }` objects only when future policy metadata is needed.

Default policy:

| State kind | Persist | History | Collab | Reason |
| --- | --- | --- | --- | --- |
| document title | yes | push by default, merge while typing | shared | user-visible document state |
| document settings that affect content/rendering | yes | push | shared | part of document intent |
| editor preferences | optional/local | skip | local | user preference, not document history |
| comments/thread metadata | external | skip in document history | external/shared by product | own audit/history outside document undo |
| annotation anchors | external or persisted depending adapter | usually skip in document history | external/shared | anchor movement follows document ops; thread lifecycle is product-owned |
| presence/cursors/viewport | no | skip | external/local | runtime state |
| remote collab imports | yes if document state | skip local history unless `saveToHistory` | shared | current metadata already has `collab.saveToHistory` |

History batches must include both `operations` and `statePatches`. Undoing a
title change should not require fake text nodes. Undoing a document edit should
not undo a comment thread creation unless the app explicitly routes comments
into the same store/history domain.

## Persistence And Collaboration Target

Persisted document value should become:

```ts
type Value = {
  roots: Record<RootKey, Element[]>
  state?: Record<string, unknown>
}
```

Rules:

- `state.value.get()` returns canonical `{ roots, state? }`.
- `state.children.get()` or a root-bound view helper may return the current
  view's root children for 99% single-root ergonomics.
- `InitialValue` accepts old `Element[]`, `{ children, state? }`, and
  `{ roots, state? }`, then normalizes once at editor creation.
- only descriptors with `persist: true` and serializer support enter snapshots.
- collab adapters receive commit records with `operations + statePatches`.
- state field descriptors declare whether a state patch is `shared`, `local`, or
  `external`.
- content operations include a root key; state patches do not unless a
  descriptor declares `scope: 'root'`.
- external comment stores keep their canonical service data outside raw Slate.

This aligns with the accepted annotation decision: document value owns document
content; comment threads, permissions, and service metadata belong outside raw
Slate (`docs/research/decisions/slate-v2-collaborative-annotation-channels.md:23`).

## Non-Contiguous And Multi-Editor Proposal

Do not solve header/footer by jamming nodes into metadata.

Editable header/footer/global regions are content. The right design is a
multi-root document model in canonical `Value`; the 99% single-root input shape
is still allowed as `InitialValue` convenience:

```ts
type Value = {
  roots: {
    main: Element[]
    footer?: Element[]
    header?: Element[]
  }
  state: Record<string, unknown>
}
```

Open design:

- path identity needs a root id, not just numeric array indexes.
- selection can be root-local by default; cross-root selection must be explicit.
- history scope belongs to the document runtime, not each React editor view.
- view-local selection/presence remains per editor surface.
- state fields remain document-scoped by default. Per-root state uses field
  policy, for example `defineStateField({ key: 'root.readonly', scope: 'root' })`.

For two editors sharing one document/history, the target is:

- one `EditorRuntime` / document runtime.
- multiple editor views bound to the runtime.
- view-local selection and DOM bridges.
- shared history stack owned by the document runtime.
- never the same node objects mounted in two editor instances.

Issue #6016 is the guardrail: shared node identity across editors is classified
as unsupported misuse in `docs/slate-v2/ledgers/fork-issue-dossier.md`.

## Issue Ledger Accounting

ClawSweeper status: applied cache-first. This pass makes no `Fixes #...` claim.
It writes a sync-note section in
`docs/slate-issues/gitcrawl-v2-sync-ledger.md` for the reviewed issue surface
instead of changing fixed/improved counts.

Related but not fixed:

| Issue/cluster | Relation | Current classification |
| --- | --- | --- |
| #4477 comments | external anchored channels and product comment stores | improves pressure only; product comments not fixed. See `docs/slate-v2/ledgers/issue-coverage-matrix.md:141`. |
| #4483 dynamic decorations | store/controller APIs and dirty source policy | improves projection-store pressure; not exact legacy API closure. See `docs/slate-v2/ledgers/issue-coverage-matrix.md:140`. |
| #5987 async decoration caret jump | source-owned projection/state invalidation | improves; exact async app repro not auto-closed. See `docs/slate-v2/ledgers/issue-coverage-matrix.md:142`. |
| #3383 overlapping metadata | reinforces external metadata/store lane | related; no closure claim. See `docs/slate-issues/gitcrawl-live-open-ledger.md:463`. |
| #5515 Undo/Redo All | history scope and shared-history semantics | related; collaboration makes simple "undo all" messy. See `docs/slate-issues/open-issues-dossiers/5558-5480.md:547`. |
| #3741 move_node OT undo/redo | commit replay/collab metadata pressure | related; exact moved-node payload not solved. See `docs/slate-issues/open-issues-dossiers/3797-3708.md:940`. |
| #3715 collaboration docs | future examples need real collab/document-state story | docs pressure. See `docs/slate-issues/open-issues-dossiers/3797-3708.md:1091`. |
| #4612 external state updates | non-node state fields must use explicit transaction/state APIs, not React controlled `value` | improves-claimed unchanged. See `docs/slate-v2/ledgers/issue-coverage-matrix.md:156`. |
| #3705/#3756/#3921 history set_selection | history batching and selection state pressure | cluster pressure. See `docs/slate-issues/gitcrawl-clusters.md:21`. |
| #6016 same initial value in two editors | rejects shared node identity as shared-history solution | triage-closed/non-fix. See `docs/slate-v2/ledgers/fork-issue-dossier.md`. |
| #5537 programmatic focus with multiple editors | multi-view runtime must keep focus/input ownership per view | cluster-synced; exact browser closure still needs proof. See `docs/slate-v2/ledgers/fork-issue-dossier.md`. |
| #5117 placeholder height leaks across multiple editors | multi-root example must prove view-local DOM measurement and placeholder state | future-proof/example pressure only. See `docs/slate-issues/open-issues-dossiers/5129-5066.md`. |
| #3482 void children requirement | warns against fake invisible child tricks | related design pressure. See `docs/slate-issues/gitcrawl-live-open-ledger.md:590`. |

No `Fixes #...` rows are accepted in this pass.

### Related Issue Discovery Pass - 2026-05-20

Status: complete.

Evidence read:

- generated live rows in `docs/slate-issues/gitcrawl-live-open-ledger.md`.
- manual sync rows in `docs/slate-issues/gitcrawl-v2-sync-ledger.md`.
- fork-local issue sections in `docs/slate-v2/ledgers/fork-issue-dossier.md`.
- issue coverage rows in `docs/slate-v2/ledgers/issue-coverage-matrix.md`.
- PR reference annotation/collaboration section in
  `docs/slate-v2/references/pr-description.md`.

Result:

- no new exact fixed issue claim.
- no broad live GitHub search needed.
- current related set is already classified in durable ledgers.
- added one sync-note override section to
  `docs/slate-issues/gitcrawl-v2-sync-ledger.md` because `#3705/#3756/#3921`
  table rows lag the fork dossier's later history-selection classification.
- kept `#4477/#4483/#5987/#3383/#5515/#3741/#3715/#6016/#3482` statuses
  unchanged.

### Related Issue Discovery Pass - 2026-05-21 Runtime Provider Reopen

Status: complete for this activation only. The broader lane remains pending.

Evidence read:

- generated live rows for `#6016`, `#5537`, `#5117`, `#4612`, `#4483`,
  `#4477`, `#3383`, `#5515`, `#3741`, `#3715`, and `#3482` in
  `docs/slate-issues/gitcrawl-live-open-ledger.md`.
- manual sync rows in `docs/slate-issues/gitcrawl-v2-sync-ledger.md`.
- fork dossier sections for `#6016`, `#5537`, `#4612`, `#3383`, `#4483`,
  `#4477`, and `#3741` in
  `docs/slate-v2/ledgers/fork-issue-dossier.md`.
- matrix rows for `#4483`, `#4477`, `#4612`, and matrix-only future-proof
  `#5117` in `docs/slate-v2/ledgers/issue-coverage-matrix.md`.
- PR reference non-claim section in
  `docs/slate-v2/references/pr-description.md`.

Result:

- no new `Fixes #...` claim.
- no new improved count.
- `#6016` stays triage-closed: sharing the same node object graph across editor
  runtimes is still unsupported. The new answer is one shared `SlateRuntime`
  with root-bound views, not two editors sharing nodes.
- `#5537` stays cluster-synced: multi-editor programmatic focus pressure becomes
  a required provider/browser proof row, not a closure claim.
- `#5117` stays future-proof/example pressure: the multi-root example must prove
  view-local placeholder/measurement ownership before any claim.
- `#4612` stays improves-claimed unchanged: the provider API must not resurrect
  controlled React `value`.
- PR reference and sync ledger were updated as non-claim API/accounting sync
  only.

Next issue-ledger pass should decide whether the wide table rows for
`#3705/#3756/#3921` should be mechanically rewritten, or whether the explicit
sync-note override is sufficient until the next generated ledger cleanup.

### Issue-Ledger Pass - 2026-05-20

Status: complete.

Evidence read:

- generated live rows in `docs/slate-issues/gitcrawl-live-open-ledger.md`.
- current manual sync notes in
  `docs/slate-issues/gitcrawl-v2-sync-ledger.md`.
- frozen corpus rows in `docs/slate-issues/open-issues-ledger.md`.
- macro cluster and gitcrawl cluster files:
  `docs/slate-issues/issue-clusters.md` and
  `docs/slate-issues/gitcrawl-clusters.md`.
- test, benchmark, package, and requirements maps:
  `docs/slate-issues/test-candidate-map.md`,
  `docs/slate-issues/benchmark-candidate-map.md`,
  `docs/slate-issues/package-impact-matrix.md`, and
  `docs/slate-issues/requirements-from-issues.md`.
- fork-local issue sections and accepted claim matrix:
  `docs/slate-v2/ledgers/fork-issue-dossier.md` and
  `docs/slate-v2/ledgers/issue-coverage-matrix.md`.
- PR reference claim/count narrative in
  `docs/slate-v2/references/pr-description.md`.

Decision:

- Keep the explicit 2026-05-20 sync-note override in
  `docs/slate-issues/gitcrawl-v2-sync-ledger.md` as current truth for
  `#3705/#3756/#3921`. The old wide table rows are stale carryover; rewriting
  three giant manual rows by hand would create noisy drift without changing the
  accepted coverage matrix or PR claims.
- No `docs/slate-v2/ledgers/issue-coverage-matrix.md` update is needed. It
  already has the current `#3705`, `#3756`, and `#3921` classifications, and
  this plan adds no exact `Fixes #...` row.
- `docs/slate-v2/references/pr-description.md` must stay a non-claim sync:
  fixed and improved counts do not change, and non-node document state is an
  architecture proposal until Ralph implementation proof passes.
- Add `#4612` to the adjacent pressure set: external state updates are already
  improved by explicit initialization and `tx.value.replace`; document state
  fields should follow the same transaction-owned API shape without
  resurrecting React controlled `value`.
- Test and benchmark maps reinforce later implementation proof for history,
  projection invalidation, and subscription breadth. They do not add a new
  benchmark target for "document title" or settings state.

Action summary:

- v2 sync ledger: no further row rewrite after the sync-note override.
- coverage matrix: no exact claim change.
- PR description: no count or claim change; non-claim future API reference
  synced in the revision/handoff pass.

### State-Field Issue-Ledger Pass - 2026-05-20

Status: complete for this activation only. The broader Ralplan lane remains
pending because terminology/handoff, maintainer-objection/risk, and final gates
are still runnable.

Evidence read:

- generated live issue rows in
  `docs/slate-issues/gitcrawl-live-open-ledger.md`.
- current manual state-field sync note in
  `docs/slate-issues/gitcrawl-v2-sync-ledger.md`.
- frozen corpus and cluster rows in
  `docs/slate-issues/open-issues-ledger.md` and
  `docs/slate-issues/gitcrawl-clusters.md`.
- fork-local dossier sections in
  `docs/slate-v2/ledgers/fork-issue-dossier.md`.
- accepted claim matrix in
  `docs/slate-v2/ledgers/issue-coverage-matrix.md`.
- PR open-debt note in `docs/slate-v2/references/pr-description.md`.

Decision:

- no fixed issue count changes.
- no improved issue count changes.
- PR reference already has the correct non-claim state-field target and remains
  unchanged.
- `docs/slate-issues/gitcrawl-v2-sync-ledger.md` already owns the reviewed
  surface and remains unchanged.
- `docs/slate-v2/ledgers/issue-coverage-matrix.md` now tightens `#4612` so
  document state fields are explicitly future transaction-owned API pressure,
  not a controlled React `value` revival.
- related state-field pressure set remains
  `#4477/#4483/#5987/#3383/#5515/#3741/#3715/#4612/#3705/#3756/#3921/#6016/#3482`.

Next owner: state-field terminology/handoff hardening.

### State-Field Terminology/Handoff Hardening Pass - 2026-05-20

Status: complete for this activation only. The broader Ralplan lane remains
pending because maintainer-objection/risk and final gates are still runnable.

Evidence read:

- active plan final authority, proof matrix, performance/DX pass, high-risk
  proof plan, maintainer objection ledger, Ralph-ready handoff, and previous
  store-based handoff.
- active completion and continuation files under
  `.tmp/019e3627-238b-7993-a8cf-26be45504c47/`.

Decision:

- at that pass, API and Ralph-ready handoff used `defineEditorStateField`,
  `initialDocument.state`, `state.fields`, `tx.fields`, `dirtyStateKeys`, and
  source `'state'`.
- latest API authority supersedes those constructor/accessor names with
  `defineStateField`, `initialValue`, `state.getField`, and `tx.setField`.
- proof rows used field-key selector and `editor-state-field`
  naming.
- current performance and risk rows now talk about state field writes, keyed
  state dirtiness, and `O(changed fields)`.
- remaining store wording is intentionally confined to external/product stores,
  Tiptap/Jotai source terminology, file paths such as `annotation-store`, and
  the explicitly historical `Previous Store-Based Handoff` section.

Next owner: state-field maintainer objection and risk pass.
- implementation: none in Slate Ralplan.
- verification: `pnpm lint:fix` for planning artifacts.

## Legacy Regression Proof Matrix

Required later implementation proof:

| Behavior | Test owner | Expected proof |
| --- | --- | --- |
| title change persists | `packages/slate/test/document-state-contract.ts` | snapshot roundtrip contains `state[documentTitle.key]` |
| title undo | `packages/slate-history/test/document-state-history-contract.ts` | undo/redo toggles title without touching body nodes |
| title typing merge | same | repeated title input merges when metadata asks merge |
| skip history | same | preference state patch with `history: skip` does not enter undo stack |
| collab export | `packages/slate/test/collab-document-state-contract.ts` | local shared state patch appears in adapter export |
| remote import | same | remote state patch applies with history skip and selection side-effect suppression |
| comments external | `packages/slate-react/test/annotation-store-contract.tsx` | comment data update does not change Slate value/history |
| dirty subscriptions | `packages/slate-react/test/state-field-selector-contract.tsx` | field-key subscriber wakes without broad document rerender |
| body edit isolation | same | body typing emits no state patches and wakes no field-key subscriber |
| title edit isolation | same | title typing emits no dirty paths and wakes no body runtime subscriber |
| legacy construction | `packages/slate/test/create-editor-value-contract.ts` | `createEditor({ initialValue: children })` normalizes to `{ roots: { main: children } }` |
| single-root document state construction | same | `createEditor({ initialValue: { children, state } })` normalizes to canonical `{ roots: { main: children }, state }` |
| multi-root construction | same | `createEditor({ initialValue: { roots, state } })` roundtrips persisted state field descriptors |
| canonical runtime value | same | `state.value.get()` returns `{ roots, state? }`, not a union and not raw `Element[]` |
| descriptor patch guard | `packages/slate/test/document-state-patch-contract.ts` | large historyable/shared field without patch hooks is rejected or downgraded by explicit policy |
| state source | `packages/slate-react/test/state-field-selector-contract.tsx` | `'state'` source plus descriptor-key subscription wakes exact field listeners only |
| rooted operations | `packages/slate/test/rooted-operation-contract.ts` | committed content operations include `root`; `Path` stays numeric and root-local |
| root-aware points/ranges | same | `Point` and `Range` carry root identity and transforms ignore unrelated roots |
| editor runtime/view split | `packages/slate/test/editor-runtime-view-contract.ts` plus React browser row | one runtime owns value/history/collab; views own root, selection, DOM bridge, focus, and read-only state |

## Browser Stress And Parity Strategy

Browser proof waits for implementation, but the required user-visible rows are:

- title input edits while body selection is live.
- undo body text vs undo title change.
- remote document state import does not steal focus or scroll.
- comment-only read-only view can add/update comment metadata without changing
  document history.
- two editor surfaces over one shared runtime do not share node object identity.
- header/body/footer views over one runtime keep root-local selection and shared
  history.

### Performance/DX/Migration/Regression Pressure Pass - 2026-05-20

Status: complete.

Evidence read:

- current Slate v2 source for metadata, commit sources, commit shape,
  operations, transaction capture, source subscriptions, `CreateEditorOptions`,
  history batching, React selectors, projection stores, and annotation stores:
  `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts:162`,
  `:1005`, `:1081`, `:1623`, and `:2342`;
  `.tmp/slate-v2/packages/slate/src/interfaces/operation.ts:130`;
  `.tmp/slate-v2/packages/slate/src/core/public-state.ts:65`, `:667`,
  `:2621`, `:2703`, `:2784`, and `:2972`;
  `.tmp/slate-v2/packages/slate-history/src/history-extension.ts:131` and
  `:233`; `.tmp/slate-v2/packages/slate-react/src/hooks/use-editor-selector.tsx:180`;
  `.tmp/slate-v2/packages/slate-react/src/projection-store.ts:486`; and
  `.tmp/slate-v2/packages/slate-react/src/annotation-store.ts:71` and `:893`.
- performance rules:
  `.agents/skills/performance/rules/cohort-segmentation.md`,
  `.agents/skills/performance/rules/repeated-unit-budget.md`,
  `.agents/skills/performance/rules/effect-subscription-budget.md`,
  `.agents/skills/performance/rules/interaction-inp-matrix.md`,
  `.agents/skills/performance/rules/memory-dom-tagging.md`, and
  `.agents/skills/performance/rules/editor-native-behavior-proof.md`.

API correction:

- `CreateEditorOptions` currently exposes `initialValue?: V` for content only
  in `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts:1005`. The earlier
  draft's runtime `Value = { children, state }` example was incomplete for
  planned multi-root support.
- Hard-break runtime `Value` to `{ roots, state? }` so history/collab/rooted
  operations have one canonical shape.
- Keep `initialValue` as the public input boundary and let it accept
  `Element[]`, `{ children, state? }`, and `{ roots, state? }`.
- Core read/write DX should be generic and descriptor-based:
  `state.getField(documentTitle)` and `tx.setField(documentTitle, updater)`.
  Product helpers like `setTitle` belong in extensions or Plate, not core.

Performance contract:

| Interaction | Commit contract | Wake contract |
| --- | --- | --- |
| body text edit | `operations` non-empty with `root`, `statePatches=[]`, `dirtyStateKeys=[]` | root/body/runtime/decoration subscribers only; field-key subscribers stay asleep |
| title edit | `operations=[]`, `statePatches=[document.title]`, no dirty rooted paths | `commit` plus state source; only `document.title` selectors wake |
| settings edit | keyed state patch with descriptor history/collab policy | only the setting field and explicitly subscribed document-level listeners wake |
| preference edit | `persist=false`, `history=skip`, `collab=local` | no history, no collab export, no body rerender |
| comment thread edit | external annotation/comment service, unless app deliberately routes anchors through a document state field | annotation id/runtime subscribers wake; Slate value/history stay unchanged |
| header edit | rooted content operation with `root: 'header'` | header view and runtime subscribers wake; body view stays asleep except shared-history observers |

Do not use `dirtyScope: all` for state patches. That would make a title keystroke
look like a whole-document edit and erase the perf win. Add
`dirtyStateKeys` to `EditorCommit`, add a state commit source, and
make keyed React hooks subscribe by descriptor key.

Cohorts and budgets:

| Cohort | Shape | Required budget |
| --- | --- | --- |
| normal | 0-500 blocks, 1-3 persisted fields, few annotations | title/settings edits wake zero body blocks |
| large | 2k-10k blocks, 10 state fields, 1k annotations | state patch cost is `O(changed fields)`, not `O(blocks + annotations)` |
| stress | 10k+ blocks, 50 state field keys, 10k annotations | body typing keeps `statePatches=[]`; title typing keeps dirty paths empty |
| pathological | megabyte JSON field or huge thread map | descriptor must provide `diff/applyPatch/invertPatch` or stay external |

Migration contract:

- old raw Slate input: `createEditor({ initialValue: children })`.
- single-root document-state input:
  `createEditor({ initialValue: { children, state } })`.
- multi-root input: `createEditor({ initialValue: { roots, state } })`.
- read canonical value: `state.value.get()` returns `{ roots, state? }`.
- read root content through root-bound helpers or `state.root('main')`.
- history migration: existing operation batches keep working; state patch
  batches add inverse patches beside inverted root-explicit operations.
- collab migration: adapters export ordered commit records containing
  operations plus state patches, with remote imports defaulting to local history
  skip unless metadata says otherwise.

Regression contract additions:

- state-only commit: no operation, no dirty path, no `childrenChanged`, one
  dirty state key.
- body-only commit: no state patches and no field subscriber wake.
- mixed commit: body operation plus state patch stay one undoable transaction
  when history policy says push/merge.
- `initialValue` compatibility: legacy `Element[]` input still works, but the
  runtime value is canonical `{ roots, state? }`.
- single-root and multi-root `initialValue` roundtrip: persisted descriptors
  serialize and deserialize only their own keys.

Score delta:

- React/runtime performance rises because keyed state dirtiness is now explicit,
  but it stays below closure score until React selector contracts exist.
- Slate-close DX rises because `initialValue` remains the single public
  construction option while runtime value stops pretending the document is only
  one `children` array.
- Migration and regression scores rise because the plan now has named
  compatibility and dirtiness contracts, not just a high-level proof matrix.

### Runtime Provider Pressure Pass - 2026-05-21

Status: complete for this activation only. The broader Ralplan lane remains
pending because handoff hardening and final gates are still runnable.

Evidence read:

- core runtime/view source:
  `.tmp/slate-v2/packages/slate/src/editor-runtime-view.ts:39` and `:58`.
- core public runtime/view types:
  `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts:590`.
- current React `<Slate>` provider:
  `.tmp/slate-v2/packages/slate-react/src/components/slate.tsx:89`, `:135`,
  `:233`, and `:259`.
- current selector bus:
  `.tmp/slate-v2/packages/slate-react/src/hooks/use-editor-selector.tsx:104`
  and `:213`.
- current single-editor hook and state-field hooks:
  `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-editor.ts:14` and
  `.tmp/slate-v2/packages/slate-react/src/hooks/use-state-field.ts:40`.
- current proof and example rows:
  `.tmp/slate-v2/packages/slate/test/editor-runtime-view-contract.ts:13`,
  `.tmp/slate-v2/packages/slate-react/test/state-field-selector-contract.tsx:25`,
  and `.tmp/slate-v2/site/examples/ts/document-state.tsx:333`.
- skill lenses applied: Vercel React rerender/subscription rules, performance
  cohort/budget/native-behavior rules, performance-oracle complexity checks,
  high-risk deliberate pass, and TDD vertical-slice discipline.

Pressure verdict:

- Keep `SlateRuntime` plus `<Slate root>`; it is the right public shape.
- Do not expose `SlateViewProvider`; that would add another provider noun when
  `<Slate>` already means "bind React children to an editor surface".
- Make `<Slate>` props XOR:
  - outside `SlateRuntime`: require `editor`.
  - inside `SlateRuntime`: accept `root`, defaulting to `main` for the 99%
    single-root runtime path.
  - reject `editor` plus `root` together.
- Allow `<Slate root readOnly>` to map to view-local `createEditorView`
  `readOnly`; `Editable readOnly` can still own DOM read-only presentation.
- Nested `SlateRuntime` providers are allowed and isolate their runtimes; a
  `<Slate root>` binds to the nearest runtime.

Performance:

- applicability: applied.
- Vercel rules used:
  `client-event-listeners`, `rerender-defer-reads`,
  `rerender-derived-state`, `rerender-split-combined-hooks`,
  `advanced-event-handler-refs`, and `advanced-use-latest`.
- extra rules used:
  `cohort-segmentation`, `repeated-unit-budget`, `rare-state-isolation`,
  `effect-subscription-budget`, `interaction-inp-matrix`,
  `memory-dom-tagging`, `react-19-runtime-proof`, and
  `editor-native-behavior-proof`.
- repeated units:
  root views, mounted blocks/leaves, state-field subscribers, runtime-level
  listeners, and cross-view selectors.
- cohorts:
  normal = one `main` root, 0-500 blocks, 1-3 fields;
  medium = header/main/footer, up to 2k body blocks, 10 fields;
  large = header/main/footer, 10k body blocks, 1k annotations;
  stress = 50k blocks, 50 fields, 10k comments/annotations, active collab;
  pathological = huge JSON field, custom renderers, heavy decorations, mobile
  IME.
- budgets:
  one editor subscription bridge per `SlateRuntime`; focus/focusout listeners
  deduped per runtime, not per root view; zero product comment payloads in
  repeated block props; root-view selectors filtered by root and dirty keys;
  state-field selectors wake only their field key.
- React/runtime primitives:
  use `useSyncExternalStore`-style selector boundaries and stable callback refs
  for long-lived subscriptions. React transitions/deferred values are allowed
  only for non-urgent side panels, previews, summaries, and diagnostics. They
  must not wrap visible typing, selection import/export, IME, or DOM text sync.
- interaction metrics:
  type in header, type in body, type in footer, title field typing, select in
  header then type in body, undo in header, undo title field, click body after
  title edit, remote title patch, remote header patch, copy/select-all per root,
  and placeholder mount/update.
- trace/CWV proof:
  React Performance Tracks and browser traces matter for provider fanout and
  interaction latency; load metrics are secondary because this is editor
  runtime behavior, not page startup.
- memory tags:
  runtime count, root view count, selector listener count, runtime listener
  count, document listener count, dirty root set size, dirty state key count,
  annotation/projection bucket count, DOM node count per root, and heap after
  repeated title/header/body edits.
- degradation contract:
  no native behavior degradation for normal/medium/large cohorts. Stress modes
  may add explicit opt-in degradation later, but this provider API cannot depend
  on virtualization or hidden editable content.
- dashboard/RUM gap:
  later implementation should tag `slate.runtimeId`, `root`, `interaction`,
  `blockCount`, `fieldCount`, `annotationCount`, `viewCount`, `browser`, and
  `inputMode`.

Regression proof additions:

| Behavior | Test owner | Expected proof |
| --- | --- | --- |
| provider shortcut | `packages/slate-react/test/slate-runtime-provider-contract.test.tsx` | `<SlateRuntime runtime><Slate /></SlateRuntime>` binds `main`; `<Slate root="header">` binds header. |
| prop boundary | same | `<Slate root>` outside runtime throws; `<Slate editor root>` throws; `<Slate editor>` outside runtime still works. |
| nearest runtime | same | nested `SlateRuntime` providers isolate root views and selectors. |
| listener budget | same | document focus listeners are deduped per runtime, not multiplied by header/body/footer views. |
| root selector isolation | same | body typing does not rerender header/footer root selectors or field-key subscribers. |
| cross-view hook | same | `useSlateViewState('header', selector)` updates from header commits and ignores body-only commits. |
| runtime state hook | same | `useSlateRuntimeState` reads state fields/history/collab metadata without binding to a root view. |
| read-only root | same | `readOnly` root view rejects `editor.update` through view hooks while writable root still edits. |
| placeholder locality | `playwright/integration/examples/multi-root-document.test.ts` | header/body/footer placeholder measurement never leaks across views. |
| focus locality | same | undo/redo and state-field edits from title/header do not steal focus into body. |
| native behavior | same | per-root select-all/copy/paste/follow-up typing stays native or explicitly model-backed. |

High-risk addendum:

| Failure | Consequence | Guard |
| --- | --- | --- |
| Naive React provider creates one selector bus per root view | header/body/footer edits broadcast too broadly | `SlateRuntime` owns the runtime selector bus; `<Slate root>` derives view state. |
| Naive focus listeners stay in every `<Slate>` | `#5537`-style focus bugs and listener fanout | dedupe document focus listeners per runtime; view focus is root-local state. |
| `<Slate root>` silently works without runtime | wrong editor binding and confusing DX | throw unless a runtime provider exists. |
| `<Slate editor root>` is accepted | two authorities for one provider | reject as invalid props. |
| Cross-view hook reads sibling React context | brittle provider topology | subscribe through runtime/root key only. |
| Multi-root example teaches comments in Slate state | bad architecture | keep comments external; use header/footer/title/settings only. |
| Placeholder measurement is keyed by editor singleton only | `#5117` repeats | key measurement by runtime plus root/view. |

TDD shape:

Use vertical slices:

1. Red/green `<SlateRuntime>` plus `<Slate root>` main/header binding.
2. Red/green prop boundary errors.
3. Red/green selector fanout for root views.
4. Red/green `useSlateRuntimeState` and `useSlateViewState`.
5. Red/green focus/listener budget.
6. Red/green multi-root browser example.

Next owner: runtime-provider-handoff-hardening.

## Applicable Skill Review Matrix

| Skill | Status | Result |
| --- | --- | --- |
| slate-ralplan | applied | latest API pass and final gates complete. |
| clawsweeper | applied cache-first | related issue set recorded; no `Fixes` claim; sync-note section added for reviewed surface. |
| major-task | applied | treated as public API/data-model architecture. |
| research-wiki | applied maintain | reused existing editor-architecture compiled lane; no new research page yet. |
| learnings-researcher | applied | relevant prior learnings: Yjs core contracts before package work, derived lint state should be snapshot-derived, projection logic split, history merge heuristics. |
| vercel-react-best-practices | applied | shared runtime provider must dedupe global listeners, avoid root-view over-subscription, keep callback refs stable, and defer only non-urgent side UI. |
| performance-oracle | applied | state patch cost must be `O(changed fields)`; root-view selector fanout must be `O(changed roots + changed fields)`, not `O(all roots * blocks)`. |
| performance | applied | repeated units are body blocks, root views, field selectors, runtime listeners, and annotation buckets; require keyed state/root dirtiness, cohort budgets, INP rows, and memory tags. |
| intent-boundary-pass | applied | scope/non-goals recorded. |
| steelman-pass | applied | maintainer objections expanded; raw Slate state-field substrate stays small, keyed, and extension-owned. |
| high-risk-deliberate-pass | applied | blast radius, proof gates, provider prop boundaries, focus/listener failure modes, rollback/remediation, and Ralph TDD order expanded. |
| tdd | applied to plan | Ralph must use vertical public-contract slices, not broad horizontal test writing. |
| ralph | prepared, not executed | Ralph-ready handoff is embedded below; no Slate v2 source edits start until the user explicitly invokes Ralph. |

## High-Risk Pre-Mortem

Trigger: public API plus persisted data-model plus history/collab change.

Blast radius:

| Surface | Files/packages | Risk |
| --- | --- | --- |
| Core public API | `packages/slate/src/interfaces/editor.ts`, `packages/slate/src/create-editor.ts` | canonical `Value`, `InitialValue`, descriptor typing, rooted operations, `EditorCommit`, runtime/view APIs, and state patches become public contracts. |
| Core transaction/runtime | `packages/slate/src/core/public-state.ts`, extension registry/runtime | state patches must rollback with failed transactions, publish ordered commits, and avoid broad dirtiness. |
| History | `packages/slate-history/src/history-extension.ts` | undo/redo batches must invert and replay mixed operation/state-patch commits without corrupting selection or body content. |
| React subscriptions | `packages/slate-react/src/hooks`, selector context, annotation/projection stores | title/settings changes must not rerender body blocks or annotation buckets. |
| Collaboration substrate | `packages/slate/test/collab-*`, future slate-yjs adapter | local/remote state patches need ordered export/import, origin metadata, and history skip defaults. |
| Examples/docs | site examples and Playwright example rows | examples must not teach hidden nodes, controlled `value`, or comments in raw Slate value. |
| Multi-root/shared runtime | `packages/slate/src/interfaces/editor.ts`, runtime/view internals, React DOM bridge | root identity must stay deterministic across operations, points/ranges, history, collab, and multiple editor views. |

Failure scenarios:

1. State patches become arbitrary app storage and raw Slate turns into a product
   framework.
   - mitigation: descriptor registry, explicit `persist/history/collab` policy,
     no product comment service in core.
2. History becomes slow because every field write snapshots large JSON.
   - mitigation: descriptor equality, patch deltas, per-key dirty classes,
     benchmark large metadata stores.
3. Collab adapters cannot reconcile state patches with document ops.
   - mitigation: commit record ordering, field descriptors with `shared/local/external`,
     fake collab adapter contracts before real Yjs package work.
4. State field writes wake the whole editor and kill typing responsiveness.
   - mitigation: `dirtyStateKeys`, descriptor-key subscriptions, render
     counter tests, and `rerender-breadth` benchmark.
5. The migration path makes the 99% single-root case noisy.
   - mitigation: keep `initialValue` as the input boundary, accept
     `{ children, state? }`, normalize once to canonical `{ roots, state? }`,
     and keep root-explicit details out of common transforms.
6. Root identity is added inconsistently and breaks selection/collab.
   - mitigation: add root to committed operations, `Point`, `Range`, refs, and
     dirty paths together; keep numeric `Path` root-local.

Verdict: keep, but split implementation into substrate, history, selector, and
example phases. Do not ship one giant API PR.

### High-Risk Deliberate Proof-Expansion Pass - 2026-05-20

Status: complete.

Evidence read:

- active plan after steelman pass.
- current Slate v2 scripts and gates in `.tmp/slate-v2/package.json`.
- package scripts in `.tmp/slate-v2/packages/slate/package.json`,
  `.tmp/slate-v2/packages/slate-history/package.json`, and
  `.tmp/slate-v2/packages/slate-react/package.json`.
- existing proof families under `.tmp/slate-v2/packages/slate/test`,
  `.tmp/slate-v2/packages/slate-history/test`,
  `.tmp/slate-v2/packages/slate-react/test`,
  `.tmp/slate-v2/playwright/integration/examples`, and
  `.tmp/slate-v2/scripts/benchmarks`.
- representative contracts:
  `.tmp/slate-v2/packages/slate/test/commit-metadata-contract.ts`,
  `.tmp/slate-v2/packages/slate/test/state-tx-public-api-contract.ts`,
  `.tmp/slate-v2/packages/slate/test/collab-adapter-extension-contract.ts`,
  `.tmp/slate-v2/packages/slate-history/test/history-contract.ts`,
  `.tmp/slate-v2/packages/slate-react/test/render-profiler-contract.test.tsx`,
  and `.tmp/slate-v2/packages/slate-react/test/annotation-store-contract.tsx`.

Ralph execution entry gates:

- The accepted public names for the first implementation pass are
  `defineStateField`, canonical `Value = { roots, state? }`, `InitialValue`,
  `state.getField`, `tx.setField`, root-explicit operations, root-aware
  `Point`/`Range`, `statePatches`, `dirtyStateKeys`, and source `'state'`.
- No implementation pass may add hidden nodes, controlled `value` wrappers, a
  product comment service, or shared node-object multi-editor support.
- Ralph should use vertical TDD slices. One failing public contract first, then
  the smallest implementation for that contract, then the next contract.
- Browser/examples wait until the core/history/react contracts compile and pass.

Expanded proof plan:

| Stage | Required new or expanded proof | Command from `.tmp/slate-v2` |
| --- | --- | --- |
| Core value/input | `packages/slate/test/create-editor-value-contract.ts`: `Element[]`, `{ children, state? }`, and `{ roots, state? }` all normalize to canonical `{ roots, state? }`; persisted field descriptors serialize only their own keys. | `bun test ./packages/slate/test/create-editor-value-contract.ts` |
| Rooted operations | `packages/slate/test/rooted-operation-contract.ts`: committed content operations include `root`; `Path` remains numeric; `Point`/`Range` carry root; transforms ignore unrelated roots. | `bun test ./packages/slate/test/rooted-operation-contract.ts` |
| Runtime/view split | `packages/slate/test/editor-runtime-view-contract.ts`: one runtime owns value/history/collab; views own root, selection, DOM bridge, focus, and read-only policy. | `bun test ./packages/slate/test/editor-runtime-view-contract.ts` |
| Core field/commit | `packages/slate/test/document-state-contract.ts`: state-only commit has no operations, no rooted dirty paths, one `dirtyStateKeys` entry; body-only commit has empty state patches. | `bun test ./packages/slate/test/document-state-contract.ts` |
| Patch guard | `packages/slate/test/document-state-patch-contract.ts`: large historyable/shared fields without `diff/applyPatch/invertPatch` are rejected or downgraded by explicit policy. | `bun test ./packages/slate/test/document-state-patch-contract.ts` |
| Commit metadata regression | Extend `packages/slate/test/commit-metadata-contract.ts` for mixed operation + state patch order, frozen metadata, tags, and source publication. | `bun test ./packages/slate/test/commit-metadata-contract.ts` |
| Public type contract | Extend `packages/slate/test/state-tx-public-api-contract.ts` and generic type tsconfig for `Value`, `InitialValue`, descriptor inference, rooted operations, and optional typed extension aliases. | `bun test ./packages/slate/test/state-tx-public-api-contract.ts && bun --filter slate typecheck` |
| History | `packages/slate-history/test/document-state-history-contract.ts`: title push, title typing merge, preference skip, mixed operation/state undo, redo, and remote import history skip. | `bun test ./packages/slate-history/test/document-state-history-contract.ts` |
| Collab substrate | Extend or add `packages/slate/test/collab-document-state-contract.ts`: local shared patch export, remote import with `history: skip`, local/external policy suppression, ordered mixed commit export. | `bun test ./packages/slate/test/collab-document-state-contract.ts` |
| React selector locality | `packages/slate-react/test/state-field-selector-contract.test.tsx`: `useStateFieldValue` wakes exact field selectors only; body typing wakes no field selector; title typing wakes no body runtime subscriber. | `cd packages/slate-react && bunx vitest run --config ./vitest.config.mjs test/state-field-selector-contract.test.tsx` |
| Annotation/comment boundary | Extend `packages/slate-react/test/annotation-store-contract.tsx`: comment data updates stay out of Slate value/history while anchors follow document edits. | `cd packages/slate-react && bunx vitest run --config ./vitest.config.mjs test/annotation-store-contract.test.tsx` |
| Browser example | Add `playwright/integration/examples/document-state.test.ts`: title input, body selection live, undo title vs body, remote state import no focus/scroll steal, two root views over one runtime. | `playwright test playwright/integration/examples/document-state.test.ts --project=chromium` |
| Performance | Extend existing benchmark families instead of inventing a one-off harness: core editor-state-field, rooted-operation-transform, history-retained-memory, collab-readiness, and React rerender breadth. | `bun bench:core:editor-state-field:local && bun bench:core:rooted-operation-transform:local && bun bench:core:history-retained-memory:local && bun bench:core:collab-readiness:local && bun bench:react:rerender-breadth:local` |
| Broad package gates | Package typecheck/test after focused contracts pass. | `bun --filter slate typecheck && bun --filter slate-history typecheck && bun --filter slate-react typecheck && bun test:vitest` |
| Release gate | Required before claiming implementation closure. | `bun check`, then `bun check:full` if examples/browser behavior changed |

Rollback and remediation:

- Before release, rollback is a hard cut: remove `defineStateField`,
  `statePatches`, rooted-operation/runtime-view public API, and the state-field
  hooks if the proof set fails. Do not ship a half-public API.
- If core field descriptors pass but history/collab fails, keep persisted field
  descriptors internal/experimental and default history/collab to `skip/local`
  until mixed commit replay is proven.
- If React locality fails, do not expose `useStateFieldValue`; keep field
  updates available through core and delay React examples.
- If large-field patching fails, keep whole-value patches only for small fields
  and reject `history: push|merge` plus `collab: shared` without descriptor
  patch hooks.
- If browser focus/scroll rows fail, state imports must default to
  `selection: { dom: 'preserve', focus: false, scroll: false }` and examples
  stay unpublished.

TDD order for Ralph:

1. `InitialValue` normalization to canonical `Value`.
2. root-explicit committed operations plus root-aware points/ranges.
3. runtime/view split for single-root shortcut and multi-root views.
4. state-only commit and body-only isolation.
5. mixed operation/state-patch commit ordering and metadata.
6. history push/merge/skip for document state fields.
7. collab export/import policy.
8. React descriptor-key selector hook.
9. example/browser proof.
10. benchmark and broad gates.

Verdict: keep and split. The plan is ready for a later Ralph implementation
handoff only after the revision/handoff pass removes remaining wording drift and
packages these proof rows as ordered implementation work.

## Maintainer Objection Ledger

| Decision | Strongest fair objection | Best antithesis | Chosen answer | Proof required | Verdict |
| --- | --- | --- | --- | --- | --- |
| Add persisted state fields beside `children` | "This turns Slate into an app-state framework." | Raw Slate should stay a content editor; apps already have Redux/Zustand/server stores for titles/settings. | Keep only descriptor, transaction, snapshot, history, collab, and dirtiness substrate. Product helpers, thread services, permissions, and domain schemas stay outside core. | Extension descriptor contract, no built-in product stores, docs showing title/settings only as examples. | keep |
| Use `statePatches` instead of hidden nodes | "Operations are Slate's replay law; a second mutation stream is dangerous." | Extend `Operation` with `set_state` so history/collab stay one stream. | Keep `Operation` content/selection focused. Make `EditorStatePatch` an ordered commit record with descriptor-owned apply/invert. Collab adapters can flatten commit records into one transport stream without pretending state is a node op. | Unit contract for ordered mixed commits and history inversion. | keep, with replay invariants |
| Canonical `Value = { roots, state? }` with `InitialValue` convenience | "This makes the normal one-root editor pay for multi-root." | Keep runtime `Value = Element[]` and add a separate multi-root mode later. | A union runtime value would poison operations/history/collab. Canonical roots give one replay shape; `InitialValue` keeps the 99% case concise with `{ children, state? }`. | Value normalization, rooted operation, collab export/import, and editor view tests. | keep |
| Generic `state.getField` / `tx.setField` API | "This is less nice than `tx.documentMeta.setTitle()`." | Require extensions to expose named state/tx groups for every field. | Generic descriptor access is the raw substrate. Extensions may expose typed aliases through existing `state` and `tx` extension groups, but raw Slate examples should first show the generic shape so core does not grow product verbs. | Type inference contract for descriptor get/set and optional extension group alias. | keep, with optional aliases |
| `useStateFieldValue(field, selector)` | "Another React hook duplicates `useEditorState`." | Make users pass `shouldUpdate` to `useEditorState`. | A broad selector hook is too easy to misuse. A field-key hook bakes in keyed subscription and equality. `useEditorState` remains broad; field selectors use state dirtiness. | Render-count test proving title typing wakes the title hook and not body blocks. | keep |
| `dirtyStateKeys` and `'state'` source | "A new dirtiness class complicates commits." | Reuse `'external'` or `dirtyScope: all`. | Reusing `'external'` is semantically wrong and `dirtyScope: all` is a perf bug. Add keyed state dirtiness; source-level notification alone is insufficient without a field key. | Source subscription contract for `commit`, `'state'`, and descriptor-key listeners. | keep |
| Descriptor `diff/applyPatch/invertPatch` hooks | "Patch hooks are too much API for title/settings." | Always snapshot previous/next values. | Small fields can use whole-value previous/next. Large historyable/collaborative fields must provide descriptor patch hooks or remain external. This keeps normal DX small and prevents megabyte undo entries. | Pathological-field test requiring either patch hooks or history/collab rejection. | revise descriptor docs |
| Document title history defaults | "Undoing title changes with body edits could surprise users." | Default every non-node field to history `skip`. | User-visible document state should be undoable by default. Continuous title input uses transaction metadata `merge`; app preferences and comments default to `skip`. | History push/merge/skip tests for document title, settings, and preference field. | keep |
| Comments external by default | "Comments are document state too." | Put comments in persisted fields so snapshots are complete. | Comment anchors may be document-adjacent, but thread lifecycle, permissions, audit, and remote service data are product-owned. Raw Slate should support external anchored stores and optional app-defined persisted anchor fields, not ship a comment model. | Example split: external comments plus persisted document title/settings. | keep |
| Root-explicit operations and root-aware points/ranges | "This is a lot of payload for single-root editors." | Put the root key inside `Path` or keep paths global. | Numeric Slate paths stay root-local; committed ops carry root only for replay/history/collab. Single-root transforms default root from the view. | Operation transform, point/range, path-ref, dirty-path, history, and collab contracts. | keep |
| Editor runtime/view split | "This sounds like a framework abstraction." | Keep one editor instance per surface and coordinate externally. | Shared history needs one document runtime with multiple root-bound views; shared node identity is misuse and collides with #6016. `createEditor(...)` remains the 99% shortcut. | Runtime/view tests plus browser proof with two views over one runtime. | keep |

### Steelman Maintainer-Objection Pass - 2026-05-20

Status: complete.

Evidence read:

- active plan sections for public API, internal runtime, perf contracts, history,
  persistence/collab, comments, multi-root, and pass ledger.
- current Slate v2 extension slots:
  `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts:1299`,
  `:1310`, `:1367`, `:1461`, and `:1554`, plus commit listener setup in
  `.tmp/slate-v2/packages/slate/src/core/editor-extension.ts:584`.
- `steelman-pass` and `high-risk-deliberate-pass` rules.

Accepted revisions:

- Keep generic `state.getField` / `tx.setField` as the raw substrate, but explicitly
  allow extensions to expose typed `state` / `tx` aliases through the existing
  extension group system. Do not make product verbs part of core.
- Treat `statePatches` as ordered commit records with replay invariants, not as
  arbitrary app events. History/collab adapters may flatten them into transport
  events, but core should not widen `Operation` until a separate operation-law
  decision proves that is better.
- Make `'state'` a source class plus descriptor-key subscriptions. A
  source-only listener is still too broad.
- Keep `diff/applyPatch/invertPatch` advanced and optional. If a field is large
  and wants history or shared collab, descriptor patch hooks are required;
  otherwise the field stays local/external or whole-value only.

Dropped alternatives:

- no runtime union `Value`.
- no canonical runtime `Value = { children, state }`.
- no `initialDocument`.
- no hidden root/header/title nodes.
- no generic custom `Operation` escape hatch in this plan.
- no reuse of `'external'` for document state patches.
- no global `dirtyScope: all` for state field writes.

Deferred implementation choices:

- exact view creation export names may still be adjusted, but the target split
  is runtime owns document state/history/collab and view owns root/selection/DOM.
- whether the descriptor factory should auto-create typed extension aliases is
  an implementation-phase TypeScript ergonomics question, not an architecture
  blocker.

### State-Field Maintainer Objection And Risk Pass - 2026-05-20

Status: complete for this activation only. The broader Ralplan lane remains
pending because final gates still have to audit every pass row, state file, and
handoff boundary.

Evidence read:

- current final authority, state-field proof rows, performance/DX contract,
  high-risk proof plan, maintainer objection ledger, and Ralph-ready handoff.
- active completion and continuation files under
  `.tmp/019e3627-238b-7993-a8cf-26be45504c47/`.

Maintainer-risk decisions:

| Risk | Decision | Reason |
| --- | --- | --- |
| Raw Slate becomes an app-state framework | keep state fields, with product stores excluded | field descriptors cover document-owned title/settings; comments, permissions, audit trails, and product services stay external. |
| Public API feels less direct than `setTitle` | keep generic `state.getField` / `tx.setField` as raw substrate | extensions may expose typed aliases, but raw Slate should not ship product verbs. |
| Field patches split replay law from operations | keep `statePatches` in ordered commits, not `Operation` | operations remain content/selection law; history/collab consume commit records containing operations plus state patches. |
| React selectors wake too broadly | keep `dirtyStateKeys` and field-key subscriptions | source-only listeners or `dirtyScope: all` are rejected as perf bugs. |
| Large field history/collab payloads explode | keep patch hooks optional but required for large shared/history fields | small scalar fields can use previous/next values; large fields must provide patch/apply/invert hooks or stay local/external. |
| Jotai inspiration leaks into Slate naming | keep `state field`, reject public `atom` naming | the borrowed idea is descriptor granularity, not Jotai branding. |
| Header/footer/multi-editor pressure overloads state fields | keep roots in canonical `Value`, not in state fields | editable regions are content roots, not metadata; state fields remain document/root metadata, not hidden content. |

Score result:

- React/runtime and DX remain strong because field-key dirtiness,
  `InitialValue`, and canonical `{ roots, state? }` now align through the proof
  plan.
- Risk stays below closure until final gates verify pass rows, continuation
  state, PR non-claim text, and handoff boundaries.
- Current capped score: 0.92 after the React runtime-provider closure pass.

Next owner: Ralph only when the user invokes it.

## Hard Cuts

- cut hidden nodes for title/settings.
- cut comment/thread metadata inside raw Slate value by default.
- cut same-node-object multi-editor sharing.
- cut React state as the authoritative durable state for document metadata.
- cut unkeyed global dirty notifications for state field changes.
- cut `initialDocument`.
- cut runtime union `Value`.
- cut root keys inside numeric `Path`.

## Implementation Phases

1. Canonical value and input normalization.
   - owner: `.tmp/slate-v2/packages/slate`.
   - gate: `InitialValue` normalization and canonical `Value` contracts.
2. Rooted content model.
   - owner: `.tmp/slate-v2/packages/slate`.
   - gate: root-explicit operations, root-aware points/ranges, refs, dirty
     paths, history/collab replay contracts.
3. Runtime/view split.
   - owner: `.tmp/slate-v2/packages/slate` and `.tmp/slate-v2/packages/slate-react`.
   - gate: single-root `createEditor` shortcut plus advanced runtime/view tests.
4. Core state field descriptors and transaction state patches.
   - owner: `.tmp/slate-v2/packages/slate`.
   - gate: focused core tests from `.tmp/slate-v2`.
5. History patch batching.
   - owner: `.tmp/slate-v2/packages/slate-history`.
   - gate: undo/redo state patch contracts.
6. Snapshot persistence API.
   - owner: `.tmp/slate-v2/packages/slate`.
   - gate: serialize/deserialize roundtrip.
7. Collab adapter contract.
   - owner: `.tmp/slate-v2/packages/slate`.
   - gate: fake adapter export/import tests.
8. React selector/subscription support.
   - owner: `.tmp/slate-v2/packages/slate-react`.
   - gate: field-key subscriber locality tests.
9. Examples/docs.
   - owner: site/docs after API stabilizes.
   - gate: title/settings example plus external comments and multi-root view
     examples.

## Fast Driver Gates

- planning state: `node tooling/scripts/completion-check.mjs` from
  `/Users/zbeyens/git/plate-2` once the lane is eligible for closure.
- core source gate: targeted `.tmp/slate-v2` package tests for document state.
- history gate: targeted `.tmp/slate-v2` history tests.
- react gate: targeted `.tmp/slate-v2` slate-react selector tests.
- broad gate before implementation closure: `.tmp/slate-v2` `bun check`, then
  the relevant focused browser/integration rows if React/browser examples change.

## Confidence Scorecard

Current reopened score: 0.92. The previous state-field/rooted-runtime plan
remains strong, and the React multi-root provider now has issue, performance,
DX, migration, regression, high-risk pressure rows, implementation proof, and
browser proof. The lane is closed as implemented; no fixed/improved issue count
is changed by this closure pass.

| Dimension | Weight | Score | Evidence |
| --- | ---: | ---: | --- |
| React 19.2 runtime performance | 0.20 | 0.90 | keyed state dirtiness, descriptor-key subscriptions, rooted dirty paths, runtime/view separation, provider-level listener dedupe, root-view selector budgets, cohort rows, render-count tests, browser row, rerender-breadth benchmark gate, rollback rule, focused provider tests, and multi-root browser proof recorded. |
| Slate-close unopinionated DX | 0.20 | 0.94 | keeps `initialValue` as the only creation input, preserves `children` as the 99% input shape, hard-breaks runtime `Value` to canonical roots, uses `state.getField` / `tx.setField`, keeps `<Slate>` as the view provider, enforces prop XOR, and permits optional typed extension aliases without core product verbs. |
| Plate/slate-yjs migration backbone | 0.15 | 0.93 | canonical roots, root-explicit operations, state patches, ordered commit records, replay invariants, rollback policy, shared runtime/multiple view policy, history/collab gate, fake adapter route, and PR non-claim sync are explicit. |
| Regression-proof testing | 0.20 | 0.91 | named core/history/react/collab/browser/benchmark contracts include value normalization, rooted operations, root-aware points/ranges, runtime/view split, state-only, body-only, mixed, patch-hook, source-subscription, focus/scroll, provider prop boundaries, listener budget, cross-view hooks, placeholder locality, browser root workflows, and release-gate rows. |
| Research evidence completeness | 0.15 | 0.93 | compiled lane, local raw ProseMirror/Lexical/Tiptap source/docs, Context7 official-doc check, current Slate v2 source refresh, current issue ledger sync, and PR-reference sync audit. |
| shadcn-style composability/minimal hooks | 0.10 | 0.93 | generic descriptor API keeps core minimal while existing extension groups can expose optional typed aliases; runtime/view split keeps UI surfaces out of core state fields; public `SlateViewProvider` is rejected, `<Slate>` stays the view provider, and prop XOR keeps the provider API small. |

Weighted total: 0.92. The plan is closed as implementation-complete.

## Pass State Ledger

Stop-hook note: `.tmp/019e3627-238b-7993-a8cf-26be45504c47/completion-check.md`
is `status: done` for this lane. A future reopened pass must set it back to
`pending` before doing work.

| Pass | Status | Evidence added | Plan delta | Open issues | Next owner |
| --- | --- | --- | --- | --- | --- |
| runtime-provider-and-multi-root-example-current-state | complete | live source read: `.tmp/slate-v2/packages/slate/src/editor-runtime-view.ts`, `.tmp/slate-v2/packages/slate-react/src/components/slate.tsx`, `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-editor.ts`, `.tmp/slate-v2/site/examples/ts/document-state.tsx`, research index/log, live issue ledger, v2 sync ledger, PR reference | reopened lane; accepted `SlateRuntime` as optional common provider, kept public `<Slate>` as view provider, rejected public `SlateViewProvider`, added `useSlateRuntimeState`, `useSlateViewState`, and separate multi-root example target | issue/reference sync not run in this activation; no fixed/improved issue claim | related-issue-discovery |
| related-issue-discovery | complete | cache-first scan of live ledger, v2 sync ledger, coverage matrix, fork dossier, open-issue dossiers, and PR reference for `#6016`, `#5537`, `#5117`, `#4612`, `#4477`, `#4483`, `#3383`, `#5515`, `#3741`, `#3715`, and `#3482` | synced provider API non-claim text; added `#5117` fork-dossier section; kept fixed/improved counts unchanged | provider/example proof still pending by design | runtime-provider-pressure-pass |
| runtime-provider-pressure-pass | complete | live source read for core runtime/view, React `<Slate>`, selector bus, state-field hooks, current core/react tests, and document-state example; Vercel React, performance, performance-oracle, high-risk, and tdd lenses applied | added prop XOR policy, listener/subscription budgets, cohort/memory/INP rows, high-risk failure guards, and vertical red-test order for `SlateRuntime`, `<Slate root>`, cross-view hooks, and multi-root example | handoff still needs one hardening pass before final gates | runtime-provider-handoff-hardening |
| runtime-provider-handoff-hardening | complete | Ralph-ready handoff, implementation slices, first red tests, required commands, issue sync, and stop rules read and updated | hardened objective, scope lock, accepted target, slice 9/10 requirements, prop-boundary/browser proof rows, issue surface, and stop rules for the runtime provider API | final gates still need to audit state, references, and pass rows | closure-score-final-gates-runtime-provider |
| closure-score-final-gates-runtime-provider | complete | audited plan top state, scorecard, pass ledger, completion state, continue prompt, issue sync ledger, coverage matrix, fork dossier, PR reference, and Ralph-ready handoff | closed the architecture review as Ralph-ready before implementation; later Ralph rows close the source lane as implemented; no issue count change | none | react-runtime-provider-contract |
| current-state read | complete | live source, research, solution, issue-ledger rows cited above | created plan and target shape | none blocking | related-issue-discovery |
| related issue discovery | complete | cache-first live/sync/fork/matrix rows plus sync-note override | no new `Fixes` claim; reviewed surface classified | row-level rewrite decision handed to issue-ledger pass | issue-ledger-pass |
| issue-ledger pass | complete | full ledger, cluster, test, benchmark, package, requirements, matrix, dossier, and PR-reference scan | kept sync-note override; added `#4612` adjacent-state boundary; no count or PR-reference change | none for this pass | research/ecosystem-refresh |
| intent/boundary | complete | scope/non-goals recorded | target narrowed | none | decision brief hardening |
| research/ecosystem | complete | compiled research, local raw ProseMirror/Lexical/Tiptap docs/source, Context7 official-doc check, and current Slate v2 source refresh | strategy table strengthened; rejected Lexical RootNode metadata as Slate target; no new research page needed | none for this pass | performance-dx-migration-regression-pressure |
| performance/DX/migration/regression | complete | current source paths plus performance rules read; `initialDocument`, keyed dirtiness, cohorts, budgets, and regression contracts added | removed bad `value: { children, state }` draft; added `dirtyStateKeys`, state source, and descriptor diff pressure | no implementation proof yet | steelman-maintainer-objection |
| steelman maintainer-objection | complete | current extension slot source plus steelman/high-risk skill rules read | added detailed objection ledger; accepted optional typed extension aliases, replay invariants, descriptor-key subscriptions, and patch-hook constraints | none for this pass | high-risk-deliberate-proof-expansion |
| high-risk deliberate proof expansion | complete | `.tmp/slate-v2` package scripts, test families, benchmark scripts, representative contracts, and high-risk/tdd rules read | expanded blast radius, proof gates, rollback/remediation, Ralph entry gates, and vertical TDD order | implementation proof still pending by design | revision-and-handoff-hardening |
| revision and handoff hardening | complete | plan, completion state, continuation prompt, issue ledgers, PR reference, and Ralph skill read | added Ralph-ready handoff, locked public API names, synced PR reference as non-claim, raised score to threshold | none | closure-score-final-gates |
| closure-score/final-gates | complete | requirement audit, state file sync, continuation sync, PR non-claim check, issue-sync check, learning check | closed plan as Ralph-ready; no source implementation started | none | Ralph only when user invokes it |
| jotai atom granularity current-state read | complete | current plan/source, solution notes, Context7 Jotai atom/store/select/focus/split docs | reopened API target around `defineEditorStateField`, `initialDocument.state`, `state.fields`, `tx.fields`, `dirtyStateKeys`, and source `'state'` | follow-up passes must reconcile store wording, issue impact, objections, and final gates | related-issue-discovery |
| state-field related issue/reference sync | complete | live issue rows, v2 sync ledger, coverage matrix, PR reference non-claim section | no new issue counts; synced PR reference and v2 sync note to state-field API | none | issue-ledger-pass |
| state-field issue-ledger pass | complete | live rows, sync note, frozen corpus, cluster rows, fork dossier, coverage matrix, and PR reference read; `#4612` matrix note tightened | no count changes; PR reference and sync ledger stay non-claim; state-field pressure set confirmed | none for this pass | state-field terminology/handoff hardening |
| state-field terminology/handoff hardening | complete | active plan authority, proof rows, high-risk proof plan, maintainer objection ledger, Ralph-ready handoff, and previous store-based handoff read | current API/proof/handoff wording moved to state-field vocabulary; remaining store wording is external/source/historical only | none for this pass | state-field maintainer objection and risk pass |
| state-field maintainer objection and risk pass | complete | final authority, proof rows, performance/DX contract, high-risk proof plan, maintainer objection ledger, Ralph-ready handoff, and state files read | kept state fields, `statePatches`, `dirtyStateKeys`, field-key subscriptions, optional typed aliases, patch-hook guard, external comments, and deferred multi-root/shared-runtime scope | none for this pass | closure-score-final-gates-state-field-final |
| closure-score/final-gates-state-field-final | complete | plan top, final authority, pass ledger, Ralph-ready handoff, completion state, continue prompt, PR reference, sync ledger, and coverage matrix read | closed lane as Ralph-ready; no `.tmp/slate-v2` implementation claim or issue count change | none | Ralph only when user invokes it |
| latest-api authority refresh | complete | current user decision chain, active plan, live Slate v2 operation/value source, and stale completion/continue state read | current authority now uses `defineStateField`, canonical `Value = { roots, state? }`, `InitialValue`, `state.getField`, `tx.setField`, rooted operations, root-aware points/ranges, and runtime/view split | closed by later issue/reference/proof sync | issue-reference-and-proof-sync-latest-api |
| issue-reference-and-proof-sync-latest-api | complete | PR reference, v2 sync ledger, issue coverage matrix, active proof rows, and Ralph handoff read | synced non-claim PR note, `#4612` coverage row, sync ledger, proof commands, and final summary to latest API names | none; no fixed/improved count change | closure-score-final-gates-latest-api-final |
| closure-score-final-gates-latest-api-final | complete | plan top, authority, scorecard, pass ledger, final handoff, completion state, continue prompt, PR reference, sync ledger, and coverage matrix read | closed latest-API lane as Ralph-ready; no `.tmp/slate-v2` implementation claim or issue count change | none | Ralph only when user invokes it |
| state-field-policy-shorthand-dx | complete | current authority, public API target, runtime descriptor type, history policy, Ralph handoff, and final summary read | changed `history`/`collab` examples and descriptor type to shorthand-first DX with object policy escape hatches | none; no issue/reference count change | closure-score-final-gates-state-field-policy-shorthand |
| closure-score-final-gates-state-field-policy-shorthand | complete | plan top, authority, policy type, handoff, final summary, completion state, and continue state read | closed policy-shorthand update; no `.tmp/slate-v2` implementation claim | none | Ralph only when user invokes it |
| ralph tdd canonical value/initialvalue | complete | red: `bun test ./packages/slate/test/create-editor-value-contract.ts` failed on object `initialValue`; green: `bun test ./packages/slate/test/create-editor-value-contract.ts ./packages/slate/test/state-tx-public-api-contract.ts`, `bun test ./packages/slate/test`, `bun --filter slate typecheck`, `bun --filter slate-dom typecheck`, `bun --filter slate-react typecheck`, and `bun lint:fix` passed | added first runtime normalization slice for legacy children, `{ children, state }`, and `{ roots, state }`; `state.value.get()` now returns canonical rooted value; PR reference synced as non-claim first-slice proof | full plan remains pending; rooted operations are next | rooted-operation-contract |
| ralph rooted-operation-contract | complete | red: `bun test ./packages/slate/test/rooted-operation-contract.ts` failed because committed `insert_text` lacked `root` and a header `Point` transformed against a main-root operation; green: `bun test ./packages/slate/test/rooted-operation-contract.ts ./packages/slate/test/create-editor-value-contract.ts ./packages/slate/test/state-tx-public-api-contract.ts`, `bun test ./packages/slate/test`, `bun --filter slate typecheck`, `bun --filter slate-dom typecheck`, `bun --filter slate-react typecheck`, and `bun lint:fix` passed | added root-stamped content operations, root-local `Point`/`Range` transforms, root-preserving selection clone, and tightened `NodeIn<V>` so editor objects do not leak into node transform generics | full plan remains pending; runtime/view split is next | editor-runtime-view-contract |
| ralph editor-runtime-view-contract | complete | red: `bun test ./packages/slate/test/editor-runtime-view-contract.ts` failed because `createEditorRuntime` and `createEditorView` were missing; green: `bun test ./packages/slate/test/editor-runtime-view-contract.ts ./packages/slate/test/rooted-operation-contract.ts ./packages/slate/test/create-editor-value-contract.ts ./packages/slate/test/state-tx-public-api-contract.ts`, `bun test ./packages/slate/test`, `bun --filter slate typecheck`, `bun --filter slate-dom typecheck`, `bun --filter slate-react typecheck`, and `bun lint:fix` passed | added `createEditorRuntime`, `createEditorView`, `state.view`, view-local root/focus/read-only policy, and root-bound read/update facades over one runtime editor | full plan remains pending; document state fields are next | document-state-contract |
| ralph document-state-contract | complete | red: `bun test ./packages/slate/test/document-state-contract.ts` failed because `defineStateField` was missing; green: `bun test ./packages/slate/test/document-state-contract.ts ./packages/slate/test/editor-runtime-view-contract.ts ./packages/slate/test/rooted-operation-contract.ts ./packages/slate/test/create-editor-value-contract.ts ./packages/slate/test/state-tx-public-api-contract.ts`, `bun test ./packages/slate/test`, `bun --filter slate typecheck`, `bun --filter slate-dom typecheck`, `bun --filter slate-react typecheck`, and `bun lint:fix` passed | added `defineStateField`, state-field descriptor types, persisted initial state registration, and `state.getField(field)` | full plan remains pending; state patch writes are next | document-state-patch-contract |
| ralph document-state-patch-contract | complete | red: `bun test ./packages/slate/test/document-state-patch-contract.ts` failed because `tx.setField` was missing, then failed because large shared/history fields lacked a patch-hook guard; green: `bun test ./packages/slate/test/document-state-patch-contract.ts ./packages/slate/test/document-state-contract.ts ./packages/slate/test/editor-runtime-view-contract.ts ./packages/slate/test/rooted-operation-contract.ts ./packages/slate/test/create-editor-value-contract.ts ./packages/slate/test/state-tx-public-api-contract.ts`, `bun test ./packages/slate/test`, `bun --filter slate typecheck`, `bun --filter slate-dom typecheck`, `bun --filter slate-react typecheck`, and `bun lint:fix` passed | added `tx.setField`, `EditorCommit.statePatches`, `dirtyStateKeys`, `StateFieldDescriptor` patch hooks, `'state'` source publication, rollback-safe state writes, and a large shared/history patch-hook guard | full plan remains pending; state history is next | document-state-history-contract |
| ralph document-state-history-contract | complete | red: `bun test ./packages/slate-history/test/document-state-history-contract.ts` failed because `state.history.undos()` stayed empty after a state-only title commit; green: `bun test ./packages/slate-history/test/document-state-history-contract.ts`, `bun test ./packages/slate-history/test/index.spec.ts ./packages/slate-history/test/history-contract.ts ./packages/slate-history/test/integrity-contract.ts ./packages/slate-history/test/document-state-history-contract.ts`, `bun test ./packages/slate/test`, `bun --filter slate typecheck`, `bun --filter slate-history typecheck`, `bun --filter slate-dom typecheck`, `bun --filter slate-react typecheck`, and `bun lint:fix` passed | added `Batch.statePatches`, internal `applyStatePatches`, state-only undo/redo replay through historic operation-free commits, and stale rooted-operation expectations in history integrity tests | full plan remains pending; collab state transport is next | collab-document-state-contract |
| ralph collab-document-state-contract | complete | red: `bun test ./packages/slate/test/collab-document-state-contract.ts` failed on missing `tx.statePatches.replay`, then on missing `Editor.getCollabStatePatches`; green: `bun test ./packages/slate/test/collab-document-state-contract.ts`, `bun test ./packages/slate/test/collab-adapter-extension-contract.ts ./packages/slate/test/collab-history-runtime-contract.ts ./packages/slate/test/collab-canonical-reconcile-contract.ts ./packages/slate/test/collab-bookmark-position-contract.ts ./packages/slate/test/collab-selection-stress-contract.ts ./packages/slate/test/collab-document-state-contract.ts`, `bun test ./packages/slate/test`, `bun --filter slate typecheck`, `bun --filter slate-history typecheck`, `bun --filter slate-dom typecheck`, `bun --filter slate-react typecheck`, and `bun lint:fix` passed | added low-level `tx.statePatches.replay` for remote imports and `Editor.getCollabStatePatches` so adapters export only `collab: 'shared'` field patches | full plan remains pending; React state-field selector hooks are next | state-field-selector-contract |
| ralph state-field-selector-contract | complete | red: `bun --filter slate-react test:vitest -- state-field-selector-contract.test.tsx` failed because `useStateFieldValue` was missing; broad provider hook run also exposed stale canonical-value assertions and a real `state.nodes.children()` root bug; green: `bun --filter slate-react test:vitest -- state-field-selector-contract.test.tsx`, `bun --filter slate-react test:vitest -- provider-hooks-contract.test.tsx state-field-selector-contract.test.tsx`, `bun --filter slate-react test:vitest`, `bun test ./packages/slate/test`, `bun test ./packages/slate/test/create-editor-value-contract.ts ./packages/slate/test/collab-document-state-contract.ts`, `bun --filter slate typecheck`, `bun --filter slate-react typecheck`, `bun --filter slate-dom typecheck`, `bun --filter slate-history typecheck`, and `bun lint:fix` passed | added `useStateFieldValue`, `useSetStateField`, field-dirty selector filtering, a setter through `tx.setField`, root `state.nodes.children()` support, and React provider test updates for canonical `state.value.get()` | full plan remains pending; browser/example proof is next | browser-example-proof |
| ralph browser-example-proof | complete | red: `PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/document-state.test.ts --project=chromium` first failed because stale examples treated canonical `state.value.get()` as raw children, then failed because `openExample` selected the title textbox instead of the Slate editable; green: `bun typecheck:site`, `PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/document-state.test.ts --project=chromium`, `dev-browser --connect http://127.0.0.1:9222` against `http://localhost:3100/examples/document-state` with screenshot `/Users/zbeyens/.dev-browser/tmp/slate-document-state.png`, `bun --filter slate-react typecheck`, `bun --filter slate typecheck`, `bun typecheck:root`, and `bun lint:fix` passed | added the `Document State` example using `defineStateField`, `initialValue: { children, state }`, `useStateFieldValue`, `useSetStateField`, `tx.history.undo/redo`, and `tx.statePatches.replay`; fixed stale site examples to read body children from `state.runtime.snapshot().children` or `tx.nodes.children()` instead of canonical `state.value.get()` | full plan remains pending; performance/release gates are next | performance-release-gates |
| ralph performance-release-gates | complete | missing-script classification: `bun run bench:core:editor-state-field:local` and `bun run bench:core:rooted-operation-transform:local` are not defined in current `package.json`; green gates: `bun bench:core:editor-store:local`, `bun bench:core:history-retained-memory:local`, `bun bench:core:collab-readiness:local`, `bun bench:react:rerender-breadth:local`, `bun test:bun`, `bun test:vitest`, and `bun check` passed | repaired stale benchmark harnesses from removed `withHistory`/`register`/`commitListeners` APIs to current `history()` and `setup/onCommit`; changed root `test` to explicit Bun-owned packages plus Vitest so root check no longer runs browser-only/Vitest files under Bun; updated stale canonical-value tests to read body children from runtime snapshots or node APIs | full plan remains pending; final gates are next | final-gates |
| ralph final-gates | complete | audited plan top status, pass ledger, completion state, continuation prompt, PR reference, browser evidence, benchmark evidence, and final `bun check` evidence | marked execution lane done; missing state-field/rooted-operation benchmark scripts remain recorded as future harness coverage, not release proof; no fixed/improved issue count changed | none | none |
| ralph react-runtime-provider-contract | complete | red/green `cd packages/slate-react && bunx vitest run --config ./vitest.config.mjs test/slate-runtime-provider-contract.test.tsx`; `bun --filter slate-react typecheck`; `bun --filter slate typecheck`; `bun lint:fix` | added `SlateRuntime`, `useSlateRuntime`, `useSlateRuntimeState`, `useSlateViewState`, root-bound `<Slate>`, provider-boundary errors, runtime selector/listener bridge, and root-local view reads | multi-root browser proof remained pending at this point | multi-root-example-browser-proof |
| ralph multi-root-example-browser-proof | complete | `PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/multi-root-document.test.ts --project=chromium`; `dev-browser --connect http://127.0.0.1:9222` against `http://localhost:3100/examples/multi-root-document` | added the multi-root document example, active-root editing model, root-local selection ownership, rooted `set_selection`, inactive-root export guards, and route/sidebar wiring | none | final-gate-sync-runtime-provider |
| final-gate-sync-runtime-provider | complete | `bun check`, focused multi-root Playwright, focused provider/core tests, focused slate-react regression tests, `bun lint:fix`, and `dev-browser` proof | synced plan top, completion state, and continuation prompt to implementation-complete; no issue count change | none | none |
| header-focus-regression | complete | red then green: `PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/multi-root-document.test.ts --project=chromium -g "focuses the header editor"`; green full file: `PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/multi-root-document.test.ts --project=chromium`; green `bun lint:fix`; green `bun typecheck:site`; green `dev-browser --connect http://127.0.0.1:9222` label-click proof; learning captured in `docs/solutions/ui-bugs/2026-05-21-slate-v2-multi-root-chrome-clicks-must-activate-root-before-focus.md` | root chrome clicks now activate the root, make the root editable before focus handling, focus the editable, and put follow-up typing in the header | none | none |

## Ralph-Ready Handoff

Use this only after the user explicitly invokes `[$ralph]`. Slate Ralplan does
not edit `.tmp/slate-v2` source.

### Objective

Implement Slate v2's latest editor value architecture: canonical rooted
`Value`, ergonomic `InitialValue`, atom-like state fields, root-explicit content
operations, one document runtime with root-bound editor views, and the React
runtime-provider API for multi-root examples. Document title/settings are state
fields. Header/footer/global editable regions are roots. Comments remain
external anchored stores by default.

### Scope Lock

Allowed implementation owners in `.tmp/slate-v2`:

- `packages/slate/src/interfaces/editor.ts`
- `packages/slate/src/interfaces/operation.ts`
- `packages/slate/src/create-editor.ts`
- `packages/slate/src/core/public-state.ts`
- `packages/slate/src/core/editor-extension.ts` only if field descriptor
  registration needs extension setup support.
- root-aware transform/location helpers touched by `Point`, `Range`, and
  operation replay.
- `packages/slate-history/src/history-extension.ts`
- `packages/slate-react/src/components/slate.tsx`
- `packages/slate-react/src/hooks/**` and selector/subscription support.
- `packages/slate-react/src/index.ts` only for public React exports.
- `site/examples/ts/document-state.tsx` only for keeping the focused
  single-root state-field example current.
- a separate site example for the multi-root/header-footer provider API.
- focused tests and examples named in the proof plan.

Forbidden in the first Ralph pass:

- hidden title/settings/header/footer nodes.
- runtime `Value` as `Element[]`, a union, or `{ children, state }`.
- root keys inside numeric `Path`.
- product comment/thread services in raw Slate.
- shared node object identity across editors.
- generic custom-operation escape hatches.
- global `dirtyScope: all` for state field writes.
- public `atom` naming in raw Slate.
- public `SlateViewProvider`.
- `<Slate root>` without `SlateRuntime`.
- `<Slate editor root>` with two competing authorities.

### Accepted Public Target

- `defineStateField(descriptor)`.
- canonical `Value = { roots: Record<RootKey, Element[]>, state? }`.
- `InitialValue = Element[] | { children, state? } | { roots, state? }`.
- `createEditor({ initialValue: children })` normalizes to
  `{ roots: { main: children } }`.
- `createEditor({ initialValue: { children, state } })` is the 99% document
  state constructor.
- `createEditor({ initialValue: { roots, state } })` is the multi-root
  constructor.
- `state.getField(field)`.
- `tx.setField(field, valueOrUpdater)`.
- `EditorCommit.statePatches`.
- `EditorCommit.dirtyStateKeys`.
- `EditorCommitSource` literal `'state'`.
- policy shorthands: `history: 'push'`, `history: 'skip'`, `collab: 'shared'`,
  `collab: 'local'`; object policy form only for extra metadata.
- root-explicit operations while `Path` stays numeric and root-local.
- root-aware `Point` and `Range`.
- `createEditorRuntime({ initialValue })`.
- `createEditorView(runtime, { root })`.
- `useSlateRuntime({ initialValue })`.
- `<SlateRuntime runtime={runtime}>`.
- `<Slate root="header">` inside `SlateRuntime` creates a root-bound view.
- `<Slate>` inside `SlateRuntime` defaults to `root="main"`.
- `<Slate editor={editor}>` remains the single-editor shortcut.
- `<Slate root>` outside `SlateRuntime` throws.
- `<Slate editor={editor} root="header">` throws.
- nested `SlateRuntime` providers isolate their runtimes.
- `<Slate root readOnly>` maps to view-local read-only policy.
- `useSlateRuntimeState(selector, options?)`.
- `useSlateViewState(root, selector, options?)`.
- `useStateFieldValue(field, selector?, options?)`.
- `useSetStateField(field)`.
- optional typed extension aliases through existing `state` / `tx` extension
  groups, never core product verbs.

### Implementation Slices

1. Canonical value and input normalization.
   - Hard-break runtime/persisted `Value` to `{ roots, state? }`.
   - Keep `InitialValue` convenience for `Element[]`, `{ children, state? }`,
     and `{ roots, state? }`.
   - First proof: `bun test ./packages/slate/test/create-editor-value-contract.ts`.
2. Root identity and runtime/view split.
   - Add root-aware locations and root-explicit committed content operations.
   - Add document runtime ownership and root-bound editor views.
   - First proof: `bun test ./packages/slate/test/rooted-operation-contract.ts`
     and `bun test ./packages/slate/test/editor-runtime-view-contract.ts`.
3. Core state field registry.
   - Add `defineStateField`, descriptor registration, persisted initialization,
     serialization, and `state.getField`.
   - First proof: `bun test ./packages/slate/test/document-state-contract.ts`.
4. Core state field writes and commit dirtiness.
   - Add `tx.setField`, state patch capture, rollback, `dirtyStateKeys`, and
     `'state'` source publication.
   - Prove state writes do not become content operations.
5. Patch policy and metadata.
   - Add whole-value patches for small fields and patch-hook guard for large
     historyable/shared fields.
   - Extend commit metadata tests for ordered mixed operation/state commits.
6. History.
   - Teach history batches to invert/replay operations plus state patches.
   - Prove title push, title typing merge, preference skip, mixed undo/redo,
     and remote import skip.
7. Collab substrate.
   - Export local shared state patches; suppress local/external policies; import
     remote patches with history skip and selection side-effect suppression.
8. React selector locality.
   - Add `useStateFieldValue` and `useSetStateField`.
   - Prove title edits wake exact field selectors only and body edits wake no
     field selectors.
9. React shared runtime provider.
   - Add `useSlateRuntime`, `SlateRuntime`, `<Slate root>`,
     `useSlateRuntimeState`, and `useSlateViewState`.
   - Keep public `<Slate>` as the view provider; do not export
     `SlateViewProvider`.
   - Enforce prop XOR: either `<Slate editor>` outside a runtime or
     `<Slate root>` inside a runtime, never both.
   - Deduplicate document focus/focusout listeners and editor subscription
     bridge per runtime, not per root view.
   - Root-view selectors must fan out by dirty root/state key; body edits must
     not rerender header/footer selectors.
   - Prove sibling root reads subscribe through the runtime bus and do not
     require prop-drilled sibling editors.
10. Comments and examples.
   - Keep comments external by default.
   - Keep `Document State` focused on title/settings state fields.
   - Add a separate `Multi-root Document` or `Headers and Footers` example
     using `SlateRuntime`, `Slate root="header"`, `Slate root="main"`, and
     `Slate root="footer"`.
   - The multi-root example must prove header/body/footer focus, placeholder
     measurement, undo/redo, select-all/copy/paste, and follow-up typing.
11. Performance and release gates.
   - Run focused benchmarks, package typechecks, then `bun check`; run
     `bun check:full` only when browser/example behavior changed enough to
     claim release proof.

### First Red Tests

Write one failing public contract at a time:

1. `packages/slate/test/create-editor-value-contract.ts`
2. `packages/slate/test/rooted-operation-contract.ts`
3. `packages/slate/test/editor-runtime-view-contract.ts`
4. `packages/slate/test/document-state-contract.ts`
5. `packages/slate/test/document-state-patch-contract.ts`
6. `packages/slate-history/test/document-state-history-contract.ts`
7. `packages/slate/test/collab-document-state-contract.ts`
8. `packages/slate-react/test/state-field-selector-contract.test.tsx`
9. `packages/slate-react/test/slate-runtime-provider-contract.test.tsx`
10. `playwright/integration/examples/document-state.test.ts`
11. `playwright/integration/examples/multi-root-document.test.ts`

Do not write the whole suite upfront.

### Required Commands

Focused gates from `.tmp/slate-v2`:

- `bun test ./packages/slate/test/create-editor-value-contract.ts`
- `bun test ./packages/slate/test/rooted-operation-contract.ts`
- `bun test ./packages/slate/test/editor-runtime-view-contract.ts`
- `bun test ./packages/slate/test/document-state-contract.ts`
- `bun test ./packages/slate/test/document-state-patch-contract.ts`
- `bun test ./packages/slate/test/commit-metadata-contract.ts`
- `bun --filter slate typecheck`
- `bun test ./packages/slate-history/test/document-state-history-contract.ts`
- `bun --filter slate-history typecheck`
- `cd packages/slate-react && bunx vitest run --config ./vitest.config.mjs test/state-field-selector-contract.test.tsx`
- `cd packages/slate-react && bunx vitest run --config ./vitest.config.mjs test/slate-runtime-provider-contract.test.tsx`
- `bun --filter slate-react typecheck`
- `PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/document-state.test.ts --project=chromium`
- `PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/multi-root-document.test.ts --project=chromium`
- `dev-browser --connect http://127.0.0.1:9222` against `http://localhost:3100/examples/document-state`
- `dev-browser --connect http://127.0.0.1:9222` against `http://localhost:3100/examples/multi-root-document`

The `slate-runtime-provider-contract` test must include:

- `<SlateRuntime runtime><Slate /></SlateRuntime>` binds `main`.
- `<Slate root="header">` binds header.
- `<Slate root>` outside runtime throws.
- `<Slate editor root>` throws.
- nested runtimes isolate selectors.
- document listeners and editor subscription bridge are deduped per runtime.
- `useSlateViewState('header', selector)` ignores body-only commits.
- `useSlateRuntimeState` reads runtime state without binding to one root.
- read-only root view rejects view writes while writable root edits.

The `multi-root-document` browser row must include:

- click/type header, body, and footer.
- edit title/state field without focus stealing.
- undo/redo in header and in title/state field.
- select-all/copy/paste per root.
- placeholder measurement does not leak between roots.
- follow-up typing after selection repair stays in the active root.

Broad gates from `.tmp/slate-v2`:

- `bun bench:core:editor-store:local`
- `bun bench:core:history-retained-memory:local`
- `bun bench:core:collab-readiness:local`
- `bun bench:react:rerender-breadth:local`
- `bun test:bun`
- `bun test:vitest`
- `bun check`
- missing harness coverage to add later: `bench:core:editor-state-field:local`
  and `bench:core:rooted-operation-transform:local`.
- `bun check:full` is not required for this close because the browser changed
  route already has focused Playwright plus `dev-browser` proof and this lane is
  not making release-quality raw-device/browser claims.

### Issue And Reference Sync

- No `Fixes #...` claim belongs to this plan.
- Current related/non-fix issue surface is
  `#4477/#4483/#5987/#3383/#5515/#3741/#3715/#4612/#3705/#3756/#3921/#6016/#5537/#5117/#3482`.
- Keep `docs/slate-issues/gitcrawl-v2-sync-ledger.md` as the current sync note
  owner for this architecture pass.
- Keep `docs/slate-v2/ledgers/issue-coverage-matrix.md` unchanged unless Ralph
  implementation produces a new exact fixed/improved proof.
- `docs/slate-v2/references/pr-description.md` is synced only as a non-claim
  future API note. Counts stay unchanged.

### Stop Rules

- If runtime `Value` remains a union or raw `Element[]`, stop and fix the
  canonical value shape.
- If 99% single-root construction requires `roots` boilerplate, stop and fix
  `InitialValue` normalization.
- If root identity gets embedded inside numeric `Path`, stop and fix rooted
  location design.
- If document runtime and editor view ownership blur, stop before React/browser
  examples.
- If multi-root React examples require prop-drilling sibling editor objects,
  stop and add the shared runtime provider first.
- If public API needs `SlateViewProvider`, stop and reuse `<Slate>` as the view
  provider.
- If `<Slate root>` works without `SlateRuntime`, stop and add the provider
  boundary error.
- If `<Slate editor root>` works, stop and enforce prop XOR.
- If root views multiply document focus listeners or selector buses, stop and
  move fanout to `SlateRuntime`.
- If `useSlateViewState` reads sibling React context instead of runtime/root
  subscriptions, stop and fix the hook boundary.
- If header/body/footer placeholder measurement leaks across roots, stop before
  publishing the multi-root example.
- If state field writes require `dirtyScope: all`, stop and redesign dirtiness.
- If title typing rerenders body blocks, stop before examples.
- If history/collab cannot invert/replay mixed commits, keep state fields
  internal/experimental and default history/collab to `skip/local`.
- If browser state import steals focus or scroll, default imports to preserve
  DOM selection/focus/scroll and do not publish the example.

## Runtime Provider Handoff Hardening Pass - 2026-05-21

Status: complete for this activation only. The broader Ralplan lane remains
pending because final gates still have to audit pass rows, state files,
reference sync, and closure criteria.

Evidence read:

- active plan top state, runtime-provider verdict, pressure pass, pass ledger,
  Ralph-ready handoff, first red tests, required commands, issue sync, and stop
  rules.
- active completion and continuation files under
  `.tmp/019e3627-238b-7993-a8cf-26be45504c47/`.
- `ralph` skill handoff contract.

Plan deltas:

- Objective now includes the React runtime-provider API, not only core rooted
  value/state fields.
- Scope lock now names `packages/slate-react/src/components/slate.tsx`,
  React exports, the existing `Document State` example, and the separate
  multi-root/header-footer example.
- Accepted target now records prop boundaries:
  `<Slate>` inside `SlateRuntime` defaults to `main`, `<Slate root>` outside a
  runtime throws, `<Slate editor root>` throws, nested runtimes isolate, and
  `<Slate root readOnly>` maps to view-local read-only policy.
- Implementation slice 9 now requires runtime-owned subscription/focus fanout,
  prop XOR, root-filtered selector updates, and no public `SlateViewProvider`.
- Implementation slice 10 now requires a separate multi-root example that proves
  focus, placeholder measurement, undo/redo, select-all/copy/paste, and
  follow-up typing across header/body/footer roots.
- Red tests and command gates now spell out the expected provider-contract rows
  instead of relying on a vague test filename.
- Issue sync surface now includes `#5537` and `#5117` beside the previous
  non-node state issue set.
- Stop rules now fail fast on missing runtime boundary errors, accepted
  `editor + root`, listener/selector fanout per root, sibling-context
  cross-view hooks, and placeholder leakage.

Decision:

- Keep the public API as `SlateRuntime` plus public `<Slate>` root views.
- The handoff is now Ralph-ready for the runtime-provider implementation slice.
- Do not mark the lane done until `closure-score-final-gates-runtime-provider`
  verifies the whole reopened schedule.

## Closure-Score/Final-Gates Runtime Provider Pass - 2026-05-21

Status: complete.

Evidence read:

- active plan top, current verdict, runtime-provider decision, scorecard, pass
  ledger, Ralph-ready handoff, issue sync, required commands, stop rules, and
  completion-state files.
- `.tmp/019e3627-238b-7993-a8cf-26be45504c47/completion-check.md`.
- `.tmp/019e3627-238b-7993-a8cf-26be45504c47/continue.md`.
- `docs/slate-issues/gitcrawl-v2-sync-ledger.md`.
- `docs/slate-v2/ledgers/issue-coverage-matrix.md`.
- `docs/slate-v2/ledgers/fork-issue-dossier.md`.
- `docs/slate-v2/references/pr-description.md`.

Requirement audit:

| Requirement | Evidence | Result |
| --- | --- | --- |
| Runtime-provider API authority | `React multi-root DX target`, `Provider naming decision`, `Runtime Provider Pressure Pass`, and `Ralph-Ready Handoff` define `SlateRuntime`, `<Slate root>`, prop XOR, and no public `SlateViewProvider`. | complete |
| Handoff readiness | `Ralph-Ready Handoff` names objective, scope, public target, implementation slices, red tests, commands, issue sync, and stop rules. | complete |
| Related issue accounting | `Related Issue Discovery Pass - 2026-05-21`, `gitcrawl-v2-sync-ledger`, coverage matrix, fork dossier `#5117`, and PR reference all keep fixed/improved counts unchanged. | complete |
| Performance and React pressure | `Runtime Provider Pressure Pass` records Vercel React rules, repeated units, listener/subscription budgets, cohorts, INP rows, memory tags, native-behavior proof, and dashboard tags. | complete |
| Regression proof plan | `Regression proof additions`, `First Red Tests`, and `Required Commands` name package/browser rows for prop boundaries, cross-view hooks, listener budget, placeholder locality, and multi-root browser workflows. | complete |
| Workspace verification boundary | Ralph implementation rows now cite focused provider/core tests, focused Playwright, `dev-browser`, and `bun check` before implementation closure. | complete |

## Ralph React Runtime Provider Contract Pass - 2026-05-21

Status: complete.

Evidence:

- red: `cd packages/slate-react && bunx vitest run --config ./vitest.config.mjs test/slate-runtime-provider-contract.test.tsx` failed on missing `useSlateRuntime`, missing provider boundary, and missing `<Slate root>` API.
- green after implementation and lint: `cd packages/slate-react && bunx vitest run --config ./vitest.config.mjs test/slate-runtime-provider-contract.test.tsx`.
- green after implementation and lint: `bun --filter slate-react typecheck`.
- green after implementation and lint: `bun --filter slate typecheck`.
- `bun lint:fix` passed and formatted the touched files.

Implementation:

- Added public `SlateRuntime`, `useSlateRuntime`, `useSlateRuntimeState`, and
  `useSlateViewState`.
- Reused public `<Slate>` as the root-bound view provider inside
  `SlateRuntime`.
- Kept `<Slate editor>` as the single-editor shortcut.
- Enforced `<Slate root>` inside `SlateRuntime` and rejected
  `<Slate editor root>`.
- Moved runtime root views to one runtime-owned selector context,
  subscription bridge, and focus listener pair.
- Made core editor views read root-local top-level children for
  `state.nodes.children()`.

Next:

- Closed by the multi-root browser proof pass below.

## Ralph Multi-Root Example Browser Proof Pass - 2026-05-21

Status: complete.

Evidence:

- `PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/multi-root-document.test.ts --project=chromium`.
- `dev-browser --connect http://127.0.0.1:9222` against
  `http://localhost:3100/examples/multi-root-document`.
- focused slate-react regression run for selection controller/reconciler,
  rendering, app-owned customization, and React editor contracts.

Implementation:

- Added the separate `multi-root-document` example with `header`, `main`, and
  `footer` roots under one `SlateRuntime`.
- Kept all roots visible and made the clicked root active/editable while the
  other roots stay read-only, because simultaneous live editables fought focus
  in the browser.
- Root-stamped `set_selection`, filtered view selection by root, and guarded
  inactive roots from exporting DOM selection while another control/editor owns
  focus.
- Routed the example into the site examples index and added focused Playwright
  coverage for root edits, title undo/redo focus, root-local select-all/copy,
  paste, placeholders, and follow-up typing.

Decision:

- The shared runtime provider API is implemented with public `SlateRuntime` and
  root-bound public `<Slate>` views.
- Public `SlateViewProvider` remains rejected.
- No fixed/improved issue count changes.

## Final Gate Sync Runtime Provider Pass - 2026-05-21

Status: complete.

Evidence:

- `bun check`.
- `PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/multi-root-document.test.ts --project=chromium`.
- `dev-browser --connect http://127.0.0.1:9222` against
  `http://localhost:3100/examples/multi-root-document`.
- `cd packages/slate-react && bunx vitest run --config ./vitest.config.mjs test/slate-runtime-provider-contract.test.tsx`.
- `bun test ./packages/slate/test/editor-runtime-view-contract.ts ./packages/slate/test/rooted-operation-contract.ts`.

Final decision:

- The React runtime-provider and multi-root example lane is complete.
- Completion state, continuation prompt, and plan top state agree.
- The accepted public API remains `SlateRuntime` plus root-bound public
  `<Slate>` views.
- No fixed/improved issue count changes.

## Header Focus Regression Pass - 2026-05-21

Status: complete.

Evidence:

- red: `PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/multi-root-document.test.ts --project=chromium -g "focuses the header editor"` failed because clicking `Header editor` left `#multi-root-header` inactive and `contenteditable="false"`.
- green: `PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/multi-root-document.test.ts --project=chromium -g "focuses the header editor"`.
- green: `PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/multi-root-document.test.ts --project=chromium`.
- green: `bun lint:fix`.
- green: `bun typecheck:site`.
- green: `dev-browser --connect http://127.0.0.1:9222` against
  `http://localhost:3100/examples/multi-root-document`; clicking the visible
  `Header editor` label focused `#multi-root-header`, made header
  `contenteditable="true"`, and typed only into the header.

Implementation:

- The root section now activates its root on mouse down capture.
- Inactive roots are switched with `flushSync` before browser focus handling.
- Clicks on root chrome focus the editable and place the caret at the end, so
  follow-up typing lands in that root.

Decision:

- The multi-root example must treat the visible root chrome as part of the
  editor activation target.
- No fixed/improved issue count changes.

## Previous Store-Based Handoff

Historical only. Do not use this as Ralph authority; use the state-field
handoff above.

### Objective

Implement first-class non-node document state in Slate v2 without hidden nodes:
document title/settings are persisted document stores; comments remain external
anchored stores by default; header/footer/global regions stay deferred to a
future multi-root model.

### Scope Lock

Allowed implementation owners in `.tmp/slate-v2`:

- `packages/slate/src/interfaces/editor.ts`
- `packages/slate/src/create-editor.ts`
- `packages/slate/src/core/public-state.ts`
- `packages/slate/src/core/editor-extension.ts` only if descriptor registration
  needs extension setup support.
- `packages/slate-history/src/history-extension.ts`
- `packages/slate-react/src/hooks/**` and selector/subscription support.
- focused tests and examples named in the proof plan.

Forbidden in the first Ralph pass:

- hidden title/settings/header/footer nodes.
- `value: { children, stores }`.
- product comment/thread services in raw Slate.
- shared node object identity across editors.
- generic custom-operation escape hatches.
- global `dirtyScope: all` for store writes.

### Accepted Public Target

- `defineEditorStateStore(descriptor)`
- `createEditor({ initialValue: children })` remains content-only.
- `createEditor({ initialDocument: { children, stores } })` is the broader
  document constructor.
- `EditorDocumentSnapshot = { children, stores?, version? }`.
- `state.stores.get(descriptor)`.
- `tx.stores.set(descriptor, valueOrUpdater)`.
- `EditorCommit.statePatches`.
- `EditorCommit.dirtyStateStoreKeys`.
- `EditorCommitSource` literal `'state-store'`.
- `useEditorStateStore(descriptor, selector, options?)`.
- optional typed extension aliases through existing `state` / `tx` extension
  groups, never core product verbs.

### Implementation Slices

1. Core document snapshot and descriptor registry.
   - Add `initialDocument` without changing `initialValue`.
   - Add persisted descriptor registry and store initialization.
   - First proof: `bun test ./packages/slate/test/create-editor-document-contract.ts`.
2. Core state writes and commit dirtiness.
   - Add `tx.stores`, state patch capture, rollback, `dirtyStateStoreKeys`, and
     `'state-store'` source publication.
   - First proof: `bun test ./packages/slate/test/document-state-contract.ts`.
3. Patch policy and metadata.
   - Add whole-value patches for small stores and patch-hook guard for large
     historyable/shared stores.
   - Extend commit metadata tests for ordered mixed operation/state commits.
4. History.
   - Teach history batches to invert/replay operations plus state patches.
   - Prove title push, title typing merge, preference skip, mixed undo/redo,
     and remote import skip.
5. Collab substrate.
   - Export local shared state patches; suppress local/external policies; import
     remote patches with history skip and selection side-effect suppression.
6. React selector locality.
   - Add `useEditorStateStore`.
   - Prove title edits wake exact store selectors only and body edits wake no
     store selectors.
7. Comments and examples.
   - Keep comments external by default.
   - Add a document-state example only after core/history/react tests pass.
8. Performance and release gates.
   - Run focused benchmarks, package typechecks, then `bun check`; run
     `bun check:full` only when browser/example behavior changed enough to
     claim release proof.

### First Red Tests

Write one failing public contract at a time:

1. `packages/slate/test/create-editor-document-contract.ts`
2. `packages/slate/test/document-state-contract.ts`
3. `packages/slate/test/document-state-patch-contract.ts`
4. `packages/slate-history/test/document-state-history-contract.ts`
5. `packages/slate/test/collab-document-state-contract.ts`
6. `packages/slate-react/test/editor-state-store-selector-contract.test.tsx`
7. `playwright/integration/examples/document-state.test.ts`

Do not write the whole suite upfront.

### Required Commands

Focused gates from `.tmp/slate-v2`:

- `bun test ./packages/slate/test/create-editor-document-contract.ts`
- `bun test ./packages/slate/test/document-state-contract.ts`
- `bun test ./packages/slate/test/document-state-patch-contract.ts`
- `bun test ./packages/slate/test/commit-metadata-contract.ts`
- `bun --filter slate typecheck`
- `bun test ./packages/slate-history/test/document-state-history-contract.ts`
- `bun --filter slate-history typecheck`
- `cd packages/slate-react && bunx vitest run --config ./vitest.config.mjs test/editor-state-store-selector-contract.test.tsx`
- `bun --filter slate-react typecheck`
- `playwright test playwright/integration/examples/document-state.test.ts --project=chromium`

Broad gates from `.tmp/slate-v2`:

- `bun bench:core:editor-store:local`
- `bun bench:core:history-retained-memory:local`
- `bun bench:core:collab-readiness:local`
- `bun bench:react:rerender-breadth:local`
- `bun check`
- `bun check:full` when examples/browser behavior changed.

### Issue And Reference Sync

- No `Fixes #...` claim belongs to this plan.
- Current related/non-fix issue surface is
  `#4477/#4483/#5987/#3383/#5515/#3741/#3715/#4612/#3705/#3756/#3921/#6016/#3482`.
- Keep `docs/slate-issues/gitcrawl-v2-sync-ledger.md` as the current sync note
  owner for this architecture pass.
- Keep `docs/slate-v2/ledgers/issue-coverage-matrix.md` unchanged unless Ralph
  implementation produces a new exact fixed/improved proof.
- `docs/slate-v2/references/pr-description.md` is synced only as a non-claim
  future API note. Counts stay unchanged.

### Stop Rules

- If `initialValue` stops being content-only, stop and fix the API shape.
- If store writes require `dirtyScope: all`, stop and redesign dirtiness.
- If title typing rerenders body blocks, stop before examples.
- If history/collab cannot invert/replay mixed commits, keep state stores
  internal/experimental and default history/collab to `skip/local`.
- If browser state import steals focus or scroll, default imports to preserve
  DOM selection/focus/scroll and do not publish the example.

## Revision/Handoff Hardening Pass - 2026-05-20

Status: complete.

Evidence read:

- active plan top, proof sections, pass ledger, and previous continuation state.
- `docs/slate-v2/references/pr-description.md`.
- issue sync and coverage rows for the touched issue surface.
- `ralph` skill handoff contract.

Plan deltas:

- Added this Ralph-ready handoff with objective, scope lock, public target,
  implementation slices, first red tests, commands, issue/reference sync, and
  stop rules.
- Locked `initialDocument` as the accepted constructor target for this plan.
- Synced `docs/slate-v2/references/pr-description.md` as a non-claim future API
  note. Fixed/improved counts stay unchanged.
- Raised the plan score to threshold because the remaining work is final closure
  audit, not architecture discovery.

Closure owner:

- Closure-score/final-gates pass completed below.

## Closure-Score/Final-Gates Pass - 2026-05-20

Status: complete.

Historical closure only. Superseded by the later latest-API refresh, which
reopened the lane and replaced `initialDocument` with `initialValue`
normalization plus canonical rooted `Value`.

Evidence read:

- active plan top, verdict, API target, runtime target, policy sections,
  proof matrix, pass ledger, and Ralph-ready handoff.
- `.tmp/019e3627-238b-7993-a8cf-26be45504c47/completion-check.md`.
- `.tmp/019e3627-238b-7993-a8cf-26be45504c47/continue.md`.
- `docs/slate-v2/references/pr-description.md`.
- `docs/slate-issues/gitcrawl-v2-sync-ledger.md`.
- `docs/slate-v2/ledgers/issue-coverage-matrix.md`.
- relevant solution notes for history batch preconditions, source-scoped
  invalidation, and projection ownership. The optional
  `docs/solutions/patterns/critical-patterns.md` file is not present in this
  repo.

Requirement audit:

| Requirement | Evidence | Result |
| --- | --- | --- |
| non-node editor state model | `Final Architecture Authority`, `Public API Target`, and `Internal Runtime Target` define state fields, `statePatches`, `dirtyStateKeys`, and `initialDocument.state` while keeping `children` as content. | complete |
| history opt-in/out | `History Policy Target`, proof matrix, high-risk proof rows, and Ralph handoff define descriptor defaults plus transaction metadata overrides for push/merge/skip. | complete |
| persistence and collaboration | `Persistence And Collaboration Target`, `EditorDocumentSnapshot`, collab proof rows, and stop rules define serialized state fields and ordered mixed commit export/import. | complete |
| related issue mapping | `Issue Ledger Accounting`, the 2026-05-20 sync notes, coverage matrix references, and PR non-claim text cover the related surface without new `Fixes #...` claims. | complete |
| other-editor comparison evidence | `Ecosystem Strategy` and research refresh cite ProseMirror StateField/history metadata, Lexical read/update/tags/NodeState, Tiptap storage/selectors, compiled research, local raw source, and Context7 official-doc checks. | complete |
| realistic examples and migration pressure | proof matrix, browser stress rows, performance/DX/migration pass, and Ralph handoff require title/settings state-field examples, external comments split, old `initialValue`, and new `initialDocument.state`. | complete |
| non-contiguous and shared-history architecture | `Non-Contiguous And Multi-Editor Proposal` defers header/footer to root-id multi-root design and rejects shared node objects for multi-editor history. | complete |
| Ralph readiness | `Ralph-Ready Handoff` gives objective, scope lock, public target, implementation slices, first red tests, required commands, issue sync, and stop rules. | complete |
| boundary discipline | plan and completion state keep Slate Ralplan as docs/ledger/state only; `.tmp/slate-v2` implementation belongs to a later explicit Ralph run. | complete |

Final decision:

- The architecture review is ready for user review and later Ralph execution.
- No Slate v2 implementation claim is made.
- No issue fixed/improved counts change from this plan.
- Closure verification remains limited to planning artifacts in `plate-2`;
  implementation proof must run from `.tmp/slate-v2` during Ralph.

Previous Done Handoff, superseded by Jotai reopen:

- public API: `defineEditorStateStore`, `initialDocument`,
  `EditorDocumentSnapshot`, `state.stores`, `tx.stores`, `statePatches`,
  `dirtyStateStoreKeys`, `'state-store'`, and `useEditorStateStore`.
- history: descriptor defaults plus update metadata override.
- persistence: `children + stores` snapshot, with `initialValue` still
  children-only.
- collab: commit records include operations plus state patches.
- comments: external anchored store default.
- multi-root: deferred root-id path model for header/footer/global regions.
- multi-editor: shared document runtime, not shared node objects.
- issue accounting: related/not-fixed mapping only; no `Fixes #...` claims.
- proof gates: core/history/react/collab/browser/benchmark rows are assigned
  to Ralph.

## Closure-Score/Final-Gates State-Field Final - 2026-05-20

Status: complete.

Historical closure only. Superseded by the latest-API refresh. Its
`initialDocument`, `state.fields`, and `tx.fields` wording is not current
authority.

Evidence read:

- active plan top, final authority, public API target, proof matrix, high-risk
  proof plan, maintainer objection ledger, pass ledger, and Ralph-ready handoff.
- `.tmp/019e3627-238b-7993-a8cf-26be45504c47/completion-check.md`.
- `.tmp/019e3627-238b-7993-a8cf-26be45504c47/continue.md`.
- `docs/slate-v2/references/pr-description.md`.
- `docs/slate-issues/gitcrawl-v2-sync-ledger.md`.
- `docs/slate-v2/ledgers/issue-coverage-matrix.md`.

Final gate audit:

| Gate | Result |
| --- | --- |
| pass schedule | complete: every state-field follow-up row is complete, and this row closes the final gates. |
| public API authority | complete at the time: `defineEditorStateField`, `initialDocument.state`, `state.fields`, `tx.fields`, `statePatches`, `dirtyStateKeys`, source `'state'`, `useEditorStateFieldValue`, and `useSetEditorStateField`. Superseded by latest API authority. |
| terminology | complete: current proof/handoff wording is field-based; store wording is external/source terminology or explicitly historical. |
| issue accounting | complete: no `Fixes #...` claim, no fixed/improved count change, #4612 matrix note tightened, PR reference remains non-claim. |
| boundary | complete: Slate Ralplan edited docs/ledgers/state only; `.tmp/slate-v2` implementation belongs to explicit Ralph execution. |
| handoff | complete: Ralph-ready handoff has objective, forbidden paths, slices, red tests, commands, issue sync, and stop rules. |

Final decision:

- The state-field architecture plan is ready for user review and later Ralph
  execution.
- No Slate v2 implementation claim is made.
- No issue fixed/improved counts change from this plan.
- Closure verification is limited to planning artifacts in `plate-2`;
  implementation proof must run from `.tmp/slate-v2` during Ralph.

## Latest API Issue/Reference/Proof Sync Pass - 2026-05-20

Status: complete.

Evidence read:

- active plan authority, proof matrix, high-risk proof plan, maintainer
  objection ledger, Ralph-ready handoff, and final summary.
- `docs/slate-v2/references/pr-description.md`.
- `docs/slate-issues/gitcrawl-v2-sync-ledger.md`.
- `docs/slate-v2/ledgers/issue-coverage-matrix.md`.
- `.tmp/019e3627-238b-7993-a8cf-26be45504c47/completion-check.md`.
- `.tmp/019e3627-238b-7993-a8cf-26be45504c47/continue.md`.

Decisions:

- keep zero new fixed issue claims.
- keep zero new improved issue claims.
- update the PR reference non-claim note to latest API names:
  `defineStateField`, canonical `Value`, `InitialValue`, `state.getField`,
  `tx.setField`, rooted operations, root-aware locations, runtime/view split,
  and React state-field hooks.
- update the sync ledger note so it no longer teaches `initialDocument`,
  `state.fields`, or old hook names as current API.
- update the `#4612` coverage row so future document state fields are tied to
  `initialValue` normalization and `tx.setField`, not React controlled `value`.
- keep the implementation proof boundary: no `.tmp/slate-v2` source edits and
  no implementation closure claim from this Ralplan.

## Closure-Score/Final-Gates Latest API Final - 2026-05-20

Status: complete.

Final gate audit:

| Gate | Result |
| --- | --- |
| latest API authority | complete: active authority uses `defineStateField`, canonical `Value`, `InitialValue`, `state.getField`, `tx.setField`, rooted operations, root-aware `Point`/`Range`, runtime/view split, and state-field React hooks. |
| proof rows | complete: proof matrix and Ralph handoff use value normalization, rooted operations, runtime/view, state field, history, collab, React selector, browser, and benchmark rows. |
| issue/reference sync | complete: PR reference, v2 sync ledger, and `#4612` coverage row are latest-API non-claim rows with no count change. |
| historical drift | complete: stale API names remain only in explicitly historical/superseded pass notes or previous handoff sections. |
| boundary | complete: Slate Ralplan edited only plan/ledger/reference/state artifacts; `.tmp/slate-v2` implementation belongs to explicit Ralph execution. |
| stop-hook state | complete: completion state may be `done` because no runnable Slate Ralplan pass remains. |

Final decision:

- The latest API Ralplan is ready for user review and later Ralph execution.
- No Slate v2 implementation claim is made.
- No issue fixed/improved counts change from this plan.
- Completion state is closed because remaining work is implementation by
  explicit `[$ralph]`, not more Slate Ralplan review.

## State-Field Policy Shorthand DX Pass - 2026-05-20

Status: complete.

Decision:

- `persist`, `history`, and `collab` are universal state-field policy axes.
- `history` and `collab` must be shorthand-first in public examples:
  `history: 'push'`, `history: 'skip'`, `collab: 'shared'`,
  `collab: 'local'`.
- Object policy forms such as `history: { default: 'push' }` and
  `collab: { default: 'shared' }` stay available only as escape hatches for
  future policy metadata.
- Do not add more universal top-level policy axes now. Future migration,
  authorization, conflict resolution, or adapter-specific behavior should first
  fit through `serialize`, `deserialize`, `collab`, or extension-owned metadata.

Plan deltas:

- updated active public examples to shorthand-first policy fields.
- updated `StateField<T>` to accept shorthand or expanded policy objects.
- added an explicit policy rule to the internal runtime target and history
  policy target.
- updated Ralph handoff/final summary expectations.
- no issue fixed/improved count changes.
- no `.tmp/slate-v2` source edits.

## Closure-Score/Final-Gates State-Field Policy Shorthand - 2026-05-20

Status: complete.

Final gate audit:

| Gate | Result |
| --- | --- |
| public examples | complete: active examples use `history: 'push'`, `history: 'skip'`, `collab: 'shared'`, and `collab: 'local'`. |
| descriptor type | complete: `StateField<T>` accepts shorthand policies and object escape hatches. |
| scope control | complete: no new universal policy axis was added. |
| boundary | complete: Slate Ralplan edited plan/state artifacts only; `.tmp/slate-v2` implementation belongs to explicit Ralph execution. |
| stop-hook state | complete: completion state may be `done` because no runnable Slate Ralplan pass remains. |

## Final User-Review Handoff Outline

Final handoff:

- public API: `defineStateField`, canonical `Value = { roots, state? }`,
  ergonomic `InitialValue`, `state.getField`, `tx.setField`, `statePatches`,
  `dirtyStateKeys`, source `'state'`, `useStateFieldValue`, and
  `useSetStateField`.
- construction: `initialValue` accepts `Element[]`, `{ children, state? }`, or
  `{ roots, state? }`; runtime always normalizes to canonical rooted `Value`.
- state-field policy DX: `history` and `collab` use string shorthands for the
  common path, with object policy forms reserved for extra metadata.
- history: descriptor defaults plus update metadata override.
- persistence: `{ roots, state? }` snapshot. No `version` field in Slate core.
- collab: commit records include operations plus state patches.
- comments: external anchored store default.
- multi-root: root-explicit content operations, root-aware `Point`/`Range`, and
  root-local numeric paths.
- multi-editor: one shared document runtime with root-bound editor views, not
  shared node objects.
- issue accounting: related/not-fixed matrix, no `Fixes` claims.
- proof gates: core/history/react/collab/browser/benchmark rows.

## Next Action

Wait for explicit `[$ralph]` before editing `.tmp/slate-v2` source.
