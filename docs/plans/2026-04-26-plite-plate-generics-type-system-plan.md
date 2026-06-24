# Plite Plate Generics Type System Plan

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

- `bunx tsc --project packages/plite/test/tsconfig.generic-types.json --noEmit --pretty false`
- `bunx tsc --project packages/plite-history/test/tsconfig.generic-types.json --noEmit --pretty false`
- `bunx tsc --project packages/plite-react/test/tsconfig.generic-types.json --noEmit --pretty false`
- `bun test ./packages/plite --bail 1`
- `bun test ./packages/plite-history --bail 1`
- `bun --cwd packages/plite-react test -- --bail 1`
- `bun test ./test/bridge.test.ts ./test/clipboard-boundary.test.ts --bail=1`
  from `packages/plite-dom`
- `bun run lint:fix`
- `bunx turbo build --filter=./packages/plite --filter=./packages/plite-history --filter=./packages/plite-dom --filter=./packages/plite-react --force`
- `bunx turbo typecheck --filter=./packages/plite --filter=./packages/plite-history --filter=./packages/plite-dom --filter=./packages/plite-react --force`
- `bun run lint`

Rejected tactic:

- Do not force every internal instance method to be perfectly generic. That
  creates TypeScript variance explosions and weakens the implementation. The
  durable boundary is generic public/static APIs plus broad structural runtime
  internals.

## Goal

Replace Plite declaration merging with a Plate-aligned generic type system, without guessing or inventing a parallel model.

The target is:

```ts
type Value = TElement[];
type Editor<V extends Value = Value> = EditorBase<V> & RuntimeEditor<V>;
```

Everything else derives from `Value`, `TElement`, `TText`, and `Editor<V>`.

## Verdict

Drop `CustomTypes` / `ExtendedType` as the primary type system.

Plate already solved the practical DX shape better than Plite legacy: document shape is carried by `Value`, editor APIs derive node/text/element types from that value, and plugin/editor layers add their own generics on top. Plite should pull that model, not infer a new one.

The only allowed improvements over Plate are explicit:

1. Replace Plate's weak `EditorMarks = Record<string, any>` with marks derived from the editor text type.
2. Make operation, commit, snapshot, transaction, command, and extension types generic over `Value`, because Plite treats operations as collaboration truth and commits as runtime truth.

## Non-Goals

- Do not rewrite the browser editing kernel in this plan.
- Do not redesign public editing methods in this plan.
- Do not keep a hybrid where declaration merging still controls package internals.
- Do not expose a schema object as the canonical type model.
- Do not fix source-first site aliases before this type boundary is in place.
- Do not preserve `CustomTypes` docs as the primary TypeScript story.

## Plate Source Of Truth Matrix

| Plate source                                                         | Plate generic law                                                                                                | Plite target                                                                                                                                                       | Action                                                                                                    | Drift allowed                               |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `../plate/packages/plite/src/interfaces/editor/editor-type.ts`       | `Editor<V extends Value = Value>`, `EditorBase<V>`, `EditorMethods<V>`, `Value`, `ValueOf<E>`, `EditorSelection` | `packages/plite/src/interfaces/editor.ts`, `packages/plite/src/create-editor.ts`, `packages/plite/src/core/public-state.ts` | Port the `Value`-first editor model. Keep Plite read/update/transaction fields in the runtime portion. | No, except marks improvement.               |
| `../plate/packages/plite/src/interfaces/element.ts`                  | `TElement`, `Element = TElement`, `ElementIn<V>`, `ElementOf<N>`, `ElementOrTextOf<E>`                           | `packages/plite/src/interfaces/element.ts`, `packages/plite/src/interfaces/node.ts`                                                       | Replace `ExtendedType<'Element'>` with direct generic helpers.                                            | No.                                         |
| `../plate/packages/plite/src/interfaces/text.ts`                     | `TText`, `Text = TText`, `TextIn<V>`, `TextOf<N>`                                                                | `packages/plite/src/interfaces/text.ts`, `packages/plite/src/interfaces/editor.ts`                                                        | Replace `ExtendedType<'Text'>`; derive marks from `TextOf<E>`.                                            | Yes: improve marks.                         |
| `../plate/packages/plite/src/interfaces/node.ts`                     | `TNode`, `Ancestor`, `Descendant`, `NodeOf<N>`, `AncestorOf<N>`, `DescendantOf<N>`, `NodeProps<N>`               | `packages/plite/src/interfaces/node.ts`                                                                                                                 | Port helper structure directly.                                                                           | No.                                         |
| `../plate/packages/plite/src/interfaces/node-entry.ts`               | `NodeEntryOf<E>`, `ElementEntryOf<E>`, `TextEntryOf<E>`, `AncestorEntryOf<E>`, `DescendantEntryOf<E>`            | `packages/plite/src/interfaces/node-entry.ts` or `packages/plite/src/interfaces/node.ts`                                                  | Add if missing; do not scatter entry helpers across editor APIs.                                          | No.                                         |
| `../plate/packages/plite/src/interfaces/editor/editor-api.ts`        | Every editor query/match option is generic on `V extends Value` where node shape matters.                        | `packages/plite/src/interfaces/editor.ts`, `packages/plite/src/editor/*.ts`                                                               | Thread `V` through editor options and return types.                                                       | No.                                         |
| `../plate/packages/plite/src/interfaces/editor/editor-transforms.ts` | `EditorTransforms<V>`, transform options generic by `V`, transform node types derived from `ValueOf<E>`          | `packages/plite/src/interfaces/transforms/*.ts`, `packages/plite/src/transforms-*/*.ts`, `packages/plite/src/editor/*.ts`   | Preserve flexible primitives; do not invent semantic method bloat.                                        | No.                                         |
| `../plate/packages/plite/src/interfaces/editor/legacy-editor.ts`     | Compat bridge for legacy transform shape.                                                                        | None as primary. Optional internal-only bridge if a migration tracer proves it is needed.                                                                             | Do not port as public API.                                                                                | Yes: hard cut public compat.                |
| `../plate/packages/core/src/lib/editor/PliteEditor.ts`               | `TPliteEditor<V, P>` layers plugin config generics over Plite editor generics.                                   | `packages/plite/src/core/editor-extension.ts`, `packages/plite/src/core/extension-registry.ts`                                            | Use as the extension generic model, not the core node model.                                              | No in spirit; names can fit Plite.       |
| `../plate/packages/core/src/lib/editor/withPlite.ts`                 | `withPlite<V, P>` preserves editor value and plugin generics.                                                    | `packages/plite/src/core/editor-extension.ts`, package consumers                                                                                        | Keep extension runtime generic over `E extends Editor<V>`.                                                | No.                                         |
| `../plate/packages/core/src/react/editor/PlateEditor.ts`             | `TPlateEditor<V, P>` extends Plite editor with React/plugin runtime.                                             | `packages/plite-react/src/plugin/react-editor.ts`, `packages/plite-react/src/context.tsx`                                                 | Use the layering idea, not Plate plugin runtime implementation.                                           | No in architecture; implementation differs. |

## Better-Than-Plate Decisions

### 1. Marks

Plate:

```ts
type EditorMarks = Record<string, any>;
```

Plite target:

```ts
type MarksOfText<T extends TText> = Partial<Omit<T, "text">>;
type EditorMarksOf<E extends Editor> = MarksOfText<TextOf<E>>;
type EditorMarks<V extends Value = Value> = MarksOfText<TextIn<V>>;
```

Reason: mark keys should come from the editor's text union, not `any`. This keeps custom mark DX flexible without losing agent/type guidance.

### 2. Operations And Commits

Plate keeps operation payloads mostly at static `Node` / `Operation` shape. Plite should generic-thread them:

```ts
type Operation<V extends Value = Value> = ...
type EditorTransaction<V extends Value = Value> = ...
type EditorSnapshot<V extends Value = Value> = ...
type EditorCommit<V extends Value = Value> = ...
```

Reason: operations are Plite collaboration truth and commits are local runtime truth. If operation payloads collapse to untyped `Node`, the generic model leaks exactly where history, Yjs, React dirtiness, and tests need precision.

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
  Element: TElementUnion;
  Text: TTextUnion;
};

type ValueOfSchema<S extends EditorSchema> = S["Element"][];
```

Reason: plugin authors often think in element/text unions; Plate-compatible core still thinks in `Value`.

## Canonical Generic Vocabulary

| Type                   | Meaning                                                        | Owner file                                                                                                       |
| ---------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------- |
| `TText`                | Base text node with `{ text: string }` plus custom properties. | `packages/plite/src/interfaces/text.ts`                                                            |
| `TElement`             | Base element node with `children`.                             | `packages/plite/src/interfaces/element.ts`                                                         |
| `Value`                | Top-level editor document: `TElement[]`.                       | `packages/plite/src/interfaces/editor.ts` or `packages/plite/src/interfaces/node.ts` |
| `Text`                 | Alias of `TText`, not declaration-merged app text.             | `packages/plite/src/interfaces/text.ts`                                                            |
| `Element`              | Alias of `TElement`, not declaration-merged app element.       | `packages/plite/src/interfaces/element.ts`                                                         |
| `Descendant`           | `TElement                                                      | TText`.                                                                                                          | `packages/plite/src/interfaces/node.ts` |
| `Ancestor`             | `Editor                                                        | TElement`.                                                                                                       | `packages/plite/src/interfaces/node.ts` |
| `Node`                 | `Editor                                                        | TElement                                                                                                         | TText`.                                               | `packages/plite/src/interfaces/node.ts` |
| `TextIn<V>`            | Text union inside `V`.                                         | `packages/plite/src/interfaces/text.ts`                                                            |
| `ElementIn<V>`         | Element union inside `V`.                                      | `packages/plite/src/interfaces/element.ts`                                                         |
| `NodeIn<V>`            | Node union inside `V`.                                         | `packages/plite/src/interfaces/node.ts`                                                            |
| `TextOf<E>`            | Text union inside editor/node `E`.                             | `packages/plite/src/interfaces/text.ts`                                                            |
| `ElementOf<E>`         | Element union inside editor/node `E`.                          | `packages/plite/src/interfaces/element.ts`                                                         |
| `NodeOf<E>`            | Node union inside editor/node `E`.                             | `packages/plite/src/interfaces/node.ts`                                                            |
| `ValueOf<E>`           | `E['children']`.                                               | `packages/plite/src/interfaces/editor.ts`                                                          |
| `EditorMarksOf<E>`     | Mark object derived from `TextOf<E>`.                          | `packages/plite/src/interfaces/editor.ts`                                                          |
| `Operation<V>`         | Operation payloads typed from `NodeIn<V>` / `Range`.           | `packages/plite/src/interfaces/operation.ts`                                                       |
| `Editor<V>`            | Public editor type.                                            | `packages/plite/src/interfaces/editor.ts`                                                          |
| `EditorTransaction<V>` | Write boundary runtime.                                        | `packages/plite/src/interfaces/editor.ts`, `packages/plite/src/core/public-state.ts` |
| `EditorCommit<V>`      | Local runtime observation payload.                             | `packages/plite/src/interfaces/editor.ts`, `packages/plite/src/core/public-state.ts` |
| `HistoryEditor<V>`     | History-enhanced editor.                                       | `packages/plite-history/src/history-editor.ts`                                                     |
| `DOMEditor<V>`         | DOM-enhanced editor.                                           | `packages/plite-dom/src/plugin/dom-editor.ts`                                                      |
| `ReactEditor<V>`       | React-enhanced editor.                                         | `packages/plite-react/src/plugin/react-editor.ts`                                                  |

## Plite File Matrix

Legend:

- `G0`: no generic change expected; verify only.
- `G1`: base model generic migration.
- `G2`: editor API / transform generic threading.
- `G3`: operation / transaction / commit generic threading.
- `G4`: package editor wrapper generic threading.
- `G5`: app, docs, test, and fixture migration away from declaration merging.

### `packages/plite`

| File or file group                                                                           | Class    | Required work                                                                                                                                                                                                            |
| -------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----- | ----- | -------------------------------- |
| `packages/plite/src/types/custom-types.ts`                                     | G1       | Delete or replace with a non-augmenting generic helper file. Remove `CustomTypes` and `ExtendedType`.                                                                                                                    |
| `packages/plite/src/types/index.ts`                                            | G1       | Stop exporting declaration-merging helpers. Export generic helpers if they live under `types`.                                                                                                                           |
| `packages/plite/src/types/types.ts`                                            | G1       | Audit for old aliases that assume global custom types.                                                                                                                                                                   |
| `packages/plite/src/interfaces/text.ts`                                        | G1       | Replace `ExtendedType<'Text'>` with `TText`, `Text`, `TextIn<V>`, `TextOf<N>`.                                                                                                                                           |
| `packages/plite/src/interfaces/element.ts`                                     | G1       | Replace `ExtendedType<'Element'>` with `TElement`, `Element`, `ElementIn<V>`, `ElementOf<N>`, `ElementOrTextOf<E>`.                                                                                                      |
| `packages/plite/src/interfaces/node.ts`                                        | G1       | Add Plate-compatible `TNode`, `NodeIn<V>`, `NodeOf<N>`, `AncestorOf<N>`, `DescendantOf<N>`, `NodeProps<N>`.                                                                                                              |
| `packages/plite/src/interfaces/editor.ts`                                      | G1/G2/G3 | Make `Editor<V>`, `BaseEditor<V>`, `Value`, `ValueOf<E>`, `EditorMarks<V>`, `EditorMarksOf<E>`, `EditorSnapshot<V>`, `EditorTransaction<V>`, `EditorCommit<V>`, extension and command types generic.                     |
| `packages/plite/src/interfaces/operation.ts`                                   | G3       | Remove `ExtendedType` from operation subtypes. Add `Operation<V>`, `InsertNodeOperation<V>`, `RemoveNodeOperation<V>`, `SplitNodeOperation<V>`, `MergeNodeOperation<V>`, `SetNodeOperation<V>` with typed node payloads. |
| `packages/plite/src/interfaces/range.ts`                                       | G1       | Replace `ExtendedType<'Range'>` with direct `Range`. Do not generic-thread unless range metadata becomes real.                                                                                                           |
| `packages/plite/src/interfaces/point.ts`                                       | G1       | Replace `ExtendedType<'Point'>` with direct `Point`.                                                                                                                                                                     |
| `packages/plite/src/interfaces/location.ts`                                    | G1       | Verify `Location` uses direct `Path                                                                                                                                                                                      | Point | Range | Span` and no global custom type. |
| `packages/plite/src/interfaces/bookmark.ts`                                    | G3       | Make bookmarks explicit about selection/node generics if bookmark stores node snapshots.                                                                                                                                 |
| `packages/plite/src/interfaces/path.ts`                                        | G0       | Verify path stays structural, not generic.                                                                                                                                                                               |
| `packages/plite/src/interfaces/path-ref.ts`                                    | G0       | Verify no global custom type.                                                                                                                                                                                            |
| `packages/plite/src/interfaces/point-ref.ts`                                   | G0       | Verify no global custom type.                                                                                                                                                                                            |
| `packages/plite/src/interfaces/range-ref.ts`                                   | G0       | Verify no global custom type.                                                                                                                                                                                            |
| `packages/plite/src/interfaces/scrubber.ts`                                    | G0       | Verify only accepts structural values.                                                                                                                                                                                   |
| `packages/plite/src/interfaces/index.ts`                                       | G1/G2/G3 | Re-export the generic vocabulary. Do not re-export `CustomTypes` / `ExtendedType`.                                                                                                                                       |
| `packages/plite/src/interfaces/transforms/general.ts`                          | G2       | Thread `V` through transform options that accept `Node`, `Descendant`, `Element`, `Text`, or match predicates.                                                                                                           |
| `packages/plite/src/interfaces/transforms/node.ts`                             | G2       | Thread `V`; `nodes`, `match`, `at`, inserted node payloads derive from `Value`.                                                                                                                                          |
| `packages/plite/src/interfaces/transforms/selection.ts`                        | G2       | Verify direct `Range` / `Point`; no declaration merging.                                                                                                                                                                 |
| `packages/plite/src/interfaces/transforms/text.ts`                             | G2       | Thread text type through marks and insertion options.                                                                                                                                                                    |
| `packages/plite/src/create-editor.ts`                                          | G1/G3    | `createEditor<V extends Value = Value>(): Editor<V>`. Construct base editor internally; cast only at the boundary.                                                                                                       |
| `packages/plite/src/index.ts` and `packages/plite/index.ts`      | G1/G2/G3 | Public export audit; no `CustomTypes` primary export.                                                                                                                                                                    |
| `packages/plite/src/core/apply.ts`                                             | G3       | `applyOperation<V>` and operation middleware use `Operation<V>`.                                                                                                                                                         |
| `packages/plite/src/core/public-state.ts`                                      | G1/G3    | Generic current value, selection, marks, operations, snapshots, transactions, and commits.                                                                                                                               |
| `packages/plite/src/core/command-registry.ts`                                  | G3       | Command context uses `E extends Editor<V>`.                                                                                                                                                                              |
| `packages/plite/src/core/editor-extension.ts`                                  | G3       | Extension methods use `E extends Editor<V>`, not `BaseEditor = Editor` without value.                                                                                                                                    |
| `packages/plite/src/core/extension-registry.ts`                                | G3       | Registry stores typed methods/listeners without erasing `V`.                                                                                                                                                             |
| `packages/plite/src/core/batch-dirty-paths.ts`                                 | G3       | Dirty paths stay path-based; commit metadata generic only if node payload leaks in.                                                                                                                                      |
| `packages/plite/src/core/get-dirty-paths.ts`                                   | G3       | Same as dirty paths.                                                                                                                                                                                                     |
| `packages/plite/src/core/update-dirty-paths.ts`                                | G3       | Operation generic input.                                                                                                                                                                                                 |
| `packages/plite/src/core/get-fragment.ts`                                      | G2/G3    | Fragment return type derives from `ValueOf<E>`.                                                                                                                                                                          |
| `packages/plite/src/core/leaf-lifecycle.ts`                                    | G1/G3    | Empty leaf normalization must use `TextOf<E>` / marks type, not untyped text.                                                                                                                                            |
| `packages/plite/src/core/normalize-node.ts`                                    | G2       | Normalize entry and node types derive from `E`.                                                                                                                                                                          |
| `packages/plite/src/core/should-normalize.ts`                                  | G2       | Options generic only if node entry payloads are exposed.                                                                                                                                                                 |
| `packages/plite/src/core/index.ts`                                             | G1/G2/G3 | Re-export audit.                                                                                                                                                                                                         |
| `packages/plite/src/editor/*.ts`                                               | G2       | Every editor query/mutation must accept `E extends Editor` and derive `ValueOf<E>`, `NodeOf<E>`, `ElementOf<E>`, `TextOf<E>`, `EditorMarksOf<E>`.                                                                        |
| `packages/plite/src/transforms-node/*.ts`                                      | G2       | Preserve flexible primitives; replace static `Node` / `Element` / `Descendant` inputs with derived generic types.                                                                                                        |
| `packages/plite/src/transforms-selection/*.ts`                                 | G2       | Verify selection transforms do not import global custom types; keep structural points/ranges.                                                                                                                            |
| `packages/plite/src/transforms-text/*.ts`                                      | G2       | `insertText`, `deleteText`, mark behavior derive marks from text type.                                                                                                                                                   |
| `packages/plite/src/utils/types.ts`                                            | G1/G2    | Central helper type cleanup; remove `ExtendedType` assumptions.                                                                                                                                                          |
| `packages/plite/src/utils/runtime-ids.ts`                                      | G0/G3    | Keep runtime IDs structural; only generic if public node payloads are exposed.                                                                                                                                           |
| `packages/plite/src/utils/get-default-insert-location.ts`                      | G2       | Insert location uses `E extends Editor`.                                                                                                                                                                                 |
| `packages/plite/src/utils/modify.ts`                                           | G2       | Verify point/range only.                                                                                                                                                                                                 |
| `packages/plite/src/utils/*.ts`                                                | G0       | Verify no hidden `CustomTypes` import or global `Element/Text` assumption.                                                                                                                                               |
| `packages/plite/src/range-projection.ts`                                       | G3       | Generic only if projection payloads carry nodes.                                                                                                                                                                         |
| `packages/plite/src/selection-operation.ts`                                    | G3       | Selection op stays structural, but union must compose with `Operation<V>`.                                                                                                                                               |
| `packages/plite/src/text-units.ts`                                             | G0       | Text unit logic stays structural.                                                                                                                                                                                        |
| `packages/plite/test/**/*.ts` and `packages/plite/test/**/*.tsx` | G5       | Replace custom-type fixture tests with explicit `createEditor<ExampleValue>()` compile/runtime contracts. Delete `tsconfig.custom-types.json`.                                                                           |

### `packages/plite-dom`

| File or file group                                                                              | Class | Required work                                                                                          |
| ----------------------------------------------------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------ |
| `packages/plite-dom/src/custom-types.ts`                                          | G4/G5 | Delete module augmentation. Move DOM-only global declarations to a non-Plite `globals.d.ts` if needed. |
| `packages/plite-dom/src/plugin/dom-editor.ts`                                     | G4    | `DOMEditor<V extends Value = Value>` and DOM helpers accept `E extends Editor<V>`.                     |
| `packages/plite-dom/src/plugin/with-dom.ts`                                       | G4/G5 | Replace CustomTypes comments with generic editor examples. Preserve runtime behavior.                  |
| `packages/plite-dom/src/index.ts` and `packages/plite-dom/index.ts` | G4    | Re-export generic DOM editor types.                                                                    |
| `packages/plite-dom/src/utils/types.ts`                                           | G4    | DOM data attributes and weak-map helpers typed against generic Plite nodes where needed.               |
| `packages/plite-dom/src/utils/range-list.ts`                                      | G0    | Verify structural ranges only.                                                                         |
| `packages/plite-dom/src/utils/*.ts`                                               | G0/G4 | Only generic-thread files that mention Plite nodes/editor.                                             |
| `packages/plite-dom/test/**/*.ts`                                                 | G5    | Replace any module augmentation expectations with explicit generic examples.                           |

### `packages/plite-history`

| File or file group                                                                                           | Class | Required work                                                                                        |
| ------------------------------------------------------------------------------------------------------------ | ----- | ---------------------------------------------------------------------------------------------------- |
| `packages/plite-history/src/history.ts`                                                        | G3/G4 | `History<V>` stores `Operation<V>[]` / `EditorCommit<V>` as appropriate.                             |
| `packages/plite-history/src/history-editor.ts`                                                 | G4    | `HistoryEditor<V extends Value = Value>`.                                                            |
| `packages/plite-history/src/with-history.ts`                                                   | G4/G5 | `withHistory<V, E extends Editor<V>>(editor: E): E & HistoryEditor<V>`. Remove CustomTypes comments. |
| `packages/plite-history/src/index.ts` and `packages/plite-history/index.ts`      | G4    | Export generic history types.                                                                        |
| `packages/plite-history/test/**/*.ts` and `packages/plite-history/test/**/*.tsx` | G5    | Add at least one custom `Value` history compile/runtime contract.                                    |

### `packages/plite-hyperscript`

| File or file group                                                                                                                                                                   | Class | Required work                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----- | ------------------------------------------------------------------------------------ |
| `packages/plite-hyperscript/src/creators.ts`                                                                                                                           | G5    | Hyperscript output type parameterizes editor/value where callers specify it.         |
| `packages/plite-hyperscript/src/hyperscript.ts`                                                                                                                        | G5    | Allow explicit `Value` for JSX fixture creators; do not rely on module augmentation. |
| `packages/plite-hyperscript/src/tokens.ts`                                                                                                                             | G0/G5 | Verify structural token types.                                                       |
| `packages/plite-hyperscript/src/index.ts` and `packages/plite-hyperscript/index.ts`                                                                      | G5    | Export generic creator signatures.                                                   |
| `packages/plite-hyperscript/test/**/*.ts`, `packages/plite-hyperscript/test/**/*.tsx`, `packages/plite-hyperscript/test/fixtures/**/*.tsx` | G5    | Replace any hidden global custom type dependency with explicit helper value types.   |

### `packages/plite-react`

| File or file group                                                                                                            | Class | Required work                                                                               |
| ----------------------------------------------------------------------------------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------- |
| `packages/plite-react/src/custom-types.ts`                                                                      | G4/G5 | Delete module augmentation. Move React-only ambient declarations elsewhere if truly needed. |
| `packages/plite-react/src/plugin/react-editor.ts`                                                               | G4    | `ReactEditor<V extends Value = Value>` layered over `DOMEditor<V>` and `Editor<V>`.         |
| `packages/plite-react/src/plugin/with-react.ts`                                                                 | G4/G5 | Generic `withReact`; remove CustomTypes comments.                                           |
| `packages/plite-react/src/context.tsx`                                                                          | G4    | Context stores generic editor internally without leaking app-wide module augmentation.      |
| `packages/plite-react/src/components/slate.tsx`                                                                 | G4    | `<Plite>` props generic on `V` / `E extends ReactEditor<V>`.                                |
| `packages/plite-react/src/components/editable.tsx`                                                              | G4    | Editable props generic over `E`; render props derive `ElementOf<E>` / `TextOf<E>`.          |
| `packages/plite-react/src/components/editable-text-blocks.tsx`                                                  | G4    | Replace local `TElement extends PliteElementNode` workaround with `ElementOf<E>`.           |
| `packages/plite-react/src/components/slate-element.tsx`                                                         | G4    | Element prop generic derives from editor context.                                           |
| `packages/plite-react/src/components/editable-element.tsx`                                                      | G4    | Same as element rendering.                                                                  |
| `packages/plite-react/src/components/slate-text.tsx`                                                            | G4    | Text prop generic derives from `TextOf<E>`.                                                 |
| `packages/plite-react/src/components/editable-text.tsx`                                                         | G4    | Same as text rendering.                                                                     |
| `packages/plite-react/src/components/slate-leaf.tsx`                                                            | G4    | Leaf and marks typed from `TextOf<E>`.                                                      |
| `packages/plite-react/src/components/text-string.tsx`                                                           | G0/G4 | Verify text only.                                                                           |
| `packages/plite-react/src/components/zero-width-string.tsx`                                                     | G0    | No model generic.                                                                           |
| `packages/plite-react/src/components/slate-placeholder.tsx`                                                     | G4    | Placeholder element typed from `ElementOf<E>` if exposed.                                   |
| `packages/plite-react/src/components/void-element.tsx`                                                          | G4    | Void element typed from `ElementOf<E>`.                                                     |
| `packages/plite-react/src/components/slate-spacer.tsx`                                                          | G0/G4 | Verify node props only if exposed.                                                          |
| `packages/plite-react/src/components/restore-dom/*.tsx` and `*.ts`                                              | G0/G4 | DOM repair remains structural; generic only if editor typed in public functions.            |
| `packages/plite-react/src/editable/*.ts`                                                                        | G4    | Editing kernel and controllers accept `ReactEditor<V>`; no stale custom type import.        |
| `packages/plite-react/src/dom-text-sync.ts`                                                                     | G4    | Generic editor where Plite nodes are accepted.                                              |
| `packages/plite-react/src/projection-store.ts`                                                                  | G4    | Projection payloads use `Range`, `TextOf<E>`, `ElementOf<E>` where relevant.                |
| `packages/plite-react/src/annotation-store.ts`                                                                  | G4    | Annotation payloads generic over editor value when Plite nodes are exposed.                 |
| `packages/plite-react/src/widget-store.ts`                                                                      | G4    | Widget anchors generic only if node payloads leak.                                          |
| `packages/plite-react/src/projection-context.tsx`                                                               | G4    | Context typed from generic projection store.                                                |
| `packages/plite-react/src/large-document/*.ts` and `*.tsx`                                                      | G4    | Large-doc shell editor/value generics preserved.                                            |
| `packages/plite-react/src/hooks/**/*.ts` and `packages/plite-react/src/hooks/**/*.tsx` if present | G4    | Hook return types derive from generic context.                                              |
| `packages/plite-react/src/index.ts` and `packages/plite-react/index.ts`                           | G4    | Export generic React types.                                                                 |
| `packages/plite-react/test/**/*.ts` and `packages/plite-react/test/**/*.tsx`                      | G5    | Add generic custom value render contract; remove module augmentation use.                   |

### `packages/plite-browser`

| File or file group                                         | Class | Required work                                                                                                               |
| ---------------------------------------------------------- | ----- | --------------------------------------------------------------------------------------------------------------------------- |
| `packages/browser/src/browser/*.ts`    | G5    | Browser snapshots are test protocol types, not Plite model generics. Verify names do not conflict with `EditorSnapshot<V>`. |
| `packages/browser/src/playwright/*.ts` | G5    | Test handles remain protocol-level. Add scenarios that prove custom value examples compile/run without `CustomTypes`.       |
| `packages/browser/test/**/*.ts`        | G5    | Add generic app fixture where useful.                                                                                       |

### Site, Docs, Examples

| File or file group                                                         | Class | Required work                                                                                                                            |
| -------------------------------------------------------------------------- | ----- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/www/src/app/(app)/examples/plite/_examples/custom-types.d.ts`                         | G5    | Delete module augmentation. Replace with exported `ExampleText`, `ExampleElement`, `ExampleValue`, `ExampleEditor` from a normal module. |
| `apps/www/src/app/(app)/examples/plite/_examples/code-highlighting.tsx`                     | G5    | Remove local `declare module 'slate'`; use explicit value/editor types.                                                                  |
| `apps/www/src/app/(app)/examples/plite/_examples/*.tsx`                                     | G5    | Every example imports or declares its own `Value` / editor type when needed. No app-wide custom type pollution.                          |
| `apps/www/components/*.tsx`                                      | G5    | Example loader must not depend on global custom Plite types.                                                                             |
| `apps/www/pages/**/*.tsx` and `apps/www/pages/**/*.ts` | G5    | Site pages compile against package source aliases after module augmentation is gone.                                                     |
| `apps/www/next-env.d.ts`                                         | G0/G5 | Verify no Plite declaration merging.                                                                                                     |
| `content/docs/plite/concepts/12-typescript.md`                             | G5    | Rewrite around `Value`, `TElement`, `TText`, `Editor<Value>`.                                                                            |
| `content/docs/plite/walkthroughs/01-installing-slate.md`                   | G5    | Replace `declare module 'slate'` with generic editor setup.                                                                              |
| `content/docs/plite/walkthroughs/*.md`                                     | G5    | Remove `CustomTypes` mental model and `Transforms.*` if generics examples touch mutation.                                                |
| `content/docs/plite/api/nodes/*.md`                                        | G5    | Document `Value`, `TElement`, `TText`, `Editor<V>`, derived helpers.                                                                     |
| `content/docs/plite/api/operations/*.md`                                   | G5    | Document `Operation<V>` if operation generics land.                                                                                      |
| `content/docs/plite/api/transforms.md`                                     | G5    | Mark `Transforms.*` as non-primary if still exported; show editor primitives in `editor.update`.                                         |
| `content/docs/plite/libraries/plite-dom/**/*.md`                           | G5    | Replace CustomTypes comments with generic editor examples.                                                                               |
| `content/docs/plite/libraries/slate-react/**/*.md`                         | G5    | Replace CustomTypes comments with generic React editor examples.                                                                         |
| `content/docs/plite/libraries/slate-history/**/*.md`                       | G5    | Replace CustomTypes comments with generic history editor examples.                                                                       |
| `content/docs/plite/general/changelog.md`                                  | G5    | Historical mentions can remain only if changelog is intentionally historical; do not use as current guidance.                            |

## Expanded Source File Inventory Command

Before implementation, generate the exact file checklist from disk and paste the result into the execution ledger:

```bash
rg --files packages/plite packages/plite-dom packages/plite-history packages/plite-hyperscript packages/plite-react packages/browser apps/www content/docs/plite \
  | rg '(\\.ts$|\\.tsx$|\\.d\\.ts$|\\.md$|\\.mdx$)' \
  > Plate repo root-generics-file-inventory.txt
```

Implementation is not complete until every file in that inventory is classified as `G0` through `G5` in the execution ledger.

## Execution Batches

### Batch 0: Red Type Contracts

Add compile-only contracts before cutting anything:

- `packages/plite/test/generic-value-contract.ts`
- `packages/plite/test/generic-editor-api-contract.ts`
- `packages/plite/test/generic-operation-contract.ts`
- `packages/plite-react/test/generic-react-editor-contract.tsx`
- `packages/plite-history/test/generic-history-contract.ts`

Required contracts:

```ts
type Paragraph = { type: "paragraph"; children: CustomText[] };
type Quote = { type: "quote"; children: CustomText[] };
type CustomText = { text: string; bold?: true; code?: true };
type CustomValue = (Paragraph | Quote)[];

const editor = createEditor<CustomValue>();

editor.update(() => {
  editor.setNodes({ type: "quote" });
  editor.addMark("bold", true);
});
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

- `packages/plite/src/types/custom-types.ts`
- `packages/plite/src/types/index.ts`
- `packages/plite/src/types/types.ts`
- `packages/plite/src/interfaces/text.ts`
- `packages/plite/src/interfaces/element.ts`
- `packages/plite/src/interfaces/node.ts`
- `packages/plite/src/interfaces/editor.ts`
- `packages/plite/src/interfaces/range.ts`
- `packages/plite/src/interfaces/point.ts`
- `packages/plite/src/interfaces/operation.ts`
- `packages/plite/src/interfaces/index.ts`
- `packages/plite/src/create-editor.ts`
- `packages/plite/src/index.ts`
- `packages/plite/index.ts`

Work:

1. Introduce `Value`, `TElement`, `TText`, derived node helpers.
2. Remove `ExtendedType` from primary model types.
3. Convert `Editor` to `Editor<V>`.
4. Convert `createEditor` to `createEditor<V>()`.
5. Keep runtime mutable storage internal; do not expose public mutable state as the generic story.

### Batch 2: Editor API And Flexible Primitive Generics

Files:

- `packages/plite/src/interfaces/editor.ts`
- `packages/plite/src/interfaces/transforms/*.ts`
- `packages/plite/src/editor/*.ts`
- `packages/plite/src/transforms-node/*.ts`
- `packages/plite/src/transforms-selection/*.ts`
- `packages/plite/src/transforms-text/*.ts`
- `packages/plite/src/utils/get-default-insert-location.ts`
- `packages/plite/src/utils/types.ts`

Work:

1. Make editor queries derive return node types from `E extends Editor`.
2. Make primitives derive implicit target and node payload types from `ValueOf<E>`.
3. Preserve flexible APIs: `setNodes`, `unwrapNodes`, `wrapNodes`, `insertNodes`, `delete`, `insertText`, `insertFragment`.
4. Do not add semantic method bloat to make generics easier.

### Batch 3: Operation, Transaction, Commit, History Generics

Files:

- `packages/plite/src/interfaces/operation.ts`
- `packages/plite/src/interfaces/editor.ts`
- `packages/plite/src/core/apply.ts`
- `packages/plite/src/core/public-state.ts`
- `packages/plite/src/core/command-registry.ts`
- `packages/plite/src/core/editor-extension.ts`
- `packages/plite/src/core/extension-registry.ts`
- `packages/plite/src/core/update-dirty-paths.ts`
- `packages/plite/src/core/get-dirty-paths.ts`
- `packages/plite/src/core/batch-dirty-paths.ts`
- `packages/plite-history/src/history.ts`
- `packages/plite-history/src/history-editor.ts`
- `packages/plite-history/src/with-history.ts`

Work:

1. `Operation<V>` becomes the operation truth.
2. `EditorTransaction<V>` and `EditorCommit<V>` preserve value type.
3. History consumes generic operations/commits without method override typing leaks.
4. Extension listeners preserve `E extends Editor<V>`.

### Batch 4: DOM And React Generic Editors

Files:

- `packages/plite-dom/src/custom-types.ts`
- `packages/plite-dom/src/plugin/dom-editor.ts`
- `packages/plite-dom/src/plugin/with-dom.ts`
- `packages/plite-dom/src/index.ts`
- `packages/plite-dom/index.ts`
- `packages/plite-react/src/custom-types.ts`
- `packages/plite-react/src/plugin/react-editor.ts`
- `packages/plite-react/src/plugin/with-react.ts`
- `packages/plite-react/src/context.tsx`
- `packages/plite-react/src/components/*.tsx`
- `packages/plite-react/src/components/restore-dom/*`
- `packages/plite-react/src/editable/*.ts`
- `packages/plite-react/src/large-document/*`
- `packages/plite-react/src/*.ts`
- `packages/plite-react/src/*.tsx`
- `packages/plite-react/src/index.ts`
- `packages/plite-react/index.ts`

Work:

1. Delete React/DOM module augmentation files.
2. Thread `ReactEditor<V>` / `DOMEditor<V>`.
3. Render element/text/leaf props derive from editor value.
4. Keep browser kernel behavior unchanged unless a type contract exposes a real bug.

### Batch 5: Hyperscript, Site, Docs, Tests

Files:

- `packages/plite-hyperscript/src/*.ts`
- `packages/plite-hyperscript/test/**/*.ts`
- `packages/plite-hyperscript/test/**/*.tsx`
- `packages/plite/test/**/*.ts`
- `packages/plite/test/**/*.tsx`
- `packages/plite-dom/test/**/*.ts`
- `packages/plite-history/test/**/*.ts`
- `packages/plite-history/test/**/*.tsx`
- `packages/plite-react/test/**/*.ts`
- `packages/plite-react/test/**/*.tsx`
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

Run from `Plate repo root`.

### Hard-Cut Search Gates

```bash
rg -n "CustomTypes|ExtendedType|declare module ['\\\"]slate|declare module \\\"slate\\\"" packages site docs --glob '!**/dist/**' --glob '!**/node_modules/**' --glob '!site/out/**'
```

Expected:

- Zero in `packages/**`, `site/**`, and current docs.
- Changelog-only historical hits are allowed only if clearly historical.

```bash
rg -n "EditorMarks = Record<string, any>|Record<string, any>" packages/plite/src packages/plite-react/src packages/plite-dom/src packages/plite-history/src
```

Expected:

- No primary marks type uses `any`.

### Type Gates

```bash
bunx tsc --project packages/plite/test/tsconfig.generic-types.json --noEmit --pretty false
bunx tsc --project packages/plite-history/test/tsconfig.generic-types.json --noEmit --pretty false
bunx tsc --project packages/plite-react/test/tsconfig.generic-types.json --noEmit --pretty false
```

### Package Gates

```bash
bunx turbo typecheck --filter=./packages/plite --filter=./packages/plite-history --filter=./packages/plite-dom --filter=./packages/plite-react --filter=./packages/plite-hyperscript --force
bun test ./packages/plite --bail 1
bun test ./packages/plite-history --bail 1
bun test ./packages/plite-dom --bail 1
bun test ./packages/plite-react --bail 1
bun test ./packages/plite-hyperscript --bail 1
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
- Updating React generics before `packages/plite` helpers are stable.
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

- Actions: activated this plan via `complete-plan`, set `active goal state` to `pending`, generated `active goal state`.
- Commands: read active plan, previous source-first typecheck plan, completion state, Plite package scripts, and current Plite core type files.
- Artifacts: `active goal state`, updated `active goal state`.
- Evidence: current Plite still imports `ExtendedType` in `interfaces/editor.ts`, `interfaces/text.ts`, `interfaces/element.ts`, `interfaces/range.ts`, `interfaces/point.ts`, and `interfaces/operation.ts`; DOM/React still have `custom-types.ts` declaration augmentation files.
- Hypothesis: Batch 0 should first prove the desired API with compile/runtime contracts, then Batch 1 can replace declaration merging without losing Plate parity.
- Decision: start with inventory plus red generic contracts; do not mutate core generic implementation before the contracts exist.
- Owner classification: Batch 0, red type contracts and exact file inventory.
- Changed files: `active goal state`, `active goal state`, `docs/plans/2026-04-26-plite-plate-generics-type-system-plan.md`.
- Rejected tactics: no browser kernel work; no source-first site alias work before package/app type pollution is removed.
- Next action: generate `Plate repo root-generics-file-inventory.txt`, add the first generic contract tests, run focused gates, and record expected failures.

### 2026-04-26: Batch 0 RED Contracts

- Actions: generated the exact Plite file inventory and added compile-only generic contracts for core value/editor API, operations, history, and React editor typing.
- Commands:
  - `rg --files packages/plite packages/plite-dom packages/plite-history packages/plite-hyperscript packages/plite-react packages/browser apps/www content/docs/plite | rg '(\\.ts$|\\.tsx$|\\.d\\.ts$|\\.md$|\\.mdx$)' > tmp/plite-generics-file-inventory.txt`
  - `bunx tsc --project tsconfig.generic-types.json --noEmit --pretty false`
  - `bunx tsc --project packages/plite/test/tsconfig.generic-types.json --noEmit --pretty false`
  - `bunx tsc --project packages/plite-history/test/tsconfig.generic-types.json --noEmit --pretty false`
  - `bunx tsc --project packages/plite-react/test/tsconfig.generic-types.json --noEmit --pretty false`
- Artifacts:
  - `tmp/plite-generics-file-inventory.txt` with 1502 files.
  - `packages/plite/test/generic-value-contract.ts`
  - `packages/plite/test/generic-editor-api-contract.ts`
  - `packages/plite/test/generic-operation-contract.ts`
  - `packages/plite-history/test/generic-history-contract.ts`
  - `packages/plite-react/test/generic-react-editor-contract.tsx`
  - `packages/plite/test/tsconfig.generic-types.json`
  - `packages/plite-history/test/tsconfig.generic-types.json`
  - `packages/plite-react/test/tsconfig.generic-types.json`
- Evidence: the Plite core generic contract is properly RED: missing `Value`, `ValueOf`, `ElementOf`, `TextOf`, `EditorMarksOf`; `createEditor<CustomValue>()` is rejected; `Editor` and `Operation` are not generic.
- Hypothesis: core must migrate first; history and React type contracts are blocked by both missing generic exports and cross-package source root configuration.
- Decision: update Batch 0 gates from `bun test` to `tsc` because Bun tests do not typecheck compile-only generic contracts.
- Owner classification: Batch 0 remains active; Batch 1 core model generics is the next implementation owner.
- Changed files: plan, completion state, continue prompt, Plite inventory, Plite generic contract files, Plite generic tsconfigs.
- Rejected tactics: do not rely on runtime `bun test` for type-only proof; do not begin React generic threading before core exports exist.
- Next action: implement Batch 1 core model generics in `packages/plite/src/interfaces/{text,element,node,editor,operation}.ts`, `types`, and `create-editor.ts` until the Plite core generic contract progresses.

### 2026-04-26: Batch 1 Core/DOM/React Generic Spine

- Actions: added Plate-aligned `Value`, `TElement`, `TText`, `ElementOf`, `TextOf`, `NodeOf`, `NodeIn`, `ValueOf`, and `EditorMarksOf`; made `Editor<V>` and core operation payloads generic; threaded generic editor preservation through `withHistory`, `withDOM`, and `withReact`; removed primary Plite core `ExtendedType` aliases and deleted React/DOM editor declaration merging.
- Commands:
  - `bunx tsc --project packages/plite/test/tsconfig.generic-types.json --noEmit --pretty false`
  - `bunx tsc --project packages/plite-history/test/tsconfig.generic-types.json --noEmit --pretty false`
  - `bunx tsc --project packages/plite-react/test/tsconfig.generic-types.json --noEmit --pretty false`
  - `rg -n "CustomTypes|ExtendedType|declare module ['\\\"]slate|declare module \\\"slate\\\"" packages/plite/src packages/plite-dom/src packages/plite-react/src packages/plite-history/src --glob '!**/dist/**' --glob '!**/node_modules/**'`
  - `rg -n "CustomTypes|ExtendedType|declare module ['\\\"]slate|declare module \\\"slate\\\"" packages site docs --glob '!**/dist/**' --glob '!**/node_modules/**' --glob '!site/out/**'`
- Artifacts:
  - green generic type contracts in `packages/plite/test`, `packages/plite-history/test`, and `packages/plite-react/test`
  - `packages/plite-react/src/dom-globals.d.ts`
  - `packages/plite-dom/src/dom-globals.d.ts`
- Evidence: focused generic gates pass for core, history, and React; source hard-cut search is clean for `packages/plite/src`, `packages/plite-dom/src`, `packages/plite-react/src`, and `packages/plite-history/src`.
- Hypothesis: the primary package generic spine is now viable; remaining CustomTypes debt is docs/site/test-fixture public mental model, not core runtime shape.
- Decision: keep course; continue to Batch 2 public-facing hard cuts instead of widening into package builds before docs/site/test usage stops teaching declaration merging.
- Owner classification: Batch 2, docs/site/test public API hard cut.
- Changed files: Plite core interfaces, operation types, create editor, history types, DOM/React plugin types, React hooks/components typing, generic contract tests and tsconfigs, React/DOM global declaration files, deleted primary custom type files.
- Rejected tactics: do not preserve `CustomTypes.Editor` as a compatibility merge; it erases `Editor<V>` and recreates the source-first type pollution bug.
- Next action: migrate docs/site/current tests away from `CustomTypes` declarations and remove the old `packages/plite/test/tsconfig.custom-types.json` fixture path or reclassify it as archived-only proof.

### 2026-04-26: Batch 2 Public Type Story And Site Source-First Closure

- Actions: removed the current docs/site/test declaration-merging story, deleted the old custom-types fixture gate, made site examples use `createEditor<CustomValue>()`, added source aliases for the site, and made React hooks generic over the full editor instance type so history/extension methods survive through React context.
- Commands:
  - `bunx tsc --project packages/plite/test/tsconfig.generic-types.json --noEmit --pretty false`
  - `bunx tsc --project packages/plite-history/test/tsconfig.generic-types.json --noEmit --pretty false`
  - `bunx tsc --project packages/plite-react/test/tsconfig.generic-types.json --noEmit --pretty false`
  - `bun typecheck`
  - `bun test ./packages/plite --bail 1`
  - `bun test ./packages/plite-history --bail 1`
  - `bun test ./packages/plite-hyperscript --bail 1`
  - `bun --cwd packages/plite-react test -- --bail 1`
  - `bun test ./test/bridge.test.ts ./test/clipboard-boundary.test.ts --bail=1`
  - `bun run lint:fix`
  - `bun run lint`
  - `rg -n "CustomTypes|ExtendedType|declare module ['\\\"]slate|declare module \\\"slate\\\"" packages/plite/src packages/plite-dom/src packages/plite-react/src packages/plite-history/src --glob '!**/dist/**' --glob '!**/node_modules/**'`
  - `rg -n "CustomTypes|ExtendedType|declare module ['\\\"]slate|declare module \\\"slate\\\"" packages site docs --glob '!**/dist/**' --glob '!**/node_modules/**' --glob '!site/out/**'`
  - `rg -n "EditorMarks = Record<string, any>|Record<string, any>" packages/plite/src packages/plite-react/src packages/plite-dom/src packages/plite-history/src`
- Artifacts: site `tsconfig.json` source aliases, generic React context hooks, source-first site example typing, removed current custom-types fixture gate, current TypeScript docs updated to `createEditor<CustomValue>()`.
- Evidence: full typecheck is green; generic contracts are green; package tests are green; lint is green; primary package source search has no `CustomTypes`, `ExtendedType`, or `declare module "slate"`; full repo search only shows historical changelog entries.
- Hypothesis: the Plate-aligned value-generic model is now the only current typing story, and source-first site checking will keep package internals from relying on app-specific globals.
- Decision: stop this plan as complete; historical changelog mentions are intentionally retained because docs policy does not rewrite history in this type-system lane.
- Owner classification: completion.
- Changed files: Plite core/history/DOM/React/hyperscript generic types, generic contract tests, docs TypeScript pages, site custom types and examples, site source aliases, completion state.
- Rejected tactics: no runtime mutation in hyperscript to satisfy `BaseElement.type`; the type bridge stays cast-only so fixture output remains unchanged.
- Next action: no autonomous next move remains for this plan.
