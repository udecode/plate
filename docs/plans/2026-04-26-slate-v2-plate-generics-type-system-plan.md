# Slate v2 Plate Generics Type System Plan

## Status

Done.

## 2026-04-26 Follow-up: Generic Parity Closure

Status: done.

Actions:

- Added RED compile coverage for the missed generic holes:
  `generic-value-contract.ts`, `generic-editor-api-contract.ts`,
  `generic-extension-contract.ts`, and the React generic selector contract.
- Added Plate-aligned helper aliases for value/node/entry/mark derivation:
  `ElementOrTextIn`, `DescendantIn`, `NodeIn`, `AncestorIn`, `ChildOf`,
  `MarksOf`, `MarksIn`, `MarkKeysOf`, `NodeEntryIn`, `NodeEntryOf`,
  `ElementEntryOf`, and `TextEntryOf`.
- Threaded `V extends Value` through public static editor APIs for children,
  operations, commits, snapshots, transactions, extension listeners, and
  React selectors.
- Kept internal runtime instance parameters structurally broad where TypeScript
  variance would otherwise make `Editor<V>` unusable by existing internal
  helpers. Public/static contracts remain the generic boundary.
- Typed DOM pasted-fragment parsing as `DescendantIn<V>[]`.

Evidence:

- `bunx tsc --project packages/slate/test/tsconfig.generic-types.json --noEmit --pretty false`
- `bunx tsc --project packages/slate-history/test/tsconfig.generic-types.json --noEmit --pretty false`
- `bunx tsc --project packages/slate-react/test/tsconfig.generic-types.json --noEmit --pretty false`
- `bun test ./packages/slate --bail 1`
- `bun test ./packages/slate-history --bail 1`
- `bun --cwd packages/slate-react test -- --bail 1`
- `bun test ./test/bridge.test.ts ./test/clipboard-boundary.test.ts --bail=1`
  from `../slate-v2/packages/slate-dom`
- `bun run lint:fix`
- `bunx turbo build --filter=./packages/slate --filter=./packages/slate-history --filter=./packages/slate-dom --filter=./packages/slate-react --force`
- `bunx turbo typecheck --filter=./packages/slate --filter=./packages/slate-history --filter=./packages/slate-dom --filter=./packages/slate-react --force`
- `bun run lint`

Rejected tactic:

- Do not force every internal instance method to be perfectly generic. That
  creates TypeScript variance explosions and weakens the implementation. The
  durable boundary is generic public/static APIs plus broad structural runtime
  internals.

## Goal

Replace Slate v2 declaration merging with a Plate-aligned generic type system, without guessing or inventing a parallel model.

The target is:

```ts
type Value = TElement[]
type Editor<V extends Value = Value> = EditorBase<V> & RuntimeEditor<V>
```

Everything else derives from `Value`, `TElement`, `TText`, and `Editor<V>`.

## Verdict

Drop `CustomTypes` / `ExtendedType` as the primary type system.

Plate already solved the practical DX shape better than Slate legacy: document shape is carried by `Value`, editor APIs derive node/text/element types from that value, and plugin/editor layers add their own generics on top. Slate v2 should pull that model, not infer a new one.

The only allowed improvements over Plate are explicit:

1. Replace Plate's weak `EditorMarks = Record<string, any>` with marks derived from the editor text type.
2. Make operation, commit, snapshot, transaction, command, and extension types generic over `Value`, because Slate v2 treats operations as collaboration truth and commits as runtime truth.

## Non-Goals

- Do not rewrite the browser editing kernel in this plan.
- Do not redesign public editing methods in this plan.
- Do not keep a hybrid where declaration merging still controls package internals.
- Do not expose a schema object as the canonical type model.
- Do not fix source-first site aliases before this type boundary is in place.
- Do not preserve `CustomTypes` docs as the primary TypeScript story.

## Plate Source Of Truth Matrix

| Plate source | Plate generic law | Slate v2 target | Action | Drift allowed |
| --- | --- | --- | --- | --- |
| `../plate/packages/slate/src/interfaces/editor/editor-type.ts` | `Editor<V extends Value = Value>`, `EditorBase<V>`, `EditorMethods<V>`, `Value`, `ValueOf<E>`, `EditorSelection` | `../slate-v2/packages/slate/src/interfaces/editor.ts`, `../slate-v2/packages/slate/src/create-editor.ts`, `../slate-v2/packages/slate/src/core/public-state.ts` | Port the `Value`-first editor model. Keep Slate v2 read/update/transaction fields in the runtime portion. | No, except marks improvement. |
| `../plate/packages/slate/src/interfaces/element.ts` | `TElement`, `Element = TElement`, `ElementIn<V>`, `ElementOf<N>`, `ElementOrTextOf<E>` | `../slate-v2/packages/slate/src/interfaces/element.ts`, `../slate-v2/packages/slate/src/interfaces/node.ts` | Replace `ExtendedType<'Element'>` with direct generic helpers. | No. |
| `../plate/packages/slate/src/interfaces/text.ts` | `TText`, `Text = TText`, `TextIn<V>`, `TextOf<N>` | `../slate-v2/packages/slate/src/interfaces/text.ts`, `../slate-v2/packages/slate/src/interfaces/editor.ts` | Replace `ExtendedType<'Text'>`; derive marks from `TextOf<E>`. | Yes: improve marks. |
| `../plate/packages/slate/src/interfaces/node.ts` | `TNode`, `Ancestor`, `Descendant`, `NodeOf<N>`, `AncestorOf<N>`, `DescendantOf<N>`, `NodeProps<N>` | `../slate-v2/packages/slate/src/interfaces/node.ts` | Port helper structure directly. | No. |
| `../plate/packages/slate/src/interfaces/node-entry.ts` | `NodeEntryOf<E>`, `ElementEntryOf<E>`, `TextEntryOf<E>`, `AncestorEntryOf<E>`, `DescendantEntryOf<E>` | `../slate-v2/packages/slate/src/interfaces/node-entry.ts` or `../slate-v2/packages/slate/src/interfaces/node.ts` | Add if missing; do not scatter entry helpers across editor APIs. | No. |
| `../plate/packages/slate/src/interfaces/editor/editor-api.ts` | Every editor query/match option is generic on `V extends Value` where node shape matters. | `../slate-v2/packages/slate/src/interfaces/editor.ts`, `../slate-v2/packages/slate/src/editor/*.ts` | Thread `V` through editor options and return types. | No. |
| `../plate/packages/slate/src/interfaces/editor/editor-transforms.ts` | `EditorTransforms<V>`, transform options generic by `V`, transform node types derived from `ValueOf<E>` | `../slate-v2/packages/slate/src/interfaces/transforms/*.ts`, `../slate-v2/packages/slate/src/transforms-*/*.ts`, `../slate-v2/packages/slate/src/editor/*.ts` | Preserve flexible primitives; do not invent semantic method bloat. | No. |
| `../plate/packages/slate/src/interfaces/editor/legacy-editor.ts` | Compat bridge for legacy transform shape. | None as primary. Optional internal-only bridge if a migration tracer proves it is needed. | Do not port as public API. | Yes: hard cut public compat. |
| `../plate/packages/core/src/lib/editor/SlateEditor.ts` | `TSlateEditor<V, P>` layers plugin config generics over Slate editor generics. | `../slate-v2/packages/slate/src/core/editor-extension.ts`, `../slate-v2/packages/slate/src/core/extension-registry.ts` | Use as the extension generic model, not the core node model. | No in spirit; names can fit Slate v2. |
| `../plate/packages/core/src/lib/editor/withSlate.ts` | `withSlate<V, P>` preserves editor value and plugin generics. | `../slate-v2/packages/slate/src/core/editor-extension.ts`, package consumers | Keep extension runtime generic over `E extends Editor<V>`. | No. |
| `../plate/packages/core/src/react/editor/PlateEditor.ts` | `TPlateEditor<V, P>` extends Slate editor with React/plugin runtime. | `../slate-v2/packages/slate-react/src/plugin/react-editor.ts`, `../slate-v2/packages/slate-react/src/context.tsx` | Use the layering idea, not Plate plugin runtime implementation. | No in architecture; implementation differs. |

## Better-Than-Plate Decisions

### 1. Marks

Plate:

```ts
type EditorMarks = Record<string, any>
```

Slate v2 target:

```ts
type MarksOfText<T extends TText> = Partial<Omit<T, 'text'>>
type EditorMarksOf<E extends Editor> = MarksOfText<TextOf<E>>
type EditorMarks<V extends Value = Value> = MarksOfText<TextIn<V>>
```

Reason: mark keys should come from the editor's text union, not `any`. This keeps custom mark DX flexible without losing agent/type guidance.

### 2. Operations And Commits

Plate keeps operation payloads mostly at static `Node` / `Operation` shape. Slate v2 should generic-thread them:

```ts
type Operation<V extends Value = Value> = ...
type EditorTransaction<V extends Value = Value> = ...
type EditorSnapshot<V extends Value = Value> = ...
type EditorCommit<V extends Value = Value> = ...
```

Reason: operations are Slate v2 collaboration truth and commits are local runtime truth. If operation payloads collapse to untyped `Node`, the generic model leaks exactly where history, Yjs, React dirtiness, and tests need precision.

If this is too wide for the first implementation slice, phase it:

1. Core node/editor/query generics first.
2. Operation subtype generics second.
3. Commit/history/react generics third.

Do not skip it permanently.

### 3. Schema Alias

Do not replace `Value` with a schema object. Add a helper only for authoring:

```ts
type EditorSchema<
  TElementUnion extends TElement = TElement,
  TTextUnion extends TText = TText,
> = {
  Element: TElementUnion
  Text: TTextUnion
}

type ValueOfSchema<S extends EditorSchema> = S['Element'][]
```

Reason: plugin authors often think in element/text unions; Plate-compatible core still thinks in `Value`.

## Canonical Generic Vocabulary

| Type | Meaning | Owner file |
| --- | --- | --- |
| `TText` | Base text node with `{ text: string }` plus custom properties. | `../slate-v2/packages/slate/src/interfaces/text.ts` |
| `TElement` | Base element node with `children`. | `../slate-v2/packages/slate/src/interfaces/element.ts` |
| `Value` | Top-level editor document: `TElement[]`. | `../slate-v2/packages/slate/src/interfaces/editor.ts` or `../slate-v2/packages/slate/src/interfaces/node.ts` |
| `Text` | Alias of `TText`, not declaration-merged app text. | `../slate-v2/packages/slate/src/interfaces/text.ts` |
| `Element` | Alias of `TElement`, not declaration-merged app element. | `../slate-v2/packages/slate/src/interfaces/element.ts` |
| `Descendant` | `TElement | TText`. | `../slate-v2/packages/slate/src/interfaces/node.ts` |
| `Ancestor` | `Editor | TElement`. | `../slate-v2/packages/slate/src/interfaces/node.ts` |
| `Node` | `Editor | TElement | TText`. | `../slate-v2/packages/slate/src/interfaces/node.ts` |
| `TextIn<V>` | Text union inside `V`. | `../slate-v2/packages/slate/src/interfaces/text.ts` |
| `ElementIn<V>` | Element union inside `V`. | `../slate-v2/packages/slate/src/interfaces/element.ts` |
| `NodeIn<V>` | Node union inside `V`. | `../slate-v2/packages/slate/src/interfaces/node.ts` |
| `TextOf<E>` | Text union inside editor/node `E`. | `../slate-v2/packages/slate/src/interfaces/text.ts` |
| `ElementOf<E>` | Element union inside editor/node `E`. | `../slate-v2/packages/slate/src/interfaces/element.ts` |
| `NodeOf<E>` | Node union inside editor/node `E`. | `../slate-v2/packages/slate/src/interfaces/node.ts` |
| `ValueOf<E>` | `E['children']`. | `../slate-v2/packages/slate/src/interfaces/editor.ts` |
| `EditorMarksOf<E>` | Mark object derived from `TextOf<E>`. | `../slate-v2/packages/slate/src/interfaces/editor.ts` |
| `Operation<V>` | Operation payloads typed from `NodeIn<V>` / `Range`. | `../slate-v2/packages/slate/src/interfaces/operation.ts` |
| `Editor<V>` | Public editor type. | `../slate-v2/packages/slate/src/interfaces/editor.ts` |
| `EditorTransaction<V>` | Write boundary runtime. | `../slate-v2/packages/slate/src/interfaces/editor.ts`, `../slate-v2/packages/slate/src/core/public-state.ts` |
| `EditorCommit<V>` | Local runtime observation payload. | `../slate-v2/packages/slate/src/interfaces/editor.ts`, `../slate-v2/packages/slate/src/core/public-state.ts` |
| `HistoryEditor<V>` | History-enhanced editor. | `../slate-v2/packages/slate-history/src/history-editor.ts` |
| `DOMEditor<V>` | DOM-enhanced editor. | `../slate-v2/packages/slate-dom/src/plugin/dom-editor.ts` |
| `ReactEditor<V>` | React-enhanced editor. | `../slate-v2/packages/slate-react/src/plugin/react-editor.ts` |

## Slate v2 File Matrix

Legend:

- `G0`: no generic change expected; verify only.
- `G1`: base model generic migration.
- `G2`: editor API / transform generic threading.
- `G3`: operation / transaction / commit generic threading.
- `G4`: package editor wrapper generic threading.
- `G5`: app, docs, test, and fixture migration away from declaration merging.

### `packages/slate`

| File or file group | Class | Required work |
| --- | --- | --- |
| `../slate-v2/packages/slate/src/types/custom-types.ts` | G1 | Delete or replace with a non-augmenting generic helper file. Remove `CustomTypes` and `ExtendedType`. |
| `../slate-v2/packages/slate/src/types/index.ts` | G1 | Stop exporting declaration-merging helpers. Export generic helpers if they live under `types`. |
| `../slate-v2/packages/slate/src/types/types.ts` | G1 | Audit for old aliases that assume global custom types. |
| `../slate-v2/packages/slate/src/interfaces/text.ts` | G1 | Replace `ExtendedType<'Text'>` with `TText`, `Text`, `TextIn<V>`, `TextOf<N>`. |
| `../slate-v2/packages/slate/src/interfaces/element.ts` | G1 | Replace `ExtendedType<'Element'>` with `TElement`, `Element`, `ElementIn<V>`, `ElementOf<N>`, `ElementOrTextOf<E>`. |
| `../slate-v2/packages/slate/src/interfaces/node.ts` | G1 | Add Plate-compatible `TNode`, `NodeIn<V>`, `NodeOf<N>`, `AncestorOf<N>`, `DescendantOf<N>`, `NodeProps<N>`. |
| `../slate-v2/packages/slate/src/interfaces/editor.ts` | G1/G2/G3 | Make `Editor<V>`, `BaseEditor<V>`, `Value`, `ValueOf<E>`, `EditorMarks<V>`, `EditorMarksOf<E>`, `EditorSnapshot<V>`, `EditorTransaction<V>`, `EditorCommit<V>`, extension and command types generic. |
| `../slate-v2/packages/slate/src/interfaces/operation.ts` | G3 | Remove `ExtendedType` from operation subtypes. Add `Operation<V>`, `InsertNodeOperation<V>`, `RemoveNodeOperation<V>`, `SplitNodeOperation<V>`, `MergeNodeOperation<V>`, `SetNodeOperation<V>` with typed node payloads. |
| `../slate-v2/packages/slate/src/interfaces/range.ts` | G1 | Replace `ExtendedType<'Range'>` with direct `Range`. Do not generic-thread unless range metadata becomes real. |
| `../slate-v2/packages/slate/src/interfaces/point.ts` | G1 | Replace `ExtendedType<'Point'>` with direct `Point`. |
| `../slate-v2/packages/slate/src/interfaces/location.ts` | G1 | Verify `Location` uses direct `Path | Point | Range | Span` and no global custom type. |
| `../slate-v2/packages/slate/src/interfaces/bookmark.ts` | G3 | Make bookmarks explicit about selection/node generics if bookmark stores node snapshots. |
| `../slate-v2/packages/slate/src/interfaces/path.ts` | G0 | Verify path stays structural, not generic. |
| `../slate-v2/packages/slate/src/interfaces/path-ref.ts` | G0 | Verify no global custom type. |
| `../slate-v2/packages/slate/src/interfaces/point-ref.ts` | G0 | Verify no global custom type. |
| `../slate-v2/packages/slate/src/interfaces/range-ref.ts` | G0 | Verify no global custom type. |
| `../slate-v2/packages/slate/src/interfaces/scrubber.ts` | G0 | Verify only accepts structural values. |
| `../slate-v2/packages/slate/src/interfaces/index.ts` | G1/G2/G3 | Re-export the generic vocabulary. Do not re-export `CustomTypes` / `ExtendedType`. |
| `../slate-v2/packages/slate/src/interfaces/transforms/general.ts` | G2 | Thread `V` through transform options that accept `Node`, `Descendant`, `Element`, `Text`, or match predicates. |
| `../slate-v2/packages/slate/src/interfaces/transforms/node.ts` | G2 | Thread `V`; `nodes`, `match`, `at`, inserted node payloads derive from `Value`. |
| `../slate-v2/packages/slate/src/interfaces/transforms/selection.ts` | G2 | Verify direct `Range` / `Point`; no declaration merging. |
| `../slate-v2/packages/slate/src/interfaces/transforms/text.ts` | G2 | Thread text type through marks and insertion options. |
| `../slate-v2/packages/slate/src/create-editor.ts` | G1/G3 | `createEditor<V extends Value = Value>(): Editor<V>`. Construct base editor internally; cast only at the boundary. |
| `../slate-v2/packages/slate/src/index.ts` and `../slate-v2/packages/slate/index.ts` | G1/G2/G3 | Public export audit; no `CustomTypes` primary export. |
| `../slate-v2/packages/slate/src/core/apply.ts` | G3 | `applyOperation<V>` and operation middleware use `Operation<V>`. |
| `../slate-v2/packages/slate/src/core/public-state.ts` | G1/G3 | Generic current value, selection, marks, operations, snapshots, transactions, and commits. |
| `../slate-v2/packages/slate/src/core/command-registry.ts` | G3 | Command context uses `E extends Editor<V>`. |
| `../slate-v2/packages/slate/src/core/editor-extension.ts` | G3 | Extension methods use `E extends Editor<V>`, not `BaseEditor = Editor` without value. |
| `../slate-v2/packages/slate/src/core/extension-registry.ts` | G3 | Registry stores typed methods/listeners without erasing `V`. |
| `../slate-v2/packages/slate/src/core/batch-dirty-paths.ts` | G3 | Dirty paths stay path-based; commit metadata generic only if node payload leaks in. |
| `../slate-v2/packages/slate/src/core/get-dirty-paths.ts` | G3 | Same as dirty paths. |
| `../slate-v2/packages/slate/src/core/update-dirty-paths.ts` | G3 | Operation generic input. |
| `../slate-v2/packages/slate/src/core/get-fragment.ts` | G2/G3 | Fragment return type derives from `ValueOf<E>`. |
| `../slate-v2/packages/slate/src/core/leaf-lifecycle.ts` | G1/G3 | Empty leaf normalization must use `TextOf<E>` / marks type, not untyped text. |
| `../slate-v2/packages/slate/src/core/normalize-node.ts` | G2 | Normalize entry and node types derive from `E`. |
| `../slate-v2/packages/slate/src/core/should-normalize.ts` | G2 | Options generic only if node entry payloads are exposed. |
| `../slate-v2/packages/slate/src/core/index.ts` | G1/G2/G3 | Re-export audit. |
| `../slate-v2/packages/slate/src/editor/*.ts` | G2 | Every editor query/mutation must accept `E extends Editor` and derive `ValueOf<E>`, `NodeOf<E>`, `ElementOf<E>`, `TextOf<E>`, `EditorMarksOf<E>`. |
| `../slate-v2/packages/slate/src/transforms-node/*.ts` | G2 | Preserve flexible primitives; replace static `Node` / `Element` / `Descendant` inputs with derived generic types. |
| `../slate-v2/packages/slate/src/transforms-selection/*.ts` | G2 | Verify selection transforms do not import global custom types; keep structural points/ranges. |
| `../slate-v2/packages/slate/src/transforms-text/*.ts` | G2 | `insertText`, `deleteText`, mark behavior derive marks from text type. |
| `../slate-v2/packages/slate/src/utils/types.ts` | G1/G2 | Central helper type cleanup; remove `ExtendedType` assumptions. |
| `../slate-v2/packages/slate/src/utils/runtime-ids.ts` | G0/G3 | Keep runtime IDs structural; only generic if public node payloads are exposed. |
| `../slate-v2/packages/slate/src/utils/get-default-insert-location.ts` | G2 | Insert location uses `E extends Editor`. |
| `../slate-v2/packages/slate/src/utils/modify.ts` | G2 | Verify point/range only. |
| `../slate-v2/packages/slate/src/utils/*.ts` | G0 | Verify no hidden `CustomTypes` import or global `Element/Text` assumption. |
| `../slate-v2/packages/slate/src/range-projection.ts` | G3 | Generic only if projection payloads carry nodes. |
| `../slate-v2/packages/slate/src/selection-operation.ts` | G3 | Selection op stays structural, but union must compose with `Operation<V>`. |
| `../slate-v2/packages/slate/src/text-units.ts` | G0 | Text unit logic stays structural. |
| `../slate-v2/packages/slate/test/**/*.ts` and `../slate-v2/packages/slate/test/**/*.tsx` | G5 | Replace custom-type fixture tests with explicit `createEditor<ExampleValue>()` compile/runtime contracts. Delete `tsconfig.custom-types.json`. |

### `packages/slate-dom`

| File or file group | Class | Required work |
| --- | --- | --- |
| `../slate-v2/packages/slate-dom/src/custom-types.ts` | G4/G5 | Delete module augmentation. Move DOM-only global declarations to a non-Slate `globals.d.ts` if needed. |
| `../slate-v2/packages/slate-dom/src/plugin/dom-editor.ts` | G4 | `DOMEditor<V extends Value = Value>` and DOM helpers accept `E extends Editor<V>`. |
| `../slate-v2/packages/slate-dom/src/plugin/with-dom.ts` | G4/G5 | Replace CustomTypes comments with generic editor examples. Preserve runtime behavior. |
| `../slate-v2/packages/slate-dom/src/index.ts` and `../slate-v2/packages/slate-dom/index.ts` | G4 | Re-export generic DOM editor types. |
| `../slate-v2/packages/slate-dom/src/utils/types.ts` | G4 | DOM data attributes and weak-map helpers typed against generic Slate nodes where needed. |
| `../slate-v2/packages/slate-dom/src/utils/range-list.ts` | G0 | Verify structural ranges only. |
| `../slate-v2/packages/slate-dom/src/utils/*.ts` | G0/G4 | Only generic-thread files that mention Slate nodes/editor. |
| `../slate-v2/packages/slate-dom/test/**/*.ts` | G5 | Replace any module augmentation expectations with explicit generic examples. |

### `packages/slate-history`

| File or file group | Class | Required work |
| --- | --- | --- |
| `../slate-v2/packages/slate-history/src/history.ts` | G3/G4 | `History<V>` stores `Operation<V>[]` / `EditorCommit<V>` as appropriate. |
| `../slate-v2/packages/slate-history/src/history-editor.ts` | G4 | `HistoryEditor<V extends Value = Value>`. |
| `../slate-v2/packages/slate-history/src/with-history.ts` | G4/G5 | `withHistory<V, E extends Editor<V>>(editor: E): E & HistoryEditor<V>`. Remove CustomTypes comments. |
| `../slate-v2/packages/slate-history/src/index.ts` and `../slate-v2/packages/slate-history/index.ts` | G4 | Export generic history types. |
| `../slate-v2/packages/slate-history/test/**/*.ts` and `../slate-v2/packages/slate-history/test/**/*.tsx` | G5 | Add at least one custom `Value` history compile/runtime contract. |

### `packages/slate-hyperscript`

| File or file group | Class | Required work |
| --- | --- | --- |
| `../slate-v2/packages/slate-hyperscript/src/creators.ts` | G5 | Hyperscript output type parameterizes editor/value where callers specify it. |
| `../slate-v2/packages/slate-hyperscript/src/hyperscript.ts` | G5 | Allow explicit `Value` for JSX fixture creators; do not rely on module augmentation. |
| `../slate-v2/packages/slate-hyperscript/src/tokens.ts` | G0/G5 | Verify structural token types. |
| `../slate-v2/packages/slate-hyperscript/src/index.ts` and `../slate-v2/packages/slate-hyperscript/index.ts` | G5 | Export generic creator signatures. |
| `../slate-v2/packages/slate-hyperscript/test/**/*.ts`, `../slate-v2/packages/slate-hyperscript/test/**/*.tsx`, `../slate-v2/packages/slate-hyperscript/test/fixtures/**/*.tsx` | G5 | Replace any hidden global custom type dependency with explicit helper value types. |

### `packages/slate-react`

| File or file group | Class | Required work |
| --- | --- | --- |
| `../slate-v2/packages/slate-react/src/custom-types.ts` | G4/G5 | Delete module augmentation. Move React-only ambient declarations elsewhere if truly needed. |
| `../slate-v2/packages/slate-react/src/plugin/react-editor.ts` | G4 | `ReactEditor<V extends Value = Value>` layered over `DOMEditor<V>` and `Editor<V>`. |
| `../slate-v2/packages/slate-react/src/plugin/with-react.ts` | G4/G5 | Generic `withReact`; remove CustomTypes comments. |
| `../slate-v2/packages/slate-react/src/context.tsx` | G4 | Context stores generic editor internally without leaking app-wide module augmentation. |
| `../slate-v2/packages/slate-react/src/components/slate.tsx` | G4 | `<Slate>` props generic on `V` / `E extends ReactEditor<V>`. |
| `../slate-v2/packages/slate-react/src/components/editable.tsx` | G4 | Editable props generic over `E`; render props derive `ElementOf<E>` / `TextOf<E>`. |
| `../slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx` | G4 | Replace local `TElement extends SlateElementNode` workaround with `ElementOf<E>`. |
| `../slate-v2/packages/slate-react/src/components/slate-element.tsx` | G4 | Element prop generic derives from editor context. |
| `../slate-v2/packages/slate-react/src/components/editable-element.tsx` | G4 | Same as element rendering. |
| `../slate-v2/packages/slate-react/src/components/slate-text.tsx` | G4 | Text prop generic derives from `TextOf<E>`. |
| `../slate-v2/packages/slate-react/src/components/editable-text.tsx` | G4 | Same as text rendering. |
| `../slate-v2/packages/slate-react/src/components/slate-leaf.tsx` | G4 | Leaf and marks typed from `TextOf<E>`. |
| `../slate-v2/packages/slate-react/src/components/text-string.tsx` | G0/G4 | Verify text only. |
| `../slate-v2/packages/slate-react/src/components/zero-width-string.tsx` | G0 | No model generic. |
| `../slate-v2/packages/slate-react/src/components/slate-placeholder.tsx` | G4 | Placeholder element typed from `ElementOf<E>` if exposed. |
| `../slate-v2/packages/slate-react/src/components/void-element.tsx` | G4 | Void element typed from `ElementOf<E>`. |
| `../slate-v2/packages/slate-react/src/components/slate-spacer.tsx` | G0/G4 | Verify node props only if exposed. |
| `../slate-v2/packages/slate-react/src/components/restore-dom/*.tsx` and `*.ts` | G0/G4 | DOM repair remains structural; generic only if editor typed in public functions. |
| `../slate-v2/packages/slate-react/src/editable/*.ts` | G4 | Editing kernel and controllers accept `ReactEditor<V>`; no stale custom type import. |
| `../slate-v2/packages/slate-react/src/dom-text-sync.ts` | G4 | Generic editor where Slate nodes are accepted. |
| `../slate-v2/packages/slate-react/src/projection-store.ts` | G4 | Projection payloads use `Range`, `TextOf<E>`, `ElementOf<E>` where relevant. |
| `../slate-v2/packages/slate-react/src/annotation-store.ts` | G4 | Annotation payloads generic over editor value when Slate nodes are exposed. |
| `../slate-v2/packages/slate-react/src/widget-store.ts` | G4 | Widget anchors generic only if node payloads leak. |
| `../slate-v2/packages/slate-react/src/projection-context.tsx` | G4 | Context typed from generic projection store. |
| `../slate-v2/packages/slate-react/src/large-document/*.ts` and `*.tsx` | G4 | Large-doc shell editor/value generics preserved. |
| `../slate-v2/packages/slate-react/src/hooks/**/*.ts` and `../slate-v2/packages/slate-react/src/hooks/**/*.tsx` if present | G4 | Hook return types derive from generic context. |
| `../slate-v2/packages/slate-react/src/index.ts` and `../slate-v2/packages/slate-react/index.ts` | G4 | Export generic React types. |
| `../slate-v2/packages/slate-react/test/**/*.ts` and `../slate-v2/packages/slate-react/test/**/*.tsx` | G5 | Add generic custom value render contract; remove module augmentation use. |

### `packages/slate-browser`

| File or file group | Class | Required work |
| --- | --- | --- |
| `../slate-v2/packages/slate-browser/src/browser/*.ts` | G5 | Browser snapshots are test protocol types, not Slate model generics. Verify names do not conflict with `EditorSnapshot<V>`. |
| `../slate-v2/packages/slate-browser/src/playwright/*.ts` | G5 | Test handles remain protocol-level. Add scenarios that prove custom value examples compile/run without `CustomTypes`. |
| `../slate-v2/packages/slate-browser/test/**/*.ts` | G5 | Add generic app fixture where useful. |

### Site, Docs, Examples

| File or file group | Class | Required work |
| --- | --- | --- |
| `../slate-v2/site/examples/ts/custom-types.d.ts` | G5 | Delete module augmentation. Replace with exported `ExampleText`, `ExampleElement`, `ExampleValue`, `ExampleEditor` from a normal module. |
| `../slate-v2/site/examples/ts/code-highlighting.tsx` | G5 | Remove local `declare module 'slate'`; use explicit value/editor types. |
| `../slate-v2/site/examples/ts/*.tsx` | G5 | Every example imports or declares its own `Value` / editor type when needed. No app-wide custom type pollution. |
| `../slate-v2/site/components/*.tsx` | G5 | Example loader must not depend on global custom Slate types. |
| `../slate-v2/site/pages/**/*.tsx` and `../slate-v2/site/pages/**/*.ts` | G5 | Site pages compile against package source aliases after module augmentation is gone. |
| `../slate-v2/site/next-env.d.ts` | G0/G5 | Verify no Slate declaration merging. |
| `../slate-v2/docs/concepts/12-typescript.md` | G5 | Rewrite around `Value`, `TElement`, `TText`, `Editor<Value>`. |
| `../slate-v2/docs/walkthroughs/01-installing-slate.md` | G5 | Replace `declare module 'slate'` with generic editor setup. |
| `../slate-v2/docs/walkthroughs/*.md` | G5 | Remove `CustomTypes` mental model and `Transforms.*` if generics examples touch mutation. |
| `../slate-v2/docs/api/nodes/*.md` | G5 | Document `Value`, `TElement`, `TText`, `Editor<V>`, derived helpers. |
| `../slate-v2/docs/api/operations/*.md` | G5 | Document `Operation<V>` if operation generics land. |
| `../slate-v2/docs/api/transforms.md` | G5 | Mark `Transforms.*` as non-primary if still exported; show editor primitives in `editor.update`. |
| `../slate-v2/docs/libraries/slate-dom/**/*.md` | G5 | Replace CustomTypes comments with generic editor examples. |
| `../slate-v2/docs/libraries/slate-react/**/*.md` | G5 | Replace CustomTypes comments with generic React editor examples. |
| `../slate-v2/docs/libraries/slate-history/**/*.md` | G5 | Replace CustomTypes comments with generic history editor examples. |
| `../slate-v2/docs/general/changelog.md` | G5 | Historical mentions can remain only if changelog is intentionally historical; do not use as current guidance. |

## Expanded Source File Inventory Command

Before implementation, generate the exact file checklist from disk and paste the result into the execution ledger:

```bash
rg --files ../slate-v2/packages/slate ../slate-v2/packages/slate-dom ../slate-v2/packages/slate-history ../slate-v2/packages/slate-hyperscript ../slate-v2/packages/slate-react ../slate-v2/packages/slate-browser ../slate-v2/site ../slate-v2/docs \
  | rg '(\\.ts$|\\.tsx$|\\.d\\.ts$|\\.md$|\\.mdx$)' \
  > tmp/slate-v2-generics-file-inventory.txt
```

Implementation is not complete until every file in that inventory is classified as `G0` through `G5` in the execution ledger.

## Execution Batches

### Batch 0: Red Type Contracts

Add compile-only contracts before cutting anything:

- `../slate-v2/packages/slate/test/generic-value-contract.ts`
- `../slate-v2/packages/slate/test/generic-editor-api-contract.ts`
- `../slate-v2/packages/slate/test/generic-operation-contract.ts`
- `../slate-v2/packages/slate-react/test/generic-react-editor-contract.tsx`
- `../slate-v2/packages/slate-history/test/generic-history-contract.ts`

Required contracts:

```ts
type Paragraph = { type: 'paragraph'; children: CustomText[] }
type Quote = { type: 'quote'; children: CustomText[] }
type CustomText = { text: string; bold?: true; code?: true }
type CustomValue = (Paragraph | Quote)[]

const editor = createEditor<CustomValue>()

editor.update(() => {
  editor.setNodes({ type: 'quote' })
  editor.addMark('bold', true)
})
```

Assertions:

- `ValueOf<typeof editor>` is `CustomValue`.
- `ElementOf<typeof editor>` is `Paragraph | Quote`.
- `TextOf<typeof editor>` is `CustomText`.
- `EditorMarksOf<typeof editor>` accepts `bold` / `code` and rejects element fields.
- `Operation<CustomValue>` payloads do not collapse to untyped `Node`.
- `withHistory(editor)` preserves `CustomValue`.
- `withReact(editor)` preserves `CustomValue`.

### Batch 1: Core Model Generics

Files:

- `packages/slate/src/types/custom-types.ts`
- `packages/slate/src/types/index.ts`
- `packages/slate/src/types/types.ts`
- `packages/slate/src/interfaces/text.ts`
- `packages/slate/src/interfaces/element.ts`
- `packages/slate/src/interfaces/node.ts`
- `packages/slate/src/interfaces/editor.ts`
- `packages/slate/src/interfaces/range.ts`
- `packages/slate/src/interfaces/point.ts`
- `packages/slate/src/interfaces/operation.ts`
- `packages/slate/src/interfaces/index.ts`
- `packages/slate/src/create-editor.ts`
- `packages/slate/src/index.ts`
- `packages/slate/index.ts`

Work:

1. Introduce `Value`, `TElement`, `TText`, derived node helpers.
2. Remove `ExtendedType` from primary model types.
3. Convert `Editor` to `Editor<V>`.
4. Convert `createEditor` to `createEditor<V>()`.
5. Keep runtime mutable storage internal; do not expose public mutable state as the generic story.

### Batch 2: Editor API And Flexible Primitive Generics

Files:

- `packages/slate/src/interfaces/editor.ts`
- `packages/slate/src/interfaces/transforms/*.ts`
- `packages/slate/src/editor/*.ts`
- `packages/slate/src/transforms-node/*.ts`
- `packages/slate/src/transforms-selection/*.ts`
- `packages/slate/src/transforms-text/*.ts`
- `packages/slate/src/utils/get-default-insert-location.ts`
- `packages/slate/src/utils/types.ts`

Work:

1. Make editor queries derive return node types from `E extends Editor`.
2. Make primitives derive implicit target and node payload types from `ValueOf<E>`.
3. Preserve flexible APIs: `setNodes`, `unwrapNodes`, `wrapNodes`, `insertNodes`, `delete`, `insertText`, `insertFragment`.
4. Do not add semantic method bloat to make generics easier.

### Batch 3: Operation, Transaction, Commit, History Generics

Files:

- `packages/slate/src/interfaces/operation.ts`
- `packages/slate/src/interfaces/editor.ts`
- `packages/slate/src/core/apply.ts`
- `packages/slate/src/core/public-state.ts`
- `packages/slate/src/core/command-registry.ts`
- `packages/slate/src/core/editor-extension.ts`
- `packages/slate/src/core/extension-registry.ts`
- `packages/slate/src/core/update-dirty-paths.ts`
- `packages/slate/src/core/get-dirty-paths.ts`
- `packages/slate/src/core/batch-dirty-paths.ts`
- `packages/slate-history/src/history.ts`
- `packages/slate-history/src/history-editor.ts`
- `packages/slate-history/src/with-history.ts`

Work:

1. `Operation<V>` becomes the operation truth.
2. `EditorTransaction<V>` and `EditorCommit<V>` preserve value type.
3. History consumes generic operations/commits without method override typing leaks.
4. Extension listeners preserve `E extends Editor<V>`.

### Batch 4: DOM And React Generic Editors

Files:

- `packages/slate-dom/src/custom-types.ts`
- `packages/slate-dom/src/plugin/dom-editor.ts`
- `packages/slate-dom/src/plugin/with-dom.ts`
- `packages/slate-dom/src/index.ts`
- `packages/slate-dom/index.ts`
- `packages/slate-react/src/custom-types.ts`
- `packages/slate-react/src/plugin/react-editor.ts`
- `packages/slate-react/src/plugin/with-react.ts`
- `packages/slate-react/src/context.tsx`
- `packages/slate-react/src/components/*.tsx`
- `packages/slate-react/src/components/restore-dom/*`
- `packages/slate-react/src/editable/*.ts`
- `packages/slate-react/src/large-document/*`
- `packages/slate-react/src/*.ts`
- `packages/slate-react/src/*.tsx`
- `packages/slate-react/src/index.ts`
- `packages/slate-react/index.ts`

Work:

1. Delete React/DOM module augmentation files.
2. Thread `ReactEditor<V>` / `DOMEditor<V>`.
3. Render element/text/leaf props derive from editor value.
4. Keep browser kernel behavior unchanged unless a type contract exposes a real bug.

### Batch 5: Hyperscript, Site, Docs, Tests

Files:

- `packages/slate-hyperscript/src/*.ts`
- `packages/slate-hyperscript/test/**/*.ts`
- `packages/slate-hyperscript/test/**/*.tsx`
- `packages/slate/test/**/*.ts`
- `packages/slate/test/**/*.tsx`
- `packages/slate-dom/test/**/*.ts`
- `packages/slate-history/test/**/*.ts`
- `packages/slate-history/test/**/*.tsx`
- `packages/slate-react/test/**/*.ts`
- `packages/slate-react/test/**/*.tsx`
- `site/examples/ts/custom-types.d.ts`
- `site/examples/ts/*.tsx`
- `site/components/*.tsx`
- `site/pages/**/*.ts`
- `site/pages/**/*.tsx`
- `docs/**/*.md`
- `docs/**/*.mdx`

Work:

1. Replace app-wide `declare module 'slate'` with normal exported app types.
2. Convert current examples to explicit `ExampleValue` / `ExampleEditor` types.
3. Rewrite TypeScript docs around `Value` generics.
4. Keep changelog historical, but current docs must not teach `CustomTypes`.

### Batch 6: Source-First Site Alias Reopen

Blocked today by app `CustomTypes` leaking into package internals. Reopen after Batch 5.

Work:

1. Enable site/root TypeScript source aliases.
2. Verify site can typecheck package source without declaration merging pollution.
3. Remove any remaining build-first typecheck workaround created only for old global custom types.

## Required Gates

Run from `../slate-v2`.

### Hard-Cut Search Gates

```bash
rg -n "CustomTypes|ExtendedType|declare module ['\\\"]slate|declare module \\\"slate\\\"" packages site docs --glob '!**/dist/**' --glob '!**/node_modules/**' --glob '!site/out/**'
```

Expected:

- Zero in `packages/**`, `site/**`, and current docs.
- Changelog-only historical hits are allowed only if clearly historical.

```bash
rg -n "EditorMarks = Record<string, any>|Record<string, any>" packages/slate/src packages/slate-react/src packages/slate-dom/src packages/slate-history/src
```

Expected:

- No primary marks type uses `any`.

### Type Gates

```bash
bunx tsc --project packages/slate/test/tsconfig.generic-types.json --noEmit --pretty false
bunx tsc --project packages/slate-history/test/tsconfig.generic-types.json --noEmit --pretty false
bunx tsc --project packages/slate-react/test/tsconfig.generic-types.json --noEmit --pretty false
```

### Package Gates

```bash
bunx turbo typecheck --filter=./packages/slate --filter=./packages/slate-history --filter=./packages/slate-dom --filter=./packages/slate-react --filter=./packages/slate-hyperscript --force
bun test ./packages/slate --bail 1
bun test ./packages/slate-history --bail 1
bun test ./packages/slate-dom --bail 1
bun test ./packages/slate-react --bail 1
bun test ./packages/slate-hyperscript --bail 1
```

### Site Gates

```bash
bun typecheck:site
bun typecheck
```

### Final Gates

```bash
bun run lint:fix
bun run lint
```

Do not run `bun test:integration-local` for this type-system plan unless a React/browser runtime file change proves behavior changed.

## Red Flags

- Keeping `CustomTypes` as "temporary" after core generics land. That creates two truth sources.
- Making `Editor<V>` infer the site example value from ambient context. That recreates the current source-first typecheck bug.
- Porting Plate's `EditorMarks = Record<string, any>` unchanged.
- Hiding generic loss with `as unknown as Editor`.
- Updating React generics before `packages/slate` helpers are stable.
- Treating docs/examples as cleanup only. They are where the old mental model keeps coming back.
- Renaming everything to a schema-first model. That drifts from Plate and punishes migration.

## Completion Target

This plan is complete when:

- `CustomTypes` / `ExtendedType` are gone from primary packages and current docs.
- `createEditor<CustomValue>()` is the canonical custom typing entrypoint.
- `Editor<V>`, `ValueOf<E>`, `ElementOf<E>`, `TextOf<E>`, `NodeOf<E>`, and `EditorMarksOf<E>` work across core, DOM, React, history, hyperscript, site examples, and tests.
- Operation, transaction, commit, history, and extension types preserve `V`.
- Site source aliases can be enabled without package internals typechecking against app-specific globals.
- Gates above pass, or every remaining failure is recorded with an exact non-autonomous blocker.

## Execution Ledger

### 2026-04-26: Execution Start

- Actions: activated this plan via `complete-plan`, set `tmp/completion-check.md` to `pending`, generated `tmp/continue.md`.
- Commands: read active plan, previous source-first typecheck plan, completion state, Slate v2 package scripts, and current Slate v2 core type files.
- Artifacts: `tmp/continue.md`, updated `tmp/completion-check.md`.
- Evidence: current Slate v2 still imports `ExtendedType` in `interfaces/editor.ts`, `interfaces/text.ts`, `interfaces/element.ts`, `interfaces/range.ts`, `interfaces/point.ts`, and `interfaces/operation.ts`; DOM/React still have `custom-types.ts` declaration augmentation files.
- Hypothesis: Batch 0 should first prove the desired API with compile/runtime contracts, then Batch 1 can replace declaration merging without losing Plate parity.
- Decision: start with inventory plus red generic contracts; do not mutate core generic implementation before the contracts exist.
- Owner classification: Batch 0, red type contracts and exact file inventory.
- Changed files: `tmp/completion-check.md`, `tmp/continue.md`, `docs/plans/2026-04-26-slate-v2-plate-generics-type-system-plan.md`.
- Rejected tactics: no browser kernel work; no source-first site alias work before package/app type pollution is removed.
- Next action: generate `tmp/slate-v2-generics-file-inventory.txt`, add the first generic contract tests, run focused gates, and record expected failures.

### 2026-04-26: Batch 0 RED Contracts

- Actions: generated the exact Slate v2 file inventory and added compile-only generic contracts for core value/editor API, operations, history, and React editor typing.
- Commands:
  - `rg --files ../slate-v2/packages/slate ../slate-v2/packages/slate-dom ../slate-v2/packages/slate-history ../slate-v2/packages/slate-hyperscript ../slate-v2/packages/slate-react ../slate-v2/packages/slate-browser ../slate-v2/site ../slate-v2/docs | rg '(\\.ts$|\\.tsx$|\\.d\\.ts$|\\.md$|\\.mdx$)' > ../slate-v2/tmp/slate-v2-generics-file-inventory.txt`
  - `bunx tsc --project tsconfig.generic-types.json --noEmit --pretty false`
  - `bunx tsc --project packages/slate/test/tsconfig.generic-types.json --noEmit --pretty false`
  - `bunx tsc --project packages/slate-history/test/tsconfig.generic-types.json --noEmit --pretty false`
  - `bunx tsc --project packages/slate-react/test/tsconfig.generic-types.json --noEmit --pretty false`
- Artifacts:
  - `../slate-v2/tmp/slate-v2-generics-file-inventory.txt` with 1502 files.
  - `../slate-v2/packages/slate/test/generic-value-contract.ts`
  - `../slate-v2/packages/slate/test/generic-editor-api-contract.ts`
  - `../slate-v2/packages/slate/test/generic-operation-contract.ts`
  - `../slate-v2/packages/slate-history/test/generic-history-contract.ts`
  - `../slate-v2/packages/slate-react/test/generic-react-editor-contract.tsx`
  - `../slate-v2/packages/slate/test/tsconfig.generic-types.json`
  - `../slate-v2/packages/slate-history/test/tsconfig.generic-types.json`
  - `../slate-v2/packages/slate-react/test/tsconfig.generic-types.json`
- Evidence: the Slate core generic contract is properly RED: missing `Value`, `ValueOf`, `ElementOf`, `TextOf`, `EditorMarksOf`; `createEditor<CustomValue>()` is rejected; `Editor` and `Operation` are not generic.
- Hypothesis: core must migrate first; history and React type contracts are blocked by both missing generic exports and cross-package source root configuration.
- Decision: update Batch 0 gates from `bun test` to `tsc` because Bun tests do not typecheck compile-only generic contracts.
- Owner classification: Batch 0 remains active; Batch 1 core model generics is the next implementation owner.
- Changed files: plan, completion state, continue prompt, Slate v2 inventory, Slate v2 generic contract files, Slate v2 generic tsconfigs.
- Rejected tactics: do not rely on runtime `bun test` for type-only proof; do not begin React generic threading before core exports exist.
- Next action: implement Batch 1 core model generics in `packages/slate/src/interfaces/{text,element,node,editor,operation}.ts`, `types`, and `create-editor.ts` until the Slate core generic contract progresses.

### 2026-04-26: Batch 1 Core/DOM/React Generic Spine

- Actions: added Plate-aligned `Value`, `TElement`, `TText`, `ElementOf`, `TextOf`, `NodeOf`, `NodeIn`, `ValueOf`, and `EditorMarksOf`; made `Editor<V>` and core operation payloads generic; threaded generic editor preservation through `withHistory`, `withDOM`, and `withReact`; removed primary Slate core `ExtendedType` aliases and deleted React/DOM editor declaration merging.
- Commands:
  - `bunx tsc --project packages/slate/test/tsconfig.generic-types.json --noEmit --pretty false`
  - `bunx tsc --project packages/slate-history/test/tsconfig.generic-types.json --noEmit --pretty false`
  - `bunx tsc --project packages/slate-react/test/tsconfig.generic-types.json --noEmit --pretty false`
  - `rg -n "CustomTypes|ExtendedType|declare module ['\\\"]slate|declare module \\\"slate\\\"" packages/slate/src packages/slate-dom/src packages/slate-react/src packages/slate-history/src --glob '!**/dist/**' --glob '!**/node_modules/**'`
  - `rg -n "CustomTypes|ExtendedType|declare module ['\\\"]slate|declare module \\\"slate\\\"" packages site docs --glob '!**/dist/**' --glob '!**/node_modules/**' --glob '!site/out/**'`
- Artifacts:
  - green generic type contracts in `packages/slate/test`, `packages/slate-history/test`, and `packages/slate-react/test`
  - `../slate-v2/packages/slate-react/src/dom-globals.d.ts`
  - `../slate-v2/packages/slate-dom/src/dom-globals.d.ts`
- Evidence: focused generic gates pass for core, history, and React; source hard-cut search is clean for `packages/slate/src`, `packages/slate-dom/src`, `packages/slate-react/src`, and `packages/slate-history/src`.
- Hypothesis: the primary package generic spine is now viable; remaining CustomTypes debt is docs/site/test-fixture public mental model, not core runtime shape.
- Decision: keep course; continue to Batch 2 public-facing hard cuts instead of widening into package builds before docs/site/test usage stops teaching declaration merging.
- Owner classification: Batch 2, docs/site/test public API hard cut.
- Changed files: Slate core interfaces, operation types, create editor, history types, DOM/React plugin types, React hooks/components typing, generic contract tests and tsconfigs, React/DOM global declaration files, deleted primary custom type files.
- Rejected tactics: do not preserve `CustomTypes.Editor` as a compatibility merge; it erases `Editor<V>` and recreates the source-first type pollution bug.
- Next action: migrate docs/site/current tests away from `CustomTypes` declarations and remove the old `packages/slate/test/tsconfig.custom-types.json` fixture path or reclassify it as archived-only proof.

### 2026-04-26: Batch 2 Public Type Story And Site Source-First Closure

- Actions: removed the current docs/site/test declaration-merging story, deleted the old custom-types fixture gate, made site examples use `createEditor<CustomValue>()`, added source aliases for the site, and made React hooks generic over the full editor instance type so history/extension methods survive through React context.
- Commands:
  - `bunx tsc --project packages/slate/test/tsconfig.generic-types.json --noEmit --pretty false`
  - `bunx tsc --project packages/slate-history/test/tsconfig.generic-types.json --noEmit --pretty false`
  - `bunx tsc --project packages/slate-react/test/tsconfig.generic-types.json --noEmit --pretty false`
  - `bun typecheck`
  - `bun test ./packages/slate --bail 1`
  - `bun test ./packages/slate-history --bail 1`
  - `bun test ./packages/slate-hyperscript --bail 1`
  - `bun --cwd packages/slate-react test -- --bail 1`
  - `bun test ./test/bridge.test.ts ./test/clipboard-boundary.test.ts --bail=1`
  - `bun run lint:fix`
  - `bun run lint`
  - `rg -n "CustomTypes|ExtendedType|declare module ['\\\"]slate|declare module \\\"slate\\\"" packages/slate/src packages/slate-dom/src packages/slate-react/src packages/slate-history/src --glob '!**/dist/**' --glob '!**/node_modules/**'`
  - `rg -n "CustomTypes|ExtendedType|declare module ['\\\"]slate|declare module \\\"slate\\\"" packages site docs --glob '!**/dist/**' --glob '!**/node_modules/**' --glob '!site/out/**'`
  - `rg -n "EditorMarks = Record<string, any>|Record<string, any>" packages/slate/src packages/slate-react/src packages/slate-dom/src packages/slate-history/src`
- Artifacts: site `tsconfig.json` source aliases, generic React context hooks, source-first site example typing, removed current custom-types fixture gate, current TypeScript docs updated to `createEditor<CustomValue>()`.
- Evidence: full typecheck is green; generic contracts are green; package tests are green; lint is green; primary package source search has no `CustomTypes`, `ExtendedType`, or `declare module "slate"`; full repo search only shows historical changelog entries.
- Hypothesis: the Plate-aligned value-generic model is now the only current typing story, and source-first site checking will keep package internals from relying on app-specific globals.
- Decision: stop this plan as complete; historical changelog mentions are intentionally retained because docs policy does not rewrite history in this type-system lane.
- Owner classification: completion.
- Changed files: Slate core/history/DOM/React/hyperscript generic types, generic contract tests, docs TypeScript pages, site custom types and examples, site source aliases, completion state.
- Rejected tactics: no runtime mutation in hyperscript to satisfy `BaseElement.type`; the type bridge stays cast-only so fixture output remains unchanged.
- Next action: no autonomous next move remains for this plan.
