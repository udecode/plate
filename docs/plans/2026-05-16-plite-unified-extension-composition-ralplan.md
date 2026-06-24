# Plite Unified Extension Composition Ralplan

Status: done
Runtime id: 019e1fc0-dba0-7de1-9236-b484a144cda6
Completion file: `active goal state`
Current pass: complete
Next pass: none

## Ralph Revision - Default React History And Disabled Extension Types

Decision:

- `createReactEditor()` and `usePliteEditor()` install React and history by
  default.
- Raw `createEditor()` stays unopinionated; headless history still requires
  `extensions: [history()]`.
- Every extension may set `enabled: false`.
- Extension resolution is latest same-name wins. A disabled same-name extension
  is a tombstone: it removes the previous runtime install and removes that
  extension output from editor types.
- There is no `replaces` API. Future duplicate strictness is a separate
  option, not part of this slice.
- React context uses a React-only context value. It must not require history,
  because `history({ enabled: false })` is valid.

Implementation evidence:

- `EditorResolvedInstalledExtensions` resolves extension tuples right-to-left,
  drops disabled extensions, and excludes replaced same-name types.
- Installed state/tx/api type mapping distributes over extension unions and
  empty extension slots contribute `never`, not absorbing `unknown`.
- `extendEditor` cleans existing same-name extension records before installing
  the latest resolved extension set.
- `history()` accepts `{ enabled?: boolean }` and exposes typed state/tx slots
  plus `editor.api.history` controls.
- React creation prepends `react()` and `history()`, then appends user
  extensions so user extensions can override or tombstone defaults.
- React examples use `usePliteEditor({ extensions: [custom()] })` or no
  `extensions` field for default history.

Fresh verification from `/Users/zbeyens/git/plite`:

- `bun install`: passed, lockfile saved with no dependency changes.
- `bun x tsc --project packages/plite/test/tsconfig.generic-types.json --noEmit`: passed.
- `bun x tsc --project packages/plite-history/test/tsconfig.generic-types.json --noEmit`: passed.
- `bun x tsc --project packages/plite-react/test/tsconfig.generic-types.json --noEmit`: passed.
- `bun test ./packages/plite/test/extension-methods-contract.ts`: 14 passed.
- `bun --filter plite typecheck`: passed.
- `bun --filter plite-history typecheck`: passed.
- `bun --filter plite-react typecheck`: passed.
- `bun typecheck:site`: passed.
- `bun lint:fix`: passed, fixed 4 files.
- `bun check`: passed; existing React hook warning remains in
  `packages/plite-react/src/components/slate.tsx`.

## Implementation Closure Evidence

Final implementation state:

- Core supports `createEditor({ extensions })`, installed `state` / `tx` /
  `editor.api` inference, and token-based `editor.getApi(extensionToken)`.
- `plite-history` exports `history()` and routes stack reads through
  `state.history`, undo/redo through `tx.history`, and ambient controls through
  `editor.api.history`.
- `plite-dom` exports `dom()` and installs sibling `editor.api.dom` and
  `editor.api.clipboard` handles.
- `plite-react` exports `react()`, `createReactEditor()`,
  `ReactEditorInstance`, and `usePliteEditor({ extensions })`.
- First-party examples and docs teach lower camel-case extension factories,
  `editor.api.*` handles, and `clipboard.insertData` handler keys.

Final verification from `/Users/zbeyens/git/plite`:

- `bun --filter plite-dom typecheck`: passed.
- `bun --filter plite-react typecheck`: passed.
- `bun typecheck:site`: passed.
- `bun lint:fix`: passed, no fixes applied.
- `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun x playwright test playwright/integration/examples/check-lists.test.ts playwright/integration/examples/editable-voids.test.ts playwright/integration/examples/markdown-shortcuts.test.ts playwright/integration/examples/inlines.test.ts --project=chromium`: 38 passed.
- `bun check`: passed; it reports one existing eslint warning in
  `packages/plite-react/src/components/slate.tsx` and 0 errors.

Final stale-surface grep:

- Old public names remain only in negative type/runtime tests.
- Root `editor.dom` remains only inside internal DOM/React installers and
  internal DOM coverage implementation.

## Current Verdict

Hard take: the user is right. `withHistory(withReact(createEditor()))`,
`usePliteEditor({ withEditor })`, and custom `withX(editor) { editor.extend(...) }`
are transitional, not the final Plite DX.

The best target is one public extension story:

- authors pass extension factories/values at editor creation
- built-in packages export extension factories, not `with*` mutators
- examples define lowercase extension factories by default, not wrapper
  functions
- `editor.extend` stays as an internal installer or test escape hatch, not the
  taught app-author API
- the editor root stays small; replayable extension typing flows into `state`
  and `tx`, not into root editor properties
- non-replayable DOM/React APIs become installed extension handles accessed
  through `editor.api.dom` / `editor.api.react`, not
  `DOMEditor`, `ReactEditor`, `editor.dom`, `state.dom`, or `tx.dom`
- generic code that has an extension token may use
  `editor.getApi(extensionToken)`, not string registry lookup
- typed extension output is inferred from the extension list, not from
  `T & HistoryEditor<ValueOf<T>>`
- public editor-bound helper namespaces are cut with `Editor`; only pure
  document/value helpers keep `*Api` names such as `NodeApi`, `PathApi`, and
  `RangeApi`

This is a breaking change. Good. Carrying both wrapper composition and extension
registration would make Plite look like a half-migration.

## Intent And Boundary

| Field                | Record                                                                                                                                                                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Intent               | Give Plite one extension/composition model with the best authoring DX and a clean type story.                                                                                                                                                  |
| Desired outcome      | A later Ralph pass can replace public `with*` editor wrappers and `withEditor` composition with creation-time extension lists, while keeping current transform/query/normalizer/operation/commit coverage.                                        |
| In scope             | `createEditor`, `usePliteEditor`, built-in history/DOM/React extension packaging, custom example extension authoring, installed-extension typing, Plate/slate-yjs migration backbone.                                                             |
| Non-goals            | Preserving backward compatibility for `withHistory`, `withReact`, `withDOM`, `withEditor`, or public `editor.extend`; copying Plate plugins into raw Plite; implementing this during Plite Ralplan.                                               |
| Decision boundary    | Breaking changes are allowed. Raw Plite may conflict with current Plate because Plate can fully migrate. Raw Plite must stay unopinionated; Plate owns product plugin APIs.                                                                       |
| User decision needed | None. Passes 4, 7, 8, and 9 close the shape: no editor-root history/DOM, no public editor-bound helper namespaces, no history duplication on `editor.api`, lowercase factory names, and typed `editor.getApi(extensionToken)` for generic access. |

## Original Live Current State

| Surface                 | Current evidence                                                                                                                                                                             | Read                                                                                |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| React creation helper   | `usePliteEditor` calls `withReact(createEditor(...))` and then optionally calls `withEditor`.                                                                                                | `/Users/zbeyens/git/plite/packages/plite-react/src/hooks/use-slate-editor.ts:19` |
| Example wrapper nesting | Editable voids teaches `withEditor: (editor) => withEditableVoids(withHistory(editor))`.                                                                                                     | `/Users/zbeyens/git/plite/site/examples/ts/editable-voids.tsx:21`                |
| Example local wrapper   | `withEditableVoids` exists only to call `editor.extend(...)` and return the same editor.                                                                                                     | `/Users/zbeyens/git/plite/site/examples/ts/editable-voids.tsx:63`                |
| Checklist wrapper       | `withChecklists` is a typed wrapper over `editor.extend({ transforms: ... })`.                                                                                                               | `/Users/zbeyens/git/plite/site/examples/ts/check-lists.tsx:87`                   |
| History wrapper         | `withHistory` casts `editor` to `T & HistoryEditor<ValueOf<T>>`, mutates `history`, `undo`, `redo`, and `writeHistory`, then registers a commit listener.                                    | `/Users/zbeyens/git/plite/packages/plite-history/src/with-history.ts:25`         |
| History type            | `HistoryEditor` extends `Editor` with top-level `history`, `undo`, `redo`, and `writeHistory`.                                                                                               | `/Users/zbeyens/git/plite/packages/plite-history/src/history-editor.ts:18`       |
| DOM wrapper             | `withDOM` mutates `e.dom`, overrides transform registry entries, and also calls `e.extend(...)` for operation middleware.                                                                    | `/Users/zbeyens/git/plite/packages/plite-dom/src/plugin/with-dom.ts:55`          |
| React wrapper           | `withReact` wraps `withDOM` and adds Android transform-registry behavior.                                                                                                                    | `/Users/zbeyens/git/plite/packages/plite-react/src/plugin/with-react.ts:23`      |
| Extension substrate     | Core already has `defineEditorExtension`, dependency/conflict checks, transform middleware, query middleware, normalizers, operation middleware, state groups, tx groups, and editor groups. | `/Users/zbeyens/git/plite/packages/plite/src/core/editor-extension.ts:89`        |
| Public editor shape     | `BaseEditor` exposes `read`, `subscribe`, `update`, and `extend`.                                                                                                                            | `/Users/zbeyens/git/plite/packages/plite/src/interfaces/editor.ts:501`           |
| Extension groups        | `Editor`, `EditorStateView`, and `EditorUpdateTransaction` are already declaration-mergeable through extension group interfaces.                                                             | `/Users/zbeyens/git/plite/packages/plite/src/interfaces/editor.ts:454`           |
| Transform coverage      | Transform middleware is mapped over every public transform key, not a hand-listed two-method table.                                                                                          | `/Users/zbeyens/git/plite/packages/plite/src/interfaces/editor.ts:784`           |
| Query coverage          | Query middleware covers grouped reads across fragment, marks, nodes, points, ranges, and text.                                                                                               | `/Users/zbeyens/git/plite/packages/plite/src/interfaces/editor.ts:930`           |
| Plate comparison        | Plate stores typed plugins on `editor.plugins` and maps plugin generics into `api`, `tf`, and plugin keyed records.                                                                          | `/Users/zbeyens/git/plate/packages/core/src/lib/editor/PliteEditor.ts:186`          |
| Plate creation          | Plate already uses creation options with `plugins?: P[]`, then returns `TPliteEditor<V, InferPlugins<P[]>>`.                                                                                 | `/Users/zbeyens/git/plate/packages/core/src/lib/editor/withPlite.ts:215`            |
| Prior PR narrative      | Before pass 11, the PR reference said `withEditor` mirrors `withReact` / `withHistory` instead of using extension lists. Pass 11 invalidates that wording.                                   | `docs/plite/references/pr-description.md`                                        |

## Before And After Shape

Current shape:

```ts
const editor = usePliteEditor<CustomValue, CustomEditor>({
  withEditor: (editor) => withEditableVoids(withHistory(editor)),
  initialValue,
});

const withEditableVoids = (editor: CustomEditor) => {
  editor.extend({
    name: "editable-voids",
    elements: [{ type: "editable-void", void: "editable-island" }],
  });

  return editor;
};
```

Target shape:

```ts
const editableVoid = () =>
  defineEditorExtension({
    name: "editable-voids",
    elements: [{ type: "editable-void", void: "editable-island" }],
  });

const editor = usePliteEditor({
  initialValue,
  extensions: [editableVoid()],
});
```

Current history shape:

```ts
const editor = withHistory(withReact(createEditor<CustomValue>()));

editor.undo();
editor.redo();
HistoryEditor.withoutSaving(editor, () => {
  editor.update((tx) => {
    tx.nodes.set({ type: "paragraph" });
  });
});
```

Target history shape:

```ts
const editor = createReactEditor({
  initialValue,
});

editor.update((tx) => {
  tx.history.undo();
});

editor.update((tx) => {
  tx.history.redo();
});

editor.api.history.withoutSaving(() => {
  editor.update((tx) => {
    tx.nodes.set({ type: "paragraph" });
  });
});
```

Target custom behavior shape:

```ts
const checklist = () =>
  defineEditorExtension({
    name: "checklist",
    transforms: {
      deleteBackward({ editor, next }) {
        if (applyChecklistBackspaceStart(editor)) return;

        next();
      },
    },
  });

const editor = usePliteEditor({
  initialValue,
  extensions: [checklist()],
});
```

No `withChecklists`. No `withEditableVoids`. No `withEditor`. No `as CustomEditor`
just to recover a wrapper intersection.

Naming convention:

- Extension factories are lower camel-case singular nouns by default:
  `history()`, `dom()`, `editableVoid()`, `checklist()`, `mention()`,
  `table()`.
- Use plural names only when the concept is naturally a collection or action
  family, such as `shortcuts()` or `normalizers()`.
- Static extension values use PascalCase plus `Extension` only when they are
  values, not functions: `EditableVoidExtension`.
- Do not export PascalCase callables such as `History()`.
- Do not suffix callables as `HistoryExtension()`. That reads like a class or
  constant but behaves like a factory.
- Plate's `NamePlugin` convention belongs to Plate's product plugin layer.
  Raw Plite uses extension factories/values, not plugins.

## Decision Brief

Principles:

1. One extension mechanism beats nostalgic wrapper composition.
2. Raw Plite uses `extensions`, not Plate `plugins`.
3. Replayable extension output is grouped and typed on state/tx; mounted
   environment capability output is exposed on typed `editor.api`
   handles.
4. Runtime ordering must be deterministic before React/provider mount.
5. Old method-override power stays covered through extension middleware, not
   monkeypatching.

Top drivers:

1. Current code already has a real extension registry and middleware substrate.
2. History/DOM/React still bypass that substrate with wrapper mutation.
3. Plate and slate-yjs need a typed migration backbone, not compatibility with
   today's wrapper names.

Viable options:

| Option                                                                                                                                                                              | Verdict | Why                                                                                                                                                                            |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Keep `with*` wrappers and let wrappers call `editor.extend`.                                                                                                                        | Reject  | This teaches two extension models and preserves intersection-type DX. It is the current mess.                                                                                  |
| Make `editor.extend(...)` the public chain API.                                                                                                                                     | Reject  | Better than wrappers, but still runtime mutation, cleanup timing, and weak creation-time type inference.                                                                       |
| Add creation-time `extensions` but expose extension-owned editor root groups such as `editor.history`.                                                                              | Reject  | It still grows the editor root and contradicts the state/tx boundary. A namespace is cleaner than `editor.undo`, but it is still a root extension.                             |
| Add creation-time `extensions`, demote `editor.extend` to internal/advanced, and expose every extension API through state/tx groups.                                                | Reject  | This wrongly drags mounted DOM and browser side effects into the replayable model API.                                                                                         |
| Add creation-time `extensions`, expose replayable extension APIs through state/tx groups, and expose non-replayable mounted capabilities through typed `editor.api.<name>` handles. | Choose  | Single install model, deterministic order, good tuple inference, one stable installed-handle map, and a clean boundary between replayable model APIs and browser runtime APIs. |
| Copy Plate product plugin records and `TPliteEditor` directly.                                                                                                                      | Reject  | Plate is the product plugin layer. Raw Plite should steal typed keyed inference, not Plate's plugin/options/component facade.                                                  |

Chosen option:

```ts
const editor = createEditor({
  initialValue,
  extensions: [history(), myExtension()],
});
```

React helper:

```ts
const editor = usePliteEditor({
  initialValue,
  extensions: [myExtension()],
});
```

`usePliteEditor` creates a React-capable editor through the same extension
pipeline. A non-hook `createReactEditor({ extensions })` can exist for tests and
non-hook React setup. It is a creation helper, not a second extension model. The
returned editor may carry a phantom installed-extension generic for `read`,
`update`, and `extensions` inference. Its public root shape stays small:
`read`, `subscribe`, `update`, `api`, and typed `getApi`.

## Public API Target

### Core

```ts
type CreateEditorOptions<
  V extends Value = Value,
  TExtensions extends readonly EditorExtensionInput[] = [],
> = {
  extensions?: TExtensions;
  initialSelection?: Selection;
  initialValue?: V;
};

declare function createEditor<
  V extends Value = Value,
  const TExtensions extends readonly EditorExtensionInput[] = [],
>(options?: CreateEditorOptions<V, TExtensions>): Editor<V, TExtensions>;
```

`Editor<V, TExtensions>` should carry installed extension type information for
`read`, `update`, and `extensions`, without adding extension-owned public root
properties such as `editor.history` or `editor.dom`. Replayable extension
groups and installed extension handles are inferred from the tuple:

```ts
const extensions = [history(), react(), checklist()] as const;
const editor = createEditor({ initialValue, extensions });

editor.read((state) => state.history.canUndo());
editor.read((state) => state.history.redos());
editor.update((tx) => tx.checklist.toggle());
editor.update((tx) => tx.history.undo());

editor.api.dom.resolvePath(element);
editor.api.clipboard.insertData(data);
```

### Built-in Packages

Cut these public exports:

- `withHistory`
- `withDOM`
- `withReact`

Add extension factories:

- `history()` from `plite-history`
- `dom(options?)` from `plite-dom`
- `react(options?)` from `plite-react`

Factory naming rule:

- Built-in factories stay lower camel-case: `history()`, `dom()`, `react()`.
- Custom factories should follow the same singular shape: `editableVoid()`,
  `checklist()`, `mention()`, `table()`.
- Plural factory names are reserved for naturally plural domains such as
  `shortcuts()` or `normalizers()`.
- Static extension values may use PascalCase plus `Extension`:
  `EditableVoidExtension`.
- Do not use `History()` or `HistoryExtension()` for factory exports.
- Do not copy Plate's `NamePlugin` suffix into raw Plite. Plate plugins are a
  product-layer concept; raw Plite extensions are the substrate.

`react()` depends on or installs DOM capability through the extension dependency
system. It must not call `withDOM` because that preserves the old mental model
inside the new one.

### React

Cut `withEditor` from `usePliteEditor`.

```ts
const editor = usePliteEditor({
  initialValue,
  extensions: [editableVoid()],
});
```

The hook installs React capability through the same creation path. If direct
construction is needed:

```ts
const editor = createReactEditor({
  initialValue,
  extensions: [editableVoid()],
});
```

### Typed API Access

Direct app code should prefer the installed handle:

```ts
editor.api.history.withoutSaving(() => {
  editor.update((tx) => tx.nodes.set({ type: "paragraph" }));
});
```

Generic code that has an extension token can use `getApi`:

```ts
editor.getApi(history).withoutSaving(() => {
  editor.update((tx) => tx.nodes.set({ type: "paragraph" }));
});

editor.getApi(dom).focus();
```

The token is the branded extension factory or static extension value, not a
string and not a freshly created extension instance:

```ts
editor.getApi("history"); // type error
editor.getApi(history()); // type error
editor.getApi(history).undo(); // type error; use tx.history.undo()
editor.getApi(history).redos(); // type error; use state.history.redos()
```

### History

History becomes state and tx extension groups:

```ts
editor.read((state) => state.history.canUndo());
editor.read((state) => state.history.canRedo());
editor.read((state) => state.history.undos());
editor.read((state) => state.history.redos());

editor.update((tx) => {
  tx.history.undo();
});

editor.update((tx) => {
  tx.history.redo();
});
```

Do not keep public `editor.undo`, `editor.redo`, `editor.writeHistory`,
`editor.history` root fields, or `HistoryEditor.*` helpers. Extension runtime
state owns the stacks; `state.history` exposes readonly stack/read helpers,
`tx.history` exposes write actions such as undo/redo, and
`editor.api.history` exposes editor-bound history controls.

History control for update grouping should use update metadata first:

```ts
editor.update(fn, { metadata: { history: { mode: "push" } } });
editor.update(fn, { metadata: { history: { mode: "merge" } } });
editor.update(fn, { metadata: { history: { mode: "skip" } } });
```

Do not duplicate stack reads or undo/redo on `editor.api.history` in the
first pass. Stack reads stay on `state.history`; undo/redo stay on `tx.history`.

Editor-bound helpers that are not pure data APIs live on the installed
extension handle:

```ts
editor.api.history.withoutSaving(() => {
  editor.update((tx) => {
    tx.nodes.set({ type: "paragraph" });
  });
});

editor.api.history.withoutMerging(() => {
  editor.update((tx) => {
    tx.text.insert("x");
  });
});
```

### DOM

Do not keep public `editor.dom`. It is the same root-growth mistake as
`editor.history`, and putting it under `state.dom` / `tx.dom` is worse because
DOM methods depend on mounted browser state, WeakMaps, native selection,
`Window`, and `DataTransfer`.

Current shape:

```ts
editor.dom.focus();
editor.dom.resolvePath(element);
editor.dom.clipboard.insertData(data);
```

Target shape:

```ts
editor.api.dom.focus();
editor.api.dom.resolvePath(element);
editor.api.dom.resolveRangeRect(range);
editor.api.clipboard.insertData(data);
```

The architecture move is to formalize extension capabilities:

- `state` groups are coherent, replayable reads over Plite editor/model state
- `tx` groups are coherent, replayable writes/actions over Plite editor/model
  state
- `capabilities` are installed runtime handles for mounted or external systems

```ts
const editor = usePliteEditor({
  initialValue,
});

editor.api.dom.resolvePath(element);
editor.api.dom.focus();
editor.api.clipboard.insertData(data);
```

`dom()` can register multiple public runtime handles. It installs the `dom`
handle for DOM projection/focus APIs and the `clipboard` handle for
`DataTransfer` / clipboard APIs. Public API keys are capability names, not
package names. The public surfaces are the typed installed handles at
`editor.api.dom` and `editor.api.clipboard`. They can assert that the capability
exists, but they must not be intersection types that add `dom` or `clipboard`
to the editor root.

`editor.api.clipboard.insertData(data)` may parse `DataTransfer` and then open
an internal `editor.update` to apply Plite operations. The public API still does
not pass `DataTransfer` through `tx`, because the browser object is not a
replayable transaction input. Do not expose
`editor.api.dom.clipboard.insertData(data)`; nesting clipboard under DOM is
package-shaped, not capability-shaped.

React follows the same rule. `react()` may expose a typed
`editor.api.react` handle for React-bound runtime helpers, but
`ReactEditor` must not be public app DX and must not be a root editor
intersection type that adds DOM or React fields.

## Internal Runtime Target

- Keep `defineEditorExtension`.
- Keep dependency, peer dependency, and conflict checks.
- Keep `elements`, `transforms`, `queries`, `normalizers`,
  `operationMiddlewares`, `commitListeners`, `state`, `tx`, and typed
  extension handles backed by internal capabilities.
- Install extensions during `createEditor` before the editor reaches React
  provider code.
- Remove `extend` from the public `BaseEditor` author type, or mark it
  explicitly internal and stop exporting it as the normal app API.
- Keep a private `extendEditor(editor, extension)` installer for core package
  implementation and focused tests.
- Do not use extension `editor` groups for public app APIs. If the runtime keeps
  an editor-group escape hatch, treat it as internal and do not use it for
  history/DOM/React public DX.
- Formalize capability access behind `editor.api.<name>` handles. Direct app
  code uses those handles. Generic extension-aware code may call
  `editor.getApi(extensionToken)` where the token is a branded factory/value.
  Raw string lookup such as `getEditorCapability(editor, name)` stays internal,
  and app code should not call `DOMEditor.*`.
- Do not expose `editor.plugins`. Raw Plite may expose read-only extension
  metadata later, but the normal API is typed state/tx groups plus
  `editor.api`, not registry inspection.

The existing `ExtensionRegistry` already has the right raw ingredients:
capabilities, commands, commit listeners, element specs, editor groups,
operation middlewares, query middlewares, state groups, and tx groups
(`/Users/zbeyens/git/plite/packages/plite/src/core/extension-registry.ts:31`).
Pass 7 narrows the public target again: mounted DOM/React target is exposed
through typed installed extension handles, not public `DOMEditor` /
`ReactEditor` namespaces, even though the live registry can currently install
editor groups.

## Type Target

Current bad shape:

```ts
export const withHistory = <T extends Editor<any>>(
  editor: T
): T & HistoryEditor<ValueOf<T>>
```

Target shape:

```ts
const extensions = [history(), editableVoid()] as const;

const editor = createEditor({
  initialValue,
  extensions,
});
```

Inference should give:

- `ValueOf<typeof editor> = CustomValue`
- `state.history.*` exists inside `editor.read` because `history()` is installed
- `tx.history.*` exists inside `editor.update` because `history()` is installed
- `tx.<customGroup>` exists only when the custom extension declares it
- `editor.api.history.withoutSaving` exists because `history()` is
  installed
- `editor.getApi(history).withoutSaving` exists because `history()` is
  installed and `history` is a typed extension token
- `editor.api.dom.*` exists because `dom()` or `react()` is installed
- `editor.getApi(dom).*` exists because `dom()` or `react()` is installed and
  `dom` is a typed extension token
- `editor.api.clipboard.*` exists because `dom()` or a future dedicated
  clipboard installer provides that capability
- `editor.getApi(clipboard).*` exists because the clipboard API token is
  installed by `dom()` or a future dedicated clipboard installer
- no `editor.history.*` root namespace is installed for normal app code
- no `editor.dom.*` root namespace is installed for normal app code
- no local `CustomEditor = ReactEditor & HistoryEditor & ...` glue for normal
  examples
- no string `editor.getApi('history')` public typing
- no fresh-instance `editor.getApi(history())` public typing
- no nested `editor.api.dom.clipboard.*` public typing
- no duplicated `editor.getApi(history).undo()` or
  `editor.getApi(history).redos()` public typing

Negative type tests must be explicit, not implied:

```ts
const plainEditor = createEditor({ initialValue });

// @ts-expect-error history is not installed
plainEditor.api.history.withoutSaving(() => {});

// @ts-expect-error history is not installed
plainEditor.getApi(history);

const historyEditor = createEditor({
  initialValue,
  extensions: [history()],
});

historyEditor.api.history.withoutSaving(() => {});
historyEditor.getApi(history).withoutSaving(() => {});

// @ts-expect-error string lookup is not public API
historyEditor.getApi("history");

// @ts-expect-error fresh extension instances are not lookup tokens
historyEditor.getApi(history());

// @ts-expect-error undo is replayable transaction API
historyEditor.api.history.undo();

// @ts-expect-error undo is replayable transaction API
historyEditor.getApi(history).undo();

// @ts-expect-error dom is not installed
historyEditor.api.dom.focus();

// @ts-expect-error dom is not installed
historyEditor.getApi(dom);

// @ts-expect-error clipboard is not installed
historyEditor.api.clipboard.insertData(data);

const domEditor = createEditor({
  initialValue,
  extensions: [dom()],
});

domEditor.api.dom.focus();
domEditor.api.clipboard.insertData(data);

// @ts-expect-error clipboard is top-level capability API
domEditor.api.dom.clipboard.insertData(data);
```

This should be closer to Plate's `TPliteEditor<V, P>` generic idea, but with
raw Plite names:

- `extensions`, not `plugins`
- `state` / `tx`, not `api` / `tf`
- extension groups, not product plugin config

## Ecosystem Strategy Synthesis

| Reference               | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Mechanism                                                                                 | Plite target                                                                                                                                                                                           | Verdict |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- |
| Lexical                 | `LexicalExtension` has unique names, conflicts, dependencies, peer dependencies, config merge, `init`, `build`, `register`, and output typing in `/Users/zbeyens/git/lexical/packages/lexical/src/extension-core/types.ts:164`. `LexicalBuilder.fromExtensions` constructs, builds, registers, and disposes extensions from a stable creation list in `/Users/zbeyens/git/lexical/packages/lexical-extension/src/LexicalBuilder.ts:138`.                                                                                                                                          | Creation-time extension graph with lifecycle/output discipline.                           | Steal dependency/conflict/lifecycle/output discipline. Do not steal PascalCase factory naming as Plite app DX; Plite's common call site is `extensions: [history(), react()]`, not `HistoryExtension`. | agree   |
| Lexical React           | `LexicalExtensionComposer` requires a stable root extension and builds the editor inside `useMemo` with `ReactProviderExtension`, configured `ReactExtension`, and the user extension in `/Users/zbeyens/git/lexical/packages/lexical-react/src/LexicalExtensionComposer.tsx:36` and `/Users/zbeyens/git/lexical/packages/lexical-react/src/LexicalExtensionComposer.tsx:89`. `ReactExtension` returns React output `{ Component, context }` in `/Users/zbeyens/git/lexical/packages/lexical-react/src/ReactExtension.tsx:75`.                                                    | React capability comes from installed extension output, not post-hoc wrapper composition. | Steal stable React creation and extension output. Keep Plite `usePliteEditor({ extensions })` / `createReactEditor({ extensions })`; do not keep `withEditor`.                                         | agree   |
| Tiptap                  | `Editor` has `options.extensions`, `extensionManager`, `commandManager`, `extensionStorage`, `storage`, `commands`, `chain`, `can`, `view`, and mounted `EditorView` in `/Users/zbeyens/git/tiptap/packages/core/src/Editor.ts:85` and `/Users/zbeyens/git/tiptap/packages/core/src/Editor.ts:222`. `ExtensionManager` gathers commands, keymaps, input rules, paste rules, ProseMirror plugins, and node views from extensions in `/Users/zbeyens/git/tiptap/packages/core/src/ExtensionManager.ts:62` and `/Users/zbeyens/git/tiptap/packages/core/src/ExtensionManager.ts:89`. | Product editor facade with root commands, storage, view, and extension features.          | Steal creation-time `extensions` and discoverable feature collection. Reject root `commands`, `storage`, `chain`, and `view` as raw Plite's public shape. Plate can own that product facade.           | partial |
| ProseMirror State       | `EditorState` is persistent, owns plugin arrays, keyed plugin fields, transaction filtering, append transactions, and plugin state fields in `/Users/zbeyens/git/prosemirror-state/src/state.ts:83`, `/Users/zbeyens/git/prosemirror-state/src/state.ts:117`, and `/Users/zbeyens/git/prosemirror-state/src/plugin.ts:7`.                                                                                                                                                                                                                                                         | Deterministic model state plus transaction authority.                                     | Steal transaction-owned behavior and keyed extension state. This supports `state.history` / `tx.history`, not root `editor.history`.                                                                   | agree   |
| ProseMirror View        | `EditorView` owns DOM state, plugin views, prop lookup, focus, coordinate/DOM mapping, paste helpers, and dispatch in `/Users/zbeyens/git/prosemirror-view/src/index.ts:27`, `/Users/zbeyens/git/prosemirror-view/src/index.ts:255`, and `/Users/zbeyens/git/prosemirror-view/src/index.ts:336`. Keymaps call command functions with `(state, dispatch, view)` and explicitly treat view as an escape hatch in `/Users/zbeyens/git/prosemirror-keymap/src/keymap.ts:47`.                                                                                                          | DOM/view APIs are view-owned and lifecycle-bound, not model state.                        | Strongly validates the capability split. DOM/React must stay out of `state` and `tx`; Plite exposes them through `editor.api.dom` / `editor.api.react`.                                                | agree   |
| Plate                   | `TPliteEditor<V, P>` maps plugin generics into keyed `plugins`, `api`, and `tf` records in `/Users/zbeyens/git/plate/packages/core/src/lib/editor/PliteEditor.ts:186`. `withPlite` accepts `plugins?: P[]` and returns `TPliteEditor<V, InferPlugins<P[]>>` in `/Users/zbeyens/git/plate/packages/core/src/lib/editor/withPlite.ts:215`.                                                                                                                                                                                                                                          | Typed product plugin registry.                                                            | Steal typed installed inference. Raw Plite may use `editor.api` as a narrow installed-handle map, but must reject Plate's product plugin records, option stores, components, and transform facade.     | diverge |
| slate-yjs               | `withYjs` casts to `T & YjsEditor`, installs root fields/methods, and patches `apply` / `onChange` in `/Users/zbeyens/git/slate-yjs/packages/core/src/plugins/withYjs.ts:156` and `/Users/zbeyens/git/slate-yjs/packages/core/src/plugins/withYjs.ts:266`.                                                                                                                                                                                                                                                                                                                        | Collaboration wrapper mutation around local/remote operation flow.                        | Migrate to a `yjs()` extension with runtime state/capabilities, operation middleware, commit listeners, and update metadata. No current adapter promise.                                               | tension |
| Plite DOM/React helpers | Live Plite already has `DOMEditor` helper namespace plus `createDOMEditorCapability` in `/Users/zbeyens/git/plite/packages/plite-dom/src/plugin/dom-editor.ts:603` and `/Users/zbeyens/git/plite/packages/plite-dom/src/plugin/dom-editor.ts:1726`. `ReactEditor` is currently an alias over DOM helper shape in `/Users/zbeyens/git/plite/packages/plite-react/src/plugin/react-editor.ts:1`.                                                                                                                                                                        | Legacy editor-bound helper namespace over mounted runtime behavior.                       | Hard-cut public helper namespaces with `Editor`. Keep internal capability implementation, but expose installed runtime APIs as `editor.api.dom` / `editor.api.react`.                                  | revise  |

## Research Ecosystem Refresh - Pass 5

Trigger:

The user challenged the DOM boundary again: if `read` and `update` are only for
replayable editor/model APIs, then `editor.dom` cannot simply move there. This
pass tested whether that means another architecture move is needed.

Verdict:

Yes, the plan needs a named architecture concept, but not a new app-author API.
The concept is first-class extension capabilities. The public shape stays:

```ts
const editor = usePliteEditor({
  extensions: [history(), react()],
  initialValue,
});

editor.read((state) => state.history.redos());

editor.update((tx) => {
  tx.history.undo();
});

editor.api.dom.focus();
editor.api.dom.resolvePath(element);
```

No `editor.dom`. No `state.dom`. No `tx.dom`.

Ecosystem findings:

| Question                                                                            | Finding                                                                                                                                                                                                                                                         | Plan decision                                                                                                                                                                                                           |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Should built-ins be capitalized like Lexical `HistoryExtension` / `ReactExtension`? | Lexical uses PascalCase extension constants, but its call site is a root extension graph. Plite's intended app call site is an options list of capability factories.                                                                                            | Keep `history()`, `dom()`, and `react()`. Capitalized constants are worse at the common Plite call site.                                                                                                                |
| Should history state live on the editor root?                                       | ProseMirror plugin state is state-owned and transaction-updated. Lexical history registers commands and output, but Plite has a stronger `read`/`update` boundary.                                                                                              | Keep `state.history.*` for reads and `tx.history.*` for undo/redo/actions.                                                                                                                                              |
| Should DOM/React live under `read` / `update`?                                      | ProseMirror view owns focus, DOM mapping, selection DOM sync, clipboard/paste helpers, and plugin views separately from persistent `EditorState`.                                                                                                               | Reject `state.dom` and `tx.dom`. DOM/React are mounted capabilities.                                                                                                                                                    |
| Should raw Plite expose a public generic capability accessor?                       | ProseMirror exposes view methods directly on the view, Lexical exposes extension output through dependency APIs, and Plate has typed plugin access. String lookup would leak registry vocabulary, but a branded extension-token accessor preserves type safety. | Expose `editor.getApi(extensionToken)` for generic code. Reject `editor.getApi('history')`, `editor.getApi(history())`, and public `getEditorCapability(editor, name)`. Direct app code still uses `editor.api.<name>`. |
| Should Plite copy Tiptap's root `commands`, `storage`, `chain`, `view` facade?      | Tiptap is a product editor facade. It is good DX for product apps, but it makes raw Plite less minimal.                                                                                                                                                         | Reject for raw Plite. Plate can expose product-level command/storage APIs over Plite extensions.                                                                                                                        |

Architecture update:

- `extensions` install three kinds of output: replayable state groups,
  replayable tx groups, and mounted/external capabilities.
- `state` groups are coherent model reads.
- `tx` groups are coherent model writes/actions.
- capabilities are runtime handles that may touch DOM, React, `Window`,
  selection, `DataTransfer`, Yjs docs, or other external systems.
- typed `editor.api.<name>` handles are the installed runtime/control
  surface.
- typed `editor.getApi(extensionToken)` is the generic escape hatch for
  extension-aware code; string/raw capability getters stay internal.

Pass verdict:

The plan is stronger, not broader. The needed architecture move is to name and
type capabilities as extension output, then expose them through typed installed
extension handles.
Copying DOM into `read` / `update` would be a category error. Copying Tiptap's
root facade would be product-layer creep. The current target remains the best
Plite-ish DX: creation-time `extensions`, replayable `state` / `tx`, and
`editor.api` handles for mounted runtime APIs.

## Plate Migration Backbone

Plate should be able to map Plate plugins to raw Plite extensions:

```ts
createPlateEditor({
  plugins: [TablePlugin, HistoryPlugin],
});
```

internally becomes:

```ts
createEditor({
  extensions: [
    history(),
    tableSchemaExtension(),
    tableTransformExtension(),
    tableRenderExtension(),
  ],
});
```

Plate keeps product config, options stores, components, toolbars, and rich rule
families. Plite supplies the unopinionated extension substrate.

Conflict is allowed: Plate can migrate to this instead of forcing Plite to keep
`with*` wrappers for Plate's comfort.

## slate-yjs Migration Backbone

Current slate-yjs evidence is old Plite wrapper mutation:

- `YjsEditor` extends editor with `sharedRoot`, `connect`, `disconnect`,
  `applyRemoteEvents`, `storeLocalChange`, and `flushLocalChanges`.
- `withYjs` casts `T & YjsEditor`, assigns fields, and patches `apply` /
  `onChange`.

Target:

- `yjs({ sharedRoot, localOrigin, positionStorageOrigin })` extension
- runtime state owns `sharedRoot`, connection state, local change buffer, and
  origins
- operation middleware captures local operations
- commit listeners flush local changes
- remote Yjs events enter through `editor.update(..., { metadata:
{ collab: { origin: 'remote', saveToHistory: false } } })`
- history uses commit metadata, not wrapper ordering

No claim that current slate-yjs can migrate without adapter work.

## Regression Proof Matrix

| Risk                            | Required proof                                                                                                                                                                                                                                                          |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public old wrappers leak back   | Public-surface tests assert no public `withHistory`, `withDOM`, `withReact`, `withEditor`, or public author-facing `editor.extend`.                                                                                                                                     |
| Type regression                 | Generic contract proves `createEditor({ extensions })` and `usePliteEditor({ extensions })` infer value and extension groups without casts.                                                                                                                             |
| History behavior regression     | Existing history contract stays green after moving stacks/listeners into `history()` extension. Add `state.history` stack/read contracts and `tx.history.undo/redo` contracts.                                                                                          |
| DOM/React regression            | Existing DOM bridge and React provider contracts stay green after `dom()` / `react()` extension conversion. Add installed-handle contracts for `editor.api.dom` / `editor.api.react` with no public `DOMEditor`, `ReactEditor`, `editor.dom`, `state.dom`, or `tx.dom`. |
| Full method override regression | Existing transform, query, normalizer, operation middleware, and commit listener contracts stay green. No old override coverage is lost.                                                                                                                                |
| Example DX regression           | Examples migrate wrappers to extension values and compile without `as CustomEditor` recovery casts.                                                                                                                                                                     |
| Browser regression              | Focused Playwright rows for checklists, editable voids, markdown shortcuts, inlines, richtext, and history undo run from `Plate repo root`.                                                                                                                               |
| Plate migration risk            | Plate-facing type proof shows raw Plite extension groups can be consumed by a Plate plugin bridge without exposing Plate plugins in raw Plite.                                                                                                                          |
| slate-yjs risk                  | Collaboration package proof covers operation middleware and remote update metadata before adapter migration is claimed.                                                                                                                                                 |

## Performance DX Migration Regression Pressure - Pass 6

Trigger:

The chosen architecture is attractive enough to be dangerous. Pass 6 tests
whether it stays good when judged as a hot editor runtime, a TypeScript API, a
migration, and a regression surface.

Live evidence used:

- `createEditor` currently accepts only `initialSelection` and `initialValue`,
  and wires `read` / `update` through runtime closures in
  `/Users/zbeyens/git/plite/packages/plite/src/create-editor.ts:498` and
  `/Users/zbeyens/git/plite/packages/plite/src/create-editor.ts:527`.
- `BaseEditor` still exposes public `extend`, while `CreateEditorOptions` has
  no `extensions` field in
  `/Users/zbeyens/git/plite/packages/plite/src/interfaces/editor.ts:501` and
  `/Users/zbeyens/git/plite/packages/plite/src/interfaces/editor.ts:988`.
- Extension outputs already include `capabilities`, `state`, `transforms`, and
  `tx` in `/Users/zbeyens/git/plite/packages/plite/src/interfaces/editor.ts:1273`.
- Transform middleware has a no-handler fast path before command dispatch in
  `/Users/zbeyens/git/plite/packages/plite/src/core/transform-middleware.ts:117`.
- Query middleware has a no-handler fast path before recursive middleware
  dispatch in
  `/Users/zbeyens/git/plite/packages/plite/src/core/query-middleware.ts:136`.
- `stateGroups` and `txGroups` are materialized onto each read/update view in
  `/Users/zbeyens/git/plite/packages/plite/src/core/public-state.ts:1370`
  and `/Users/zbeyens/git/plite/packages/plite/src/core/public-state.ts:1484`.
- Operation middleware currently snapshots the registry Set into an array for
  every operation in
  `/Users/zbeyens/git/plite/packages/plite/src/core/public-state.ts:1737`.
- Commit listener notification already delays snapshot materialization until a
  listener needs it in
  `/Users/zbeyens/git/plite/packages/plite/src/core/public-state.ts:2571`.
- `usePliteEditor` still wraps `withReact(createEditor(...))` and then calls
  `withEditor` in
  `/Users/zbeyens/git/plite/packages/plite-react/src/hooks/use-slate-editor.ts:25`.
- Existing benchmark owners cover core transaction/query/ref/node-transform,
  history memory, collaboration readiness, React rerender breadth, and huge
  document compare in `/Users/zbeyens/git/plite/package.json:11` and
  `/Users/zbeyens/git/plite/scripts/benchmarks/README.md:110`.
- Current tests still prove the old wrapper surface in several places, while
  extension contracts already cover state/tx groups and transform/query
  middleware. The live grep showed current `withHistory`, `withDOM`,
  `withReact`, and `withEditor` usages in history, DOM, React, and examples.

Pressure verdict:

The architecture survives, but only with explicit performance rules. The
absolute-best shape does not change back to wrappers, and it does not expose
`editor.dom`. The implementation plan must add hard runtime guardrails:

| Pressure                       | Verdict                                                                                                                    | Required plan response                                                                                                                                                                                                               |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| No-handler transform path      | Good. Existing transform middleware already falls through without command dispatch when no handler exists.                 | Preserve this shape. `extensions` install must not make every transform walk an empty generic middleware chain.                                                                                                                      |
| No-handler query path          | Good. Existing query middleware already returns the default directly when no middleware exists.                            | Preserve this shape. New state groups must not route every query through extension code.                                                                                                                                             |
| Operation middleware path      | Needs tightening. It currently clones `operationMiddlewares` into an array on every operation.                             | Ralph should add an empty-Set fast path before array allocation, and benchmark operation replay with zero middleware, one middleware, and Yjs-style middleware.                                                                      |
| State/tx group materialization | Acceptable only if disciplined. Every read/update view currently loops installed groups and calls group factories.         | Extension group factories must be tiny and pure. Add an extension-overhead benchmark with zero, one, and many groups. Consider lazy group materialization only if benchmark data proves the current view construction is too costly. |
| Commit listeners               | Good. Snapshot creation is already lazy unless listeners need it.                                                          | Preserve this. History/Yjs listeners must not force snapshot materialization when commit metadata is enough.                                                                                                                         |
| React creation                 | Good target, current code is old. `useState` creation is stable today, but the hook still teaches `withEditor`.            | Replace with `usePliteEditor({ extensions })` and keep editor creation in a stable initializer. Do not reinstall extensions on render.                                                                                               |
| Type DX                        | Good target, but easy to botch. Tuple inference must flow from `extensions` without `CustomEditor` intersections.          | Use const generic `TExtensions`; examples should not require `as CustomEditor`. Add helper types for mark/text keys instead of making examples write mapped-type puzzles.                                                            |
| Migration                      | Hard but mechanical. Wrapper usages are widespread enough that a soft dual API will rot.                                   | Hard-cut public wrappers and migrate examples/tests/docs in one Ralph lane. Keep internal installer only for core tests if needed.                                                                                                   |
| Plate                          | Good boundary. Raw Plite should not copy Plate's product plugin records, options, component registry, or transform facade. | Plate can bridge plugins to Plite extensions internally; raw Plite keeps `extensions`, `state`, `tx`, and narrow installed handles under `editor.api`.                                                                               |
| slate-yjs                      | Good substrate, not free. Current slate-yjs is wrapper/root-mutation shaped.                                               | Treat `yjs()` as later adapter work with operation middleware, commit listeners, runtime state, and capabilities. No "drop-in migration" claim.                                                                                      |
| Regression proof               | Not enough yet. Current proof matrix is broad, but the target needs hard public-surface and benchmark assertions.          | Add public-surface/type tests before code, then run focused package tests, browser rows, benchmark lanes, and `bun check` from `Plate repo root`.                                                                                      |

DX verdict:

The best call-site still looks like this:

```ts
const editor = usePliteEditor({
  initialValue,
  extensions: [checklist()],
});
```

Do not require:

```ts
const extensions = [checklist()] as const;
```

for normal inline usage. The public overload should use a const generic so the
array literal infers as a tuple. Reusable arrays may still use `as const` or
`satisfies`, but primary examples should not teach that as mandatory.

History should stay:

```ts
editor.read((state) => state.history.redos());

editor.update((tx) => {
  tx.history.undo();
});
```

`History.undo(editor)` is rejected for the public API for the same reason
`Editor.*` is rejected: it is an editor-bound helper namespace. Do not duplicate
undo/redo on `editor.api.history` in the first pass. Outside `update`,
call `editor.update((tx) => tx.history.undo())`; inside `update`, use
`tx.history.undo()`.

DOM/React should move to installed extension handles:

```ts
editor.api.dom.focus();
editor.api.dom.resolvePath(element);
editor.api.clipboard.insertData(data);
```

Generic extension-aware code can use typed token access:

```ts
editor.getApi(history).withoutSaving(() => {
  editor.update((tx) => tx.history.undo());
});
```

No public string capability accessor. If package internals need raw capability
lookup, keep it internal and typed.

Regression gates to add before Ralph claims success:

```bash
# cwd: /Users/zbeyens/git/plite
bun test ./packages/plite/test/public-surface-contract.ts
bun test ./packages/plite/test/generic-extension-namespace-contract.ts
bun test ./packages/plite/test/extension-methods-contract.ts
bun test ./packages/plite/test/query-extension-contract.ts
bun test ./packages/plite/test/normalization-contract.ts
bun --filter plite-history test
bun --filter plite-dom test
bun --filter plite-react test:vitest -- generic-react-editor-contract surface-contract with-react-contract
bun --filter plite typecheck
bun --filter plite-history typecheck
bun --filter plite-dom typecheck
bun --filter plite-react typecheck
bun run bench:core:transaction:local
bun run bench:core:query-ref-observation:local
bun run bench:core:node-transforms:local
bun run bench:core:history-retained-memory:local
bun run bench:core:collab-readiness:local
bun run bench:react:rerender-breadth:local
REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local
PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun x playwright test playwright/integration/examples/check-lists.test.ts playwright/integration/examples/editable-voids.test.ts playwright/integration/examples/markdown-shortcuts.test.ts playwright/integration/examples/inlines.test.ts --project=chromium
bun check
```

Additional contracts to add during Ralph:

| Contract                                                | Purpose                                                                                                                                                           |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `createEditor({ extensions })` generic contract         | Proves value and installed state/tx groups infer without wrapper intersections.                                                                                   |
| `usePliteEditor({ extensions })` generic React contract | Proves React helper preserves extension tuple inference without `withEditor`.                                                                                     |
| Capability type contract                                | Proves `editor.api.dom` and `editor.api.react` infer only when the matching extension is installed, without exposing `DOMEditor`, `ReactEditor`, or `editor.dom`. |
| Public hard-cut contract                                | Proves public exports do not include `withHistory`, `withDOM`, `withReact`, `withEditor`, or author-facing `editor.extend`.                                       |
| Extension overhead benchmark                            | Measures zero, one, and many installed groups/middlewares for read, update, transform, query, and operation paths.                                                |

Pass 6 decision:

Keep the architecture. Add performance guardrails and proof gates before code:

- no-handler transform/query paths must stay direct
- operation middleware needs an empty-path allocation fix
- state/tx group factories must stay cheap, with benchmark proof
- React must install once at creation, never per render
- TypeScript must infer inline extension arrays without teaching casts
- migration is hard-cut, not compatibility mode
- benchmark and browser proof are mandatory before `ralph` can call the
  implementation complete

## Plite Maintainer Objection Ledger - Pass 7

Trigger:

The user caught the remaining half-cut: if public `Editor.*` is gone because
editor-bound helpers should not live in static namespaces, then
`HistoryEditor.withoutSaving`, `DOMEditor.focus`, and `ReactEditor.*` have the
same smell. Keeping them would leave authors guessing which APIs live on
`editor`, `state`, `tx`, `editor.api`, or a package namespace.

Evidence used:

- live `HistoryEditor` extends `Editor` with root `history`, `undo`, `redo`,
  and `writeHistory` in
  `/Users/zbeyens/git/plite/packages/plite-history/src/history-editor.ts:18`.
- live `HistoryEditor.withoutSaving`, `withMerging`, `withoutMerging`, and
  `withNewBatch` are editor-bound helper methods in
  `/Users/zbeyens/git/plite/packages/plite-history/src/history-editor.ts:88`.
- live `withHistory` calls `HistoryEditor.withoutSaving` while mutating the
  editor root in `/Users/zbeyens/git/plite/packages/plite-history/src/with-history.ts:25`
  and `/Users/zbeyens/git/plite/packages/plite-history/src/with-history.ts:42`.
- live `withDOM` still assigns `e.dom = createDOMEditorCapability(e)` in
  `/Users/zbeyens/git/plite/packages/plite-dom/src/plugin/with-dom.ts:67`.
- live `DOMEditor` is a public editor-bound helper namespace in
  `/Users/zbeyens/git/plite/packages/plite-dom/src/plugin/dom-editor.ts:603`.
- live `ReactEditor` aliases `DOMEditor` in
  `/Users/zbeyens/git/plite/packages/plite-react/src/plugin/react-editor.ts:1`.
- live core already has an extension registry with `capabilities`, `stateGroups`,
  `txGroups`, and `editorGroups` in
  `/Users/zbeyens/git/plite/packages/plite/src/core/extension-registry.ts:31`.

API namespace law:

- Keep pure data/value helper namespaces: `NodeApi`, `ElementApi`, `TextApi`,
  `PathApi`, `PointApi`, `RangeApi`, `OperationApi`.
- Cut public editor-bound static namespaces: `Editor`, `HistoryEditor`,
  `DOMEditor`, `ReactEditor`, and future `YjsEditor`.
- If an API needs a mounted editor instance, it belongs either inside
  `editor.read`, inside `editor.update`, or under an installed handle at
  `editor.api.<name>`.
- Internal package implementation can keep private helper objects, but public
  docs, examples, and exports should not teach editor-bound static namespaces.

Revised public shape:

```ts
const editor = usePliteEditor({
  initialValue,
  extensions: [history(), react(), checklist()],
});

editor.read((state) => state.history.canUndo());

editor.update((tx) => {
  tx.history.undo();
});

editor.api.history.withoutSaving(() => {
  editor.update((tx) => {
    tx.nodes.set({ type: "paragraph" });
  });
});

editor.api.dom.focus();
editor.api.dom.resolvePath(element);
editor.api.clipboard.insertData(data);

editor.getApi(history).withoutSaving(() => {
  editor.update((tx) => {
    tx.nodes.set({ type: "paragraph" });
  });
});
```

Steelman ledger:

| Decision                                                                  | Strongest fair objection                                                                             | Antithesis                                                                                                     | Tradeoff                                                                                 | Verdict                                                                                                                              |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Hard-cut public `with*`, `withEditor`, and author-facing `editor.extend`. | Classic Plite composition is recognizable, and a hard cut makes v2 feel less familiar.               | Keep wrappers as thin adapters over extensions and deprecate later.                                            | More migration pain now, more docs churn, more first-party example rewrites.             | Keep hard cut. Two extension models are worse than one breaking migration.                                                           |
| Move editor-bound helper namespaces into installed handles.               | `DOMEditor.focus(editor)` is explicit and already familiar to Plite users.                           | Keep `HistoryEditor` / `DOMEditor` / `ReactEditor` as package namespaces, backed by capabilities.              | `editor.api.dom.focus()` is a little longer and requires installed-handle typing.        | Revise target. The longer call is worth it because it gives one rule: editor-bound APIs live on the editor's installed API handles.  |
| Keep history reads/actions in `state.history` / `tx.history`.             | Authors may ask why `undo` exists in `tx.history` but `withoutSaving` is under `editor.api.history`. | Put everything under `editor.api.history`.                                                                     | Losing state/tx groups weakens replayable read/write discipline.                         | Keep both with a hard rule: replayable reads/writes live in read/update; editor-scoped control helpers live on the installed handle. |
| Expose DOM/React through `editor.api.dom` / `editor.api.react`.           | This adds a stable root `api` map after saying the root should stay small.                           | Hide DOM behind static helper namespaces or a generic getter.                                                  | `editor.api` is one root field and becomes a public object to type and document.         | Keep. One stable typed handle map is cleaner than arbitrary root growth or helper namespaces.                                        |
| Add typed `editor.getApi(extensionToken)`.                                | This creates a second way to access installed APIs after `editor.api.<name>`.                        | Reject it and force direct property access only.                                                               | Slightly more surface area, but generic helpers can stay type-safe without string names. | Keep the token accessor. Reject string lookup and fresh-instance lookup.                                                             |
| Keep lowercase factories.                                                 | PascalCase `HistoryExtension` / `ReactExtension` looks more like extension objects.                  | Rename built-ins to `HistoryExtension`, `DomExtension`, `ReactExtension`, or copy Plate's `NamePlugin` suffix. | Lowercase factories can look like commands.                                              | Keep lowercase for built-in and custom factories. PascalCase `NameExtension` is only for static extension values.                    |

Accepted revisions from pass 7:

- Public editor-bound helper namespaces are cut: no public `HistoryEditor`,
  `DOMEditor`, `ReactEditor`, or future `YjsEditor`.
- `editor.api` becomes the stable typed installed-extension handle map.
- `editor.getApi(extensionToken)` becomes the stable typed generic accessor for
  extension-aware code.
- `history()` exposes replayable `state.history` and `tx.history`, plus
  editor-bound helpers such as `editor.api.history.withoutSaving`.
- `dom()` / `react()` expose mounted runtime handles such as
  `editor.api.dom.focus()` and `editor.api.dom.resolvePath(...)`.
- `dom()` may expose multiple capability handles, including top-level
  `editor.api.clipboard`; do not nest clipboard under `editor.api.dom`.
- Pure data/value namespaces keep `*Api` naming.
- Public surface tests must assert the hard cut for `HistoryEditor`,
  `DOMEditor`, and `ReactEditor`, not only `with*` wrappers.

Pass 7 decision:

Revise the plan. The earlier package-helper target was not the absolute-best
DX. It was a compromise. The stronger architecture has one public location for
editor-bound extension APIs: `editor.api.<name>`. That gives Plite users
a simple mental model:

- plain data helpers: `NodeApi`, `PathApi`, `RangeApi`
- editor core: `editor.read`, `editor.update`, `editor.subscribe`
- installed editor-bound APIs: `editor.api.history`,
  `editor.api.dom`, `editor.api.react`
- generic installed API access: `editor.getApi(history)`,
  `editor.getApi(dom)`, `editor.getApi(clipboard)`,
  `editor.getApi(EditableVoidExtension)`
- replayable extension read/write code: `state.history`, `tx.history`

## Confidence Score - Pass 7

| Dimension                              | Score | Evidence                                                                                                                                                                             |
| -------------------------------------- | ----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| React 19.2 runtime performance         |  0.88 | Pass 7 does not change creation timing; React still installs once through `react()` and exposes runtime handles from the stable editor object.                                       |
| Plite-close unopinionated DX           |  0.94 | One rule replaces static editor-bound namespaces: installed APIs live on `editor.api`. Pure data APIs keep `*Api`; wrappers and helper namespace ambiguity are cut.                  |
| Plate and slate-yjs migration backbone |  0.90 | The typed installed-handle map is closer to Plate's keyed plugin inference while preserving raw Plite names; future collaboration can expose `editor.api.yjs` without root mutation. |
| Regression-proof testing strategy      |  0.88 | Public-surface gates now include `HistoryEditor`, `DOMEditor`, and `ReactEditor` removal, plus installed-handle type contracts.                                                      |
| Research evidence completeness         |  0.93 | Pass 7 re-read live history helper namespaces, DOM/React helper namespaces, wrapper root mutation, and core extension registry output maps.                                          |
| shadcn-style composability/minimalism  |  0.90 | The common call site stays compact; extension handles keep imperative APIs discoverable without wrapper functions or static editor helper namespaces.                                |

Weighted score: 0.91.

The score improves, but it still cannot close. High-risk pre-mortem,
ecosystem maintainer pass, revision, issue/reference sync, and final gates are
still pending.

## High-Risk Deliberate Pass - Pass 8

Trigger:

This plan hard-cuts public editor wrappers and editor-bound helper namespaces
while adding one stable typed `editor.api` handle map. That touches
public API, package boundaries, React/DOM runtime behavior, history semantics,
examples, type inference, performance gates, and third-party migration.

Blast radius:

| Area                | Impact                                                                                                                                                                       |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Packages            | `slate`, `plite-history`, `plite-dom`, `plite-react`, later Plate bridge code, and later slate-yjs adapter work.                                                             |
| Public exports      | `withHistory`, `withDOM`, `withReact`, `withEditor`, public `editor.extend`, `HistoryEditor`, `DOMEditor`, and `ReactEditor` are removed from app-facing API.                |
| User code           | Current wrapper composition, `CustomEditor` intersections, static editor helpers, DOM/focus/clipboard calls, and history control helpers all need rewrite.                   |
| Runtime behavior    | History stack grouping, DOM node mapping, focus, clipboard, React editor creation, operation middleware, commit listeners, and extension cleanup.                            |
| Types               | Inline `extensions: [history(), react(), extension()]` must infer value, `state`, `tx`, `editor.api`, and `editor.getApi(extensionToken)` handles without `as CustomEditor`. |
| Docs/examples/tests | Every example that teaches `withEditor`, `with*`, `HistoryEditor`, `DOMEditor`, or `ReactEditor` must move to current API only.                                              |

Three-scenario pre-mortem:

| Scenario                                   | Failure mode                                                                                                                                                                         | Required response                                                                                                                                                                                                                                     |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `editor.api` becomes disguised root growth | Extension authors copy every API into `editor.api.<name>`, so Plite gets `editor.history` again with a longer path.                                                                  | Seal the rule: `editor.api` exposes installed runtime/control handles only. Replayable reads stay in `state`; replayable writes/actions stay in `tx`. Do not duplicate `undo`, `redo`, `undos`, or `redos` on `editor.api.history` in the first pass. |
| Type inference collapses                   | Inline extension arrays infer as `any`, installed handles appear without installed extensions, or required handles disappear in React helper types.                                  | Add negative and positive type contracts before migration. Use const generic extension tuples. No fallback `CustomEditor` intersections, no `any` installed-handle escape hatch.                                                                      |
| Runtime behavior regresses                 | DOM handles hold stale mounted state, React reinstalls extensions during render, history `withoutSaving` leaks across nested updates, or operation middleware slows every operation. | Add lifecycle tests for mount/unmount, focused browser rows for focus/clipboard/history examples, nested history-control tests, no-handler fast-path assertions, and extension overhead benchmarks.                                                   |

Expanded proof plan:

| Proof lane         | Required proof                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public surface     | Assert no app-facing exports for `withHistory`, `withDOM`, `withReact`, `withEditor`, `HistoryEditor`, `DOMEditor`, `ReactEditor`, or author-facing `editor.extend`.                                                                                                                                                                                                                                                  |
| Type contracts     | Prove `createEditor({ extensions })` and `usePliteEditor({ extensions })` infer `state.history`, `tx.history`, `editor.api.history`, `editor.api.dom`, `editor.api.react`, and `editor.getApi(extensionToken)` only when installed. Add negative tests for uninstalled handles, string `getApi`, fresh-instance `getApi`, duplicated history APIs on `editor.api.history`, and fallback `CustomEditor` intersections. |
| History behavior   | Existing history tests stay green. Add stack read tests through `state.history`, undo/redo tests through `tx.history`, and `withoutSaving` / `withMerging` / `withNewBatch` tests through `editor.api.history`.                                                                                                                                                                                                       |
| DOM/React behavior | Existing DOM and React package tests stay green. Add installed-handle tests for focus, resolvePath, clipboard, mount/unmount, read-only, composition, and selection reconciliation.                                                                                                                                                                                                                                   |
| Browser rows       | Run focused Playwright examples for checklists, editable voids, markdown shortcuts, inlines, richtext, and history undo from `Plate repo root`.                                                                                                                                                                                                                                                                         |
| Performance        | Preserve transform/query no-handler fast paths, add operation middleware empty-Set fast path, benchmark zero/one/many installed groups and handles, and rerun core plus React benchmarks.                                                                                                                                                                                                                             |
| Migration/adoption | Migrate first-party examples and docs in the same Ralph lane. Docs describe current API only. PR reference sync must remove stale `withEditor` rationale.                                                                                                                                                                                                                                                             |
| Package boundary   | Keep raw Plite on `extensions`, `state`, `tx`, and narrow `editor.api` handles. Plate keeps product `plugins`, product APIs, transforms, components, options, and rule families.                                                                                                                                                                                                                                      |

Rollback and remediation answer:

No compatibility aliases. If implementation finds `editor.api` is too
broad, narrow it; do not fall back to public `HistoryEditor` / `DOMEditor` /
`ReactEditor`. If installed-handle typing fails, fix the extension tuple and
phantom-type design before migrating examples. If DOM mounted state is not
stable enough, split the internal mount lifecycle, but keep the public handle
shape. If performance data regresses, fix no-handler and group materialization
costs before shipping the public API.

Accepted refinements from pass 8:

- `editor.api` is a sealed, read-only installed-handle map, not a second
  plugin registry.
- Do not duplicate replayable history APIs on `editor.api.history` in
  the first pass. Reads stay in `state.history`; undo/redo stay in `tx.history`.
- `editor.api.history` is for ambient history controls such as
  `withoutSaving`, `withMerging`, `withoutMerging`, and `withNewBatch`.
- DOM/React handles may expose mounted runtime APIs because those APIs are not
  replayable model reads or transaction writes.
- Public-surface gates must fail on static editor-bound namespaces and wrapper
  exports, not only on root editor fields.

Pass 8 verdict:

Keep the plan with the refinements above. The scary part is real: without a
hard rule, `editor.api` can turn into root growth with better branding.
The rule is simple enough to ship:

- `state` for replayable reads
- `tx` for replayable writes/actions
- `editor.api` for installed runtime/control handles
- `*Api` only for pure data/value helpers

## Confidence Score - Pass 8

| Dimension                              | Score | Evidence                                                                                                                                                                     |
| -------------------------------------- | ----: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance         |  0.87 | Pass 8 keeps stable creation, but flags mounted-handle lifecycle and reinstall risk as proof blockers.                                                                       |
| Plite-close unopinionated DX           |  0.93 | The API rule is sharper after banning replayable history duplication on `editor.api.history`.                                                                                |
| Plate and slate-yjs migration backbone |  0.90 | Installed handles give later bridges a typed runtime target while keeping Plate product APIs outside raw Plite.                                                              |
| Regression-proof testing strategy      |  0.91 | The proof plan now includes negative public-surface tests, installed-handle type tests, lifecycle/browser rows, and benchmark gates.                                         |
| Research evidence completeness         |  0.94 | Pass 8 re-read live root editor shape, extension registry maps, state/tx group materialization, history helper state, React creation, public exports, tests, and benchmarks. |
| shadcn-style composability/minimalism  |  0.90 | The common call site stays compact; imperative runtime APIs are discoverable without wrapper functions or static editor-bound namespaces.                                    |

Weighted score: 0.91.

The score does not close the lane. Ecosystem maintainer pass, revision,
issue/reference sync, and final gates are still pending.

## Ecosystem Maintainer Pass - Pass 9

Trigger:

Pass 8 made `editor.api` the public installed-handle map. This pass asks
whether Lexical, ProseMirror, Tiptap, Plate, or slate-yjs prove that shape is
wrong, too broad, or missing an architectural boundary.

Fresh evidence used:

- Lexical extension types define unique names, conflicts, dependencies, peer
  dependencies, config merge, lifecycle, and output typing in
  `/Users/zbeyens/git/lexical/packages/lexical/src/extension-core/types.ts:164`.
- Lexical React requires a stable extension argument and builds the editor from
  React provider, React extension config, and user extension in
  `/Users/zbeyens/git/lexical/packages/lexical-react/src/LexicalExtensionComposer.tsx:36`
  and `/Users/zbeyens/git/lexical/packages/lexical-react/src/LexicalExtensionComposer.tsx:89`.
- ProseMirror `EditorState` is persistent, plugin-owned, and transaction-applied
  in `/Users/zbeyens/git/prosemirror-state/src/state.ts:83`.
- ProseMirror plugins can define state fields and view objects in
  `/Users/zbeyens/git/prosemirror-state/src/plugin.ts:7`.
- ProseMirror `EditorView` owns DOM, focus, input, DOM observer, doc view, and
  plugin views in `/Users/zbeyens/git/prosemirror-view/src/index.ts:27`.
- Tiptap `Editor` owns `options.extensions`, root commands, chain/can,
  storage, mounted view, and lifecycle callbacks in
  `/Users/zbeyens/git/tiptap/packages/core/src/Editor.ts:85`.
- Tiptap `ExtensionManager` collects commands from extensions with editor,
  options, storage, and schema type context in
  `/Users/zbeyens/git/tiptap/packages/core/src/ExtensionManager.ts:27`.
- Plate maps plugin generics into keyed `plugins`, `api`, `tf`, and transforms
  in `/Users/zbeyens/git/plate/packages/core/src/lib/editor/PliteEditor.ts:186`
  and creates `TPliteEditor<V, InferPlugins<P[]>>` in
  `/Users/zbeyens/git/plate/packages/core/src/lib/editor/withPlite.ts:215`.
- slate-yjs currently mutates root collaboration fields and exposes
  `YjsEditor` helpers in
  `/Users/zbeyens/git/slate-yjs/packages/core/src/plugins/withYjs.ts:29` and
  `/Users/zbeyens/git/slate-yjs/packages/core/src/plugins/withYjs.ts:156`.

Ecosystem verdict table:

| Ecosystem pressure           | What it proves                                                                                                                                                                                        | Plite decision                                                                                                                                                                                                  |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lexical extension output     | Extension output is legitimate when it is typed, lifecycle-owned, and dependency-checked. Stable creation input matters in React.                                                                     | Keep creation-time `extensions`, dependency/conflict checks, lowercase Plite factories, and stable React creation. `editor.api` is Plite's public installed-output handle, not a generic dependency lookup API. |
| ProseMirror state/view split | Model state and transactions stay separate from DOM/view lifecycle. Plugin views can own mounted behavior without polluting state.                                                                    | Keep DOM/React out of `state` and `tx`. Do not create a new public `EditorView` object for raw Plite; `editor.api.dom` is the mounted view handle for Plite's React/DOM package.                                |
| Tiptap root facade           | Root `commands`, `chain`, `can`, `storage`, and `view` are excellent product-app DX, but they make the editor a product facade.                                                                       | Reject root commands/storage/view for raw Plite. Plate can expose that layer. Raw Plite keeps `read`, `update`, `extensions`, narrow `editor.api`, and data `*Api` helpers.                                     |
| Plate plugin generics        | Product plugins need keyed records, product APIs, transforms, options, components, and nested plugin config.                                                                                          | Raw Plite can use `editor.api` as a narrow installed-handle map, but it must not copy Plate's product plugin records, option stores, components, or transform facade.                                           |
| slate-yjs wrapper mutation   | Collaboration needs connection handles, shared root state, local/remote origin control, operation capture, and remote apply entry points. Current `YjsEditor` repeats the root/static helper problem. | Future `yjs()` should expose runtime controls at `editor.api.yjs`, model reads/writes through state/tx/metadata where replayable, and operation/commit hooks internally. No public `YjsEditor`.                 |

Architecture result:

Keep the pass-8 model unchanged, with one clarification:

- `editor.api.<name>` is Plite's installed-output handle map.
- It is not Tiptap `storage`, Plate `plugins`, or a public capability registry.
- Handles are allowed only for installed runtime/control APIs that cannot live
  as replayable `state` or `tx` groups.
- Extension lifecycle, dependency, conflict, and cleanup rules should be closer
  to Lexical than to wrapper mutation.
- DOM/React handle lifecycle should steal ProseMirror's view discipline:
  mounted state must be owned, updated, and destroyed explicitly.
- Collaboration should steal ProseMirror/Lexical transaction discipline, not
  slate-yjs root mutation.

Rejected ecosystem alternatives:

| Alternative                                           | Rejection                                                                                                                                                                                    |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Add a separate public `view` object like ProseMirror. | Too much surface for raw Plite right now. Plite's DOM/React package can expose the mounted view handle through `editor.api.dom` without introducing another top-level object.             |
| Copy Tiptap root commands/storage.                    | That is a product editor facade. It belongs in Plate, not raw Plite.                                                                                                                         |
| Copy Plate product plugin records into raw Plite.     | It would collapse the boundary between raw editor substrate and product plugin framework. Raw Plite `editor.api` is only an installed runtime/control handle map.                            |
| Keep `YjsEditor` as the collaboration namespace.      | It repeats the exact editor-bound static namespace problem already cut for `HistoryEditor`, `DOMEditor`, and `ReactEditor`.                                                                  |
| Rename built-ins to PascalCase extension constants.   | Lexical's convention fits its root extension graph. Plite's common app call site reads better as `extensions: [history(), react()]`; user-defined extension constants can remain PascalCase. |

Pass 9 verdict:

Keep the plan. The external systems sharpen the boundaries but do not beat the
pass-8 shape. The best Plite architecture remains:

- creation-time `extensions`
- `state` for replayable reads
- `tx` for replayable writes/actions
- `editor.api` for installed runtime/control handles
- `*Api` only for pure data/value helpers
- Plate owns product plugin facade APIs

## Confidence Score - Pass 9

| Dimension                              | Score | Evidence                                                                                                                      |
| -------------------------------------- | ----: | ----------------------------------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance         |  0.88 | Lexical React reinforces stable extension inputs and editor creation; Plite still needs benchmark/browser proof during Ralph. |
| Plite-close unopinionated DX           |  0.94 | Ecosystem pressure keeps the raw Plite surface small while preserving discoverable installed handles.                         |
| Plate and slate-yjs migration backbone |  0.92 | Plate and slate-yjs evidence now maps cleanly to product facade versus raw substrate and future `editor.api.yjs`.             |
| Regression-proof testing strategy      |  0.91 | Pass 9 keeps pass-8 proof gates and adds lifecycle/dependency/cleanup pressure from Lexical and ProseMirror.                  |
| Research evidence completeness         |  0.95 | Re-read live Lexical, ProseMirror, Tiptap, Plate, slate-yjs, and active Plite plan evidence.                                  |
| shadcn-style composability/minimalism  |  0.90 | The common call site stays compact and avoids product facade creep.                                                           |

Weighted score: 0.92.

The score still cannot close. Revision, issue/reference sync, and final gates
remain.

## Revision Pass - Pass 10

Trigger:

Passes 7, 8, and 9 changed the target from package helper namespaces to a
sealed installed-handle map. This pass reconciles the older wording so Ralph
does not implement a hybrid API by accident.

Consistency review result:

| Area               | Revision                                                                                                                                                                      |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Top verdict        | Kept one public extension story, but made the final shape explicit: no public editor-bound helper namespaces and no history read/write duplication on `editor.api.history`.   |
| Intent boundary    | Closed the earlier factory-naming uncertainty. Built-ins stay lowercase unless implementation proof disproves it.                                                             |
| Decision brief     | Replaced older root-growth wording with "installed-handle map" so `editor.api` is not framed as arbitrary root growth.                                                        |
| History target     | Clarified that `editor.api.history` is for ambient controls only in the first pass. Stack reads stay in `state.history`; undo/redo stay in `tx.history`.                      |
| DOM/React target   | Kept mounted runtime APIs under `editor.api.dom` / `editor.api.react`; `DOMEditor` / `ReactEditor` references remain only as current-state evidence or rejected alternatives. |
| Ecosystem sections | Kept pass-5 history as context but made pass-7/8/9 supersession explicit.                                                                                                     |
| Proof gates        | Confirmed public-surface tests must remove wrappers and editor-bound helper namespaces, and type tests must include negative installed-handle cases.                          |

Final target API law:

```ts
const editor = usePliteEditor({
  initialValue,
  extensions: [history(), react(), checklist()],
});

editor.read((state) => state.history.redos());

editor.update((tx) => {
  tx.history.undo();
});

editor.api.history.withoutSaving(() => {
  editor.update((tx) => {
    tx.nodes.set({ type: "paragraph" });
  });
});

editor.getApi(history).withoutSaving(() => {
  editor.update((tx) => {
    tx.nodes.set({ type: "paragraph" });
  });
});

editor.api.dom.focus();
editor.api.dom.resolvePath(element);
```

Do not add:

```ts
editor.history;
editor.dom;
HistoryEditor.withoutSaving(editor, fn);
DOMEditor.focus(editor);
ReactEditor.focus(editor);
editor.api.history.undo();
editor.api.history.redos();
```

Final rule table:

| API kind                          | Public location                                                                                       |
| --------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Pure data/value helpers           | `NodeApi`, `PathApi`, `RangeApi`, `OperationApi`, and similar `*Api` values                           |
| Core editor lifecycle             | `createEditor({ extensions })`, `usePliteEditor({ extensions })`, `createReactEditor({ extensions })` |
| Replayable reads                  | `editor.read((state) => state.<group>.*)`                                                             |
| Replayable writes/actions         | `editor.update((tx) => tx.<group>.*)`                                                                 |
| Installed runtime/control handles | `editor.api.<name>.*`                                                                                 |
| Product plugin facade             | Plate `plugins`, product APIs, transforms, options, components, and rule families                     |

Revision decisions:

- No new architecture change.
- No new issue claim.
- No ledger write in this pass; pass 11 owns issue/reference sync.
- Before pass 11, the PR reference still teaches the old `withEditor` rationale
  and wrapper-composition framing.
- The final Ralph handoff must implement public-surface tests before removing
  code so stale exports fail loudly.

## Confidence Score - Pass 10

| Dimension                              | Score | Evidence                                                                                                                        |
| -------------------------------------- | ----: | ------------------------------------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance         |  0.88 | Revision does not add runtime evidence; it preserves stable creation and the pass-8/9 benchmark gates.                          |
| Plite-close unopinionated DX           |  0.95 | The public API law is now internally consistent and easier to teach: `state`, `tx`, `editor.api`, and data `*Api`.              |
| Plate and slate-yjs migration backbone |  0.92 | The plan preserves Plate as product facade and future collaboration as installed handle plus operation/commit substrate.        |
| Regression-proof testing strategy      |  0.92 | The revision aligns proof gates with the final API law, including negative tests for helper namespaces and history duplication. |
| Research evidence completeness         |  0.95 | No new research needed; pass 10 reconciles pass-7/8/9 evidence already recorded in the active plan.                             |
| shadcn-style composability/minimalism  |  0.91 | Common examples stay short while avoiding wrapper functions, static editor helper namespaces, and mapped-type puzzles.          |

Weighted score: 0.93.

The score still cannot close. Issue/reference sync and final gates remain.

## Issue Reference Sync Pass - Pass 11

Trigger:

Pass 10 settled the final API law, but the maintainer-facing PR reference and
related issue rows still contained accepted wording for `withEditor`,
`withDOM` / `withReact` options, `editor.dom`, and `DOMEditor.findPath`.

Read set:

- `docs/plite/references/pr-description.md`
- `docs/plite/ledgers/issue-coverage-matrix.md`
- `docs/plite-issues/gitcrawl-v2-sync-ledger.md`
- `docs/plite/ledgers/fork-issue-dossier.md`

Sync result:

| Artifact                           | Update                                                                                                                                                                                                                                 |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PR reference, core editor API      | Added the final law: creation-time `extensions`, lowercase `history()` / `dom()` / `react()` factories, replayable `state` / `tx`, installed `editor.api` handles, and no public `HistoryEditor` / `DOMEditor` / `ReactEditor` app DX. |
| PR reference, clipboard            | Replaced accepted `editor.dom.clipboard` and wrapper option wording with top-level `editor.api.clipboard` and `dom({ clipboardFormatKey })` in the `extensions` list.                                                                  |
| PR reference, React initialization | Replaced `usePliteEditor({ initialValue, withEditor })` and wrapper-composition rationale with `usePliteEditor({ initialValue, extensions })` plus optional `createReactEditor({ initialValue, extensions })`.                         |
| PR reference, render path lookup   | Replaced accepted `editor.dom.findPath` / `DOMEditor.findPath` wording with `editor.api.dom.findPath`.                                                                                                                                 |
| Issue coverage matrix              | Updated `#5867` to name future v2 focus proof as `editor.api.dom.focus`, changed preserved built-in proof wording from wrappers to extension factories, and marked PR prose sync complete with no claim count change.                  |
| Current gitcrawl sync              | Updated `#3802` resolution criteria so closure requires removing stale public wrappers, public `editor.extend`, and editor-bound helper namespaces.                                                                                    |
| Fork issue dossier                 | Updated `#3802` PR-description note to state the reference text is synced to the final API law.                                                                                                                                        |

Claim policy:

- New fixed issue claims: `0`.
- New improved issue claims: `0`.
- Existing fixed/improved rows stay unchanged. This pass only aligns reference
  wording and related-row proof targets with the accepted architecture.

Not changed:

- Historical current-state evidence and rejected examples in this plan still
  name `withHistory`, `withEditor`, `HistoryEditor`, `DOMEditor`, `ReactEditor`,
  `editor.dom`, and `editor.extend` where those names are evidence of the
  current problem or explicit rejected API.
- Existing issue rows that quote upstream issue titles or legacy reports keep
  enough legacy wording to remain searchable, but their v2 proof target is no
  longer a public helper namespace.

Open:

- Closure score and final gates remain pending. Pass 11 cannot set top-level
  `done`; one activation may complete only this scheduled pass.

## Confidence Score - Pass 11

| Dimension                              | Score | Evidence                                                                                                                                       |
| -------------------------------------- | ----: | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance         |  0.88 | No new runtime proof; reference text now points React creation at creation-time `extensions` and avoids render-time wrapper composition.       |
| Plite-close unopinionated DX           |  0.96 | PR prose, issue rows, and the active plan now teach the same API law: `extensions`, `state`, `tx`, `editor.api`, and pure data `*Api`.         |
| Plate and slate-yjs migration backbone |  0.92 | Sync keeps Plate product facade out of raw Plite and keeps future collaboration on installed handles plus operation/commit substrate.          |
| Regression-proof testing strategy      |  0.93 | Related rows now name the right proof targets: public-surface/type contracts, installed handles, and no public editor-bound helper namespaces. |
| Research evidence completeness         |  0.95 | No new external research needed; this pass used the already reviewed live-source and ecosystem evidence.                                       |
| shadcn-style composability/minimalism  |  0.92 | Author examples stay compact through extension values without wrapper functions, static editor helper namespaces, or mapped-type puzzles.      |

Weighted score: 0.94.

The score still cannot close. The closure score and final gates are a separate
pass.

## Closure Score And Final Gates - Pass 12

Eligibility:

- Rows 1 through 11 were already recorded as `complete` before this closure
  activation started.
- Pass 11 left top-level status `pending` and named
  `closure-score-and-final-gates` as the next pass.

Closure checks:

| Gate                           | Result | Evidence                                                                                                                                                                                                                                                           |
| ------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Scheduled pass ledger          | pass   | Pass-state rows 1 through 11 are `complete`; row 12 is closed in this pass.                                                                                                                                                                                        |
| Reference accepted API wording | pass   | Scoped grep over `docs/plite/references/pr-description.md` finds no accepted `withEditor`, wrapper-option, `editor.dom`, `DOMEditor.findPath`, `state.dom`, or `tx.dom` wording. Historical evidence and rejected examples stay only in the plan/issue dossier. |
| Issue claim accounting         | pass   | Pass 11 records `New fixed issue claims: 0` and `New improved issue claims: 0`; PR reference fixed issue count stays `32`.                                                                                                                                         |
| Plite source boundary       | pass   | Plite Ralplan edited only planning, reference, ledger, and scoped `.tmp` artifacts. No `Plate repo root` implementation/test/package edits were made in this planning lane.                                                                                          |
| Verification ownership         | pass   | This is planning-only closure. `plate-2` verification covers plan/reference/state artifacts; the later Ralph implementation must run `Plate repo root` public-surface, type, browser, benchmark, and package gates before claiming implementation release readiness. |
| Completion state               | pass   | Scoped completion file may move to `status: done`, `current_pass: closure-score-and-final-gates`, `next_pass: none`, and `next_action: none`.                                                                                                                      |

Final closure score:

| Dimension                              | Score | Evidence                                                                                                                                                 |
| -------------------------------------- | ----: | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance         |  0.88 | Architecture keeps stable creation and no render-time wrapper reinstall; implementation benchmarks remain a Ralph gate.                                  |
| Plite-close unopinionated DX           |  0.96 | One public extension model with raw `extensions`, replayable `state` / `tx`, installed `editor.api`, and pure data `*Api`.                               |
| Plate and slate-yjs migration backbone |  0.92 | Raw Plite stays substrate-only; Plate keeps product facade; future Yjs-style adapters use installed handles plus operation/commit hooks.                 |
| Regression-proof testing strategy      |  0.94 | Plan names negative public-surface tests, installed-handle type contracts, history/DOM/React behavior proof, examples/browser rows, and benchmark gates. |
| Research evidence completeness         |  0.95 | Local Plite, Plate, slate-yjs, Lexical, ProseMirror, and Tiptap evidence were read across earlier passes.                                             |
| shadcn-style composability/minimalism  |  0.92 | Common author code is compact without wrappers, static editor-bound helper namespaces, or mapped-type example puzzles.                                   |

Weighted score: 0.94.

Closure verdict:

Done for Plite Ralplan planning. This plan is ready for a later Ralph execution
handoff. It does not claim implementation is done.

## Post-Closure API Naming Refinement - 2026-05-17

User decision:

Use `editor.api.<name>` for installed runtime/control handles instead of
`editor.extensions.<name>`.

Accepted refinement:

```ts
editor.read((state) => state.history.redos());

editor.update((tx) => {
  tx.history.undo();
});

editor.api.history.withoutSaving(() => {
  editor.update((tx) => {
    tx.nodes.set({ type: "paragraph" });
  });
});

editor.api.dom.focus();
editor.api.dom.findPath(element);
```

Hard rule:

- `editor.api.history.undo()` is rejected.
- `editor.api.history.redos()` is rejected.
- Replayable reads stay in `editor.read`.
- Replayable writes/actions stay in `editor.update`.
- `editor.api` is only for installed runtime/control APIs and ambient wrappers
  around future updates.

Why:

`editor.api.history.withoutSaving` is better author DX than
`editor.extensions.history.withoutSaving`, but duplicating `undo` / `redo` in
both `editor.api` and `tx` would recreate the same "where does this method
live?" problem this plan is cutting. The final rule is:

- `state` = reads
- `tx` = mutations
- `editor.api` = installed runtime/control handles

Plate boundary:

Raw Plite using `editor.api` does not mean copying Plate's product plugin
facade. Plate owns product plugins, product APIs, transforms, option stores,
components, and rule families. Raw Plite `editor.api` is narrower: installed
runtime/control handles inferred from the `extensions` list.

## Issue Ledger Accounting - Pass 1

No fixed or improved issue claim is made in this pass.

Initial related pressure from ledgers:

| Surface                      | Ledger signal                                                                                                                                | Claim               |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| Public API/typing            | `#3802` manual sync row says v2 target includes tighter public API, type surface, extension surface, and initialization/value DX.            | Related, not fixed. |
| Render/extension composition | `#3177` matrix row is related to render extension composition and example cleanup.                                                           | Related, not fixed. |
| History/collaboration        | Matrix rows for `#1770`, `#3741`, `#3534`, `#3551`, `#3705`, `#3756`, and `#3921` show history/collab pressure.                              | Related, not fixed. |
| Runtime boundaries           | Issue intelligence says plugin override fragility, history grouping, undo semantics, API discoverability, and typing are recurring pressure. | Related, not fixed. |

Pass 2 ran bounded related-issue discovery from existing ledgers first. It did
not broad-search GitHub.

## Related Issue Discovery - Pass 2

Read set:

- generated live open rows in `docs/plite-issues/gitcrawl-live-open-ledger.md`
- manual current classifications in
  `docs/plite-issues/gitcrawl-v2-sync-ledger.md`
- fixed/related claims in `docs/plite/ledgers/issue-coverage-matrix.md`
- fork issue notes in `docs/plite/ledgers/fork-issue-dossier.md`
- stale accepted API text in `docs/plite/references/pr-description.md`
- issue theme and package pressure in `docs/plite-issues/issue-clusters.md`,
  `docs/plite-issues/package-impact-matrix.md`, and
  `docs/plite-issues/requirements-from-issues.md`

Discovery verdict:

No new fixed or improved issue claim belongs to this pass. The unified
extension architecture is related pressure plus a must-preserve constraint for
existing proofs. The next pass should do the full row-by-row issue-ledger
accounting and update ledgers only where a classification, claim, proof owner,
or stale accepted-API reference actually changes.

| Surface                                           | Issues                                                             | Current ledger state                                                                                                                                                                                                                                                                                               | Discovery decision                                                                                                                                                                 |
| ------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public API, type surface, and extension model     | `#3802`, `#4915`, API/Typing/Extensibility theme, R11 requirements | `#3802` is now `planning-reviewed` for unified extension composition and remains tied to public API, type surface, extension surface, and initialization/value DX. `#4915` is broader API/type pressure. Theme 7 has 33 issues and explicitly warns not to grow core just because old API expectations were fuzzy. | Related. This plan improves the public model only after `with*`, `withEditor`, and public author-facing `editor.extend` are cut and type contracts prove extension-list inference. |
| React initialization and editor identity          | `#6013`, `#5605`, `#5709`, `#5281`, `#3465`                        | `#6013` and duplicate `#5605` are already fixed by creation-owned `initialValue`. `#5709` is already fixed by provider replacement proof. `#5281` is related/not full controlled React value. `#3465` is not claimed because import normalization is a separate problem.                                           | Preserve existing claims. Replacing `withEditor` with `extensions` must not regress pre-initialized editor creation or provider replacement semantics. No new claim.               |
| Render/plugin composition pressure                | `#3177`                                                            | `#3177` is `planning-reviewed` / `Related`: registered renderers answer composition direction, but examples/docs still need cleanup.                                                                                                                                                                               | Related. Unified `extensions` strengthens the same direction, but no closure until first-party examples and proof land.                                                            |
| Full method override pressure                     | `#3557`                                                            | `#3557` is `Related`: general `insertNode` / `insertFragment` override pressure belongs to v2 extension/transform APIs.                                                                                                                                                                                            | Related. The plan must preserve full transform/query/normalizer/operation coverage and must not regress old method-override capability into a two-method table.                    |
| Clipboard extension surface                       | `#4613`, `#5233`, `#3486`                                          | `#4613` is `Improves`; `#5233` and `#3486` are `Fixes`, with current evidence still naming `withDOM` / `withReact` options.                                                                                                                                                                                        | Preserve claims, but later reference sync must move accepted API wording from wrapper options to `dom(options?)` / `react(options?)`.                                              |
| History undo and selection proof                  | `#3534`, `#3551`, `#4559`, `#3499`, `#3705`, `#3756`, `#3921`      | Four exact fixes and two improvements already depend on `plite-history` package proof; `#3756` remains related.                                                                                                                                                                                                    | Preserve claims. Converting `withHistory` to `history()` must keep the same behavior proof and add `state.history.*` / `tx.history.*` type/runtime contracts.                      |
| Collaboration and operation metadata              | `#1770`, `#3741`, plus existing PM-08 rows                         | Both stay `Related`: replay convergence exists, but no general operation-merging utility and no moved-node payload closure.                                                                                                                                                                                        | Related only. Extension lists must keep operation middleware, commit metadata, and history-skip metadata viable for a later adapter.                                               |
| History memory/performance                        | `#3752`                                                            | `#3752` is `Improves` through retained-memory benchmark coverage, not exact detached DOM leak closure.                                                                                                                                                                                                             | Preserve claim. Moving history stacks into extension runtime state must keep memory benchmark coverage.                                                                            |
| React readonly/custom layout and ecosystem limits | `#3924`, `#3892`                                                   | `#3924` is related runtime policy; `#3892` is not claimed because custom layout engines are product/ecosystem territory.                                                                                                                                                                                           | No new claim. Raw Plite should expose primitives, not absorb product layout policy.                                                                                                |

Ledger write decision:

- No `gitcrawl-v2-sync-ledger.md` classification changes in pass 2.
- No `fork-issue-dossier.md` section needed in pass 2 because no issue claim was
  promoted, demoted, or newly reviewed as an exact issue.
- `issue-coverage-matrix.md` should be updated in the issue-ledger pass only if
  the final plan changes proof owners or claim wording.
- `docs/plite/references/pr-description.md` is stale: it still presents
  `usePliteEditor({ initialValue, withEditor })` and says `withEditor` mirrors
  `withReact` / `withHistory`. Reference sync must invalidate that text after
  this plan's final architecture is accepted.

## Issue-Ledger Pass - Pass 3

Pass result:

The ledger now has an explicit accounting path for unified extension
composition. This pass still makes no fixed issue claim and no improved issue
claim. It does update the current manual sync and coverage ledgers where the
planning owner changed.

Changed ledger artifacts:

- `docs/plite-issues/gitcrawl-v2-sync-ledger.md`
- `docs/plite/ledgers/issue-coverage-matrix.md`
- `docs/plite/ledgers/fork-issue-dossier.md`

Unchanged in this pass:

- `docs/plite-issues/gitcrawl-live-open-ledger.md` because it is generated live
  input only.
- `docs/plite-issues/open-issues-ledger.md` because current manual sync is
  owned by `gitcrawl-v2-sync-ledger.md`.
- `docs/plite/references/pr-description.md` because reference narrative sync
  is pass 11 and the architecture plan is still under review.

| Issue / group                                                          | Ledger action                                                                                                                                                 | Claim policy                                                                                                                                                                   |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `#3802`                                                                | Added related row to `issue-coverage-matrix.md`, updated current manual sync to `planning-reviewed`, and appended a fork dossier section.                     | Related only. This plan targets public API/type/extension DX, but exact closure waits for implementation and public-surface/type proof.                                        |
| `#3177`                                                                | Added this plan as supporting evidence in current manual sync and coverage matrix.                                                                            | Preserve `Related`. Renderer composition still needs example/docs cleanup and proof before any closure.                                                                        |
| `#3557`                                                                | Updated current manual sync and coverage matrix so the owner is broad extension middleware, not clipboard-only customization.                                 | Preserve `Related`. Full method override pressure must stay covered by transform, query, normalizer, operation, and commit listener middleware; no legacy method-slot closure. |
| `#5233`, `#3486`, `#4613`                                              | No claim change. Existing clipboard rows keep their current proof owners until implementation renames wrapper options to `dom(options?)` / `react(options?)`. | Preserve existing `Fixes` / `Improves` claims. Later implementation must update proof owner paths and accepted API wording if filenames/API names change.                      |
| `#6013`, `#5605`, `#5709`, `#5281`, `#3465`                            | No claim change. Creation-owned initial value and provider replacement claims remain separate from this extension architecture plan.                          | Preserve existing claims and non-claims. `usePliteEditor({ extensions })` must not regress them.                                                                               |
| `#3534`, `#3551`, `#4559`, `#3499`, `#3705`, `#3756`, `#3921`, `#3752` | No claim change. History claims stay tied to existing `plite-history` proof and benchmark rows.                                                               | Preserve existing fixes/improvements/related status. `history()` implementation must keep these proof rows green.                                                              |
| `#1770`, `#3741`                                                       | No claim change. Existing collaboration rows remain related.                                                                                                  | Preserve `Related`. Extension lists must preserve operation middleware and commit metadata, but no operation-merging utility or moved-node payload closure is claimed.         |
| `#3924`, `#3892`                                                       | No claim change.                                                                                                                                              | Preserve runtime/product boundary: readonly and custom layout are not solved by extension composition alone.                                                                   |

Reference-sync decision:

`docs/plite/references/pr-description.md` still contained obsolete
`withEditor` / wrapper-composition accepted shape during pass 3. Do not edit it
in pass 3. Pass 11 rewrites it after the intervening review passes keep the API
target.

## Intent Boundary And Decision Brief Challenge - Pass 4

Trigger:

The user challenged the previous target: `editor.history.undo()` contradicts
the principle that extensions should not extend the editor root type. The same
challenge applies to migrating `editor.history.redos`; history needs state
extension coverage, not only methods. The follow-up DOM challenge tightened the
boundary again: `editor.read` and `editor.update` are for coherent editor/model
work, not mounted browser APIs.

Evidence used:

- live editor root currently exposes `read`, `subscribe`, `update`, and public
  `extend` in `/Users/zbeyens/git/plite/packages/plite/src/interfaces/editor.ts:501`.
- live extension substrate already supports `state`, `tx`, and `editor` groups
  in `/Users/zbeyens/git/plite/packages/plite/src/interfaces/editor.ts:1205`.
- live public-state code materializes extension `stateGroups` onto read views
  and `txGroups` onto update transactions in
  `/Users/zbeyens/git/plite/packages/plite/src/core/public-state.ts:1371`
  and `/Users/zbeyens/git/plite/packages/plite/src/core/public-state.ts:1485`.
- live editor-group registration mutates the editor root in
  `/Users/zbeyens/git/plite/packages/plite/src/core/extension-registry.ts:327`.
- live history wrapper currently mutates root fields `history`, `undo`, `redo`,
  and `writeHistory` in
  `/Users/zbeyens/git/plite/packages/plite-history/src/with-history.ts:25`.
- live DOM wrapper currently mutates root field `dom` in
  `/Users/zbeyens/git/plite/packages/plite-dom/src/plugin/with-dom.ts:55`.
- live DOM package already has a helper namespace and capability factory in
  `/Users/zbeyens/git/plite/packages/plite-dom/src/plugin/dom-editor.ts:603`
  and `/Users/zbeyens/git/plite/packages/plite-dom/src/plugin/dom-editor.ts:1726`.
- live extension registry already has a `capabilities` map and
  `registerCapability` in
  `/Users/zbeyens/git/plite/packages/plite/src/core/extension-registry.ts:32`
  and `/Users/zbeyens/git/plite/packages/plite/src/core/extension-registry.ts:169`.
- live public-state update transaction has replay guardrails in
  `/Users/zbeyens/git/plite/packages/plite/src/core/public-state.ts:130`
  and `/Users/zbeyens/git/plite/packages/plite/src/core/public-state.ts:1433`.

Pressure test:

The weak assumption was that `editor.history.undo()` is acceptable because it is
namespaced. It is not. It still extends the editor root. If the architecture
principle is "the editor root stays stable and small", then root namespaces are
only a softer version of the same problem. A second weak assumption was that
DOM can simply move to `state.dom` / `tx.dom`. It cannot. DOM projection and
focus depend on mounted browser state, so those APIs need capabilities, not
replayable state/transaction groups.

Revised intent/boundary record:

| Field                | Pass-4 record                                                                                                                                                                                                                                                                                              |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Intent               | Give Plite one creation-time extension model while keeping the editor root small and stable.                                                                                                                                                                                                            |
| Desired outcome      | A later Ralph pass replaces public wrappers with `extensions`, infers replayable extension APIs inside `editor.read` and `editor.update`, exposes DOM/React through installed capabilities, and does not add extension-owned root properties.                                                              |
| In scope             | `createEditor({ extensions })`, `usePliteEditor({ extensions })`, typed state/tx extension groups, typed installed capabilities, history state/actions, DOM/React extension factories, examples, public-surface contracts.                                                                                 |
| Non-goals            | Public `with*` wrappers, public author-facing `editor.extend`, public extension-owned editor root namespaces, Plate `plugins`, current-version Plate compatibility, current slate-yjs adapter compatibility.                                                                                               |
| Decision boundaries  | Raw Plite root remains minimal. Replayable extension reads belong to `state.<group>` and replayable writes/actions belong to `tx.<group>`. Mounted DOM/React APIs belong to installed extension handles accessed through `editor.api.<name>`. Public editor-bound helper namespaces are cut with `Editor`. |
| User decision needed | None. The user correction is accepted.                                                                                                                                                                                                                                                                     |

Decision changes:

| Previous target                                          | Pass-4 target                                                                                                          | Reason                                                                                                                                                                                    |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `editor.history.undo()` / `editor.history.redo()`        | `editor.update((tx) => tx.history.undo())` and `editor.update((tx) => tx.history.redo())`                              | Undo/redo change editor state, so they belong to a transaction extension group.                                                                                                           |
| Root `editor.history.undos/redos` stack                  | `editor.read((state) => state.history.undos())` and `editor.read((state) => state.history.redos())`                    | Stack access is read-only state, not editor root mutation.                                                                                                                                |
| Direct `editor.state.redos` shorthand                    | Reject; use `editor.read((state) => state.history.redos())`                                                            | Direct root state reads invite stale-read bugs and flatten a history-owned concern into core state. Do not duplicate stack reads on `editor.api.history` in the first pass.               |
| `editor.dom.*` root namespace                            | `editor.api.dom.*` / `editor.api.react.*` installed handles                                                            | DOM/React APIs depend on mounted environment state and should not extend the editor root with arbitrary properties.                                                                       |
| `state.dom.*` / `tx.dom.*`                               | Reject                                                                                                                 | `read` and `update` stay coherent editor/model APIs. Native DOM, `Window`, selection, and `DataTransfer` are not replayable transaction/state inputs.                                     |
| Extension-list inference may add editor root groups      | Extension-list inference types state/tx groups for replayable APIs and `editor.api` handles for installed runtime APIs | Keeps root stable while preserving DX and runtime capability checks.                                                                                                                      |
| `HistoryExtension` or `History()` naming considered open | Keep `history()`, `dom()`, and `react()` factories; custom factories follow lower camel-case                           | Lowercase factories read as capabilities/options and avoid class/component noise. `HistoryExtension` is too nouny for the common call site; Plate's `NamePlugin` suffix belongs to Plate. |

Updated API shape:

```ts
const editor = usePliteEditor({
  extensions: [history(), react(), editableVoid()],
  initialValue,
});

editor.read((state) => state.history.canUndo());
editor.read((state) => state.history.redos());

editor.update((tx) => {
  tx.history.undo();
});

editor.api.dom.resolvePath(element);
editor.api.dom.focus();
editor.getApi(history).withoutSaving(() => {
  editor.update((tx) => tx.text.insert("x"));
});
```

No `HistoryEditor.*`, `DOMEditor.*`, or `ReactEditor.*` public app DX. If it is
editor-bound, it belongs to the installed extension handle.

Pass verdict:

The architecture is stronger after this correction. Creation-time `extensions`
stays the best public model, but the earlier `editor.history.*` target was a
leak from the old wrapper mental model. The absolute-best shape is now:

- root editor: stable core methods only
- extension install: creation-time `extensions`
- replayable extension reads: `state.<group>`
- replayable extension writes/actions: `tx.<group>`
- mounted/environment capabilities: `editor.api.<name>` installed handles
- generic runtime/control access: `editor.getApi(extensionToken)`
- editor-bound helpers: installed handles, no public static helper namespaces
- naming: lowercase extension factories

Remaining ambiguity:

None that needs a user question. The later ecosystem pass can still challenge
factory capitalization or whether the typed `getApi` accessor is too much
surface, but pass 7 sets the default to lowercase factories plus installed
extension handles.

## Applicable Review Lenses

| Lens                       | Pass 1 status      | Reason                                                                                                                                                                                    |
| -------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| intent-boundary-pass       | applied in pass 4  | Accepted the user correction, tightened non-goals, moved history from root editor namespace to state/tx extension groups, and moved DOM/React out of read/update into capabilities.       |
| research/ecosystem refresh | applied in pass 5  | Re-read Lexical, Tiptap, ProseMirror, Plate, slate-yjs, and live Plite DOM/React helpers; validated capabilities as the architecture concept for mounted runtime APIs.                    |
| performance-oracle         | applied in pass 6  | Pressure-tested no-handler transform/query paths, operation middleware allocation, read/update group materialization, benchmark owners, and React creation cost.                          |
| Vercel React               | applied in pass 6  | Kept React editor creation in a stable initializer and rejected render-time reinstall or wrapper composition.                                                                             |
| steelman-pass              | applied in pass 7  | Accepted the user correction: editor-bound helper namespaces are cut with `Editor`; installed extension handles replace `HistoryEditor`, `DOMEditor`, and `ReactEditor` as public app DX. |
| high-risk-deliberate-pass  | applied in pass 8  | Kept the hard cut, but sealed `editor.api` as installed runtime/control handles only and banned replayable history duplication there in the first pass.                                   |
| architecture-strategist    | applied in pass 9  | Checked raw Plite versus Plate, ProseMirror view ownership, Tiptap facade pressure, and slate-yjs collaboration boundaries.                                                               |
| best-practices-researcher  | applied in pass 9  | Used local ecosystem source as authoritative evidence; no online lookup needed because the relevant editor repositories are present locally.                                              |
| coherence-reviewer         | applied in pass 10 | Consolidated pass-7/8/9 refinements so target snippets, rule tables, proof gates, and open questions do not conflict.                                                                     |
| tdd                        | scheduled          | Later Ralph must start with failing public-surface/type contracts.                                                                                                                        |
| shadcn/react-useeffect     | skipped for pass 1 | No UI component or effect implementation is edited in this planning pass.                                                                                                                 |

## Maintainer Objection Seed Ledger

| Objection                                                                                           | Answer                                                                                                                                                                                               |
| --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "Classic Plite composition was `withX(withY(editor))`; this is less Plite-ish."                     | v2's Plite-ish identity is the data model, operations, and unopinionated core. Monkeypatch wrappers are historical baggage, not a principle.                                                         |
| "`editor.extend` is simple. Why hide it?"                                                           | Public dynamic extension mutation weakens ordering, cleanup, and type inference. Creation-time extension lists are simpler for authors and stricter for runtime.                                     |
| "This looks like Tiptap."                                                                           | It steals the good part: extension arrays. It rejects Tiptap's product command/chain style as the primary raw Plite write model.                                                                     |
| "Why not just use Plate plugins?"                                                                   | Plate plugins are product APIs with options stores, components, `api`, `tf`, and plugin config. Raw Plite needs the substrate below that.                                                            |
| "History undo on `editor.history` is still a top-level add-on."                                     | Accepted. Pass 4 cuts this target. History state and actions belong under `state.history` and `tx.history`; outside read/update, imperative controls belong under `editor.api.history`.              |
| "`HistoryEditor.withoutSaving` keeps the same static editor-bound namespace problem as `Editor.*`." | Accepted. Pass 7 cuts public `HistoryEditor`; editor-bound history controls live under `editor.api.history`.                                                                                         |
| "`DOMEditor` / `ReactEditor` still leave users guessing where editor APIs live."                    | Accepted. Pass 7 cuts public DOM/React editor helper namespaces; mounted runtime APIs live under `editor.api.dom` / `editor.api.react`.                                                              |
| "`editor.api` is just root growth with better branding."                                            | Accepted as the pass-8 danger. The map is sealed to installed runtime/control handles only. Replayable reads stay in `state`; replayable writes/actions stay in `tx`.                                |
| "ProseMirror has an explicit view. Should Plite add one instead of `editor.api.dom`?"               | Rejected for raw Plite. ProseMirror validates the model/view boundary, but Plite can expose the mounted DOM handle through the installed DOM extension without adding another public root object. |
| "Tiptap has great root commands/storage. Should Plite copy that?"                                   | Rejected. Tiptap is a product facade benchmark; Plate owns that layer.                                                                                                                               |
| "plite-yjs has `YjsEditor`. Should collaboration keep that namespace?"                              | Rejected. Future collaboration should expose `editor.api.yjs` plus operation/commit hooks, not another static editor-bound namespace.                                                                |
| "DOM under `state.dom` or `tx.dom` violates the replayable API boundary."                           | Accepted. DOM/React are installed handles, not root fields and not state/tx groups.                                                                                                                  |
| "Breaking all wrappers is too expensive."                                                           | The prompt allows hard cuts. Keeping wrappers would be more expensive long-term because every example and agent learns the wrong architecture.                                                       |

## Implementation Phases For Ralph

1. Add `extensions` to `createEditor` and install through the existing internal
   extension registry before state is exposed.
2. Add typed extension-list inference for replayable state/tx groups and
   installed `editor.api` handles plus `editor.getApi(extensionToken)`.
3. Convert `withHistory` to `history()` extension, moving stack reads to
   `state.history`, undo/redo writes to `tx.history`, and ambient history
   controls to `editor.api.history`.
4. Convert `withDOM` to `dom()` extension that registers
   `editor.api.dom`.
5. Convert `withReact` to `react()` extension and add `createReactEditor`;
   expose React-bound runtime helpers through `editor.api.react`.
6. Replace `usePliteEditor({ withEditor })` with `usePliteEditor({ extensions })`.
7. Migrate examples from wrapper functions to lower camel-case extension
   factories/values.
8. Update public exports and public-surface tests, including hard removal of
   `HistoryEditor`, `DOMEditor`, and `ReactEditor` from app-facing exports.
9. Update docs and PR reference to current API only, no migration-story wording.
10. Run focused package tests, browser rows, typecheck, lint, and `bun check`
    from `Plate repo root`.

## Fast Driver Gates

Planning-only gates:

```bash
# cwd: /Users/zbeyens/git/plate-2
pnpm lint:fix
```

Implementation gates for Ralph:

```bash
# cwd: /Users/zbeyens/git/plite
bun test ./packages/plite/test/public-surface-contract.ts
bun test ./packages/plite/test/generic-extension-namespace-contract.ts
bun test ./packages/plite/test/extension-methods-contract.ts
bun test ./packages/plite/test/query-extension-contract.ts
bun test ./packages/plite/test/normalization-contract.ts
bun --filter plite-history test
bun --filter plite-dom test
bun --filter plite-react test:vitest -- provider-hooks-contract generic-react-editor-contract surface-contract with-react-contract
bun --filter plite typecheck
bun --filter plite-history typecheck
bun --filter plite-dom typecheck
bun --filter plite-react typecheck
bun lint:fix
PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun x playwright test playwright/integration/examples/check-lists.test.ts playwright/integration/examples/editable-voids.test.ts playwright/integration/examples/markdown-shortcuts.test.ts playwright/integration/examples/inlines.test.ts --project=chromium
bun check
```

## Confidence Score - Pass 1

| Dimension                              | Score | Evidence                                                                                                                                                |
| -------------------------------------- | ----: | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance         |  0.84 | React install becomes creation-time instead of render/provider mutation; no-handler fast path still needs performance pass.                             |
| Plite-close unopinionated DX           |  0.90 | One `extensions` model, raw names, `state` / `tx` for replayable APIs, installed handles for DOM/React, no Plate plugin copy, no wrapper intersections. |
| Plate and slate-yjs migration backbone |  0.86 | Plate typed plugin model and slate-yjs wrapper pressure were read; adapter plan exists but no proof yet.                                                |
| Regression-proof testing strategy      |  0.78 | Matrix names replayable contracts, but no implementation tests were run in this planning pass.                                                          |
| Research evidence completeness         |  0.88 | Live Plite, Plate, Lexical, ProseMirror, Tiptap, slate-yjs, and compiled research were read.                                                         |
| shadcn-style composability/minimalism  |  0.86 | Extension values remove wrapper boilerplate and keep hooks minimal; component-level pass still pending.                                                 |

Weighted score: 0.85.

Score is intentionally below closure threshold. The direction is strong, but
issue discovery, objection, high-risk, performance, revision, reference sync,
and closure passes are still pending.

## Confidence Score - Pass 5

| Dimension                              | Score | Evidence                                                                                                                                                                                                |
| -------------------------------------- | ----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance         |  0.85 | Lexical React validates stable creation-time extension arguments and React output. Plite React runtime performance still needs the scheduled pressure pass.                                             |
| Plite-close unopinionated DX           |  0.92 | Pass 7 revises pass 5: one `extensions` list, lowercase factories, `state` / `tx` for replayable APIs, and `editor.api.dom` / `editor.api.react` for mounted capabilities.                              |
| Plate and slate-yjs migration backbone |  0.88 | Plate typed plugin inference and slate-yjs root mutation were re-read. The target gives Plate a typed substrate and gives Yjs operation/commit/runtime-state hooks without promising a current adapter. |
| Regression-proof testing strategy      |  0.80 | Proof matrix covers wrapper removal, type inference, history, DOM/React, examples, browser rows, Plate bridge, and collaboration, but implementation tests are still future Ralph work.                 |
| Research evidence completeness         |  0.93 | Pass 5 cites live local source for Lexical, Lexical React, Tiptap, ProseMirror state/view/keymap/commands, Plate, slate-yjs, and Plite DOM/React helpers.                                               |
| shadcn-style composability/minimalism  |  0.88 | Lowercase factories keep author code compact and composable; typed `getApi(extensionToken)` supports generic helpers without exposing string registry internals.                                        |

Weighted score: 0.87.

Score improves because the ecosystem evidence is now current and concrete. It
still cannot close because performance, objection, high-risk, revision,
reference sync, and final gates are pending.

## Confidence Score - Pass 6

| Dimension                              | Score | Evidence                                                                                                                                                                    |
| -------------------------------------- | ----: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance         |  0.88 | Pass 6 keeps stable creation and names concrete benchmark gates, but no Ralph implementation or fresh browser benchmark has run.                                            |
| Plite-close unopinionated DX           |  0.92 | Inline `extensions: [history(), extension()]` remains the target; wrapper intersections, `editor.dom`, string capability getters, and Plate product APIs stay rejected.     |
| Plate and slate-yjs migration backbone |  0.89 | Pass 6 keeps Plate as product bridge and slate-yjs as later adapter over operation middleware, commit listeners, runtime state, and capabilities.                           |
| Regression-proof testing strategy      |  0.86 | Pass 6 adds public-surface, generic type, capability, benchmark, browser, and package gates, but those gates are not run during planning.                                   |
| Research evidence completeness         |  0.93 | Pass 6 cites live Plite source for createEditor, BaseEditor, extension outputs, middleware fast paths, group materialization, React hook creation, and benchmark owners. |
| shadcn-style composability/minimalism  |  0.89 | Common call site remains compact and examples must avoid casts, wrapper functions, and mapped-type puzzles.                                                                 |

Weighted score: 0.89.

The score improves, but it still cannot close. Maintainer objections,
high-risk pre-mortem, final ecosystem pass, revision, reference sync, and final
gates are still pending.

## Pass-State Ledger

|   # | Pass                                         | Status   | Evidence added                                                                                                                                                                                                                                                                                | Plan delta                                                                                                                                                                                                                                          | Open issues                                                                             | Next owner |
| --: | -------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ---------- |
|   1 | Current-state read and initial score         | complete | Read live wrappers, extension registry, Plate plugin typing, compiled research, local Lexical/Tiptap/ProseMirror/slate-yjs source.                                                                                                                                                            | Created hard-cut `extensions` target and invalidated wrapper-composition as final DX.                                                                                                                                                               | Related issue pass still needed.                                                        | none       |
|   2 | Related issue discovery                      | complete | Read live open rows, manual sync ledger, issue coverage matrix, fork dossier, PR reference, issue clusters, package impact matrix, and requirements rows for public API/type, extension composition, history, clipboard, React identity, and collaboration pressure.                          | Added pass-2 issue discovery section. No new fixed/improved claims.                                                                                                                                                                                 | Full issue-ledger accounting still pending.                                             | none       |
|   3 | Issue-ledger pass                            | complete | Updated current manual sync, issue coverage matrix, and fork dossier for `#3802`, `#3177`, and `#3557`; recorded preserve/no-change policy for existing fix/improve rows.                                                                                                                     | Added pass-3 issue ledger section.                                                                                                                                                                                                                  | Reference narrative sync still pending for pass 11.                                     | none       |
|   4 | Intent/boundary and decision brief           | complete | Re-read live editor root, extension groups, capability registry, history root mutation, DOM root mutation, DOM helper namespace, and replay guardrails.                                                                                                                                       | Accepted user correction: no `editor.history`, no `editor.dom`, no `state.dom` / `tx.dom`; history uses state/tx, DOM/React use installed capabilities. Pass 7 later tightens public access to `editor.api` and typed `getApi`.                     | Public generic accessor shape remains an ecosystem-pass question, not a pass-4 blocker. | none       |
|   5 | Research/ecosystem refresh                   | complete | Re-read Lexical extension lifecycle/output, Lexical React creation, Tiptap extension manager/command facade, ProseMirror state/view split, Plate typed plugin records, slate-yjs wrapper mutation, and Plite DOM/React helper/capability code.                                                | Kept lowercase factories; validated `state.history` / `tx.history`; made capabilities the named extension output for DOM/React/Yjs-style runtime APIs; accepted typed `editor.getApi(extensionToken)` while rejecting string/raw capability lookup. | None.                                                                                   | none       |
|   6 | Performance/DX/migration/regression pressure | complete | Re-read createEditor, BaseEditor/CreateEditorOptions, extension outputs, transform/query no-handler fast paths, state/tx group materialization, operation middleware allocation, commit listener laziness, usePliteEditor creation, benchmark owners, live wrapper usages, and test surfaces. | Kept the architecture; added performance guardrails, no-handler requirements, operation middleware empty-path fix, extension-overhead benchmark requirement, inline tuple-inference DX rule, and hard-cut regression gates.                         | None.                                                                                   | none       |
|   7 | Plite maintainer objection ledger            | complete | Re-read live `HistoryEditor`, `DOMEditor`, `ReactEditor`, wrapper root mutation, and extension registry maps.                                                                                                                                                                                 | Accepted hard-cut of public editor-bound helper namespaces; added `editor.api.<name>` installed handles as the public surface for history controls and DOM/React runtime APIs.                                                                      | None.                                                                                   | none       |
|   8 | High-risk deliberate pass                    | complete | Re-read live root editor shape, extension registry maps, state/tx group materialization, history helper state, React creation, public exports, tests, and benchmarks.                                                                                                                         | Kept the plan but sealed `editor.api` as installed runtime/control handles only; banned replayable history duplication on `editor.api.history` in the first pass; expanded proof gates.                                                             | None.                                                                                   | none       |
|   9 | Ecosystem maintainer pass                    | complete | Re-read live Lexical extension output/React creation, ProseMirror state/plugin/view split, Tiptap root facade, Plate plugin generics, and slate-yjs wrapper mutation.                                                                                                                         | Kept pass-8 model; rejected separate public view object, Tiptap root facade, Plate plugin API copy, `YjsEditor`, and PascalCase built-in factories.                                                                                                 | None.                                                                                   | none       |
|  10 | Revision pass                                | complete | Ran internal consistency review across the final target API, snippets, proof gates, pass deltas, and open questions.                                                                                                                                                                          | Consolidated pass-7/8/9 refinements into one final API law; clarified that `editor.api.history` does not duplicate undo/redo or stack reads.                                                                                                        | None.                                                                                   | none       |
|  11 | Issue/reference sync pass                    | complete | Updated PR reference, issue coverage matrix, current gitcrawl sync row for `#3802`, and fork dossier PR note.                                                                                                                                                                                 | Synced accepted wording to final API law: creation-time `extensions`, replayable `state` / `tx`, installed `editor.api` handles, no public editor-bound helper namespaces.                                                                          | None.                                                                                   | none       |
|  12 | Closure score and final gates                | complete | Verified rows 1-11 complete, PR/reference stale accepted API grep clean, no new fixed/improved issue claim, and scoped completion state ready for `done`.                                                                                                                                     | Closed Plite Ralplan planning; implementation remains for later Ralph execution.                                                                                                                                                                    | None.                                                                                   | none       |

## Plan Deltas From Review

- Created this plan for the `with*` versus `editor.extend` architecture review.
- Rejected the current wrapper-composition story as final DX.
- Chose creation-time `extensions` as the single public extension model.
- Chose extension-list type inference over `T & HistoryEditor<ValueOf<T>>`.
- Kept Plate boundary: raw Plite uses extensions and `state` / `tx`; Plate keeps
  plugins and product APIs.
- Recorded that `docs/plite/references/pr-description.md` had stale
  `withEditor` rationale; pass 11 revised it.
- Added ledger ownership for unified extension composition through `#3802` and
  updated `#3177` / `#3557` related rows without promoting any issue claim.
- Pass 4 removed `editor.history.*` from the target and put history reads under
  `state.history` and history actions under `tx.history`.
- Pass 4 rejected `editor.state.redos`, `editor.dom`, `state.dom`, and `tx.dom`.
- Pass 4 added the capability lane: `dom()` / `react()` install mounted
  capabilities.
- Pass 5 validated the capability lane against Lexical, ProseMirror, Tiptap,
  Plate, slate-yjs, and live Plite DOM/React helpers.
- Pass 5 kept `history()`, `dom()`, and `react()` as the best common-call-site
  names despite Lexical's PascalCase extension constants.
- Pass 5 rejects string/raw capability access, but the post-closure refinement
  accepts typed `editor.getApi(extensionToken)` for generic code.
- Pass 6 kept the architecture under performance pressure but added mandatory
  guardrails: preserve transform/query no-handler fast paths, add operation
  middleware empty-path allocation fix, benchmark extension overhead, keep React
  creation stable, and hard-cut wrapper exports with type/browser proof.
- Pass 7 hard-cut public `HistoryEditor`, `DOMEditor`, and `ReactEditor` with
  `Editor`; only pure data/value helper namespaces keep `*Api` names.
- Pass 7 added `editor.api.<name>` as the stable installed-handle map for
  editor-bound extension APIs such as `editor.api.history.withoutSaving`
  and `editor.api.dom.focus`.
- Pass 7 added `editor.getApi(extensionToken)` as the Plate-like typed accessor
  for generic code while keeping direct app code on `editor.api.<name>`.
- Pass 8 kept `editor.api` but sealed it as installed runtime/control
  handles only. Replayable history reads stay in `state.history`; undo/redo
  stay in `tx.history`; `editor.api.history` is limited to ambient
  controls such as `withoutSaving`, `withMerging`, `withoutMerging`, and
  `withNewBatch` in the first pass.
- Pass 9 re-checked Lexical, ProseMirror, Tiptap, Plate, and slate-yjs against
  the pass-8 target and kept the model. The pass rejected a separate public view
  object, Tiptap root commands/storage, Plate plugin API copy, public
  `YjsEditor`, and PascalCase built-in factories.
- Pass 10 consolidated the target into one final API law: pure data helpers use
  `*Api`; replayable reads use `state`; replayable writes/actions use `tx`;
  installed runtime/control APIs use `editor.api`; product facade APIs
  stay in Plate.
- Pass 10 clarified that `editor.api.history` does not duplicate
  undo/redo or stack reads in the first pass.
- Pass 11 synced PR and issue-reference wording to the final API law, including
  `usePliteEditor({ extensions })`, `editor.api.dom`, and no public
  editor-bound helper namespaces. No issue claim changed.
- Pass 12 verified closure gates and moved the planning lane to `done` without
  claiming implementation completion.
- Post-closure naming refinement made factory-first examples the primary DX:
  built-ins and custom factories use lower camel-case; `NameExtension` is only
  for static extension values; Plate's `NamePlugin` suffix stays in Plate.
- Post-closure type refinement requires negative tests for uninstalled typed
  APIs, string `getApi`, fresh-instance `getApi`, duplicated history APIs, and
  examples falling back to `CustomEditor` intersections.

## Open Questions That Can Still Change Details

- Exact factory names are closed for the plan: built-ins stay `history()`,
  `dom()`, and `react()`; custom factories follow lower camel-case such as
  `editableVoid()`, `checklist()`, `mention()`, and `table()`. Plural names are
  reserved for naturally plural domains such as `shortcuts()` or
  `normalizers()`. PascalCase `NameExtension` is reserved for static extension
  values.
- Whether `createReactEditor` is necessary beside `usePliteEditor`. This pass
  includes it because tests and non-hook setup need a direct constructor.
- Whether raw Plite should expose read-only installed-extension metadata. This
  pass says no public registry until a concrete author use exists.
- Public string/raw capability access is rejected for the plan. Typed
  `editor.api.<name>` handles are the direct public surface, and
  `editor.getApi(extensionToken)` is the generic public accessor.

## Done Handoff

Status: complete for Plite Ralplan planning.

Implementation status: not started by this skill. A later Ralph pass should
execute the plan in `Plate repo root`.

## Ralph Execution Start - 2026-05-17

Status: pending for implementation.

Ralph generated the scoped continuation prompt at
`active goal state` and moved the scoped
completion state back to `pending` for execution.

Current pass:

- `current_pass: tdd-pass`
- `current_pass_status: in_progress`
- `current_pass_owner: packages/plite`
- `current_pass_scope: creation-time extension installation and typed installed
API contracts`

Initial tracer evidence:

- Live `Plate repo root` still exposes `withHistory`, `HistoryEditor`, `withDOM`,
  `withReact`, `usePliteEditor({ withEditor })`, public `editor.extend`, and
  wrapper-based tests/examples.
- Existing useful test owners include
  `packages/plite/test/generic-extension-namespace-contract.ts`,
  `packages/plite/test/extension-methods-contract.ts`,
  `packages/plite/test/tsconfig.generic-types.json`,
  `packages/plite-history/test/generic-history-contract.ts`, and
  `packages/plite-react/test/generic-react-editor-contract.tsx`.

First red target:

- Add `packages/plite/test/generic-extension-install-contract.ts`.
- Add that file to
  `packages/plite/test/tsconfig.generic-types.json`.
- Run `bun --filter plite typecheck` from `Plate repo root`.
- Expected red: `createEditor({ extensions })`, `editor.api`, and
  `editor.getApi(...)` are not implemented yet.

Red result:

- Added `packages/plite/test/generic-extension-install-contract.ts`.
- Added it to
  `packages/plite/test/tsconfig.generic-types.json`.
- Ran `bun --filter plite typecheck` from `Plate repo root`.
- Failure is expected and points at the right owner:
  - `CreateEditorOptions` does not accept `extensions`.
  - `Editor<CustomValue>` does not expose `api`.
  - uninstalled `state` / `tx` negative tests are unused because current
    declaration-merged groups still leak without installed-extension inference.

Green result:

- Implemented `createEditor({ extensions })` in `packages/plite`.
- Added installed-extension inference for `editor.read`, `editor.update`,
  `editor.api`, and `editor.getApi(extensionToken)`.
- Added runtime token identity for `editor.getApi(extensionToken)` so a fresh
  extension object with the same name/capability is rejected.
- Added a curried typed-authoring form,
  `defineEditorExtension<Editor<CustomValue>>()({...})`, for value-specific
  extension definitions without erasing literal installed group keys.

## Ralph React Extension Slice - 2026-05-17

Status: complete for the focused React package slice; implementation remains
pending for examples/docs/browser/final gates.

Red result:

- Replaced `packages/plite-react/test/generic-react-editor-contract.tsx`
  with the hard-cut target: `react()`, `createReactEditor()`,
  `usePliteEditor({ extensions })`, `editor.api.react`,
  `editor.api.dom`, `editor.api.clipboard`, and negative tests for public
  `ReactEditor`, public `withReact`, and `withEditor`.
- Ran `bun x tsc --project packages/plite-react/test/tsconfig.generic-types.json --noEmit`
  from `Plate repo root`.
- Failure was expected: `plite-react` exported no `react()` or
  `createReactEditor()`, stale `withReact` imports still existed, and
  `usePliteEditor` still accepted `withEditor`.

Green result:

- Implemented `react()` as the creation-time Plite React extension.
- Added `createReactEditor({ extensions })` and rewired
  `usePliteEditor({ extensions })` through it.
- Cut public root exports for `withReact` and `ReactEditor`.
- Exposed installed runtime handles through `editor.api.react`,
  `editor.api.dom`, and `editor.api.clipboard`.
- Replaced runtime `editor.dom` / `editor.dom.clipboard` calls in
  `plite-react` with `editor.api.dom` / `editor.api.clipboard`.
- Updated `editor.getApi(extensionToken)` so multi-capability extensions return
  the capability whose key matches the extension name.
- Migrated focused React provider/surface tests from wrapper construction to
  `createReactEditor()`.

Verification:

- `bun --filter plite-react typecheck`: passed.
- `bun --filter plite typecheck`: passed.
- `bun --filter plite-dom typecheck`: passed.
- `bun --filter plite-react test:vitest -- provider-hooks-contract surface-contract`:
  45 pass, 0 fail.
- `bun test ./packages/plite-react/test/with-react-contract.tsx`: 1 pass, 0 fail.
- `bun lint:fix`: passed and fixed 10 files; the focused type/test gates were
  rerun after lint and stayed green.

Next owner:

- Migrate first-party examples and docs from `withEditor`, local `with*`
  wrappers, public `ReactEditor` types, and `editor.dom` to extension factories
  plus installed `editor.api.*` handles.
- Updated the focused generic extension contracts to install extensions at
  editor creation time instead of relying on dynamic `editor.extend` typing.
- Updated the public editor method contract to include the planned `getApi`
  accessor.

Green verification:

- `bun --filter plite typecheck` from `Plate repo root`: passed.
- `bun test ./packages/plite/test/public-surface-contract.ts ./packages/plite/test/generic-extension-namespace-contract.ts ./packages/plite/test/extension-methods-contract.ts ./packages/plite/test/query-extension-contract.ts ./packages/plite/test/normalization-contract.ts` from `Plate repo root`: 390 pass, 0 fail.
- `bun lint:fix` from `Plate repo root`: passed.
- Reran `bun --filter plite typecheck` from `Plate repo root` after lint: passed.
- Reran the focused core contract tests after lint: 390 pass, 0 fail.

History slice result:

- Replaced the history generic type contract with the final API shape:
  `history()`, `state.history`, `tx.history`, `editor.api.history`, and
  `editor.getApi(HistoryExtension)`.
- Implemented `packages/plite-history/src/history-extension.ts`.
- Exported `history()` from `plite-history`.
- Removed stale `withHistory` and `HistoryEditor` source files from
  `packages/plite-history/src`.
- Migrated focused history tests away from editor-root history fields and root
  undo/redo methods.
- Updated core installed-group extraction so declared state/tx groups resolve
  with the installed editor value type, keeping `history()` generic-free at call
  sites.

History verification:

- `bun x tsc --project packages/plite-history/test/tsconfig.generic-types.json --noEmit`
  from `Plate repo root`: failed red, then passed after implementation.
- `bun --filter plite-history typecheck` from `Plate repo root`: passed.
- `bun test ./packages/plite-history/test/history-contract.ts ./packages/plite-history/test/integrity-contract.ts ./packages/plite-history/test/index.spec.ts`
  from `Plate repo root`: 50 pass, 1 skip, 0 fail.
- `bun --filter plite typecheck` from `Plate repo root`: passed after core
  type-helper changes.
- `bun lint:fix` from `Plate repo root`: passed.
- Reran focused history type/runtime gates after lint: passed.
- `rg -n "withHistory|HistoryEditor" packages/plite-history/src packages/plite-history/test/generic-history-contract.ts packages/plite-history/test/history-contract.ts packages/plite-history/test/integrity-contract.ts packages/plite-history/test/index.spec.ts`
  from `Plate repo root`: no matches.

DOM slice result:

- Added a DOM generic type contract for `dom()`, `editor.api.dom`, and
  `editor.api.clipboard`.
- Implemented `dom()` in `packages/plite-dom`.
- Removed `withDOM` from the public `plite-dom` root.
- Split clipboard into a sibling capability, not `editor.api.dom.clipboard`.
- Migrated focused DOM/clipboard tests to `createEditor({ extensions: [dom()] })`
  and `editor.api.dom` / `editor.api.clipboard`.
- Renamed the internal bridge installer to `installDOM`; `withDOM` is no longer
  present in `plite-dom` source except the public-surface negative assertion.

DOM verification:

- `bun x tsc --project packages/plite-dom/test/tsconfig.generic-types.json --noEmit`
  from `Plate repo root`: failed red, then passed after implementation.
- `bun --filter plite-dom typecheck` from `Plate repo root`: passed.
- `bun --filter plite typecheck` from `Plate repo root`: passed after DOM changes.
- `bun test` from `packages/plite-dom`: 71 pass, 0 fail.
- `bun lint:fix` from `Plate repo root`: passed.
- Reran focused DOM type/runtime gates after lint and internal rename: passed.

Next implementation owner:

- `packages/plite/src/interfaces/editor.ts`
- `packages/plite/src/create-editor.ts`
- `packages/plite/src/core/editor-extension.ts`
- `packages/plite/src/core/extension-registry.ts`

Final target:

- creation-time `extensions`
- built-ins as `history()`, `dom()`, and `react()`
- custom factories as lower camel-case, with `NameExtension` reserved for static
  extension values
- replayable reads under `state`
- replayable writes/actions under `tx`
- installed runtime/control handles under `editor.api`
- generic installed API access through `editor.getApi(extensionToken)`, not
  strings or freshly created extension instances
- no public `with*` wrappers, `withEditor`, author-facing `editor.extend`,
  `HistoryEditor`, `DOMEditor`, `ReactEditor`, or future editor-bound `*Editor`
  app DX
- pure data/value helper namespaces keep `*Api`

Required Ralph proof:

- public-surface contract fails on stale wrappers and editor-bound helper
  namespaces
- type contracts prove extension-list inference and installed-handle typing
- negative type contracts cover missing `editor.api.*`, missing
  `editor.getApi(extensionToken)`, `editor.getApi('history')`,
  `editor.getApi(history())`, `editor.api.history.undo`,
  `editor.getApi(history).undo`, and fallback `CustomEditor` intersections
- history contracts prove `state.history`, `tx.history`, and
  `editor.api.history` control helpers
- DOM/React contracts prove installed handles and lifecycle cleanup
- examples/docs teach extension values, not wrapper functions
- browser rows cover touched React/DOM examples
- benchmarks cover zero/one/many extension overhead and no-handler fast paths
- broad `Plate repo root` gate runs before any implementation release claim
