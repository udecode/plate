# Query and clipboard final shapes

Planning-only shape closure for the full editor audit. Live source is
authoritative. These two packets are accepted only with the exact contracts
below.

## Verdict

- **P1: hard-cut generic query middleware.** Replace its five production
  registrations with three narrow extension lanes and one existing
  selection-kind owner. Do not introduce `nodePolicy`, a generic policy bag,
  or another arbitrary read interceptor.
- **P1: move clipboard transport to `@platejs/plite-dom`.** Plain Plite has no
  `DataTransfer` types and no clipboard API. The DOM host owns the clipboard
  API, handler chain, exact-slice envelope, host-codec fallback, and errors.
- **Fold `selection.domRange()` → `selection.primaryRange()` into the query
  packet.** It changes the same `EditorSelectionSpec`, registry, table adopter,
  state wrappers, and DOM consumer. A standalone rename packet would create a
  second break for no value.

## Live-source closure

The complete production registration set is five:

| Registration             | Live owner                                                         | Current intercepted read               |
| ------------------------ | ------------------------------------------------------------------ | -------------------------------------- |
| Empty merge target       | `packages/core/src/lib/plugins/override/OverridePlugin.ts:500-529` | `nodes.shouldMergeNodesRemovePrevNode` |
| Closed-toggle navigation | `packages/toggle/src/react/TogglePlugin.tsx:100-109`               | `nodes.isSelectable`                   |
| Diff export cleanup      | `packages/diff/src/lib/excludeDiffFromFragment.ts:30-39`           | `fragment.get`                         |
| Table selected content   | `packages/table/src/lib/BaseTablePlugin.ts:2543-2581`              | `fragment.get`                         |
| Table shared marks       | `packages/table/src/lib/BaseTablePlugin.ts:3046-3088`              | `marks.get`                            |

The public matrix mirrors 43 reads
(`packages/plite/src/interfaces/editor.ts:1367-1559`). Its runtime owns
recursive `next()`, argument rewriting, generator lifetime wrapping, and two
depth `WeakMap`s (`packages/plite/src/core/query-middleware.ts:1-216`). The
registry is a `Map<string, unknown[]>`
(`packages/plite/src/core/extension-registry.ts:63,960-990`), and every read
wrapper routes through it. Five unrelated policies do not justify that
machinery.

## Final narrow public contracts

These are proposed public types from `@platejs/plite`:

```ts
import type {
  ContentSlice,
  Editor,
  EditorMarks,
  EditorSelection,
  EditorSelectionMapContext,
  EditorStateView,
  EditorValueCodec,
  Node,
  NodeEntry,
  Range,
  Value,
  ValueOf,
} from "@platejs/plite";

export type EditorMergeTargetDecision = "merge" | "remove";

export type EditorMergeTargetPolicy<TEditor extends Editor<any, any> = Editor> =
  (
    context: Readonly<{
      current: NodeEntry;
      editor: TEditor;
      previous: NodeEntry;
      state: EditorStateView;
    }>
  ) => EditorMergeTargetDecision | undefined;

export type EditorSelectabilityGuard<
  TEditor extends Editor<any, any> = Editor
> = (
  context: Readonly<{
    editor: TEditor;
    element: Node;
    state: EditorStateView;
  }>
) => false | undefined;

export type EditorExportSliceProjection<V extends Value = Value> = (
  context: Readonly<{
    slice: ContentSlice<V>;
    state: EditorStateView<V>;
  }>
) => ContentSlice<V>;

export type EditorSelectionSpec<
  TSelection extends EditorSelection = EditorSelection
> = Readonly<{
  codec: EditorValueCodec<TSelection>;
  kind: TSelection["kind"];
  map?: (
    selection: TSelection,
    context: EditorSelectionMapContext
  ) => TSelection | null;
  marks?: (selection: TSelection, state: EditorStateView) => EditorMarks | null;
  primaryRange?: (selection: TSelection) => Range | null;
  ranges?: (selection: TSelection) => readonly Range[];
  replacementRange?: (selection: TSelection) => Range | null;
  slice?: (selection: TSelection, state: EditorStateView) => ContentSlice;
  validate: (selection: TSelection) => boolean;
}>;

export type EditorExtension<TEditor extends Editor<any, any> = Editor> = {
  // Existing fields omitted.
  exportSlice?: EditorExportSliceProjection<ValueOf<TEditor>>;
  mergeTarget?: EditorMergeTargetPolicy<TEditor>;
  selectability?: EditorSelectabilityGuard<TEditor>;
  selections?: readonly EditorSelectionSpec[];
};
```

The state API gains one truthful export read:

```ts
editor.read.slice.get(); // canonical model slice, no export projections
editor.read.slice.export(); // selection-aware slice, then export projections
```

`editor.read.fragment()` remains a direct model query. Callers that mean
“content leaving the editor” adopt `editor.read.slice.export().content`.

### Composition and veto laws

| Lane           | Order                                                | Result law                                                                                                | Veto / failure law                                                                                                                     |
| -------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Merge target   | Order-independent reducer                            | Any `'merge'` wins; otherwise any `'remove'` wins; otherwise the Plite default decides                    | `'merge'` is the conservative veto against deleting the previous node. Conflicting policies cannot make source order delete content.   |
| Selectability  | Order-independent guard set                          | Compiled schema must be selectable and no guard may return `false`                                        | `false` is final. A guard cannot turn a schema-nonselectable node selectable. `undefined` has no opinion.                              |
| Export slice   | Extension dependency order, then stable source order | Each projection receives the prior immutable `ContentSlice` and must return the next valid `ContentSlice` | No early exit and no `next()`. Invalid output aborts export through the editor error sink; the canonical model slice is never mutated. |
| Selection spec | Exactly one spec per `kind`                          | The registered kind owns its own `marks`, `primaryRange`, `ranges`, `replacementRange`, and `slice`       | Duplicate kinds are configuration errors. There is no reducer, priority, or continuation.                                              |

The merge reducer deliberately differs from “first callback wins.” The current
Plate policy can preserve an empty plugin-owned block; letting unrelated source
order override that with deletion would be unsafe.

## Registration 1 — override merge target

### Current public shape

```ts
import { createBasePlugin } from "@platejs/core";
import { ElementApi, PathApi } from "@platejs/plite";

export const OverridePlugin = createBasePlugin({
  key: "override",
  extension: ({ editor }) => ({
    queries: {
      nodes: {
        shouldMergeNodesRemovePrevNode({ current, next, previous }) {
          const [previousNode, previousPath] = previous;
          const [, currentPath] = current;

          if (
            isRuntimeTextNode(previousNode) &&
            previousNode.text === "" &&
            previousPath.at(-1) !== 0
          ) {
            return true;
          }

          if (
            ElementApi.isElement(previousNode) &&
            getRuntimeNodeText(previousNode).length === 0 &&
            PathApi.isSibling(previousPath, currentPath)
          ) {
            return shouldRemoveEmptyMergeTarget(
              editor,
              previousNode,
              previousPath
            );
          }

          return next({ current, previous });
        },
      },
    },
  }),
});
```

### Proposed public shape

```ts
import { createBasePlugin } from "@platejs/core";
import { ElementApi, PathApi } from "@platejs/plite";

export const OverridePlugin = createBasePlugin({
  key: "override",
  extension: ({ editor }) => ({
    mergeTarget({ current, previous }) {
      const [previousNode, previousPath] = previous;
      const [, currentPath] = current;

      if (
        isRuntimeTextNode(previousNode) &&
        previousNode.text === "" &&
        previousPath.at(-1) !== 0
      ) {
        return "remove";
      }

      if (
        ElementApi.isElement(previousNode) &&
        getRuntimeNodeText(previousNode).length === 0 &&
        PathApi.isSibling(previousPath, currentPath)
      ) {
        return shouldRemoveEmptyMergeTarget(editor, previousNode, previousPath)
          ? "remove"
          : "merge";
      }

      return undefined;
    },
  }),
});
```

This must not become command-only. The live callback is consulted inside
`mergeNodes` (`packages/plite/src/transforms-node/merge-nodes.ts:197-202`), so
it affects delete cleanup, suggestion, list, single-block, direct transaction,
history, and Yjs-driven merges. Moving it only into
`editorCommands.delete` would silently change those callers.

### Internal shape

```ts
type CompiledMergeTargetRuntime = Readonly<{
  policies: readonly EditorMergeTargetPolicy[];
}>;

const decideMergeTarget = (input: MergeTargetInput) => {
  let remove = false;

  for (const policy of runtime.policies) {
    const decision = policy(input);

    if (decision === "merge") return "merge";
    if (decision === "remove") remove = true;
  }

  return remove ? "remove" : defaultMergeTargetDecision(input);
};
```

The transform consumes this exact reducer; it does not call a public read
method. Delete the public/static
`shouldMergeNodesRemovePrevNode` query after direct transform adoption.

## Registration 2 — toggle selectability

### Current public shape

```ts
import { toPlatePlugin } from "@platejs/core/react";

export const TogglePlugin = toPlatePlugin(BaseTogglePlugin, {
  // Existing Plate fields.
}).extend(({ editor }) => ({
  extension: {
    queries: {
      nodes: {
        isSelectable({ element, next }) {
          return typeof element.id === "string" &&
            isInClosedToggle(editor, element.id)
            ? false
            : next();
        },
      },
    },
  },
}));
```

### Proposed public shape

```ts
import { toPlatePlugin } from "@platejs/core/react";

export const TogglePlugin = toPlatePlugin(BaseTogglePlugin, {
  // Existing Plate fields.
}).extend(({ editor }) => ({
  extension: {
    selectability({ element }) {
      if (
        typeof element.id === "string" &&
        isInClosedToggle(editor, element.id)
      ) {
        return false;
      }

      return undefined;
    },
  },
}));
```

### Internal shape

```ts
const isSelectable = (element: Node, state: EditorStateView) => {
  if (!state.schema.isSelectable(element)) return false;

  return compiled.selectability.every(
    (guard) => guard({ editor, element, state }) !== false
  );
};
```

Only selection and keyboard-navigation owners call this compiled guard. Normal
node reads remain direct. A guard cannot opt a node into selectability.

## Registration 3 — diff export projection

### Current public shape

```ts
import { defineEditorExtension } from "@platejs/plite";

export const createExcludeDiffFragmentExtension = () =>
  defineEditorExtension({
    name: "exclude-diff-fragment",
    queries: {
      fragment: {
        get: ({ next }) => excludeDiffFromFragment(next()),
      },
    },
  });
```

### Proposed public shape

```ts
import {
  ContentSlice,
  type ContentSlice as ContentSliceValue,
  type Descendant,
  defineEditorExtension,
  ElementApi,
} from "@platejs/plite";

const removeDiff = (node: Descendant): Descendant => {
  const next = Object.fromEntries(
    Object.entries(node).filter(
      ([key]) => key !== "diff" && key !== "diffIntent"
    )
  ) as Descendant;

  return ElementApi.isElement(next)
    ? { ...next, children: next.children.map(removeDiff) }
    : next;
};

const excludeDiffFromSlice = (slice: ContentSliceValue): ContentSliceValue =>
  ContentSlice.fromJSON({
    ...slice,
    content: slice.content.map(removeDiff),
    ...(slice.roots
      ? {
          roots: Object.fromEntries(
            Object.entries(slice.roots).map(([root, children]) => [
              root,
              children.map(removeDiff),
            ])
          ),
        }
      : {}),
  });

export const createExcludeDiffSliceExtension = () =>
  defineEditorExtension({
    name: "exclude-diff-export",
    exportSlice: ({ slice }) => excludeDiffFromSlice(slice),
  });
```

The projection maps both primary content and detached roots while preserving
`openStart` and `openEnd`. Version-history and other callers that mean export
adopt:

```ts
const fragment = editor.read.slice.export().content;
```

The old `excludeDiffFromFragment` helper may remain only if another non-editor
consumer exists after the adoption sweep; otherwise inline its recursion into
the slice owner and delete it.

## Registrations 4 and 5 — table selection slice and marks

### Current public shape

```ts
{
  queries: {
    fragment: {
      get({ next }) {
        const fragment = next();
        // Rewrites table fragments using getGridAbove().
        return nextFragment;
      },
    },
  },
},
{
  queries: {
    marks: {
      get({ next }) {
        const selection = editor.read.selection();

        if (!selection || editor.read.selection.isCollapsed()) return next();

        const cells = table.getGridAbove({ format: 'cell' });

        if (cells.length <= 1) return next();

        // Intersects marks across every selected text leaf.
        return marks;
      },
    },
  },
}
```

The same table plugin already registers the `table-cell` selection spec at
`packages/table/src/lib/BaseTablePlugin.ts:2889-2944`, but content and marks
are split into unrelated global reads.

### Proposed public shape

```ts
import {
  ContentSlice,
  type EditorSelectionSpec,
  TextApi,
} from '@platejs/plite';

{
  selections: [
    {
      codec: defineValueCodec<TableCellSelection>({
        decode(value) {
          if (!isTableCellSelection(value)) {
            throw new Error('Invalid table-cell selection.');
          }

          return value;
        },
        encode: (selection) => selection,
        version: 1,
      }),
      kind: 'table-cell',
      map(selection, mapContext) {
        // Keep the live mapping implementation unchanged.
        return mapTableCellSelection(selection, mapContext);
      },
      marks(selection, state) {
        const cells = context.api.getGridAbove(
          { at: selection, format: 'cell' },
          state
        );
        const counts: Record<string, number> = {};
        const marks: Record<string, unknown> = {};
        let textCount = 0;

        for (const [, cellPath] of cells) {
          for (const [text] of state.nodes.toArray({
            at: cellPath,
            match: TextApi.isText,
          })) {
            textCount++;

            for (const key of Object.keys(text)) {
              if (key === 'text') continue;
              counts[key] = (counts[key] ?? 0) + 1;
              marks[key] = text[key];
            }
          }
        }

        for (const key of Object.keys(counts)) {
          if (counts[key] !== textCount) delete marks[key];
        }

        return textCount === 0 ? null : marks;
      },
      primaryRange: (selection) => ({
        anchor: selection.anchor,
        focus: selection.anchor,
      }),
      ranges: (selection) => selection.cells,
      replacementRange: (selection) => selection,
      slice(selection, state) {
        const [table] = context.api.getGridAbove(
          { at: selection, format: 'table' },
          state
        );

        return table
          ? ContentSlice.closed([table[0]])
          : ContentSlice.empty;
      },
      validate: isTableCellSelection,
    } satisfies EditorSelectionSpec<TableCellSelection>,
  ],
}
```

`TableCellSelection` is created only for more than one cell
(`packages/table/src/lib/BaseTablePlugin.ts:850-879`), so ordinary one-cell
text ranges continue through the built-in text-selection slice. The table spec
owns the projected subtable for structural multi-cell selection.

### Internal selection protocol

```ts
type RuntimeSelectionSpec = Readonly<{
  // Existing codec/map/ranges/replacementRange/validate fields.
  marks?: (
    selection: EditorSelection,
    state: EditorStateView
  ) => EditorMarks | null;
  primaryRange?: (selection: EditorSelection) => Range | null;
  slice?: (selection: EditorSelection, state: EditorStateView) => ContentSlice;
}>;
```

- `state.selection.primaryRange()` uses the current spec and returns the model
  range used to project one browser selection.
- `state.marks()` uses `spec.marks` for a custom kind; built-in text/node
  selections retain the existing mark algorithm.
- `state.slice.get()` uses `spec.slice` for a custom kind; otherwise it runs the
  existing canonical open-slice reader.
- `state.slice.export()` first obtains that canonical selection-aware slice,
  then runs export projections.
- Every returned range, marks object, and slice is validated and frozen before
  publication.

## `domRange` → `primaryRange`

### Current public shape

```ts
import type { EditorSelectionSpec } from "@platejs/plite";

const tableSelection = {
  domRange: (selection) => ({
    anchor: selection.anchor,
    focus: selection.anchor,
  }),
  // ...
} satisfies EditorSelectionSpec<TableCellSelection>;

const range = editor.read.selection.domRange();
const domRange = editor.api.dom.resolveDOMRange(range);
```

`domRange()` returns a Plite model `Range`, not a browser `Range`
(`packages/plite/src/interfaces/editor.ts:458,2184-2204`;
`packages/plite/src/core/selection-protocol.ts:569-579`).

### Proposed public shape

```ts
import type { EditorSelectionSpec } from "@platejs/plite";

const tableSelection = {
  primaryRange: (selection) => ({
    anchor: selection.anchor,
    focus: selection.anchor,
  }),
  // ...
} satisfies EditorSelectionSpec<TableCellSelection>;

const range = editor.read.selection.primaryRange();
const domRange = range ? editor.api.dom.resolveDOMRange(range) : null;
```

There is no alias. Hard-cut `domRange` in the public state API, runtime spec,
registry wrappers, table, React selection reconciliation, tests, and docs.
Actual browser conversion remains exclusively under `editor.api.dom`.

## Clipboard: final public contract

Proposed public types from `@platejs/plite-dom`:

```ts
import type {
  ContentSlice,
  EditorUpdateTransaction,
  Value,
} from "@platejs/plite";

export type ClipboardSliceRead<V extends Value = Value> =
  | Readonly<{ kind: "absent" }>
  | Readonly<{ kind: "invalid"; source: "html" | "mime" }>
  | Readonly<{ kind: "slice"; slice: ContentSlice<V> }>;

export type ClipboardSliceWrite<V extends Value = Value> = Readonly<{
  formats?: Readonly<Record<string, string>>;
  slice: ContentSlice<V>;
}>;

export type DOMClipboardInsertContext<V extends Value = Value> = Readonly<{
  next: (data?: DataTransfer) => boolean;
  transaction: EditorUpdateTransaction<V>;
}>;

export type DOMClipboardHandler<V extends Value = Value> = Readonly<{
  insertData: (
    data: DataTransfer,
    context: DOMClipboardInsertContext<V>
  ) => boolean;
}>;

export type DOMClipboardApi<V extends Value = Value> = Readonly<{
  insertData: (data: DataTransfer) => boolean;
  readSlice: (
    data: Pick<DataTransfer, "getData" | "types">
  ) => ClipboardSliceRead<V>;
  writeSelection: (data: Pick<DataTransfer, "getData" | "setData">) => void;
  writeSlice: (
    data: Pick<DataTransfer, "getData" | "setData">,
    payload: ClipboardSliceWrite<V>
  ) => void;
}>;
```

The discriminated `readSlice` result is necessary. Table currently performs
its own MIME/embedded-payload detection so it can distinguish “no exact slice”
from “an exact slice was claimed but malformed”
(`packages/table/src/lib/BaseTablePlugin.ts:2583-2648`). Returning only
`ContentSlice | null` would force that internal wire-format leak to survive.

### Public path 1 — core-only Plite

Current:

```ts
import { createEditor } from "@platejs/plite";

const editor = createEditor({ initialValue });

editor.api.clipboard.insertData(dataTransfer);
```

Proposed:

```ts
import { createEditor } from "@platejs/plite";

const editor = createEditor({ initialValue });

// @ts-expect-error Clipboard is installed by a DOM host.
editor.api.clipboard;
```

`@platejs/plite` exports no `EditorClipboard*` type and contains no
`DataTransfer` reference.

### Public path 2 — common DOM-installed editor

```ts
import { createEditor } from "@platejs/plite";
import { dom } from "@platejs/plite-dom";

const editor = createEditor({
  extensions: [dom()],
  initialValue,
});

editor.api.clipboard.insertData(dataTransfer);
editor.api.clipboard.writeSelection(dataTransfer);

const exact = editor.api.clipboard.readSlice(dataTransfer);

if (exact.kind === "slice") {
  editor.update((transaction) => {
    transaction.slice.replace(exact.slice);
  });
}
```

`createReactEditor()` and Plate's React editor install the same host-owned
capability through their DOM extension; they do not reimplement it.

### Public path 3 — direct `plite-dom` handler authoring

```ts
import { createEditor, defineEditorExtension } from "@platejs/plite";
import { clipboardHandler, dom } from "@platejs/plite-dom";

const ImageClipboard = defineEditorExtension({
  name: "image-clipboard",
  outputs: [
    clipboardHandler({
      insertData(data, { next, transaction }) {
        return insertImageData(data, transaction) || next(data);
      },
    }),
  ],
});

const editor = createEditor({
  extensions: [dom(), ImageClipboard],
  initialValue,
});
```

`clipboardHandler()` returns an opaque, descriptor-owned DOM output. The public
author does not name a string capability or assert its type. This output token,
its aggregation, and its inference ship inside the clipboard packet; they do
not depend on accepting a general service registry.

Handler laws:

1. DOM handler order is extension dependency order, then stable source order;
   the first handler runs first.
2. `next()` delegates once to the remaining handlers and finally to exact-slice
   then host-codec insertion. A second call throws.
3. `true` consumes the browser input. `false` without `next()` is an explicit
   unhandled terminal result. Returning `undefined` after `next()` propagates
   the downstream result.
4. A handler may pass replacement `DataTransfer` to `next(data)`.
5. Malformed claimed exact data is consumed as a handled no-op by the owning
   policy; it never silently downgrades to HTML.

### Public path 4 — Plate plugin authoring and table exact slice

Ordinary Plate feature author:

```ts
import { createBasePlugin } from "@platejs/core";

export const ImagePlugin = createBasePlugin({
  clipboard: {
    insertData(data, { next, transaction }) {
      return insertPlateImageData(data, transaction) || next(data);
    },
  },
  key: "image",
});
```

`createBasePlugin` contextually types the callback. Plate's compiler lowers
this field to the same opaque `clipboardHandler()` output. It does not lower to
an `EditorExtension.clipboard` field in Plite core.

Table exact-slice read:

```ts
const exact = editor.api.clipboard.readSlice(data);

if (exact.kind === "invalid") {
  editor.api.debug.warn(
    "Table paste rejected: invalid-source.",
    "TABLE_MUTATION_DIAGNOSTIC",
    { kind: "invalid-source", reason: "malformed-exact" }
  );

  return true;
}

if (exact.kind === "slice") {
  const table = getTablePasteElement(exact.slice, {
    cellTypes: tableApi.getCellTypes(),
    rowType: editor.plugin(KEYS.tr).type,
    tableType: editor.plugin(KEYS.table).type,
  });

  if (table) {
    return withTablePasteSource(editor, "model", () => next(data));
  }
}
```

Table exact-slice write:

```ts
import { ContentSlice } from "@platejs/plite";

editor.api.clipboard.writeSlice(data, {
  formats: {
    "text/csv": csv,
    "text/plain": tsv,
    "text/tsv": tsv,
  },
  slice: ContentSlice.closed([selectedTable]),
});
```

`writeSlice` runs the export projections, writes the versioned exact envelope,
runs configured host codecs, then applies explicit non-exact `formats`.
Explicit formats win for their MIME key. The exact MIME key is reserved and
cannot be overridden. Any `text/html` result always receives exact-fragment
metadata after serialization.

## Clipboard internal shape

Current:

```ts
// @platejs/plite
type EditorCoreApiGroups = {
  clipboard: EditorClipboardApi;
};

type EditorExtension = {
  clipboard?: EditorClipboardMiddlewareMap;
};

// String keys in the generic capability registry:
// "clipboard", "clipboard.insertData"
```

Proposed:

```ts
// @platejs/plite-dom
type CompiledDOMClipboardRuntime<V extends Value> = Readonly<{
  handlers: readonly DOMClipboardHandler<V>[];
  hostCodecs: readonly CompiledHostCodec<V>[];
  readSlice: (
    data: Pick<DataTransfer, "getData" | "types">
  ) => ClipboardSliceRead<V>;
  writeSlice: (
    data: Pick<DataTransfer, "getData" | "setData">,
    payload: ClipboardSliceWrite<V>
  ) => void;
}>;
```

The DOM extension contributes `api.clipboard`. `plite-dom` owns:

- typed handler registration and deterministic dispatch;
- the exact MIME key and envelope version;
- exact MIME and embedded-HTML decoding;
- host-codec parsing/serialization and fallback;
- export-slice projection before writing;
- malformed payload, codec, and handler errors through the editor error sink;
- DOM/React event integration.

Plite core owns only `ContentSlice`, schema fitting, `replaceSlice`, transaction
publication, and generic extension lifecycle.

## Deletion ledger

### Query packet

- `EditorQueryMiddlewareArgs`, `EditorQueryMiddlewareResult`,
  `EditorQueryMiddlewareContext`, `EditorQueryMiddlewareMap`, and exports.
- `EditorExtension.queries`.
- `queryMiddlewares` registry state and registration helpers.
- `packages/plite/src/core/query-middleware.ts`.
- `DEFAULT_DEPTH`, `QUERY_DEPTH`, generator wrappers, recursive `next()`, and
  all 43 read interception calls.
- Public/static `shouldMergeNodesRemovePrevNode` after the merge transform
  consumes the narrow reducer directly.
- All five Plate query registrations.
- Generic query middleware tests and docs; keep behavior tests under their new
  owners.
- The `domRange` model name in selection types, spec registry, runtime views,
  table, React, tests, and docs.

### Clipboard packet

- Core `EditorClipboardInsertDataContext`,
  `EditorClipboardMiddlewareMap`, `EditorClipboardApi`, and
  `EditorClipboardInsertDataCapability`.
- `EditorCoreApiGroups.clipboard`.
- `EditorExtension.clipboard`.
- Core string capabilities `clipboard` and `clipboard.insertData`.
- `createInternalClipboardApi` and core fallback assembly.
- Core `DataTransfer` references and core clipboard contract tests.
- Plate's lowering to the core clipboard slot.
- Table imports of `getDOMClipboardFormatKey`, `readDOMFragmentData`, and
  `writeDOMHostFragmentData` from `@platejs/plite-dom/internal`.
- Duplicate React clipboard assembly once React consumes the DOM capability.

## Adoption

| Owner                        | Required adoption                                                                                                                                                  |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Plite core                   | Compile the three narrow lanes; extend selection specs; add `slice.export`; rename `primaryRange`; delete generic query and core clipboard machinery               |
| `plite-dom`                  | Own typed handler output, clipboard API, exact tri-state reader, writer, host-codec fallback, error reporting, and export projection                               |
| `plite-react`                | Consume DOM clipboard capability; use `primaryRange`; preserve input/IME/selection scheduling                                                                      |
| Plate core                   | Lower `createBasePlugin({ clipboard })` to `clipboardHandler`; migrate OverridePlugin merge policy; remove query/clipboard types from Plate plugin extension types |
| Toggle                       | Adopt veto-only `selectability`                                                                                                                                    |
| Diff                         | Adopt `ContentSlice` export projection; migrate export-intent callers                                                                                              |
| Table                        | Put slice/marks/primary range on the existing selection spec; use public exact-slice read/write; keep CSV/TSV semantics table-owned                                |
| Other clipboard contributors | Media, input rules, HTML, Markdown, files, product codecs, static export, docs, examples, and type tests adopt the DOM-owned path                                  |

## Dependencies and owners

| Work                                                     | Entry dependency                                                                 | Primary decision/plan owner | Dependent owner |
| -------------------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------- | --------------- |
| Freeze these public contracts                            | Live five-registration inventory                                                 | `best-api`                  | —               |
| Selection spec + three narrow runtimes                   | Accepted contracts                                                               | `plite-plan`                | `plate-plan`    |
| Migrate all five registrations and rename `primaryRange` | Narrow runtimes exist                                                            | `plate-plan`                | `plite-plan`    |
| Delete generic query runtime                             | All five production registrations are gone                                       | `plite-plan`                | `plate-plan`    |
| DOM clipboard output/API                                 | `ContentSlice` and error sink already exist; no general output registry required | `plite-plan`                | `plate-plan`    |
| Plate/table/React clipboard adoption                     | DOM API and handler output exist                                                 | `plate-plan`                | `plite-plan`    |
| Delete core clipboard                                    | Zero core-slot and internal-table consumers                                      | `plite-plan`                | `plate-plan`    |

Global extension/plugin priority deletion may follow query migration, but none
of these contracts depends on global priority. The clipboard packet owns its
typed aggregate output even if the broader descriptor-output proposal is
deferred.

## Proof

### Query and selection

- Type tests infer every callback without annotations and reject unsupported
  query keys, duplicate selection kinds, `domRange`, and a guard returning
  `true`.
- Merge laws cover empty text, empty typed/untyped elements, first-child text,
  siblings/non-siblings, Plate rule overrides, conflicting policies, direct
  `tx.nodes.merge`, delete, suggestion, list, history replay, and Yjs replay.
- Selectability laws cover schema veto, closed/open toggle, nested toggle,
  keyboard navigation, node selection, and extension permutation.
- Export laws cover open depths, detached roots, immutable input, projection
  order, invalid projection failure isolation, and no projection on raw
  `slice.get`.
- Table laws cover directed multi-cell selection, mapping, common marks,
  mixed marks, empty text, projected subtable, replacement, primary range, and
  ordinary one-cell text selection.
- Browser proof covers table copy/cut, toggle keyboard navigation, DOM
  selection export, partial DOM coverage, and Chromium/Firefox/WebKit/mobile
  viewport rows already owned by the Plite matrix.
- Benchmark direct ordinary reads with zero policies and one policy; removing
  middleware must not regress the zero-policy path.

### Clipboard

- Type tests prove clipboard absence on core-only editors, presence after
  `dom()`/React/Plate, handler inference, output ownership, exact-slice value
  inference, and zero `DataTransfer` declarations in `@platejs/plite`.
- Runtime laws cover handler order, single delegation, data replacement,
  handled/unhandled results, transaction reuse, rollback, reconfiguration,
  cleanup, and handler/codec failure isolation.
- Exact transport laws cover open slices, detached roots, selection export
  projections, MIME and embedded HTML, malformed claimed data, version
  rejection, reserved MIME protection, and cross-editor schema validation.
- Browser proof covers exact slice + HTML + plain text + CSV + TSV, files,
  custom selection, cross-editor table copy/paste, cut, drag/drop, Trusted
  Types/injection, shadow roots, partial DOM, and all supported browsers.
- Benchmark handler dispatch and exact encode/decode before/after; the common
  one-handler and zero-handler paths must not regress materially.

## Closure gate

The packets are decision-ready only when the parent audit adopts these exact
shapes, removes the standalone range-rename row, and does not retain conditional
wording such as “exact names need best-api” or “Plate may keep clipboard sugar.”
No product implementation is part of this artifact.
