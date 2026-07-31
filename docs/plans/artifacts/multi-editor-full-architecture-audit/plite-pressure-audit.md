# Plite pressure audit

This file pressure-tests material Plite packets before the cross-editor synthesis. `accept` means the current checkout contains enough evidence that the architecture should change if a reference implementation proves the candidate semantics. It does not mean implementation is authorized.

## Decision summary

| Rank | Packet                                          | Decision                          | Local value                                                                                                | Primary owner                            |
| ---: | ----------------------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
|    1 | Ordered compiled content grammar                | **accept, P1**                    | Removes representable correction policy and makes fitting/validation structurally precise                  | `best-api` → `plite-plan` → `plate-plan` |
|    2 | Property exclusion and exclusive groups         | **accept, P1**                    | Deletes caller-owned mark coordination and invalid-state windows                                           | `best-api` → `plite-plan` → `plate-plan` |
|    3 | Hard-cut generic query middleware               | **accept, P1**                    | Deletes a huge public interception matrix used by five registrations                                       | `best-api` → `plite-plan` → `plate-plan` |
|    4 | Move clipboard transport out of core            | **accept, P1**                    | Restores the DOM-free substrate boundary without changing DOM-installed call sites                         | `best-api` → `plite-plan` → `plate-plan` |
|    5 | Descriptor-owned dependencies and typed outputs | **accept, P2**                    | Removes string/generic capability hazards and Plate lowering                                               | `best-api` → `plite-plan` → `plate-plan` |
|    6 | Hard-cut global extension priority              | **accept, P1**                    | Stops one number from reordering commands, schema, lifecycle, queries, and every other resource together   | `best-api` → `plite-plan` → `plate-plan` |
|    7 | Rename model `selection.domRange()`             | **accept, P3**                    | Removes a host-specific lie from the core vocabulary                                                       | `best-api` → `plite-plan` → `plate-plan` |
|    8 | Replace native input/repair runtime             | **reject**                        | Current explicit kernel and browser proof are stronger than a narrower generic view loop                   | keep                                     |
|    9 | Replace DOM phase scheduler                     | **reject**                        | Current bounded four-phase owner already solves the general problem                                        | keep                                     |
|   10 | Public mega view layer over mapped stores       | **reject**                        | Current private shared kernel plus separate public concepts is cleaner                                     | keep                                     |
|   11 | Replace host codec compiler                     | **reject**                        | Current schema-linked, ownership-checked, fitted-slice design is strong; only transport ownership is wrong | keep compiler; execute packet 4          |
|   12 | Replace history with donor history              | **reject**                        | Current change/effect/selection/schema persistence is already complete                                     | keep                                     |
|   13 | Replace Yjs with donor transform/collaboration  | **reject**                        | Current event-native canonical bridge plus Yjs semantics is the right Plate architecture                   | keep                                     |
|   14 | Bulk-anchor rewrite                             | **defer to benchmark evidence**   | Shared indexes exist; another registry is unjustified without a measured remaining bottleneck              | `performance` → `plite-plan` if proven   |
|   15 | Split layout mega-module                        | **defer to architecture cleanup** | File ownership is ugly but no cross-editor semantic gain is established                                    | `architecture-cleanup`                   |

Execution dependencies differ from value rank:

1. Finalize descriptor-owned outputs before moving clipboard contributions.
2. Compile property groups in the schema before deleting caller `clear`.
3. Migrate and delete generic query middleware before deleting global priority, because `OverridePlugin` owns both.
4. Ordered grammar is independent, but Plate correction deletion must wait for grammar adoption and generated fitting laws.

## 1. Ordered compiled content grammar

### Current public shape

```ts
schema: {
  elements: {
    doc: {
      content: schema.content.group('block', {
        default: { type: 'paragraph' },
        min: 1,
      }),
    },
  },
}
```

`SchemaContentRule` is a set predicate. `all` intersects sets, `any` unions sets, and one envelope supplies global `min`, `max`, and `default` (`packages/plite/src/interfaces/schema.ts:174`, `packages/plite/src/interfaces/schema.ts:186`, `packages/plite/src/core/schema-definition.ts:687`, `packages/plite/src/core/schema-definition.ts:753`).

### Current internal shape

```ts
type CompiledSchemaContentProgram = {
  allowedElementTypes: ReadonlySet<string>;
  allowsText: boolean;
  allowsUnknownElements: boolean;
  default: SchemaContentDefault | null;
  max: number | null;
  min: number;
};
```

The compiler cannot encode order, alternatives over sequences, repetition of a term, or term-level cardinality (`packages/plite/src/core/schema-compiler.ts:286`). It compensates with wrapper-path search and product corrections. `TrailingBlockPlugin` repairs a required suffix at `packages/utils/src/lib/plugins/trailing-block/TrailingBlockPlugin.ts:44`; `SingleBlockPlugin` repairs a one-block root at `packages/utils/src/lib/plugins/single-block/SingleBlockPlugin.ts:7`.

### Proposed public shape

```ts
const block = schema.content.group("block");
const paragraph = schema.content.type("paragraph");

const article = schema.content.sequence([
  schema.content.repeat(block, { min: 0 }),
  paragraph,
]);

const figure = schema.content.sequence([
  schema.content.type("image"),
  schema.content.optional(schema.content.type("caption")),
]);

const listItem = schema.content.choice([
  schema.content.sequence([
    paragraph,
    schema.content.optional(schema.content.type("list")),
  ]),
  schema.content.type("task"),
]);
```

Keep the current simple builders. `schema.content.text()`, `type()`, and `group()` remain valid one-term programs. Add only `sequence`, `choice`, `repeat`, and `optional`; do not add a string grammar DSL.

### Proposed internal shape

```ts
type CompiledContentProgram = {
  startState: number;
  states: readonly {
    accepting: boolean;
    defaultFill: readonly CompiledDefaultNode[];
    transitions: ReadonlyMap<CompiledContentClass, number>;
  }[];
};
```

Compile the declarative expression once into deterministic transition tables. Construction, external validation, fitting, insertion, replacement, correction scheduling, and wrapper search must consume the same program. Cache `(programId, state, childClass)` transitions and precompute shortest valid fill/wrap plans. JSON nodes and paths do not change.

### Value

- Required order and suffix/prefix laws become impossible to violate during construction.
- Slice fitting becomes structurally complete instead of set-compatible.
- External validation and default filling stop disagreeing with correction policy.
- The grammar scales with document size through compiled state transitions, not repeated rule walking.

### Hard deletions

- `SchemaContentRule`'s set-only compiled representation.
- Global-only cardinality assumptions in `assertContentOptions`.
- Allowed-set-only validation branches and duplicated wrapper heuristics replaced by automaton plans.
- `TrailingBlockPlugin` correction when its configuration is a fixed root grammar.
- The structural part of `SingleBlockPlugin` when the configured shape is expressible.
- Tests that assert the old set-only internal representation.

Do **not** delete table rectangular/span repair. Ordered child grammar cannot express cross-row geometry.

### Adoption and proof

- Adopt Plate root schema in `packages/core/src/lib/editor/withPlite.ts:361`.
- Convert table/list/figure/caption schemas where order is semantic.
- Keep corrections for cross-node/product invariants that are not context-free.
- Add generated accept/reject/fill/fit laws, property tests over grammar expressions, incremental validation locality, 10k-node fitting benchmarks, paste browser proof, and correction-count assertions.
- Dependency: schema descriptor identity and `ContentSlice` remain unchanged.

### Decision

**Accept, P1.** This is missing substrate power, not decorative API polish.

## 2. Property exclusion and exclusive groups

### Current public shape

```ts
schema: {
  mark: property.boolean({ default: false, omitDefault: true }),
},
update: ({ editor, tx, type }) => ({
  toggle: () => {
    tx.marks.toggle(type, true, {
      clear: editor.plugin(KEYS.sub).type,
    });
  },
}),
```

The reciprocal plugin repeats the inverse clear (`packages/basic-nodes/src/lib/BaseSuperscriptPlugin.ts:6`, `packages/basic-nodes/src/lib/BaseSubscriptPlugin.ts:6`). Toolbar state also accepts and forwards arbitrary `clear` keys (`packages/utils/src/react/hooks/useMarkToolbarButton.ts:8`). Core exposes `EditorMarkToggleOptions.clear` at `packages/plite/src/interfaces/editor.ts:539` and executes it in `packages/plite/src/editor/toggle-mark.ts:15`.

### Current internal shape

Compiled properties know owner, placement, target, lifecycle, default, value codec, and replace/set merge, but no relation or cardinality (`packages/plite/src/interfaces/schema.ts:323`, `packages/plite/src/core/schema-compiler.ts:337`). A toggle may therefore publish a transient or persisted combination the schema conceptually forbids.

### Proposed public shape

```ts
export const BaselineShift = schema.propertyGroup("baseline-shift", {
  cardinality: "at-most-one",
});

export const BaseSuperscriptPlugin = createBasePlugin({
  key: KEYS.sup,
  schema: {
    mark: BaselineShift.member(
      property.boolean({ default: false, omitDefault: true })
    ),
  },
});

export const BaseSubscriptPlugin = createBasePlugin({
  key: KEYS.sub,
  schema: {
    mark: BaselineShift.member(
      property.boolean({ default: false, omitDefault: true })
    ),
  },
});

editor.update.marks.toggle(KEYS.sup, true);
```

At raw Plite level the same group descriptor is passed to `schema.textProperty`. A group descriptor owns stable identity and cardinality; callers never enumerate peers.

### Proposed internal shape

```ts
type CompiledPropertyGroup = {
  cardinality: "one" | "at-most-one";
  id: string;
  members: readonly CompiledSchemaProperty[];
};
```

The schema compiler validates group placement/value compatibility and builds a property-to-peers index. Set/toggle, fitted slice construction, external validation, type change, split, history replay, and Yjs import canonicalize one atomic property change. For booleans, the non-default value is active; other descriptors must provide an explicit active predicate or are rejected from exclusive groups.

### Value

- The declaration owns the invariant.
- Commands, toolbars, paste, collaboration, and history cannot disagree.
- Plugin rename/type remapping no longer requires cross-plugin key lookup.

### Hard deletions

- `EditorMarkToggleOptions.clear`.
- `clear` handling in `toggleMark`.
- Superscript/subscript reciprocal plugin references.
- Toolbar `clear` state/props.
- Equivalent ad hoc clear arrays found during adoption.

### Adoption and proof

- Start with superscript/subscript; audit code/highlight or mutually exclusive product marks.
- Add schema compile conflict tests, atomic toggle laws, slice-fit/external-value validation, history/Yjs convergence, typing continuation, and toolbar/browser proof.
- Dependency: compile property descriptors before command adoption. Ordered grammar is independent.

### Decision

**Accept, P1.** Caller `clear` is plainly the wrong owner.

## 3. Hard-cut generic query middleware

### Current public shape

```ts
defineEditorExtension({
  name: "example",
  queries: {
    fragment: {
      get({ next }) {
        return project(next());
      },
    },
    nodes: {
      isSelectable({ element, next }) {
        return dynamicRule(element) ? false : next();
      },
    },
  },
});
```

`EditorQueryMiddlewareMap` mirrors the whole query taxonomy (`packages/plite/src/interfaces/editor.ts:1367`, `packages/plite/src/interfaces/editor.ts:1434`, `packages/plite/src/interfaces/editor.ts:1494`, `packages/plite/src/interfaces/editor.ts:1510`). The runtime builds per-method continuation chains and generator wrappers (`packages/plite/src/core/query-middleware.ts:124`).

### Current production pressure

Exactly five production registrations exist:

1. merge-target policy — `packages/core/src/lib/plugins/override/OverridePlugin.ts:499`;
2. diff fragment projection — `packages/diff/src/lib/excludeDiffFromFragment.ts:30`;
3. table fragment projection — `packages/table/src/lib/BaseTablePlugin.ts:2543`;
4. table selection marks — `packages/table/src/lib/BaseTablePlugin.ts:3046`;
5. dynamic toggle selectability — `packages/toggle/src/react/TogglePlugin.tsx:100`.

These are not one abstraction. They are command policy, slice projection, custom-selection semantics, and dynamic navigation policy.

### Proposed public shape

```ts
const TableSelection = defineSelection({
  kind: "table",
  marks: ({ selection, state }) => getSharedCellMarks(selection, state),
  slice: ({ selection, state }) => getSelectedCellSlice(selection, state),
  // existing map/ranges/replacementRange/codec fields remain
});

const excludeDiff = defineSliceProjection("diff.export", ({ slice }) =>
  stripDiffProperties(slice)
);

const ToggleSelectability = defineElementPolicy("toggle.selectability", {
  selectable: ({ element, state }) => !isInClosedToggle(state, element.id),
});

defineEditorExtension({
  commands: ({ around }) => [
    around(editorCommands.delete, ({ input, next, state }) => {
      // Plate owns its exceptional empty-merge behavior in the delete spec.
      return buildPlateDelete(state, input) ?? next();
    }),
  ],
});
```

The exact narrow descriptors should be finalized by `best-api`. The invariant is fixed: no generic interception of arbitrary reads. Selection-specific marks/slices belong to selection specs; export-only projection belongs to `ContentSlice`; dynamic selectability may use one narrow element policy only if direct command ownership cannot cover it.

### Proposed internal shape

- Selection registry compiles optional `marks` and `slice` functions with the existing selection descriptor.
- Slice projections compile as an ordered typed output only for the slice/export pipeline.
- If dynamic selectability remains, compile one boolean policy chain; do not build a generalized query registry.
- Delete command behavior builds explicit changes rather than mutating a primitive query globally.

### Hard deletions

- `EditorQueryMiddlewareArgs`, `EditorQueryMiddlewareResult`, `EditorQueryMiddlewareContext`, and `EditorQueryMiddlewareMap`.
- `EditorExtension.queries`.
- `queryMiddlewares` in extension registries.
- `packages/plite/src/core/query-middleware.ts`.
- Generic method-name dispatch/wrapping in `editor-query-runtime`.
- Five migrated registrations and their middleware-specific tests.

### Adoption and proof

- Migrate one registration at a time with behavior-equivalent focused tests.
- Prove fragment/copy behavior in diff and table browser suites.
- Prove table marks and custom selection persistence.
- Prove toggle keyboard navigation and merge/delete behavior.
- Add a benchmark showing ordinary queries no longer inspect a registry.
- Dependency: typed extension outputs help narrow slice policies but are not required.

### Decision

**Accept, P1.** Keeping an interception framework this broad for five unrelated uses is architectural debt.

## 4. Move clipboard transport out of core

### Current public shape

Plain `@platejs/plite` always exposes:

```ts
editor.api.clipboard.insertData(dataTransfer);

defineEditorExtension({
  clipboard: {
    insertData(data, { editor, next, tx }) {
      // ...
      return next(data);
    },
  },
});
```

Core types directly mention `DataTransfer` at `packages/plite/src/interfaces/editor.ts:1912`, `packages/plite/src/interfaces/editor.ts:1920`, `packages/plite/src/interfaces/editor.ts:1929`, and `packages/plite/src/interfaces/editor.ts:1945`. `EditorCoreApiGroups` always includes clipboard (`packages/plite/src/interfaces/editor.ts:1941`), `EditorExtension` owns a clipboard slot (`packages/plite/src/interfaces/editor.ts:2108`), and core lifecycle errors know the `host-codec` source (`packages/plite/src/interfaces/editor.ts:1972`).

### Current internal shape

Core registers `clipboard.insertData` as an untyped capability and builds a fallback chain (`packages/plite/src/core/editor-extension.ts:849`, `packages/plite/src/create-editor.ts:152`). The actual MIME codecs, DOM serialization, exact fragment payload, `DataTransfer`, and browser policies live in `@platejs/plite-dom`.

### Proposed public shape

The call site remains identical when DOM is installed, but plain core editors do not have it:

```ts
const editor = createEditor({
  extensions: [dom(), imageClipboard, tableClipboard],
});

editor.api.clipboard.insertData(dataTransfer);
```

Direct Plite DOM extensions contribute typed handlers:

```ts
import {
  clipboardHandler,
  defineHostCodec,
  hostCodecs,
} from "@platejs/plite-dom";

const imageClipboard = defineEditorExtension({
  name: "image-clipboard",
  outputs: [
    clipboardHandler({
      insertData(data, { next, transaction }) {
        return insertImageData(data, transaction) || next(data);
      },
    }),
  ],
});
```

Plate can retain `clipboard: { insertData }` as plugin DSL sugar only if its compiler lowers that field to the typed DOM output. It must not lower into a core extension slot.

### Proposed internal shape

- `dom()` contributes both `api.dom` and `api.clipboard`.
- `@platejs/plite-dom` owns the clipboard handler descriptor, middleware chain, fallback, host codecs, and errors.
- Core knows only `ContentSlice`, pure slice fitting/replacement, and a generic lifecycle error channel.
- Host-codec errors carry DOM-owned structured detail through the generic error channel without adding a host-specific core union member.

### Hard deletions

- Core `EditorClipboard*` types and `EditorCoreApiGroups.clipboard`.
- `EditorExtension.clipboard`.
- Core `DataTransfer` references.
- Core clipboard capability registration and fallback construction.
- Core clipboard contract tests.
- Host-codec-specific branch in core `EditorLifecycleError`.

### Adoption and proof

- Move tests to `packages/plite-dom`.
- Convert media/table/CSV/Markdown/HTML/input-rule clipboard contributions.
- Ensure installed editor inference exposes clipboard only with DOM/React.
- Preserve exact-fragment, HTML, plain text, TSV/CSV, files, custom selection, partial DOM, and error-isolation browser proof.
- Dependency: descriptor-owned typed outputs make the cleanest contribution API; otherwise `plite-dom` needs its own typed registrar.

### Decision

**Accept, P1.** A DOM-free core that publicly requires `DataTransfer` is not DOM-free.

## 5. Descriptor-owned dependencies and typed outputs

### Current public shape

```ts
defineEditorExtension({
  name: "react",
  conflicts: ["dom"],
});

defineEditorExtension({
  api: { [HOST_CODEC_CAPABILITY]: registrations },
  name: "html-codecs",
  validateConfiguration(context) {
    const codecs = context.capabilities<HostCodecRegistration>(
      HOST_CODEC_CAPABILITY
    );
  },
});
```

Dependencies, peer dependencies, and conflicts are strings (`packages/plite/src/interfaces/editor.ts:2118`, `packages/plite/src/interfaces/editor.ts:2119`, `packages/plite/src/interfaces/editor.ts:2131`). Configuration and activation expose `capabilities<TValue>(name: string)` (`packages/plite/src/interfaces/editor.ts:1958`, `packages/plite/src/interfaces/editor.ts:1991`). API values are automatically copied into `Map<string, unknown[]>` (`packages/plite/src/core/editor-extension.ts:841`, `packages/plite/src/core/extension-registry.ts:780`).

Only host codecs use `context.capabilities<T>()` in production (`packages/plite-dom/src/plugin/host-codec.ts:536`). Plite-family production dependencies use one string conflict: React against DOM (`packages/plite-react/src/plugin/with-react.ts:123`). Plate already authors plugin dependencies with descriptors and lowers them.

The raw registry is less narrow than the public context suggests. It also powers core clipboard dispatch and fallback (`packages/plite/src/create-editor.ts:157`, `packages/plite/src/create-editor.ts:475`), the generic `editor.api` proxy (`packages/plite/src/create-editor.ts:524`), projected React clipboard handlers (`packages/plite-react/src/editable/mutation-controller.ts:175`), and host-codec compilation (`packages/plite-dom/src/plugin/host-codec.ts:573`). One string bag therefore conflates public API aggregation, dependency outputs, and DOM transport middleware.

### Proposed public shape

```ts
export const DOMExtension = defineExtensionKey("dom");
export const ReactExtension = defineExtensionKey("react");

export const HostCodecOutput = defineExtensionOutput<HostCodecRegistration>(
  "plite-dom:host-codec"
);

defineEditorExtension({
  key: ReactExtension,
  conflicts: [DOMExtension],
});

defineEditorExtension({
  key: defineExtensionKey("html-codecs"),
  outputs: codecs.map((codec) => HostCodecOutput.provide({ codec })),
  validateConfiguration({ outputs }) {
    const codecs = outputs.all(HostCodecOutput);
  },
});
```

The key/output descriptors carry phantom types and a stable diagnostic ID. `outputs.all(HostCodecOutput)` infers the value; callers cannot lie with `<T>` or mistype a string. Keep public `editor.api` separate from dependency outputs.

### Proposed internal shape

```ts
type ExtensionRegistry = {
  extensions: Map<EditorExtensionKey, RegisteredExtension>;
  apiByName: Map<string, readonly unknown[]>;
  outputs: Map<EditorExtensionOutput<unknown>, readonly unknown[]>;
};
```

`apiByName` preserves the existing structurally typed public namespace aggregation used by the `editor.api` proxy. It is not readable through extension dependency contexts. `outputs` is descriptor-keyed and is the only extension-to-extension contribution registry. Clipboard moves to a typed DOM output, so neither store carries core-owned clipboard special cases.

Reject a duplicate ID backed by a different key/output identity, as commands already do. Resolve required/order dependencies and conflicts by descriptor identity. Preserve atomic detached compilation and rollback. Do not make JavaScript class identity persistence truth; stable IDs remain diagnostics/serialization keys.

### Hard deletions

- String arrays for extension dependency/conflict matching.
- `capabilities<T>(name: string)`.
- The conflated `Map<string, unknown[]> capabilities`; replace it with separate public API and typed output stores.
- `registerCapabilityInRegistry`.
- Automatic registration of public `api` values as hidden dependency outputs.
- `HOST_CODEC_CAPABILITY` string and associated casts.
- Plate descriptor-to-string dependency lowering.

### Adoption and proof

- Convert DOM/React conflict and host codec outputs first.
- Move core/React projected clipboard readers to the DOM-owned clipboard output.
- Move the generic `editor.api` proxy to `apiByName` without exposing that store to extensions.
- Convert Plate plugin dependencies at the adapter owner, preserving configured descriptor replacement semantics.
- Add duplicate-ID/cross-realm diagnostics, inference tests, atomic reconfiguration, output aggregation, dependency cycles, removal, and rollback tests.
- Dependency: decide extension key/factory shape in `best-api`; keep the implementation smaller than a service container.

### Decision

**Accept as P2.** The runtime usage is narrow, so do not build a general dependency-injection framework. A typed descriptor map is enough.

## 6. Hard-cut global extension priority

### Current public shape

```ts
defineEditorExtension({
  name: 'plate-override',
  priority: -100,
  commands: /* ... */,
  queries: /* ... */,
  corrections: /* ... */,
});
```

`priority?: number` is one property on the whole extension (`packages/plite/src/interfaces/editor.ts:2097`, `packages/plite/src/interfaces/editor.ts:2132`). The compiler sorts all extension records by descending priority before dependency traversal (`packages/plite/src/core/editor-extension.ts:1261`). Core tests explicitly use this global value as command priority (`packages/plite/test/extension-methods-contract.ts:442`).

The only clear production use of **Plite extension priority** is `OverridePlugin` (`packages/core/src/lib/plugins/override/OverridePlugin.ts:499`). Other Plate `priority` fields found in the tree belong to plugin resolution, codecs, shortcuts, or rules and are separate concepts.

### Proposed public shape

```ts
createEditor({
  extensions: [
    coreEditing,
    tableEditing,
    plateFallbacks, // deterministic source order
  ],
});

defineEditorExtension({
  commands: ({ around, handle }) => [
    handle(editorCommands.delete, fallbackDelete),
    around(editorCommands.insert, wrapInsert),
  ],
  key: PlateFallbacks,
});
```

Extension configuration order determines fallback order. `around` expresses wrapping. Typed dependency descriptors express required installation/order constraints. Resource compilers may define their own explicit order only where the resource semantics require it; no number can reorder unrelated resources.

### Proposed internal shape

- Preserve stable installation/source order after dependency topological ordering.
- Compile commands in that order.
- Compile schema, lifecycle, state, outputs, corrections, and codecs according to their own declared semantics.
- No shared priority comparator.

### Hard deletions

- `EditorExtension.priority`.
- Priority normalization/freezing and global sort comparator.
- Command-priority tests tied to extension priority.
- `OverridePlugin`'s `priority: -100`.

### Adoption and proof

- Snapshot every command chain and correction order before/after.
- Place Plate fallback extension explicitly in the generated extension list.
- Prove dynamic reconfiguration, dependency ordering, command fallback, around composition, schema conflict determinism, and host-codec precedence.
- Dependency: query middleware deletion removes the riskiest mixed-resource consumer.

### Decision

**Accept, P1.** A global number that silently changes every resource lane is too blunt.

## 7. Rename model `selection.domRange()`

### Current public shape

```ts
const range: import("@platejs/plite").Range | null =
  editor.read.selection.domRange();
```

The method returns a Plite model `Range`, not a browser `Range` (`packages/plite/src/interfaces/editor.ts:456`). Custom selection specs use the same name for their model projection (`packages/plite/src/core/selection-protocol.ts:52`). The public production call is table selection; DOM conversion is separately and correctly owned by `editor.api.dom.resolveDOMRange`.

### Proposed public and internal shape

```ts
const range = editor.read.selection.primaryRange();

defineSelection({
  kind: "table",
  primaryRange(selection) {
    return rangeCoveringSelectedCells(selection);
  },
});

const domRange = editor.api.dom.resolveDOMRange(range);
```

Rename the registry callback and state query together. No behavioral change or compatibility alias.

### Hard deletions and proof

- `domRange` field in state API, selection spec, runtime wrappers, and tests.
- Adopt table and React tests.
- Typecheck Plite/Plate adopters and run selection browser contracts.

### Decision

**Accept, P3.** Small break, real vocabulary correction.

## 8. Native input and DOM repair

### Current shape under pressure

- Editing kernel owns browser family, state, selection ownership, repair policy, and trace (`packages/plite-react/src/editable/editing-kernel.ts:50`).
- Event engine composes family-specific handlers (`packages/plite-react/src/editable/runtime-event-engine.ts:69`).
- Repair is version guarded and scheduler owned (`packages/plite-react/src/editable/runtime-repair-engine.ts:13`).
- Root engine and imperative DOM runtime own mounted lifecycle (`packages/plite-react/src/editable/runtime-root-engine.ts:79`, `packages/plite-react/src/editable/editable-dom-runtime.ts:53`).
- Browser proof spans Chromium, Firefox, mobile viewport, and WebKit with zero retries (`apps/plite/playwright.config.ts:36`, `apps/plite/playwright.config.ts:68`, `apps/plite/playwright.config.ts:90`).

### Decision

**Reject a donor-driven rewrite.** Wordgard or ProseMirror may offer useful individual algorithms and tests, but their narrower browser/product surface does not prove a better owner. Any accepted import must enter as a focused behavior law and delete equivalent logic; it must not collapse Plite's explicit state machine into generic event callbacks.

## 9. DOM phase scheduler

### Current shape under pressure

```ts
type DOMPhase = "model" | "dom-read" | "dom-write" | "selection-repair";
```

The scheduler supports immediate/microtask/frame/timeout timing, keyed replacement, bounded passes, diagnostics, mounted-root ownership, and fallback schedulers (`packages/plite-dom/src/plugin/dom-phase-scheduler.ts:9`, `packages/plite-dom/src/plugin/dom-phase-scheduler.ts:31`, `packages/plite-dom/src/plugin/dom-phase-scheduler.ts:79`, `packages/plite-dom/src/plugin/dom-phase-scheduler.ts:109`). `DOMRootRuntime` owns one scheduler per mounted root (`packages/plite-dom/src/plugin/dom-root-runtime.ts:180`).

### Decision

**Reject replacement.** This is already the general bounded scheduler Plite needed. Donor code must show a missing phase law or a measured latency win, not a shorter file.

## 10. Mapped view stores

### Current shape under pressure

One private kernel owns mapping, invalidation, lifecycle, keyed/global subscriptions, and error isolation (`packages/plite-react/src/mapped-view-store.ts:12`, `packages/plite-react/src/mapped-view-store.ts:28`). Decoration, annotation, widget, and projection remain separate public concepts with separate source hooks.

### Decision

**Reject a public mega view layer.** The current design shares machinery without erasing semantics. Compare donor invalidation algorithms and benchmarks only; retain the public split.

## 11. Host codecs

### Current shape under pressure

`defineHostCodec` is pure and typed, parses or serializes `ContentSlice`, declares schema ownership, detects format/resource conflicts atomically, compiles against the exact schema, caches by registry, isolates provider failures, and defers fitting to insertion (`packages/plite-dom/src/plugin/host-codec.ts:92`, `packages/plite-dom/src/plugin/host-codec.ts:98`, `packages/plite-dom/src/plugin/host-codec.ts:113`, `packages/plite-dom/src/plugin/host-codec.ts:375`, `packages/plite-dom/src/plugin/host-codec.ts:425`, `packages/plite-dom/src/plugin/host-codec.ts:492`).

### Decision

**Reject codec replacement; accept packet 4's owner move.** A donor DOM parser that looks shorter because it lacks schema ownership, open slices, multi-root content, or fault isolation is inferior.

## 12. History

### Current shape under pressure

History batches store canonical changes, effects, before/after selections and roots (`packages/plite-history/src/history.ts:24`). History JSON is version 4 and carries schema identity (`packages/plite-history/src/history.ts:39`, `packages/plite-history/src/history.ts:49`). Decode validates schema, effects, selections, documents, and version (`packages/plite-history/src/history-codec.ts:211`). Remote changes map stacks rather than clearing them.

### Decision

**Reject replacement.** Donor grouping heuristics may become tests or focused policy improvements, but the architecture already has the right truth and persistence model.

## 13. Yjs

### Current shape under pressure

Local canonical changes lower into Yjs (`packages/yjs/src/core/change-bridge.ts:72`). Remote event batches import canonical changes and report explicit fallback reasons (`packages/yjs/src/core/event-change-bridge.ts:67`, `packages/yjs/src/core/event-change-bridge.ts:77`). The controller owns per-root bridges, schema/set-valued property semantics, awareness, shared effects, and trace (`packages/yjs/src/core/controller.ts:115`). Extension activation and cleanup are rollback aware (`packages/yjs/src/core/extension.ts:92`, `packages/yjs/src/core/extension.ts:176`).

### Decision

**Reject replacement and reject central OT.** Harvest donor concurrent-transform laws for `DocumentChange`, but keep Yjs as the collaboration owner.

## 14. Anchors

### Current shape under pressure

Anchors already share active state and lazy `DocumentIndex` instances per root (`packages/plite/src/core/anchor-state.ts:29`, `packages/plite/src/core/anchor-state.ts:94`, `packages/plite/src/core/anchor-state.ts:125`). Each anchor still owns mapping semantics and listener work.

### Decision

**Defer.** Run bulk-anchor benchmarks against donor registries. Accept a rewrite only if current complexity or latency remains materially worse after shared indexing; do not add a second anchor registry because another editor has one.

## 15. Layout module ownership

`packages/plite-layout/src/index.ts` mixes settings codecs, geometry, projections, page-break snapshots, estimated/pretext engines, pagination, and runtime creation across roughly 3,500 lines. Public semantics and browser proof are real, but the file is a navigation/testing problem rather than evidence that the model is wrong.

### Decision

**Defer to `architecture-cleanup`.** Split coherent owners only when imports/tests can follow the same boundaries. Do not rank it as a cross-editor architecture packet without a semantic or performance gain.
