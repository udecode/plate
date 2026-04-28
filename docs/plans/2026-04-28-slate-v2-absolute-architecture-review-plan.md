# Slate v2 Absolute Architecture Review Plan

Date: 2026-04-28
Status: done; closure pass complete
Score: 0.924 (closure score)

## 1. Current Verdict

The architecture direction is still the right one, and the review is complete
under the updated `slate-review` rules.

The previous single-pass closure was too optimistic. The current multi-pass
review has completed Pass 1, Pass 2, Pass 3, Pass 4, Pass 5, Pass 6, Pass 7,
Pass 8, Pass 9, Pass 10, Pass 11, the revision pass, and the closure pass.

Keep the Slate model and operations. Hard cut the remaining public API clutter
toward:

```ts
editor.read((state) => {
  state.selection.get()
})

editor.update((tx) => {
  tx.nodes.set(props, { at: target })
})
```

The current live code still has the exact issues this plan resolves:

- eager void renderer `focused` / `selected` / `actions`:
  `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx:208`
- public `onKeyCommand`:
  `/Users/zbeyens/git/slate-v2/packages/slate-react/src/editable/keyboard-input-strategy.ts:76`
- public `onSnapshotChange`:
  `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/slate.tsx:35`
- flat editor method surface:
  `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:67`
- extension methods mutating the editor object:
  `/Users/zbeyens/git/slate-v2/packages/slate/src/core/editor-extension.ts:126`

The old void-shell lane is complete, but the public render and core API shape is
not yet absolute.

## 2. Confidence Scorecard

This is the closure score. It passes the `slate-review` threshold.

| Dimension | Weight | Score | Evidence |
| --- | ---: | ---: | --- |
| React 19.2 runtime performance | 0.20 | 0.92 | Pass 3 rechecked node/text selector dirty-runtime-id filtering in `/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-node-selector.tsx:31`, root source filters in `/Users/zbeyens/git/slate-v2/packages/slate-react/src/editable/root-selector-sources.ts:23`, and render profiler budgets in `/Users/zbeyens/git/slate-v2/playwright/stress/generated-editing.test.ts:267`; the revision pass moved eager void subscriptions, stale-target handling, and plugin browser contracts into implementation phases and final gates instead of leaving them as review-only notes. |
| Slate-close unopinionated DX | 0.20 | 0.93 | Pass 4 rechecked legacy Slate docs for `onKeyDown` and `onChange`, current v2 `onKeyCommand`, `onSnapshotChange`, `RenderVoidProps`, hook exports, and the accepted `state` / `tx` decision. Pass 5 rechecked legacy Slate command/transform docs, Tiptap command/chain source, current v2 command registry, and the current extension-method mutation surface. Pass 9 cut raw Slate filtered change callbacks; the final raw callback surface is `onChange` plus advanced `onCommit`. Pass 10 challenged every hard cut as a skeptical Slate maintainer and kept the Slate mental model: document value, paths, operations, `Editable`, `renderElement`, `renderLeaf`, `onKeyDown`, `onChange`, and plain React renderers. |
| Plate and slate-yjs migration shape | 0.15 | 0.93 | Pass 6 rechecked Plate table typed API/transform groups in `/Users/zbeyens/git/plate-2/packages/table/src/lib/BaseTablePlugin.ts:119`, link element config in `/Users/zbeyens/git/plate-2/packages/link/src/lib/BaseLinkPlugin.ts:13`, mark transform sugar in `/Users/zbeyens/git/plate-2/packages/basic-nodes/src/lib/BaseBoldPlugin.ts:27`, image void/media transforms in `/Users/zbeyens/git/plate-2/packages/media/src/lib/image/BaseImagePlugin.ts:33`, Plate Yjs adapter APIs in `/Users/zbeyens/git/plate-2/packages/yjs/src/lib/BaseYjsPlugin.ts:30`, and v2 operation replay/commit contracts in `/Users/zbeyens/git/slate-v2/packages/slate/test/apply-onchange-hard-cut-contract.ts:38` and `/Users/zbeyens/git/slate-v2/packages/slate/test/collab-history-runtime-contract.ts:14`. The revision pass made Plate adapter fixtures, slate-yjs remote commit/target proof, and ecosystem TypeScript fixtures required implementation work. |
| Regression-proof testing strategy | 0.20 | 0.92 | Pass 7 rechecked the operation-family contract list in `/Users/zbeyens/git/slate-v2/playwright/stress/generated-editing.test.ts:43`, inline void navigation at `generated-editing.test.ts:254`, markable inline void shell proof at `generated-editing.test.ts:348`, block void navigation and no-layout-gap proof at `generated-editing.test.ts:408`, editable island focus proof at `generated-editing.test.ts:556`, table boundary navigation at `generated-editing.test.ts:625`, search focus/decorations at `generated-editing.test.ts:665`, mouse toolbar selection at `generated-editing.test.ts:698`, replay proof in `/Users/zbeyens/git/slate-v2/playwright/stress/replay.test.ts:19`, and release/stress scripts in `/Users/zbeyens/git/slate-v2/package.json:60`. The revision pass moved final callback, hook, namespace, Plate adapter, stale-target, plugin browser contract, and slate-yjs replay proof into the proof matrix, phases, and final gates. |
| Research evidence completeness | 0.15 | 0.92 | Pass 8 rechecked the compiled research entrypoints in `docs/research/index.md`, the accepted `state` / `tx` decision in `docs/research/decisions/slate-v2-state-tx-public-api-and-extension-namespaces.md:27`, the cross-corpus steal/reject decision in `docs/research/decisions/slate-v2-perfect-plan-should-steal-read-update-transaction-discipline-and-extension-dx.md:21`, runtime-owned shell DX in `docs/research/decisions/editor-node-dx-should-use-runtime-owned-shells-and-spec-first-renderers.md:19`, React 19.2 evidence in `docs/research/sources/editor-architecture/react-19-2-external-store-and-background-ui.md:31`, and local source citations in `/Users/zbeyens/git/lexical/packages/lexical/src/LexicalEditor.ts:1375`, `/Users/zbeyens/git/lexical/packages/lexical/src/LexicalUpdates.ts:101`, `/Users/zbeyens/git/prosemirror/state/src/transaction.ts:22`, and `/Users/zbeyens/git/tiptap/packages/core/src/CommandManager.ts:28`. No contradiction was found. |
| shadcn-style composability and hook/component minimalism | 0.10 | 0.93 | Pass 9 reduced each public surface to one obvious path plus at most one advanced escape hatch: `onChange` / `onCommit`, `renderVoid({ element, target })` / `renderShellUnsafe`, named hooks / `useEditorSelector`, `state` / `tx`, and Plate-owned product sugar. The revision pass keeps raw Slate minimal while requiring Plate/shadcn-style adapter proof for richer component ergonomics. |

Weighted total: `0.924`.

Completion threshold passes:

- total score is above `0.92`
- no dimension is below `0.85`
- every dimension cites concrete evidence
- all major hard cuts have accepted objection-ledger answers
- extension, plugin, Plate, and slate-yjs answers are present
- implementation acceptance criteria and final proof gates are recorded
- pass-state ledger is complete through closure

## 3. Source-Backed Architecture North Star

Steal only the parts that beat Slate:

- Lexical: read/update lifecycle and active-context legality.
- ProseMirror: transaction-owned document, selection, marks, and metadata.
- Tiptap: extension packaging and discoverable product DX.

Reject:

- Lexical class-node identity and `$` public functions.
- ProseMirror integer positions and schema-first identity as the core Slate
  model.
- Tiptap chain-first product ceremony as raw Slate's primary API.

## 3.1 Pass 8 Research Pressure Verdict

Verdict: the plan is using research correctly. The external systems are proof
sources for specific disciplines, not vague prestige citations.

What held up:

- The `state` / `tx` decision is accepted and directly ties the public API to
  Lexical read/update lifecycle, ProseMirror transaction ownership, and Tiptap
  extension discoverability.
- Lexical source backs the read/update and active-context claim:
  `LexicalEditor.read` / `update` are explicit instance methods, active editor
  state is required during read/update callbacks, and dirty leaves/elements are
  tracked below rendering.
- ProseMirror source backs transaction ownership: transactions track document
  changes, selection changes, stored marks, scroll intent, and metadata; its
  selections also expose document-independent bookmarks.
- Tiptap source backs the product-DX claim: extensions add commands,
  attributes, keyboard shortcuts, input rules, and paste rules; `CommandManager`
  builds single-command and chained-command APIs around one transaction.
- React 19.2 compiled research supports the projection-layer claim:
  `useSyncExternalStore`, `Activity`, deferred work, transitions, and
  Performance Tracks make React a strong UI scheduler, but not a replacement
  for an editor dirty-node runtime.
- Runtime-owned shell and spec-first renderer research directly explains why
  the void API should cut app-owned spacers and hidden anchors.

What this means:

- Keep the north star exactly as written:
  Slate model + operations, Lexical-style lifecycle, ProseMirror-style
  transaction and DOM-selection discipline, Tiptap-style extension/product DX,
  and React 19.2 projection/runtime subscriptions.
- Do not add new framework research before closure unless a maintainer or
  ecosystem pass exposes a contradiction.
- Keep the remaining work on plan pressure: simplicity, maintainer objections,
  ecosystem objections, revision, and closure.

No active claim in the plan is currently relying on uncited external-source
assertions.

Final north star:

```txt
Slate model + operations
small editor object
read-only state view
writable transaction view
runtime-owned render shells
node-scoped React selectors
generated browser parity proof
Plate/Yjs migration through stable operations and extension namespaces
```

## 4. Public API Target

### Editor

Keep the editor object small:

```ts
editor.read(fn)
editor.update(fn, options?)
editor.getSnapshot()
editor.subscribe(listener)
editor.extend(extension)
editor.schema
```

Do not document normal app code against flat mutation methods like:

```ts
editor.setNodes()
editor.removeNodes()
editor.insertText()
editor.select()
editor.addMark()
```

Those move behind `tx`.

### Read State

```ts
editor.read((state) => {
  state.value.get()
  state.selection.get()
  state.marks.get()

  state.nodes.get(target)
  state.nodes.parent(target)
  state.nodes.children(target)
  state.nodes.match(options)
  state.nodes.hasPath(path)

  state.points.before(target, options)
  state.points.after(target, options)
  state.ranges.get(target)
  state.ranges.edges(target)
  state.text.string(target)

  state.schema.isInline(element)
  state.schema.isVoid(element)
  state.schema.isSelectable(element)
  state.schema.markableVoid(element)
})
```

### Transaction

`tx` includes read groups plus write groups. Reads inside update observe the
transaction-in-progress.

```ts
editor.update((tx) => {
  tx.selection.get()
  tx.selection.set(target)
  tx.selection.collapse({ edge: 'end' })
  tx.selection.move({ distance: 1 })
  tx.selection.clear()

  tx.nodes.insert(node, { at })
  tx.nodes.insertMany(nodes, { at })
  tx.nodes.remove({ at })
  tx.nodes.set(props, { at })
  tx.nodes.unset(keys, { at })
  tx.nodes.split(options)
  tx.nodes.merge(options)
  tx.nodes.wrap(element, options)
  tx.nodes.unwrap(options)
  tx.nodes.move({ at, to })

  tx.text.insert('hello')
  tx.text.delete(options)

  tx.marks.add('bold', true)
  tx.marks.remove('bold')
  tx.marks.toggle('bold')

  tx.meta.set('source', 'keyboard')
  tx.history.undo()
  tx.history.redo()

  tx.normalize()
  tx.withoutNormalizing(() => {})
})
```

### Extension Namespaces

Extensions add namespaces to `state` and `tx`, not flat editor methods:

```ts
defineEditorExtension({
  key: 'table',
  state: {
    table(state) {
      return {
        currentCell() {},
        isInTable(target = state.selection.get()) {},
      }
    },
  },
  tx: {
    table(tx) {
      return {
        insertRow() {},
        removeColumn() {},
      }
    },
  },
})
```

Usage:

```ts
editor.read((state) => {
  state.table.currentCell()
})

editor.update((tx) => {
  tx.table.insertRow()
})
```

## 4.1 Pass 5 Unopinionated-Core Verdict

Verdict: raw Slate should expose lifecycle and primitive grouped capabilities,
not a product command catalog.

Keep in raw Slate:

- `editor.read((state) => ...)`
- `editor.update((tx) => ...)`
- small editor object: `read`, `update`, `getSnapshot`, `subscribe`,
  `extend`, `schema`
- core primitive groups on `state` and `tx`: `selection`, `nodes`, `text`,
  `marks`, `schema`, `meta`, `history`
- extension-provided groups on `state` and `tx`
- internal command middleware for browser/editing intent routing

Do not put in raw Slate public DX:

- `editor.commands`
- `editor.chain()`
- `chain().focus().run()` as toolbar ceremony
- extension `methods` that mutate the editor object
- top-level product helpers like `editor.table.insertRow()`
- direct instance predicates as the authoring story:
  `editor.isVoid`, `editor.isInline`, `editor.markableVoid`,
  `editor.isSelectable`

The critical distinction:

```ts
// Raw Slate primitive.
editor.update((tx) => {
  tx.nodes.set({ type: 'heading', level: 2 }, { at: target })
})

// Plate or extension sugar, still lifecycle-owned.
editor.update((tx) => {
  tx.table.insertRow()
})
```

That second shape is allowed only because `table` is an extension namespace on
`tx`, not because core Slate has a command catalog.

Evidence:

- legacy Slate docs split low-level transforms from custom commands, but also
  let command helpers grow on the editor object; v2 should keep the primitive
  flexibility and cut the object-growth part
- Tiptap source proves `editor.commands` and `editor.chain()` are strong
  product DX, but also proves why that ceremony should stay above raw Slate
- current v2 already avoids public `editor.commands`, but its extension
  `methods` path still recomposes methods onto the editor object; that is the
  next hard cut for this API lane

Implementation consequence:

- rename the current internal command registry to intent/operation middleware
  language unless it is deliberately public
- replace extension `methods` with `state` and `tx` group registration
- add a public-surface contract that bans `editor.commands`, `editor.chain`,
  direct extension method recomposition, and normal-example predicate
  monkeypatching
- let Plate expose `editor.tf`, `editor.api`, chains, toolbar commands, and
  product sugar as an adapter layer over raw `editor.update`

## 5. Internal Runtime Target

`editor.update` creates one transaction runtime:

```txt
editor.update
  -> tx snapshot view
  -> target resolution / rebasing
  -> primitive grouped writes
  -> operations
  -> EditorCommit
  -> history / collab / React / DOM repair / browser proof
```

Targets passed to renderers are rebasing runtime targets, not raw `Path`
values. A target can resolve to the current path, range, runtime id, or null if
the node no longer exists.

Core schema predicates compile from element specs and extension predicates:

```ts
defineElement({
  type: 'mention',
  inline: true,
  void: 'markable-inline',
  selectable: true,
})
```

Manual predicate overrides remain advanced extension policy.

## 6. Hook / Component / Render DX Target

### Void Render

Hard cut:

```ts
renderVoid({ element, target })
```

Do not pass:

```ts
focused
selected
actions
children
attributes
```

Renderer example:

```tsx
function ImageVoid({ element, target }: RenderVoidProps<ImageElement>) {
  const editor = useEditor()
  const selected = useElementSelected(target)

  return (
    <ImageCard
      src={element.url}
      selected={selected}
      onRemove={() => {
        editor.update((tx) => {
          tx.nodes.remove({ at: target })
        })
      }}
    />
  )
}
```

This preserves content-only render DX and removes app-owned spacer/anchor
responsibility.

### Hook Renames

Hard cut before publish:

```txt
useSlateStatic      -> useEditor
useSlateSelector    -> useEditorSelector
useFocused          -> useEditorFocused
useSelected         -> useElementSelected
useReadOnly         -> useEditorReadOnly
useComposing        -> useEditorComposing
```

`useEditorSelector` is advanced. Public docs should teach named hooks first.

### Callback Names

Replace public `onSnapshotChange` with:

```tsx
<Slate
  onChange={({ value, selection, operations, snapshot, changed }) => {}}
  onCommit={(commit, snapshot) => {}}
/>
```

`onChange` is the normal public surface. `onCommit` is the low-level runtime
tap.

Do not ship raw Slate `onValueChange` or `onSelectionChange`. They are filtered
convenience callbacks that Plate or an app adapter can layer on top of
`onChange`.

### Keyboard Contract

Remove public `onKeyCommand`.

Keep Slate-close naming:

```tsx
<Editable
  onKeyDown={(event, ctx) => {
    if (isHotkey('mod+b', event)) {
      ctx.editor.update((tx) => {
        tx.marks.toggle('bold')
      })
      return true
    }
  }}
/>
```

Return contract:

- `true`: handled, prevent default, run model-owned repair
- `EditableRepairRequest`: handled with explicit repair policy
- `void`: fall through to runtime

## 6.1 Pass 4 DX Pressure Verdict

Verdict: keep the target API names, with two hard adjustments.

What stays close to Slate:

- keep `renderElement`, `renderLeaf`, `onKeyDown`, `onChange`,
  and `onCommit`
- keep normal element rendering as `attributes + children`
- keep hooks as the React escape hatch, but rename the confusing ones before
  publish

What must not stay:

- `onKeyCommand`; it is engine-shaped and duplicates `onKeyDown`
- `onSnapshotChange`; public users should not learn snapshots before
  value/selection/change semantics
- void render props with `children`, `attributes`, `actions`, `focused`, or
  `selected`
- `RenderVoidPropsFor` casts in examples
- `useSlateStatic` as the public "get editor" hook name
- top-level `editor.isVoid`, `editor.markableVoid`, and `editor.isSelectable`
  as the normal authoring story

Final naming:

- `editor.read((state) => ...)`
- `editor.update((tx) => ...)`
- `renderVoid({ element, target })`
- `useEditor()`
- `useEditorSelector()` for advanced selector work
- `useElementSelected(target)` and `useEditorFocused()` as opt-in hooks
- `<Editable onKeyDown={(event, ctx) => ...} />`
- `<Slate onChange={...} onCommit={...} />`

Reason:

- this is close enough to Slate for migration because the mental model keeps
  `Editable`, `renderElement`, `renderLeaf`, `onKeyDown`, `onChange`, value,
  selection, and operations
- it is not legacy-compatible for voids or filtered callbacks because those are
  exactly the footguns and duplicate surfaces that caused drift
- `state` / `tx` is better than `api` / `tf` for raw Slate because it is
  semantic English and not Plate-shaped

## 6.2 Pass 9 Simplicity Pressure Verdict

Verdict: the plan is simpler after one real cut. Raw Slate should expose one
normal public path and one advanced escape hatch per surface.

Final public/advanced split:

- editor lifecycle: public `editor.read` and `editor.update`; advanced
  `getSnapshot` / `subscribe` for stores and adapters
- writes: public writes only through `tx`; advanced replay through explicit
  `applyOperations`
- extension APIs: public extension namespaces on `state` and `tx`; no flat
  method injection on the editor object
- normal rendering: public `renderElement` / `renderLeaf` keep Slate-style
  `attributes + children`
- void rendering: public `renderVoid({ element, target })`; advanced
  `renderShellUnsafe` only when the author also owns browser contracts
- hooks: public named hooks like `useEditor`, `useElementSelected`, and
  `useEditorFocused`; advanced `useEditorSelector`
- keyboard: public `onKeyDown(event, ctx)`; no public `onKeyCommand` or
  `onCommand`
- callbacks: public `onChange`; advanced `onCommit`
- product sugar: Plate/adapters own `editor.api`, `editor.tf`, command
  catalogs, chains, and filtered callbacks

Cuts from raw Slate:

- `onValueChange` and `onSelectionChange`; they are convenience filters over
  `onChange`, not separate raw lifecycle APIs
- `editor.chain()` as future raw Slate possibility; it belongs in Plate/product
  sugar if needed
- compatibility aliases for hook renames, callbacks, void props, and extension
  method shapes

What stays:

- `onCommit` stays because collaboration, history, instrumentation, and adapters
  need a low-level runtime tap.
- `useEditorSelector` stays because advanced UI needs selector power, but docs
  should teach named hooks first.
- `renderShellUnsafe` may exist only as an explicitly ugly escape hatch with
  browser-contract proof.

Simplicity rule for implementation:

```txt
If a raw Slate API exists only because it is convenient sugar, move it to Plate.
If a raw Slate API can corrupt browser/runtime ownership, make it advanced and
require proof.
```

## 7. Plate Migration Target

Plate should expose product APIs on top of Slate primitives:

```ts
editor.update((tx) => {
  tx.table.insertRow()
  tx.link.toggle({ href })
})
```

Plate may keep `editor.tf` and `editor.api` as Plate adapter sugar, but raw
Slate must not use those names.

Migration route:

1. Convert Plate plugin transforms into `tx.<plugin>.*` groups.
2. Convert Plate query helpers into `state.<plugin>.*` groups.
3. Keep high-level Plate commands as product sugar over `editor.update`.
4. Keep existing Slate operation output stable so collaboration and history do
   not fork.

Proof required:

- one table plugin migration row
- one link/mark plugin migration row
- one void/media plugin migration row
- type inference row where Plate does not need `RenderVoidPropsFor` casts
- adapter fixture proving `editor.api` / `editor.tf` call through legal raw
  Slate read/update contexts
- no adapter transform can write outside `editor.update`
- no adapter API can observe stale pre-transaction state during `editor.update`

## 8. slate-yjs Migration Target

The collab contract remains operations, commits, snapshots, and deterministic
normalization.

Rules:

- remote operations apply through transaction/runtime entrypoints
- remote apply carries metadata like `source: 'remote'`
- targets are local UI handles, not serialized collaboration identity
- serialized document state stays Slate value + operations
- collab does not depend on React render targets

Proof required:

- local update -> operations -> remote replay -> same snapshot
- remote apply does not fire local DOM repair as user input
- target refs rebase or null after concurrent remove/move
- normalization produces deterministic operations under remote replay
- remote commits preserve metadata without depending on React `onChange` /
  `onCommit`
- stale local `EditorTarget` handles fail softly or rebase through runtime APIs;
  they never become serialized collaboration identity

## 8.1 Pass 6 Migration Verdict

Verdict: the migration path is credible, but only if Slate v2 treats `state` /
`tx` as the raw extension namespace substrate and Plate keeps product
`editor.api` / `editor.tf` sugar above it.

Table/plugin row:

- Current Plate table config already separates typed read helpers from typed
  transforms.
- `api.create.table`, `api.table.getSelectedCell`, and
  `api.table.isCellSelected` map to `state.create.*` and `state.table.*`.
- `tf.insert.tableRow`, `tf.remove.tableColumn`, and `tf.table.merge` map to
  `tx.insert.*` / `tx.table.*`, or to a Plate adapter that wraps those raw
  transaction groups.

Link/mark row:

- Link is an inline element plugin with parsing, normalization, and product
  options; it does not require raw Slate to grow link-specific editor methods.
- Mark plugins already expose product sugar like `editor.tf.toggleMark(type)`.
  Raw Slate should expose primitive mark transforms on `tx.marks.*`; Plate can
  keep `tf.bold.toggle()` or equivalent adapter sugar.

Void/media row:

- Image declares `isVoid` and media insertion transforms today.
- Slate v2 should compile this into an element spec with runtime-owned shell,
  hidden anchor, and selection mapping.
- Plate media commands map to `tx.image.*` / `tx.media.*` adapter groups rather
  than renderer-owned `children`, `attributes`, or `actions`.

Type-inference row:

- Plate's current `PluginConfig` generic slots prove the ecosystem depends on
  inferred API, transform, option, and selector groups.
- The v2 extension API must preserve group inference on `state` and `tx` so
  examples do not need casts like `RenderVoidPropsFor`.
- The target is inferred plugin groups, not a manually widened global editor
  object.

slate-yjs / operation replay row:

- Raw Slate owns value, operations, snapshots, commits, commit tags, and the
  explicit `applyOperations` replay entrypoint.
- slate-yjs and Plate own providers, awareness, CRDT wiring, cursor UI, and
  product lifecycle APIs.
- Runtime ids, local targets, DOM shells, hidden anchors, and React render props
  stay local runtime facts. They must not become serialized collaboration
  identity.

Keep:

- Plate may keep `editor.api` / `editor.tf` as adapter names.
- Raw Slate exposes `state` / `tx`, not `api` / `tf`, not product command
  catalogs, and not chain-first toolbar ceremony.

Implementation proof required before closure:

- table adapter fixture compiles against inferred `state.table` and `tx.table`
  groups
- link/mark adapter fixture compiles without raw Slate link-specific methods
- image/media adapter fixture compiles with content-only void renderers
- extension namespace type fixture proves inferred plugin groups without casts
- Yjs/remote fixture applies operations with remote metadata and publishes one
  tagged commit

## 9. Legacy Regression Proof Matrix

| Family | Required proof |
| --- | --- |
| Inline void navigation | `mentions`, `inlines`, and stress family `inline-void-boundary-navigation`; assert model selection, DOM selection, render budget. |
| Block void navigation | `images`, `embeds`, stress family `block-void-navigation`; assert no spacer layout gap and selection before/on/after. |
| Markable inline void | `mentions`, stress family `markable-inline-void-formatting`; assert mark styling, selection, render budget. |
| Editable island | `editable-voids`; assert native input focus stays inside island and outer editor selection restores. |
| Keyboard command handling | examples using `onKeyCommand` become `onKeyDown(event, ctx)` rows; assert handled return prevents default and model repair runs. |
| Change callbacks | unit tests for `onChange` and `onCommit`; assert `changed` distinguishes value-only, selection-only, metadata-only, and remote commits. |
| Hook renames | public surface contract tests; no exported old names before publish. |
| State/tx lifecycle | unit tests: reads outside callback fail or route through snapshot; writes outside update fail; reads inside `tx` see transaction-local changes. |
| Extension namespaces | unit tests: extension state group, tx group, conflict detection, dependency order, cleanup. |
| Plate adapter | type and runtime fixtures proving `editor.api` / `editor.tf` wrap raw `state` / `tx` legally, with no write access outside `editor.update`. |
| Yjs migration | remote operation replay, commit metadata, deterministic normalization, and target rebase/null behavior. |
| Plugin browser contracts | plugin-provided browser rows can register with the generated proof system without copy-pasting Playwright mechanics. |
| Ecosystem TypeScript | fixtures for nested plugin groups, collision errors, composed inference, and `state.<plugin>` / `tx.<plugin>` augmentation. |

## 10. Browser Stress / Parity Strategy

Fast CI:

- focused unit contracts
- `slate-browser` core proof
- selected browser rows for reported regressions
- render budget assertions on hot paths
- public surface contracts for removed callbacks/hooks/void props
- adapter type fixtures for Plate-style `editor.api` / `editor.tf`
- stale-target unit contracts

Sparing stress:

- `bun test:stress`
- replay artifacts through `STRESS_REPLAY`
- full operation-family gauntlets for selection, voids, paste, deletion, IME,
  keyboard command handling, and change callbacks
- plugin-provided browser contract rows for table, media, link/mark, and
  editable-island packages

Release gate:

- `bun check:full`
- generated legacy-vs-v2 parity rows for the same scenario families
- persistent-profile soak
- raw device mobile proof only when the claim is mobile-device behavior

## 10.1 Pass 3 Performance Pressure Verdict

Verdict: keep the target architecture, but do not close performance yet.

What held up:

- mounted node/text rendering already routes through runtime-id selectors:
  `useMountedNodeRenderSelector` and `useMountedTextRenderSelector`
- runtime-id selector wakeups are dirty-id aware through
  `change.nodeImpactRuntimeIds`
- text render selectors can skip synced text operations on the hot DOM-sync
  path
- root sources are named wrappers for top-level runtime ids, selected island,
  placeholder, and root commit wakeup
- render profiler plumbing exists in `slate-react`, `slate-browser`,
  integration tests, and generated stress tests

What still fails the absolute bar:

- `EditableRenderedVoid` still computes `focused` and `selected` for every void
  renderer before user render code runs
- `useFocused()` is cheap but broad by design; it should not be injected into
  every void renderer by default
- `useSelected()` is runtime-id filtered, but still opt-out instead of opt-in
  for void authors

Required plan response:

- `renderVoid` must receive `element + target` only
- selection/focus UI must move to opt-in hooks such as `useSelected(target)` or
  `useElementSelected(target)`
- performance closure must include render-budget proof for block voids, inline
  voids, search decorations, table boundary navigation, and mouse selection
- broad `useSlateSelector` remains allowed only inside named source hooks or
  advanced APIs, not as the ordinary hot-render authoring surface

## 10.2 Pass 7 Regression Pressure Verdict

Verdict: the regression strategy is finally pointed at the right owner, but it
is not closure-grade yet.

What held up:

- `slate-browser` owns operation-family contracts instead of leaving examples
  as the primary safety net.
- The generated stress suite already covers the user-reported families:
  inline void navigation, markable inline voids, block voids, editable islands,
  table cell boundary navigation, search decoration focus, mouse selection
  toolbar visibility, paste normalization, and IME selection repair.
- The stress runner emits replayable artifacts, and `STRESS_REPLAY` replays the
  generated browser steps against the same route and surface.
- Render profiler assertions are part of the browser scenario language, so
  regression proof can include "did not rerender broad React roots" rather than
  only "the DOM looked right."
- Release scripts keep full browser proof out of the fast `bun check` loop and
  reserve it for `bun check:full`, `test:stress`, and release gates.

What still fails closure:

- The planned public hard cuts are not all contract-tested under their final
  names. Current tests still reference `onSnapshotChange` and `useSlateStatic`.
- `onKeyDown(event, ctx)` handled-result behavior needs an explicit browser or
  unit row replacing public `onKeyCommand`.
- `onChange` and `onCommit` need final callback contract tests that distinguish
  value-only, selection-only, metadata-only, and remote commits.
- Hook rename proof needs a public export contract: old names absent, new names
  present, examples using the final names only.
- Final `state` / `tx` namespace proof needs both unit type fixtures and at
  least one browser row proving commands routed through `tx` still repair DOM
  selection correctly.

Required plan response:

- Keep fast CI narrow: release-discipline unit contracts, `slate-browser` core
  proof, selected integration examples, and targeted render budgets.
- Keep slow human-like proof in `test:stress` and `test:stress:replay`, not in
  default CI.
- Add implementation acceptance criteria for:
  - final callback names
  - final hook names
  - final `state` / `tx` lifecycle and namespace fixtures
  - final `onKeyDown(event, ctx)` handled-result contract
  - Plate/Yjs adapter replay rows
- Treat examples as demo surfaces only. Any regression first discovered in an
  example must become a reusable `slate-browser` contract family or step kind.

## 11. Hard Cuts And Rejected Alternatives

Hard cut:

- public `onKeyCommand`
- public `onSnapshotChange`
- raw Slate `onValueChange` / `onSelectionChange`
- eager `focused` / `selected` / `actions` in `renderVoid`
- renderer-owned void children/spacer/attributes
- normal public `useSlateStatic`
- flat public extension method injection on the editor object
- public docs-first flat mutation methods outside `editor.update`
- top-level schema predicates as normal authoring surface
- compatibility aliases before publish

Rejected:

- `editor.update(({ api, tf }) => {})`
- `editor.api` / `editor.tf` in raw Slate
- Tiptap-style flat `editor.commands` as core API
- keeping Slate legacy void renderer shape for compatibility
- making examples the primary safety net

## 12. Slate Maintainer Objection Ledger

### Row 1: Read/update with `state` and `tx`

- Change: make `editor.read((state) => ...)` and `editor.update((tx) => ...)`
  the public lifecycle.
- Who feels pain: raw Slate users, plugin authors, Plate, slate-yjs.
- Likely objection: "Slate was flexible because I could call editor methods
  directly; this makes simple code ceremony."
- Why this is not change for change's sake: stale reads and writes outside a
  coherent update caused the exact class of toolbar, selection, DOM repair, and
  browser timing bugs the v2 work is eliminating.
- Evidence: Lexical active-context legality in
  `/Users/zbeyens/git/lexical/packages/lexical/src/LexicalUpdates.ts:101`;
  ProseMirror transaction ownership in
  `/Users/zbeyens/git/prosemirror/state/src/transaction.ts:22`.
- Rejected alternative: keep flat editor methods but assert at runtime. Weaker
  because autocomplete still teaches illegal shape.
- Migration answer: direct mutation examples move into `editor.update((tx) => ...)`;
  reads move into `editor.read((state) => ...)`.
- Docs / example answer: "read state, update transaction" guide with before and
  after examples for common Slate transforms.
- Regression proof: lifecycle unit contracts plus browser command rows.
- Plate/plugin answer: Plate maps transforms to `tx.<plugin>.*`.
- slate-yjs answer: operations and commits remain the serialized contract.
- Verdict: keep.

### Row 2: Grouped `state` / `tx` APIs instead of flat editor methods

- Change: move primitive groups to `state.selection`, `state.nodes`, `tx.nodes`,
  `tx.marks`, etc.
- Who feels pain: raw Slate users and TypeScript users.
- Likely objection: "This is a new API, not just safer Slate."
- Why this is not change for change's sake: the live `BaseEditor` surface is
  already large and mixed; read/write groups reduce clutter and prevent writes
  from existing in read context.
- Evidence: flat surface in
  `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:118`.
- Rejected alternative: `editor.api` / `editor.tf`. Weaker because it leaves
  writes visible outside update and uses unclear names.
- Migration answer: codemod maps `editor.setNodes(props, opts)` to
  `editor.update((tx) => tx.nodes.set(props, opts))`.
- Docs / example answer: grouped method reference generated from the public
  types.
- Regression proof: type tests and lifecycle tests for every grouped method.
- Plate/plugin answer: plugin groups extend the same namespace pattern.
- slate-yjs answer: grouped methods still emit Slate operations.
- Verdict: keep.

### Row 3: Extension namespaces instead of editor method injection

- Change: extensions add `state.table.*` and `tx.table.*`, not flat
  `editor.insertRow`.
- Who feels pain: plugin authors and Plate maintainers.
- Likely objection: "Flat methods are easy to call and match current
  extension style."
- Why this is not change for change's sake: live extension registration writes
  methods onto the editor object and manually detects conflicts; namespaces make
  ownership visible.
- Evidence:
  `/Users/zbeyens/git/slate-v2/packages/slate/src/core/editor-extension.ts:156`;
  Tiptap proves extension commands are valuable in
  `/Users/zbeyens/git/tiptap/packages/core/src/Extendable.ts:113`.
- Rejected alternative: keep flat method injection. Weaker because collisions
  are inevitable as ecosystem APIs grow.
- Migration answer: extension method maps split into `state` and `tx` groups.
- Docs / example answer: table extension example with `state.table` and
  `tx.table`.
- Regression proof: conflict/dependency/cleanup unit tests.
- Plate/plugin answer: Plate gets clean grouped plugin APIs without wrapping
  every core call.
- slate-yjs answer: extension methods only build operations; remote apply does
  not serialize extension method names.
- Verdict: keep.

### Row 4: `renderVoid({ element, target })`

- Change: remove `focused`, `selected`, and `actions` from normal `renderVoid`.
- Who feels pain: app authors currently using `actions.remove()` and
  `selected`.
- Likely objection: "You removed convenient props for a perf theory."
- Why this is not change for change's sake: current void renderers subscribe to
  global focus and node selection before user code decides whether it needs
  them.
- Evidence:
  `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx:208`;
  void stress render budgets in
  `/Users/zbeyens/git/slate-v2/playwright/stress/generated-editing.test.ts:410`.
- Rejected alternative: keep eager props and rely on dirty-id filtering. Weaker
  because global focus still fans out to every consumer.
- Migration answer: use `const selected = useElementSelected(target)` and
  `editor.update((tx) => tx.nodes.remove({ at: target }))`.
- Docs / example answer: image, mention, video, and editable-island examples.
- Regression proof: render budget rows for selecting before/on/after voids.
- Plate/plugin answer: Plate UI components receive minimal props and call
  editor update methods.
- slate-yjs answer: target is local-only, rebased or null; serialized ops do
  not depend on render props.
- Verdict: keep.

### Row 5: `onKeyDown(event, ctx)` instead of public `onKeyCommand`

- Change: remove public `onKeyCommand`; strengthen Slate-close `onKeyDown`.
- Who feels pain: examples and app code using `onKeyCommand`.
- Likely objection: "Why invent a new return contract on a React event?"
- Why this is not change for change's sake: the runtime needs an explicit
  model-owned handled signal to prevent native DOM drift and repair selection.
- Evidence:
  `/Users/zbeyens/git/slate-v2/packages/slate-react/src/editable/keyboard-input-strategy.ts:117`.
- Rejected alternative: keep both. Weaker because two public keyboard surfaces
  teach users to pick the wrong one.
- Migration answer: move handler body to `onKeyDown`, return `true` or an
  `EditableRepairRequest`.
- Docs / example answer: markdown shortcuts, rich text, check lists, tables,
  images, mentions.
- Regression proof: keyboard rows asserting preventDefault, model selection,
  DOM selection, and follow-up typing.
- Plate/plugin answer: Plate hotkeys call `editor.update((tx) => ...)` through
  the same contract.
- slate-yjs answer: no collab surface change; only local event ownership.
- Verdict: keep.

### Row 6: `onChange` / `onCommit` instead of duplicate change callbacks

- Change: make `onChange` the normal callback and `onCommit` the low-level
  commit tap. Do not ship raw Slate `onSnapshotChange`, `onValueChange`, or
  `onSelectionChange`.
- Who feels pain: users already wired to `onSnapshotChange` and users who
  expected separate value-only or selection-only callbacks in raw Slate.
- Likely objection: "Snapshot is the honest runtime object; why hide it?"
- Why this is not change for change's sake: `onSnapshotChange` is engine-shaped
  and makes normal app state sync feel internal.
- Evidence:
  `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/slate.tsx:35`.
- Rejected alternative: keep `onSnapshotChange` and document it. Weaker because
  it leaves the primary API less Slate-close than necessary.
- Migration answer: `onSnapshotChange((snapshot, commit) => ...)` becomes
  `onCommit((commit, snapshot) => ...)` or
  `onChange(({ snapshot, commit, changed }) => ...)`. Existing value-only and
  selection-only app callbacks become small filters over `onChange`.
- Docs / example answer: controlled value, selection-only, commit-listener
  examples.
- Regression proof: callback unit tests for value-only, selection-only,
  metadata-only, and remote commits.
- Plate/plugin answer: Plate can subscribe to `onChange` for app state and
  `onCommit` for low-level plugin telemetry.
- slate-yjs answer: collab listens to commits, not React callbacks.
- Verdict: keep.

### Row 7: Hook renames

- Change: `useSlateStatic` -> `useEditor`, `useSelected` ->
  `useElementSelected`, `useFocused` -> `useEditorFocused`, and related names.
- Who feels pain: current Slate React users and examples.
- Likely objection: "This is churn."
- Why this is not change for change's sake: `useSlateStatic` is obscure, and
  `useSelected` hides whether the selection is editor-wide or element-scoped.
- Evidence: current exports in
  `/Users/zbeyens/git/slate-v2/packages/slate-react/src/index.ts:53`.
- Rejected alternative: keep aliases. Weaker before publish because aliases
  become permanent API debt.
- Migration answer: direct import rename.
- Docs / example answer: hook reference grouped by editor, element, and
  advanced selector hooks.
- Regression proof: public surface contract test and example typecheck.
- Plate/plugin answer: Plate can re-export names without compatibility junk.
- slate-yjs answer: not applicable to serialized collab contract.
- Verdict: keep.

### Row 8: Schema/spec predicates

- Change: move top-level `isInline`, `isVoid`, `markableVoid`, `isSelectable`
  into `editor.schema` and compiled element specs.
- Who feels pain: plugin authors overriding predicate functions.
- Likely objection: "Classic Slate made these simple functions."
- Why this is not change for change's sake: these are schema policy, not random
  editor methods; specs prevent every plugin from hand-rolling browser-critical
  void behavior.
- Evidence: current top-level predicates in
  `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:188`;
  node DX decision in
  `docs/research/decisions/editor-node-dx-should-use-runtime-owned-shells-and-spec-first-renderers.md`.
- Rejected alternative: keep predicates only. Weaker because it preserves void
  kind ambiguity.
- Migration answer: predicate plugins become element specs or schema extension
  predicates.
- Docs / example answer: mention/image/editable-island specs.
- Regression proof: generated browser rows per void kind and schema contract
  unit tests.
- Plate/plugin answer: Plate plugins map cleanly to element specs.
- slate-yjs answer: schema affects normalization deterministically; remote
  peers must share schema config.
- Verdict: keep.

### Row 9: Generated parity and stress gates

- Change: examples stop being the main safety net; `slate-browser` owns
  replayable operation-family contracts.
- Who feels pain: test authors and release maintainers.
- Likely objection: "This is slower and heavier."
- Why this is not change for change's sake: the user-reported regressions came
  from human editing sequences examples did not catch.
- Evidence: stress families in
  `/Users/zbeyens/git/slate-v2/playwright/stress/generated-editing.test.ts:46`;
  replay artifacts in
  `/Users/zbeyens/git/slate-v2/playwright/stress/replay.test.ts:19`.
- Rejected alternative: patch examples one by one. Weaker because regressions
  keep escaping through untested operation families.
- Migration answer: fast subset in CI, full stress under `test:stress` and
  release gates.
- Docs / example answer: testing guide with contract families and replay
  artifact workflow.
- Regression proof: this row is the proof strategy.
- Plate/plugin answer: Plate can add plugin-specific contract families without
  copying Playwright mechanics.
- slate-yjs answer: collab replay rows assert remote operation determinism.
- Verdict: keep.

### Row 10: No compatibility aliases before publish

- Change: remove old names instead of shipping aliases for unpublished APIs.
- Who feels pain: local examples and current branch users.
- Likely objection: "Aliases would make migration less annoying."
- Why this is not change for change's sake: the package is not published; aliases
  turn wrong API names into permanent support burden.
- Evidence: current examples still carry `RenderVoidPropsFor` casts and
  `onKeyCommand` usage, e.g.
  `/Users/zbeyens/git/slate-v2/site/examples/ts/images.tsx:50`.
- Rejected alternative: deprecate first. Weaker because there is no external
  release audience yet.
- Migration answer: one hard-cut branch with examples and tests migrated in the
  same pass.
- Docs / example answer: latest-state docs only, no changelog-style migration
  prose.
- Regression proof: public surface contract grep for removed names.
- Plate/plugin answer: Plate starts from final API.
- slate-yjs answer: no serialized contract effect.
- Verdict: keep.

## 12.1 Pass 10 Slate Maintainer Verdict

Verdict: keep the hard cuts. The maintainer objection pass did not find a
reason to pivot back toward compatibility aliases, eager render props, flat
editor methods, or duplicate callback surfaces.

The strongest fair objection is that this is a lot of change and can sound like
"not Slate anymore." That objection is valid only if the plan loses Slate's
authoring center. It does not. The plan keeps:

- document value and operations as the data model
- paths and ranges as the addressing model
- `Editable`, `renderElement`, `renderLeaf`, `onKeyDown`, and `onChange`
- plain React renderers for normal elements
- operation/commit boundaries for collaboration and history

The hard cuts target the places where the legacy shape actively teaches the
wrong owner:

- writes outside an update context
- browser selection policy living in React components
- app-owned void spacers and hidden anchors
- eager selection/focus subscriptions in every void renderer
- engine-shaped callback names as default app API
- flat extension methods colliding on the editor object
- examples acting as the regression system

Maintainer challenge results:

| Row | Decision | Maintainer answer |
| --- | --- | --- |
| 1. `state` / `tx` lifecycle | Keep | This is the largest mental shift, but it is the right one. It preserves Slate operations while making stale reads and illegal writes harder to author. |
| 2. grouped `state` / `tx` APIs | Keep | The grouped shape is more teachable than flat editor clutter. It also gives plugin namespaces one obvious home. |
| 3. extension namespaces | Keep | Flat method injection is convenient until two plugins pick the same verb. Namespace ownership is worth the break. |
| 4. `renderVoid({ element, target })` | Keep | Convenience props are not worth global focus/selection fanout. Users who draw selection UI can opt into node-scoped hooks. |
| 5. `onKeyDown(event, ctx)` | Keep with strict docs/tests | Do not rename Slate's public keyboard surface. Strengthen it with a handled/repair return contract instead of shipping `onKeyCommand`. |
| 6. `onChange` / `onCommit` | Keep, strengthened | Normal users get Slate-close `onChange`; low-level consumers get `onCommit`. Separate raw `onValueChange` / `onSelectionChange` would reintroduce callback sprawl. |
| 7. hook renames | Keep | `useEditor` and node-scoped hook names are clearer than legacy names. No aliases before publish. |
| 8. schema/spec predicates | Keep, but keep escape policy | Schema owns browser-critical node behavior. Advanced predicate policy can exist, but it should compile into schema behavior. |
| 9. generated browser proof | Keep | This is the only credible answer to "I cannot report every bug one by one." Fast CI stays narrow; stress/replay handles human-like breadth. |
| 10. no compatibility aliases | Keep | The API is unpublished. Shipping aliases now is debt with a warning label. |

Required strengthening from this pass:

- Every breaking change needs a mechanical adoption recipe in the execution
  plan or test fixture, not just prose.
- Callback cuts need examples for controlled value sync, selection observation,
  commit telemetry, and remote/collab commits.
- Hook renames need a public export contract and first-party examples using only
  the final names.
- `renderVoid({ element, target })` needs examples for image, mention, embed,
  and editable island shapes, with selection UI using opt-in hooks.
- `state` / `tx` namespaces need TypeScript fixtures for core groups and plugin
  group augmentation.
- The final implementation plan must keep user docs latest-state only; adoption
  recipes can live in the plan, codemods, fixtures, and PR notes.

No objection row moves to `drop` or `revise`. Row 6 was strengthened after the
Pass 9 callback simplification because raw `onValueChange` / `onSelectionChange`
are now explicitly cut.

## 12.2 Pass 11 Ecosystem Maintainer Verdict

Verdict: keep the architecture, but strengthen the adapter and proof
requirements. The ecosystem pass did not justify backing away from `state` /
`tx`, content-only void renderers, callback cuts, hook renames, schema/spec
predicates, or no aliases. It did expose one non-negotiable implementation
requirement: Plate must get a deliberate adapter layer, not a hand-wavy
"just migrate everything to raw Slate names" story.

Ecosystem challenge results:

| Perspective | Strongest objection | Decision | Required answer |
| --- | --- | --- | --- |
| Plate maintainer | Current Plate APIs, tests, and plugins rely heavily on `editor.api` / `editor.tf`; raw Slate `state` / `tx` could become churn with no product benefit. | Keep raw Slate `state` / `tx`; keep Plate `editor.api` / `editor.tf` as Plate-owned adapter sugar. | Add a Plate adapter fixture proving `editor.api` read methods and `editor.tf` transforms call through legal raw Slate read/update contexts without exposing writes outside `editor.update`. |
| Plate plugin author | Extension namespaces can hurt inference if plugin groups, selectors, transforms, and options stop composing cleanly. | Keep extension namespaces. | Add TypeScript fixtures for nested plugin groups, collision errors, composed plugin inference, and `state.<plugin>` / `tx.<plugin>` augmentation. |
| slate-yjs maintainer | React callback names should not affect collaboration; target refs can go stale after remote operations. | Keep callback cuts and local `target` render props. | Add contracts for remote operation replay, commit metadata, target rebasing/nullability, and no dependency on React `onChange` / `onCommit` for serialized collaboration. |
| Third-party plugin author | Runtime-owned void shells reduce footguns but can feel less flexible for unusual inline, editable-island, or embedded widgets. | Keep content-only renderers plus ugly unsafe escape hatch. | Add plugin-facing void kind examples for image, mention, embed, table-adjacent widget, and editable island; require `renderShellUnsafe` users to attach browser contracts. |
| Test/release maintainer | Generated browser contracts can become slow and hard to maintain. | Keep generated proof, split fast and slow lanes. | Add a plugin contract registry: fast core rows in CI, focused plugin rows on package change, full human-like replay in `test:stress` / release gates. |
| App author | Cutting `focused`, `selected`, and `actions` from void props removes convenient UI state. | Keep opt-in hooks and target-based editor methods. | Add small examples for selection UI, remove/select/set-node commands, stale target behavior, and toolbar usage. |

What this pass changes:

- Plate adapter proof becomes a first-class requirement, not an implementation
  nice-to-have.
- `editor.api` / `editor.tf` are explicitly allowed as Plate/product adapter
  names and explicitly rejected as raw Slate names.
- `EditorTarget` needs a stale-target policy:
  - local targets are stable enough for render-time commands
  - remote changes can invalidate targets
  - invalid targets fail softly or require rebasing through runtime APIs
  - serialized collaboration never depends on target identity
- Browser proof must be extensible by plugins. Otherwise "examples are demos"
  just moves the burden from examples to handwritten Playwright.
- TypeScript proof must cover ecosystem authoring, not only raw core methods.

No hard cut is dropped. The revision pass must fold these ecosystem constraints
into the implementation phases, final gates, and acceptance criteria.

## 12.3 Revision Pass Verdict

Verdict: the plan now owns the maintainer and ecosystem objections in its main
execution sections, not just in review notes.

Revision decisions:

- Keep the raw Slate API exactly as accepted: `editor.read((state) => ...)` and
  `editor.update((tx) => ...)`.
- Keep `editor.api` / `editor.tf` out of raw Slate and explicitly allow them as
  Plate-owned adapter names.
- Treat stale `EditorTarget` behavior as runtime policy, not an open design
  vibe: local handles may rebase or fail softly; remote/collab state never
  serializes target identity.
- Make plugin browser contracts first-class so regression proof scales beyond
  first-party examples.
- Make ecosystem TypeScript fixtures part of the implementation, not a closure
  afterthought.
- Keep docs latest-state only. Adoption recipes belong in execution plans,
  codemods, fixtures, and PR notes.

The plan now has a high enough score for closure review, but not for automatic
completion. Closure still needs to verify every gate and then set
`tmp/completion-check.md` to `done`.

## 12.4 Closure Pass Verdict

Verdict: close the review lane.

Closure gates checked:

- score is `0.924`, above the `0.92` threshold
- all score dimensions are at or above `0.92`
- every score dimension has concrete file, research, test, or ledger evidence
- no P0/P1 review issue remains unplanned
- no public API surface is left in "maybe" language
- every hard cut has an accepted maintainer objection row
- extension, plugin, Plate, and slate-yjs answers are present
- final implementation phases own the accepted maintainer/ecosystem constraints
- final proof gates cover public API cuts, callbacks, hooks, void renderers,
  Plate adapter sugar, stale targets, plugin browser contracts, and slate-yjs
  replay/commit behavior
- pass-state ledger proves the multi-pass sequence completed before closure
- plan deltas record what changed, what was dropped, what was strengthened, and
  what stayed unchanged

No further review pass is required before executing the plan with
`complete-plan`.

## 13. Pass Schedule And Pass-State Ledger

| Pass | Status | Evidence added | Plan delta | Open issues | Next owner |
| --- | --- | --- | --- | --- | --- |
| Current-state read and initial score | complete | Rechecked live `renderVoid`, `onKeyCommand`, `onSnapshotChange`, flat editor methods, extension method mutation, and research index/log entries. | Reopened plan from single-pass closure to multi-pass pending state; demoted `0.928` to candidate closure target; active score is `0.806`. | None for Pass 1. | Research and live-source refresh pass. |
| Research and live-source refresh | complete | Rechecked Lexical `read`/`update` and active-context legality, Lexical extension packaging, ProseMirror transactions and `EditorState.tr`, Tiptap command/chain and extension hooks, official React 19.2 Activity/Performance Tracks, Slate selector context, and `slate-browser` selection/stress APIs. | Refreshed the React 19.2 source page to accepted/current; raised research score to `0.90`; kept closure pending. | None for Pass 2. | Performance pressure pass. |
| Performance pressure pass | complete | Rechecked runtime-id node/text selectors, root source filters, eager void selection/focus props, render profiler plumbing, and generated render-budget stress rows. | Added Pass 3 performance verdict; raised performance score to `0.88`; kept void eager subscription as a closure-blocking hard cut. | None for Pass 3; remaining work belongs to the implementation plan and later closure proof. | DX pressure pass. |
| DX pressure pass | complete | Rechecked legacy Slate `onKeyDown`, `onChange`, void docs, current v2 `onKeyCommand`, `onSnapshotChange`, `RenderVoidProps`, hook exports, and the state/tx decision page. | Added Pass 4 DX verdict; raised DX score to `0.89`; kept void compatibility as explicitly rejected. | None for Pass 4; unopinionated-core pressure remains. | Unopinionated-core pass. |
| Unopinionated-core pass | complete | Rechecked legacy Slate command/transform docs, current v2 `BaseEditor` flat method surface, extension method recomposition, internal command registry, public-surface contracts, Tiptap `CommandManager`, and the accepted state/tx decision page. | Added Pass 5 unopinionated-core verdict; raised active score to `0.871`; clarified that `editor.commands` / `editor.chain()` stay out of raw Slate and Plate owns product sugar. | None for Pass 5; migration proof remains. | Migration pass. |
| Migration pass | complete | Rechecked Plate table typed API/transform groups, link element config, mark transform sugar, image void/media transforms, Plate Yjs adapter APIs, the accepted `state` / `tx` decision, and current Slate v2 operation replay/commit contracts. | Added Pass 6 migration verdict; raised migration score to `0.88` and active score to `0.881`; clarified Plate can keep `editor.api` / `editor.tf` as adapter sugar while raw Slate stays `state` / `tx`. | None for Pass 6; regression proof remains. | Regression pass. |
| Regression pass | complete | Rechecked generated operation-family contracts, inline void, markable inline void, block void, paste image void, editable island, large-document runtime void, table boundary navigation, search decoration focus, mouse toolbar selection, IME, replay artifacts, render profiler assertions, release-discipline scripts, public-surface hard-cut tests, and remaining old callback/hook names in tests/docs. | Added Pass 7 regression verdict; raised regression score to `0.87` and active score to `0.887`; clarified that `slate-browser` owns regression families while examples stay demos. | Final callback, hook rename, `onKeyDown(event, ctx)`, and `state` / `tx` namespace contracts still need final-name proof before closure. | Research pass. |
| Research pass | complete | Rechecked research index/log, accepted `state` / `tx` decision, cross-corpus steal/reject decision, runtime-owned shell DX decision, React 19.2 source page, read/update corpus ledger, Lexical read/update and active-context source, ProseMirror transaction and bookmark source, and Tiptap command/extension source. | Added Pass 8 research verdict; raised research score to `0.92` and active score to `0.890`; confirmed no active plan claim relies on uncited external-source assertions. | None for Pass 8; simplicity pressure remains. | Simplicity pass. |
| Simplicity pass | complete | Rechecked editor lifecycle, mutation, extension, render, hook, keyboard, callback, product-sugar, alias, and escape-hatch surfaces against the one-public-path / one-advanced-escape-hatch rule. | Added Pass 9 simplicity verdict; cut raw `onValueChange` / `onSelectionChange`; closed raw `editor.chain()` as Plate/product-only; raised DX score to `0.92`, composability/minimalism to `0.91`, and active score to `0.895`. | None for Pass 9; maintainer objections remain. | Slate maintainer pass. |
| Slate maintainer pass | complete | Rechallenged all ten objection rows as a skeptical Slate maintainer: `state` / `tx`, grouped APIs, extension namespaces, content-only void renderers, `onKeyDown`, `onChange` / `onCommit`, hook renames, schema/spec predicates, generated proof, and no aliases. | Added Pass 10 maintainer verdict; strengthened Row 6 for the callback cuts after Pass 9; raised DX score to `0.93`, migration score to `0.89`, and active score to `0.899`. | None for Pass 10; ecosystem maintainer objections remain. | Ecosystem maintainer pass. |
| Ecosystem maintainer pass | complete | Rechecked Plate `editor.api` / `editor.tf` usage, table/image/Yjs plugins, type-test surfaces, slate-yjs init/collab contracts, plugin authoring pressure, app author void ergonomics, and generated browser proof ownership. | Added Pass 11 ecosystem verdict; made the Plate adapter layer, stale-target policy, plugin browser contract registry, and ecosystem TypeScript fixtures required; raised migration score to `0.91`, regression score to `0.88`, composability/minimalism to `0.92`, and active score to `0.905`. | None for Pass 11; revision pass must fold constraints into phases/gates. | Revision pass. |
| Revision pass | complete | Folded accepted maintainer/ecosystem constraints into the scorecard, Plate migration target, slate-yjs target, proof matrix, browser strategy, implementation phases, fast gates, open questions, and final completion gates. | Added revision verdict; made Plate adapter fixtures, stale-target policy, plugin browser contract registry, plugin void examples, ecosystem TypeScript fixtures, and slate-yjs remote commit/target proof core plan requirements; raised active score to `0.924`. | None for revision; closure must verify every final gate. | Closure pass. |
| Closure score and final gates | complete | Verified score threshold, dimension floors, evidence citations, accepted objection rows, ecosystem/collab answers, implementation phases, final proof gates, pass-state ledger, and plan deltas. | Added closure verdict; set active score to `0.924`; review lane is ready for `complete-plan` execution. | None. | Done. |

## 14. Plan Deltas From Review

Pass 1 rerun deltas:

- Reopened the review from `done` to `pending`.
- Replaced the single-pass closure claim with a pass-state ledger.
- Demoted the prior `0.928` score to candidate closure target only.
- Set active Pass 1 score to `0.806`.
- Named Pass 2 as research and live-source refresh.

Pass 2 rerun deltas:

- Revalidated the compiled read/update corpus against live local source.
- Refreshed
  `docs/research/sources/editor-architecture/react-19-2-external-store-and-background-ui.md`
  against the official React 19.2 release page.
- Confirmed no research contradiction against the `state` / `tx` namespace
  decision.
- Raised active score from `0.806` to `0.822`.
- Named Pass 3 as performance pressure pass.

Pass 3 rerun deltas:

- Added a dedicated performance pressure verdict.
- Confirmed runtime-id node/text selectors and named root source hooks are the
  right direction.
- Confirmed render-profiler and stress-budget proof hooks exist.
- Kept eager void `focused` / `selected` props as a hard closure blocker.
- Raised active score from `0.822` to `0.841`.
- Named Pass 4 as DX pressure pass.

Pass 4 rerun deltas:

- Added a dedicated DX pressure verdict.
- Accepted `state` / `tx`, `target`, `onKeyDown`, `onChange`, and content-only
  `renderVoid` as final names pending maintainer review.
- Rejected `api` / `tf`, public `onKeyCommand`, public `onSnapshotChange`,
  `RenderVoidPropsFor`, and app-owned void shell props.
- Raised active score from `0.841` to `0.859`.
- Named Pass 5 as unopinionated-core pressure pass.

Pass 5 rerun deltas:

- Added a dedicated unopinionated-core verdict.
- Confirmed raw Slate should not expose `editor.commands`, `editor.chain()`, or
  chain-first toolbar ceremony.
- Kept Tiptap-style command catalogs as Plate/product adapter sugar over
  `editor.update`.
- Kept extension-provided `state` / `tx` namespaces as the clean replacement
  for direct extension method recomposition onto the editor object.
- Raised active score from `0.859` to `0.871`.
- Named Pass 6 as migration pass.

Pass 6 rerun deltas:

- Added a dedicated migration verdict.
- Validated table/plugin, link/mark, void/media, type-inference, and
  slate-yjs/operation replay rows against current Plate and Slate v2 source.
- Kept Plate `editor.api` / `editor.tf` as adapter sugar, not raw Slate
  terminology.
- Confirmed `state` / `tx` extension namespaces are enough for Plate if the
  type system preserves inferred plugin groups.
- Raised active score from `0.871` to `0.881`.
- Named Pass 7 as regression pass.

Pass 7 rerun deltas:

- Added a dedicated regression pressure verdict.
- Confirmed the generated stress suite already maps the reported regression
  families to reusable browser contracts.
- Confirmed replay artifacts and render-budget assertions are first-class proof
  mechanisms.
- Kept examples classified as demos, not the regression spine.
- Identified closure gaps for final callback names, hook renames,
  `onKeyDown(event, ctx)`, and final `state` / `tx` namespace contracts.
- Raised active score from `0.881` to `0.887`.
- Named Pass 8 as research pass.

Pass 8 rerun deltas:

- Added a dedicated research pressure verdict.
- Revalidated the plan against the compiled research layer and live local
  Lexical, ProseMirror, and Tiptap source citations.
- Confirmed React 19.2 evidence supports React as projection/UI scheduler, not
  as a replacement for editor dirty-node runtime.
- Confirmed runtime-owned shell DX is backed by the node/render research lane.
- Found no contradiction in the accepted `state` / `tx` namespace decision.
- Raised active score from `0.887` to `0.890`.
- Named Pass 9 as simplicity pass.

Pass 9 rerun deltas:

- Added a dedicated simplicity pressure verdict.
- Reduced raw Slate callbacks to `onChange` plus advanced `onCommit`.
- Moved `onValueChange` and `onSelectionChange` to Plate/app adapter filters
  over `onChange`.
- Closed `editor.chain()` as Plate/product sugar only, not raw Slate.
- Confirmed every major surface has one obvious public path and at most one
  advanced escape hatch.
- Raised active score from `0.890` to `0.895`.
- Named Pass 10 as Slate maintainer pass.

Pass 10 rerun deltas:

- Added a dedicated Slate maintainer verdict.
- Rechallenged every objection row against Slate-ness, migration pain, docs,
  tests, Plate, and slate-yjs.
- Kept all ten hard cuts.
- Strengthened Row 6 for the post-Pass-9 callback surface:
  `onChange` plus advanced `onCommit`, no raw `onValueChange` /
  `onSelectionChange`.
- Added required strengthening for mechanical adoption recipes, final callback
  examples, hook export contracts, void examples, and `state` / `tx` type
  fixtures.
- Raised active score from `0.895` to `0.899`.
- Named Pass 11 as ecosystem maintainer pass.

Pass 11 rerun deltas:

- Added a dedicated ecosystem maintainer verdict.
- Rechallenged the plan from Plate maintainer, Plate plugin author, slate-yjs
  maintainer, third-party plugin author, test/release maintainer, and app author
  perspectives.
- Kept raw Slate `state` / `tx` and explicitly kept `editor.api` /
  `editor.tf` as Plate-owned adapter sugar.
- Made Plate adapter proof, stale-target policy, plugin browser contract
  registry, plugin void examples, and ecosystem TypeScript fixtures required
  before closure.
- Raised active score from `0.899` to `0.905`.
- Named the revision pass as the next owner.

Revision pass deltas:

- Folded accepted objection answers into the main plan sections instead of
  leaving them only in Pass 10/11 verdicts.
- Added Plate adapter proof to migration target, proof matrix, phases, and
  final gates.
- Added stale `EditorTarget` policy to slate-yjs target, proof matrix, phases,
  open questions, and final gates.
- Added plugin browser contract registry requirements to browser strategy,
  phases, fast gates, and final gates.
- Added ecosystem TypeScript fixtures to migration target, proof matrix, phases,
  and final gates.
- Raised active score from `0.905` to `0.924`.
- Named closure as the next owner.

Closure pass deltas:

- Verified every `slate-review` completion threshold.
- Added a dedicated closure verdict.
- Marked the pass-state ledger complete through closure.
- Kept active score at `0.924`.
- Set the review lane to `done`.

Accepted decisions after revision:

Added decisions:

- `state` / `tx` naming is accepted.
- `tx` includes read groups.
- extension methods attach to `state` / `tx` namespaces.
- `editor.schema` owns predicate access.

Revised decisions:

- public keyboard API keeps Slate-close `onKeyDown` and cuts public
  `onKeyCommand`.
- public change API uses `onChange` and `onCommit`, not `onSnapshotChange`.
- raw Slate cuts `onValueChange` and `onSelectionChange`; Plate/adapters can
  reintroduce them as filters over `onChange`.
- `renderVoid` is `element + target` only.

Dropped decisions:

- `api` / `tf` names for raw Slate.
- top-level `actions` for void renderers.
- compatibility aliases before publish.
- optional `editor.chain()` in raw Slate.

Strengthened acceptance criteria:

- every hard cut has a public surface contract test
- every render hot path has render budget proof
- Plate and slate-yjs migration rows are required before closure
- Plate adapter fixtures prove `editor.api` / `editor.tf` are product sugar over
  legal raw Slate read/update contexts
- stale `EditorTarget` behavior is specified and covered for local and remote
  changes
- plugin-provided browser contract rows can join the generated proof system
- ecosystem TypeScript fixtures cover plugin namespace inference and collisions

No-change decisions:

- keep Slate value and operation model
- keep `editor.read` / `editor.update`
- keep generated browser stress outside the fastest routine loop

## 15. Open Questions And What Would Change The Decision

No blocking open question remains for planning.

Non-blocking implementation choices:

- exact names for grouped methods where Slate legacy has multiple close terms

Closed implementation choice:

- `editor.chain()` belongs to Plate/product sugar only, not raw Slate.
- `EditorTarget` is a local runtime handle; it can rebase or fail softly, but it
  is not serialized collaboration identity.
- `editor.api` / `editor.tf` are Plate adapter names only.
- plugin browser contracts are part of the regression system, not bespoke
  example tests.

What would change the decision:

- a type-system proof that `state` / `tx` namespaces cannot preserve plugin
  inference
- a slate-yjs proof that target rebasing or nullability changes serialized
  operation determinism
- browser evidence that runtime-owned target refs add measurable hot-path cost
  beyond current path refs

## 16. Implementation Phases With Owners

### Phase 1: Core lifecycle and grouped API

Owner: `packages/slate`.

- introduce `EditorStateView` and `EditorTransactionView`
- implement grouped read APIs
- implement grouped tx write APIs
- make writes outside `editor.update` fail in development/test
- keep operation output identical where behavior is unchanged

### Phase 2: Extension namespace model

Owner: `packages/slate`.

- add extension `state` and `tx` namespaces
- migrate current flat `methods` registration
- add conflict and dependency tests
- keep commands/commit listeners/operation middleware as runtime slots
- add ecosystem TypeScript fixtures for nested groups, collision errors,
  composed plugin inference, and `state.<plugin>` / `tx.<plugin>` augmentation

### Phase 3: React render API and hook cleanup

Owner: `packages/slate-react`.

- replace `renderVoid` props with `element + target`
- remove eager `focused` / `selected` subscriptions
- define stale `EditorTarget` runtime behavior: rebase when possible, fail
  softly when invalid, never serialize target identity
- add `useEditor`, `useElementSelected`, `useEditorFocused`, and related
  renamed hooks
- cut old exports before publish
- remove `RenderVoidPropsFor` casts from examples
- add image, mention, embed, editable-island, and table-adjacent widget examples
  using content-only void renderers

### Phase 4: Event and callback API cleanup

Owner: `packages/slate-react`.

- remove public `onKeyCommand`
- make `onKeyDown(event, ctx)` carry handled/repair return contract
- replace public `onSnapshotChange` with `onChange` and `onCommit`
- remove raw `onValueChange` and `onSelectionChange`; adapters can filter
  `onChange`
- update all examples and tests
- add callback tests for controlled value sync, selection observation, commit
  telemetry, metadata-only commits, and remote commits

### Phase 5: Schema/spec surface

Owner: `packages/slate` and `packages/slate-react`.

- add `editor.schema`
- compile element specs into schema policy
- migrate void kind behavior to specs
- keep manual predicate overrides as advanced extension policy
- require `renderShellUnsafe` users to register browser contracts for owned DOM
  shell behavior

### Phase 6: Plate and slate-yjs proof

Owner: adapters.

- migrate one Plate-style table/link/media plugin fixture
- add a Plate adapter fixture proving `editor.api` / `editor.tf` are product
  sugar over legal raw Slate `state` / `tx` contexts
- prove Plate adapter transforms cannot write outside `editor.update`
- prove Plate adapter reads inside updates observe transaction-local state
- prove slate-yjs remote apply and operation replay stay deterministic
- prove remote commit metadata does not depend on React callbacks
- prove local targets rebase or null after remote remove/move
- document adapter rules

### Phase 7: Browser parity and release proof

Owner: `packages/slate-browser` and Playwright suite.

- add generated operation-family rows for every renamed public surface
- add legacy-vs-v2 parity rows for selection and void scenarios
- add a plugin browser contract registry so table/media/link/mark/editable
  island plugins can contribute replayable rows
- add stale-target browser rows around void selection, remote remove/move, and
  follow-up typing
- run focused browser rows, `test:stress`, and `bun check:full`

## 17. Fast Driver Gates

During implementation:

```bash
bun --filter slate test
bun --filter slate-react test:vitest
bun --filter slate-browser test:core
bun --filter slate-react typecheck
bun --filter slate-browser typecheck
bun typecheck:site
bun lint
```

Type/API proof:

```bash
bun test:release-discipline
bun typecheck:packages
bun typecheck:site
bun --filter slate-browser test:core
cd /Users/zbeyens/git/plate-2 && pnpm test:types
```

Focused browser:

```bash
PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright \
  playwright/integration/examples/images.test.ts \
  playwright/integration/examples/embeds.test.ts \
  playwright/integration/examples/editable-voids.test.ts \
  playwright/integration/examples/mentions.test.ts \
  --project=chromium
```

Plugin browser contracts:

```bash
PLUGIN_CONTRACTS=table,media,link,mark,editable-island \
  PLAYWRIGHT_RETRIES=0 bun test:stress
```

Stress:

```bash
STRESS_FAMILIES=inline-void-boundary-navigation,markable-inline-void-formatting,block-void-navigation,editable-island-native-focus \
  PLAYWRIGHT_RETRIES=0 bun test:stress
```

Release closure:

```bash
bun check:full
```

## 18. Final Completion Gates

The implementation is not complete until all gates pass:

- no public `onKeyCommand`
- no public `onSnapshotChange`
- no raw Slate `onValueChange` / `onSelectionChange`
- no public `actions` in `RenderVoidProps`
- no eager `focused` / `selected` in `RenderVoidProps`
- no `RenderVoidPropsFor` casts in first-party examples
- `useSlateStatic`, `useSelected`, and `useFocused` aliases removed before
  publish
- writes outside `editor.update` fail in development/test
- reads inside `tx` see transaction-local state
- extension `state` / `tx` namespaces typecheck with plugin augmentation
- `editor.schema` is the documented predicate surface
- Plate adapter fixture proves `editor.api` / `editor.tf` read/write through
  legal raw Slate contexts
- Plate adapter transforms cannot write outside `editor.update`
- adapter reads inside updates observe transaction-local state
- stale `EditorTarget` handles rebase or fail softly; they are never serialized
  collaboration identity
- slate-yjs/collab replay fixture passes with remote commit metadata
- remote apply does not depend on React `onChange` / `onCommit`
- ecosystem TypeScript fixtures cover nested plugin groups, collision errors,
  composed inference, and state/tx augmentation
- plugin browser contract registry accepts first-party plugin rows
- `renderShellUnsafe` examples carry explicit browser contracts
- generated browser rows cover selection, void, callbacks, keyboard, target,
  and extension families
- `bun check:full` passes

## 19. Execution Ledger

### 2026-04-28 Phase 1 tracer: public state/tx callback views

Status: complete for tracer, lane still pending.

Implemented in `/Users/zbeyens/git/slate-v2`:

- `editor.read((state) => ...)` receives grouped read state.
- `editor.update((tx) => ...)` receives grouped tx write/read methods.
- `tx` reads observe same-update draft mutations.
- tx write groups route through the existing transaction runtime.
- release-discipline inventory classifies the new public-state adapter as a
  central runtime owner.

Files changed:

- `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/public-state.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/create-editor.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/test/state-tx-public-api-contract.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/test/escape-hatch-inventory-contract.ts`

Verification:

```bash
bun test ./packages/slate/test/state-tx-public-api-contract.ts
bun test ./packages/slate/test/read-update-contract.ts ./packages/slate/test/write-boundary-contract.ts ./packages/slate/test/transaction-contract.ts ./packages/slate/test/state-tx-public-api-contract.ts
bun test ./packages/slate/test/transaction-target-runtime-contract.ts ./packages/slate/test/generic-editor-api-contract.ts ./packages/slate/test/surface-contract.ts
bun test:release-discipline
bun lint:fix
bun typecheck:packages
```

Notes:

- `bun --filter slate test` does not match a package in this checkout; focused
  package contracts were run directly.
- The first `bun typecheck:packages` failed on tx generic variance. The accepted
  fix keeps read value generics precise and widens tx write parameter types so
  `Editor<CustomValue>` still flows through runtime helpers.

Next owner:

- Phase 1 extension namespace registration: `state.<extension>` /
  `tx.<extension>` group composition, collision proof, cleanup, and type
  fixtures.

### 2026-04-28 Phase 1 tracer: extension namespaces and method hard cut

Status: complete for runtime tracer, lane still pending for TypeScript
augmentation fixtures.

Implemented in `/Users/zbeyens/git/slate-v2`:

- extension `state` / `tx` groups register into runtime namespace maps
- duplicate extension group names fail before becoming public state
- reserved core group names reject extension collisions
- unextend cleans up extension groups
- failed multi-extension batches roll back earlier namespace groups
- flat extension `methods` are no longer a public or internal registration
  path
- stale runtime objects that still pass `methods` are rejected before editor
  mutation
- registry `methodNames` and editor-object method recomposition were removed

Files changed:

- `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/public-state.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/extension-registry.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/editor-extension.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/test/extension-namespaces-contract.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/test/extension-methods-contract.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/test/extension-contract.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/test/escape-hatch-inventory-contract.ts`

Verification:

```bash
bun test ./packages/slate/test/extension-namespaces-contract.ts
bun test ./packages/slate/test/extension-methods-contract.ts ./packages/slate/test/extension-namespaces-contract.ts ./packages/slate/test/generic-extension-contract.ts ./packages/slate/test/extension-contract.ts ./packages/slate/test/state-tx-public-api-contract.ts ./packages/slate/test/read-update-contract.ts
bun typecheck:packages
bun lint:fix
bun test:release-discipline
```

Notes:

- `EditorExtension.methods` was cut instead of renamed. Plugin sugar can exist
  above raw Slate, but the raw runtime extension surface is grouped `state` /
  `tx`.
- The first rollback helper typecheck failed because it accepted the full
  generic registry type even though cleanup only deletes installed extension
  names. The fix narrowed the helper to that one operation.

Next owner:

- Phase 1 namespace TypeScript fixtures: inferred `state.<plugin>` /
  `tx.<plugin>` groups, nested group shapes, collision errors, composed
  inference, and module augmentation.

### 2026-04-28 Phase 1 tracer: extension namespace type fixtures

Status: complete for Phase 1 type surface, lane still pending for React/API
cuts.

Implemented in `/Users/zbeyens/git/slate-v2`:

- `EditorStateExtensionGroups<V>` and `EditorTxExtensionGroups<V>` are public
  module-augmentation slots
- `EditorStateView<V>` and `EditorUpdateTransaction<V>` expose augmented
  extension groups while the runtime builders satisfy non-augmented core view
  types first
- extension group factories get contextual return typing for known augmented
  group names
- compile-only fixture proves:
  - nested `state.<plugin>` groups
  - nested `tx.<plugin>` groups
  - tx-only groups are not visible in read state
  - extension groups do not mutate the editor object
  - bad known-group return shapes fail typecheck
  - custom value generics flow through augmented state groups

Files changed:

- `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/public-state.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/test/generic-extension-namespace-contract.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/test/tsconfig.generic-types.json`

Verification:

```bash
bunx tsc --project packages/slate/test/tsconfig.generic-types.json --noEmit
bun test ./packages/slate/test/extension-methods-contract.ts ./packages/slate/test/extension-namespaces-contract.ts ./packages/slate/test/generic-extension-contract.ts ./packages/slate/test/extension-contract.ts ./packages/slate/test/state-tx-public-api-contract.ts ./packages/slate/test/read-update-contract.ts
bun typecheck:packages
bun lint:fix
bun test:release-discipline
```

Notes:

- The first type fixture run failed red on missing namespace augmentation.
- Biome tried to collapse empty augmentation interfaces into type aliases. The
  final slots are interfaces with optional unique-symbol brands so they remain
  mergeable without lint suppression.

Next owner:

- Phase 2 React void renderer API cut: `RenderVoidProps` becomes
  `{ element, target }`, eager `focused` / `selected` / `actions` leave the
  default render path, and first-party void renderers move to opt-in
  node-scoped hooks/selectors.
