## Decision-ready full audit

### Blunt verdict

Plite is already the stronger substrate. Keep its JSON-native multi-root
model, canonical `DocumentChange`, immutable transaction specs, typed
effects/fields/facets, compiled schema identity, atomic extension publication,
host codec compiler, bounded DOM scheduler, mapped-view-store kernel,
versioned history, and event-native Yjs bridge.

The three references expose exactly six changes worth paying for now. Two are
wrong public ontology, three remove broad machinery or restore the correct
owner, and one closes a real typing hole. Ordered grammar is semantically
stronger in ProseMirror but not yet materially funded by retained Plate jobs.
Browser, fitter, history, and collaboration cases are proof inputs, not fake
architecture packets.

This is planning-only. The proposed names, imports, call shapes, composition
rules, internal owners, deletions, and proof gates are the target;
`best-api` accepts or rejects these concrete shapes instead of inventing
different ones later.

### Audit authority and mechanical closure

The exhaustive concept ledger is the union of five independently generated,
source-derived ledgers. Each reference remains independently classified; no
score is averaged across editors.

| Source            | Immutable/local authority                       |       Included units | Declarations | Concepts |                 Exact exclusions | Unmapped |
| ----------------- | ----------------------------------------------- | -------------------: | -----------: | -------: | -------------------------------: | -------: |
| Wordgard          | `01eb2b5eae509509677345fd603acad001827dff`      |     114 mapped files |        3,275 |       73 |        6 files / 12 declarations |        0 |
| Lexical           | `d52f66e250e031a6c6fd8836d160373b0df557c7`      | 1,424 relevant units |        5,132 |       48 |     219 units / 862 declarations |        0 |
| ProseMirror       | meta plus 19 commits in the provenance artifact |     214 mapped files |        2,180 |       64 |                        116 files |        0 |
| Live Plite family | generated current-source manifest               |          2,318 files |        6,004 |       32 | generated/build/cache paths only |        0 |
| Live Plate family | generated current-source manifest               |          2,253 files |        7,660 |       45 |                        135 files |        0 |

Complete evidence:

- [Wordgard ledger](./wordgard-architecture-report.md) and
  [manifest](./wordgard-source-manifest.json)
- [Lexical ledger](./lexical-architecture-ledger.md) and
  [manifest](./lexical-source-manifest.json)
- [ProseMirror ledger](./prosemirror-concept-ledger.md),
  [provenance](./prosemirror-provenance.md), and
  [manifest](./prosemirror-source-manifest.json)
- [Plite ledger](./plite-concepts.md),
  [pressure audit](./plite-pressure-audit.md), and
  [manifest](./plite-source-manifest.json)
- [Plate ledger](./plate-concept-inventory.md) and
  [manifest](./plate-coverage-manifest.json)
- [Independent proposal pressure review](./proposal-pressure-review.md)

### Strong local mechanisms to keep

1. Plain immutable JSON nodes, paths for snapshot queries, anchors for live
   identity, runtime IDs for rendering, and first-class multi-root documents.
2. One canonical immutable `DocumentChange` shared by editing, mapping,
   history, Yjs, invalidation, serialization, and correction.
3. Pure `TransactionSpec` construction followed by atomic publication.
4. Compiled schema identity, typed properties, `ContentSlice`, fitting,
   external validation, and correction worklists.
5. Descriptor-owned typed commands with ordinary `handle` and rare `around`.
6. Typed effects, annotations, fields, explicit-dependency facets, and
   versioned codecs.
7. Atomic extension candidate compilation, validation, activation, rollback,
   cleanup, and reconfiguration.
8. DOM-free core intent, schema-linked host codecs, React rendering, partial
   DOM coverage, and the bounded model/read/write/repair scheduler.
9. Separate public decoration, annotation, and widget concepts over one
   private mapping and lifecycle kernel.
10. Versioned history persistence and event-native Yjs translation.
11. Plate ownership of tables, product schemas, media, AI, UI, kits, and
    application composition.

## Ranked decisions

| Value rank | ID   | Priority | Decision                                                                                                                                                   | Primary owner             | Dependent owner |
| ---------: | ---- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | --------------- |
|          1 | `A1` | P0       | Split immutable Plate plugin `options` from editor-local `session`                                                                                         | `best-api` → `plate-plan` | none            |
|          2 | `A2` | P0       | Delete global Plate plugin and Plite extension priority                                                                                                    | `best-api` → `plate-plan` | `plite-plan`    |
|          3 | `A3` | P1       | Compile schema-owned exclusive text-property groups                                                                                                        | `best-api` → `plite-plan` | `plate-plan`    |
|          4 | `A4` | P1       | Delete generic query middleware in favor of three narrow policies plus richer selection specs; rename model `domRange` to `primaryRange` in the same break | `best-api` → `plite-plan` | `plate-plan`    |
|          5 | `A5` | P1       | Move clipboard transport, handlers, and every `DataTransfer` contract from Plite core to `plite-dom`                                                       | `best-api` → `plite-plan` | `plate-plan`    |
|          6 | `A6` | P2       | Replace string dependency/peer/conflict edges with descriptor-owned required dependencies and conflicts                                                    | `best-api` → `plite-plan` | `plate-plan`    |

Value rank is not implementation order. `A1` and `A3` are independent. `A2`
can compile dependency/source order over the current graph; `A6` may land
before, with, or after it without changing the ordering laws. `A4` must identify
the owners currently hidden behind priority before the final `A2` cut. `A5`
owns its typed multi-provider output primitive and can proceed independently
or reuse `A6`'s candidate-registry identity.

## Cross-packet laws

1. Plain JSON nodes, structural selections, paths, anchors, runtime IDs,
   multi-root documents, `ContentSlice`, `TransactionSpec`, `DocumentChange`,
   atomic extension publication, React rendering, host-owned DOM, history, and
   Yjs remain.
2. No compatibility aliases, dual signatures, string fallbacks, optional peer
   service locator, or old/new middleware bridge survives a packet.
3. Configuration order is explicit product composition. It is not persistence
   truth and never changes document JSON, history, or Yjs identity.
4. A public extension point exists only for a demonstrated multi-owner job.
5. Every candidate compiles and validates before publication; failure exposes
   none of its options, session factories, dependencies, policies, codecs, or
   APIs.

---

## A1 — immutable plugin options and editor-local session

### Why this clears P0

Keep `options` as Plate's immutable authoring noun. Add `session` as the sole
editor-local ephemeral store. Do not rename options to `config`. Do not add
runtime plugin reconfiguration to this packet.

Current evidence:

- `PluginBase.options` is described as mutable runtime state in
  `packages/core/src/lib/plugin/PluginConfig.ts:208-224`.
- Schema and HTML factories receive readonly options in
  `packages/core/src/lib/plugin/PluginConfig.ts:390-400,854-861`.
- `getOption`, `getOptions`, `setOption`, and `setOptions` share one portal in
  `packages/core/src/lib/plugin/PluginConfig.ts:458-492`.
- Runtime writes target a second Zustand snapshot in
  `packages/core/src/lib/plugin/getEditorPlugin.ts:229-299` and
  `packages/core/src/internal/plugin/pluginOptionsStore.ts:120-149`.
- The current bounded production census is 169 mutation calls across 42 files:
  154 session, 10 application/provider, 2 existing Copilot field/effect,
  1 immutable codec option, 2 DOM call-local, and 0 document.

### Current public shape

```ts
import type { PlateEditor } from "@platejs/core/react";
import { createPlatePlugin, usePluginOption } from "@platejs/core/react";

export const SelectionDemoPlugin = createPlatePlugin({
  key: "selection-demo",
  options: {
    selectable: true,
    selectedIds: [] as string[],
  },
  schema: ({ options }) => ({
    element: {
      selectable: options.selectable,
    },
  }),
});

export function replaceSelectedIds(editor: PlateEditor, selectedIds: string[]) {
  editor.plugin(SelectionDemoPlugin).setOption("selectedIds", selectedIds);
}

export function useSelectedIds() {
  return usePluginOption(SelectionDemoPlugin, "selectedIds");
}
```

`selectable` is compiler input. `selectedIds` is runtime UI state. The same
object and hook vocabulary claims both are mutable options.

### Proposed public shape

```ts
import type { InferSession } from "@platejs/core";
import type { PlateEditor } from "@platejs/core/react";
import { createPlatePlugin, usePluginSession } from "@platejs/core/react";

export const SelectionDemoPlugin = createPlatePlugin({
  key: "selection-demo",
  options: {
    selectable: true,
  },
  session: () => ({
    selectedIds: [] as string[],
  }),
  schema: ({ options }) => ({
    element: {
      selectable: options.selectable,
    },
  }),
});

export function replaceSelectedIds(editor: PlateEditor, selectedIds: string[]) {
  editor.plugin(SelectionDemoPlugin).session.set({ selectedIds });
}

export function readSelectionConfiguration(editor: PlateEditor) {
  return editor.plugin(SelectionDemoPlugin).options.selectable;
}

export function useSelectedIds() {
  return usePluginSession(
    SelectionDemoPlugin,
    (session) => session.selectedIds
  );
}
```

The exact public contract is:

```ts
import type { InferSession } from "@platejs/core";
import type { PlateEditor } from "@platejs/core/react";

type DeepReadonly<T> = T extends (...args: infer _Args) => unknown
  ? T
  : T extends ReadonlyMap<infer K, infer V>
  ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
  : T extends ReadonlySet<infer U>
  ? ReadonlySet<DeepReadonly<U>>
  : T extends readonly (infer U)[]
  ? readonly DeepReadonly<U>[]
  : T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;

type PluginSessionStore<TSession extends object> = Readonly<{
  get(): Readonly<TSession>;
  set(
    update:
      | Partial<TSession>
      | ((session: Readonly<TSession>) => Partial<TSession>)
  ): void;
}>;

type InstalledPluginPortal<
  TOptions,
  TSession extends object | never
> = Readonly<{
  options: DeepReadonly<TOptions>;
}> &
  ([TSession] extends [never]
    ? {}
    : Readonly<{
        session: PluginSessionStore<Extract<TSession, object>>;
      }>);

declare function usePluginSession<TPlugin, TResult>(
  plugin: TPlugin,
  selector: (session: Readonly<InferSession<TPlugin>>) => TResult,
  options?: Readonly<{
    editor?: PlateEditor;
    equalityFn?: (left: TResult, right: TResult) => boolean;
  }>
): TResult;
```

There is no `session.get('selector', args)` API. Store-derived values use the
hook selector. Editor/document-dependent derived reads move to the plugin's
typed `read` group. Existing `PluginConfig.state` continues to mean
state-bound read groups; it is not renamed or reused as mutable storage.

### Current internal shape

```ts
type ResolvedBasePlugin<C extends AnyPluginConfig> = {
  options: InferOptions<C>;
};

type PluginOptionsStore<C extends AnyPluginConfig> = TBaseStateApi<
  InferOptions<C>,
  unknown,
  unknown,
  InferSelectors<C>
>;

type BasePluginContext<C extends AnyPluginConfig> = {
  getOption(key: PropertyKey, ...args: unknown[]): unknown;
  getOptions(): Readonly<InferOptions<C>>;
  setOption(key: PropertyKey, value: unknown): void;
  setOptions(update: object | ((draft: object) => void)): void;
};
```

The compiled descriptor and mutable store both claim ownership of options.

### Proposed internal shape

```ts
type CompiledPlatePlugin<
  TOptions,
  TSession extends object | never = never
> = Readonly<{
  options: DeepReadonly<TOptions>;
  session: [TSession] extends [never] ? null : () => Extract<TSession, object>;
}>;

type InstalledPlatePlugin<
  TOptions,
  TSession extends object | never = never
> = Readonly<{
  descriptor: CompiledPlatePlugin<TOptions, TSession>;
  options: DeepReadonly<TOptions>;
}> &
  ([TSession] extends [never]
    ? {}
    : Readonly<{
        session: PluginSessionStore<Extract<TSession, object>>;
      }>);

type PlateModelPublication = Readonly<{
  optionsByPlugin: ReadonlyMap<object, unknown>;
  sessionsByPlugin: ReadonlyMap<object, PluginSessionStore<object>>;
}>;
```

Options are cloned/frozen during candidate compilation and participate in
schema/codec fingerprints. The pure session factory runs once per editor
candidate so mutable object, `Set`, ref, or controller identity cannot leak
between editors. Configuration `Map`/`Set` inputs are copied into
mutation-throwing readonly views; stable service/function references remain
opaque capabilities whose identity, not private internals, is the immutable
option. Candidate stores publish with the Plate model only after Plite
extension initialization succeeds. Session stores:

- are owned by the editor runtime and disposed with it;
- never enter schema identity, history, Yjs, document JSON, or persistence;
- notify only subscribers to that plugin session;
- are not readable by schema or codec factories;
- are not partially replaced during failed publication.

Session is creation-owned. Terminal `.configure({ options })` may replace
immutable parameters, but terminal configuration cannot replace the session
shape or initializer. A plugin without a session factory allocates no store and
has no `.session` portal member.

### Deletion

- `getOption`, `getOptions`, `setOption`, and `setOptions`;
- `PluginOptionsStore`, `getPluginOptionsStore`, and mixed option-store setup;
- `usePluginOption`, `usePluginOptions`, `useEditorPluginOption`, and
  `useEditorPluginOptions`;
- root `selectors` that use the option store as a query engine; migrate them to
  hook selectors or typed plugin `read`;
- tests and docs that treat compiled and mutable option snapshots as valid
  independent truths.

### Adoption

Every existing mutable key is classified before editing:

| Destination                                             | Families                                                                                                                                                                             |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| immutable `options` — 1 current mutation must disappear | schema/codec policy, upload callbacks, limits, feature flags, match/query configuration, presentation defaults                                                                       |
| editor-local `session` — 154 calls                      | AI/chat streaming state, upload progress/errors, DnD hover state, selection IDs/anchors, link/find popover state, navigation feedback, table interaction state, emoji/combobox state |
| Plite field/effect — 2 calls                            | existing Copilot suggestion field/effect; delete duplicate option keys                                                                                                               |
| application/provider state — 10 calls                   | discussions and live AI request settings                                                                                                                                             |
| call-local runtime input — 2 calls                      | DOM auto-scroll overrides passed through the existing call                                                                                                                           |
| document/schema property — 0 calls                      | semantic state that must copy, undo, collaborate, serialize, or render from content; no current option mutation belongs here                                                         |
| plugin `read` / API                                     | selectors depending on document, selection, compiled schema, or imperative session derivation                                                                                        |

Adopters include AI, copilot, comments, suggestions, media uploads, DnD, link,
find/replace, table, toggle, selection, navigation feedback, registry kits,
hooks, fixtures, docs, and type tests.

### Proof and performance

- Inference for options/session portals and hooks without callback annotations.
- Compile-time rejection of option writes and session reads in schema/codec
  factories.
- Two editors from one descriptor receive independent session stores.
- Publication rollback creates no visible session; disposal unsubscribes all
  listeners.
- Session writes produce no document traversal, commit, history, Yjs, schema
  revision, or codec recompile.
- Benchmark initialization and subscriber fan-out against the current store;
  a 5,000-block document must not affect session-write cost.

### Ownership and dependencies

- `best-api`: accept this exact `options`/`session` portal and hook.
- `plate-plan`: own types, compiler, store replacement, all call-site
  classification, package adoption, docs, and deletion.
- `plite-plan`: no work in this packet.
- Independent of `A2`–`A6`.

### Why this is better than each donor

| Donor       | Judgment                                                                                                                                                                                                                       |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Wordgard    | Keeps Wordgard's clean split between configuration inputs and state/facets, but avoids nominal field identity and implicit facet dependencies. Plate authors get one obvious immutable noun and one editor-local mutable noun. |
| Lexical     | Keeps typed extension configuration without importing reactive signals that mutate installed resources outside an atomic publication.                                                                                          |
| ProseMirror | Keeps plugin-state separation without array-ordered partial state construction or state fields that observe half-built next state.                                                                                             |

---

## A2 — hard-cut global priority

### Why this clears P0

Delete `BasePlugin.priority` and `EditorExtension.priority`. Dependency order
and stable configuration order govern owner installation. Only resource
compilers with a real competition job retain local priority.

Current evidence:

- Plate global priority contract:
  `packages/core/src/lib/plugin/PluginConfig.ts:211-224`.
- Shortcut and input-rule fallback:
  `packages/core/src/internal/plugin/resolvePlugins.ts:1083-1084,1133-1169`.
- Component and weak-override winners:
  `packages/core/src/internal/plugin/resolvePlugins.ts:1296-1328,1420-1461`.
- Dependency ready queue:
  `packages/core/src/internal/plugin/resolvePlugins.ts:1810-1818`.
- MIME and HTML codec order:
  `packages/core/src/internal/plugin/compilePlateCodecs.ts:132-150` and
  `compilePlateHtmlCodec.ts:650-665`.
- Plite sorts every extension before dependency traversal in
  `packages/plite/src/core/editor-extension.ts:1236-1269`.

### Current public shape

```ts
import { createBasePlugin } from "@platejs/core";
import { defineEditorExtension } from "@platejs/plite";

export const FeatureExtension = defineEditorExtension({
  name: "feature-runtime",
  priority: 200,
});

export const FeaturePlugin = createBasePlugin({
  key: "feature",
  priority: 200,
  shortcuts: {
    toggle: {
      handler: () => true,
      keys: "mod+k",
    },
  },
});
```

The number `200` changes extension traversal, commands, shortcuts, input rules,
components, overrides, schema contributors, and codecs.

### Proposed public shape

```ts
import { createBasePlugin } from "@platejs/core";
import { defineEditorExtension } from "@platejs/plite";

export const FeatureExtension = defineEditorExtension({
  name: "feature-runtime",
});

export const FeaturePlugin = createBasePlugin({
  key: "feature",
  shortcuts: {
    toggle: {
      handler: () => true,
      keys: "mod+k",
      priority: 20,
    },
  },
});
```

The only number above belongs to shortcut collision resolution. The final
ordering laws are:

| Resource                      | Final order/conflict rule                                                                             |
| ----------------------------- | ----------------------------------------------------------------------------------------------------- |
| extension/plugin installation | required dependency topological order, then stable application configuration order                    |
| typed commands                | extension configuration order; ordinary `handle` then explicit `around` contract                      |
| shortcuts                     | shortcut-local priority, then source order                                                            |
| input rules                   | rule-local priority, then source order                                                                |
| MIME/HTML codecs              | codec/rule-local priority, then source order; equal exclusive claims reject where ambiguity is unsafe |
| schema contributions          | structural merge and explicit compiler conflict diagnostics, never priority                           |
| components/render overrides   | one terminal application `.configure()` decision; ambiguous plugin claims reject                      |
| weak plugin overrides         | explicit extension/configuration composition; no numeric fallback                                     |
| lifecycle                     | dependency order for setup, reverse dependency order for cleanup                                      |

Component ownership is no longer numeric arbitration:

```ts
import { createPlatePlugin, ParagraphPlugin } from "@platejs/core/react";

const ParagraphElement = () => null;

// Current: a global number arbitrates an unrelated component claim.
export const CurrentThemePlugin = createPlatePlugin({
  key: "theme",
  priority: 1_000,
  override: {
    components: {
      [ParagraphPlugin.key]: ParagraphElement,
    },
  },
});

// Proposed: the application configures the descriptor that owns the slot.
export const ConfiguredParagraphPlugin = ParagraphPlugin.configure({
  component: ParagraphElement,
});
```

Weak plugin contributions retain their current structural authoring shape but
lose priority arbitration: disjoint leaf writes merge, `Object.is`-equal
overlap coalesces, different overlap fails with both owners/property path, and
the target descriptor's terminal `.configure()` wins.

### Current internal shape

```ts
type PlatePluginRecord = {
  order: number;
  priority: number;
};

type EditorExtension = {
  dependencies?: readonly string[];
  priority?: number;
};

records.sort(
  (left, right) =>
    (right.extension.priority ?? 0) - (left.extension.priority ?? 0) ||
    left.order - right.order
);

resolvedShortcut.priority ??= plugin.priority;
resolvedInputRule.priority ??= plugin.priority;
```

### Proposed internal shape

```ts
type CompiledExtensionOrder = Readonly<{
  configurationIndex: ReadonlyMap<object, number>;
  dependencyOrder: readonly object[];
}>;

type CompiledLocalOrder<TContribution> = Readonly<{
  contribution: TContribution;
  owner: object;
  sourceIndex: number;
  localPriority: number;
}>;

type CompiledPlateResourceOrder = Readonly<{
  htmlRules: readonly CompiledLocalOrder<unknown>[];
  inputRules: readonly CompiledLocalOrder<unknown>[];
  mimeCodecs: readonly CompiledLocalOrder<unknown>[];
  shortcuts: readonly CompiledLocalOrder<unknown>[];
}>;
```

`configurationIndex` is candidate-local runtime metadata. It is never
serialized. Each resource compiler receives dependency/configuration order and
applies only its own explicit local rule.

### Deletion

- `BasePlugin.priority`, `PluginBase.priority`, and
  `EditorExtension.priority`;
- defaults `100`, `10_000`, `-100`, and every global comparator;
- shortcut/input-rule/codec fallback to plugin priority;
- component and weak-override numeric winner logic;
- tests/docs that imply one plugin can “run before” every unrelated resource.

### Adoption

- Core plugin resolution, dependency expansion, plugin cache construction,
  overrides, components, render rules, shortcuts, input rules, codecs, HTML,
  commands, corrections, lifecycle, and extension configuration.
- Packages with intentional local precedence—media, code block, list, math,
  table, CSV, DOM, input rules—declare it on the competing contribution.
- Application kits settle terminal component/configuration overrides through
  `.configure()`.
- Every removed fallback receives one entry in an ordering ledger: new owner,
  tie rule, conflict rule, and proof.

### Proof and performance

- Generated dependency-DAG permutation laws.
- Changing one shortcut/codec/rule priority cannot reorder any other resource.
- Equal exclusive claims fail with both owner names.
- Command/lifecycle order is stable under unrelated extension insertion.
- Plate terminal configuration beats plugin defaults without numeric tricks.
- Compile/dispatch benchmarks at 10/100/1,000 extensions and plugins; removal
  must not add per-dispatch graph work.

### Ownership and dependencies

- `best-api`: accept absence of global priority and the resource-order table.
- `plate-plan`: primary owner because Plate has most fallbacks/adopters.
- `plite-plan`: delete extension priority and publish the descriptor graph
  ordering.
- `A4` replacement owners land before priority is removed from their current
  plugins. `A6` can land before, with, or after this packet; the source/dependency
  ordering law is unchanged.

### Why this is better than each donor

| Donor       | Judgment                                                                                                                                           |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Wordgard    | Replaces five precedence bands and identity-based flattening with inspectable dependency/configuration order and resource-local conflict rules.    |
| Lexical     | Retains the useful idea that priority belongs to a specific command/resource, but rejects fixed global command bands and ambient mutable dispatch. |
| ProseMirror | Eliminates plugin-array order as the shared precedence mechanism for state, props, filters, appenders, and views.                                  |

---

## A3 — schema-owned exclusive text properties

### Why this clears P1

Compile one structural “at most one active member” relation. Do not expose a
generic cardinality algebra or asymmetric exclusion DSL until another invariant
proves it.

Current evidence:

- Subscript and superscript manually clear each other in
  `packages/basic-nodes/src/lib/BaseSubscriptPlugin.ts:20-28` and
  `BaseSuperscriptPlugin.ts:20-28`.
- Caller-owned `clear` is public in
  `packages/plite/src/interfaces/editor.ts:539-546`.
- The command performs the clear loop in
  `packages/plite/src/editor/toggle-mark.ts:14-55`.

### Current public shape

```ts
import { createBasePlugin } from "@platejs/core";
import { property } from "@platejs/plite";
import { KEYS } from "@platejs/utils";

export const BaseSubscriptPlugin = createBasePlugin({
  key: KEYS.sub,
  schema: {
    mark: property.boolean({
      default: false,
      omitDefault: true,
    }),
  },
  update: ({ editor, tx, type }) => ({
    toggle: () =>
      tx.marks.toggle(type, true, {
        clear: editor.plugin(KEYS.sup).type,
      }),
  }),
});
```

### Proposed public shape

Plate plugin author:

```ts
import { createBasePlugin } from "@platejs/core";
import { property, schema } from "@platejs/plite";
import { KEYS } from "@platejs/utils";

export const ScriptPosition = schema.property.exclusive(
  "plate:script-position"
);

export const BaseSubscriptPlugin = createBasePlugin({
  key: KEYS.sub,
  schema: {
    mark: {
      exclusive: [ScriptPosition],
      property: property.boolean({
        default: false,
        omitDefault: true,
      }),
    },
  },
  update: ({ tx, type }) => ({
    toggle: () => tx.marks.toggle(type),
  }),
});

export const BaseSuperscriptPlugin = createBasePlugin({
  key: KEYS.sup,
  schema: {
    mark: {
      exclusive: [ScriptPosition],
      property: property.boolean({
        default: false,
        omitDefault: true,
      }),
    },
  },
  update: ({ tx, type }) => ({
    toggle: () => tx.marks.toggle(type),
  }),
});
```

Direct Plite schema author:

```ts
import { property, schema, target } from "@platejs/plite";

const ReviewMode = schema.property.exclusive("acme:review-mode");

export const Inserted = schema.textProperty(
  "inserted",
  property.boolean({ default: false, omitDefault: true }),
  {
    exclusive: [ReviewMode],
    target: target.group("textBlock"),
  }
);
```

The descriptor is frozen structural data:

```ts
export type SchemaPropertyExclusiveGroup<TId extends string = string> =
  Readonly<{
    id: TId;
    kind: "schema-property-exclusive";
  }>;
```

Its namespaced ID participates in schema identity. Object identity and
declaration order do not decide conflicts.

### Current internal shape

```ts
type EditorMarkToggleOptions = {
  clear?: string[] | string;
};

type CompiledSchemaProperty = Readonly<{
  descriptor: PropertyValueDescriptor;
  id: string;
  lifecycle: PropertyLifecycle;
  owner: string;
  placement: "element" | "text";
  target: SchemaTarget | null;
}>;
```

Each property validates independently; callers remove siblings before adding a
mark.

### Proposed internal shape

```ts
type CompiledSchemaProperty = Readonly<{
  descriptor: PropertyValueDescriptor;
  exclusiveGroupIds: ReadonlySet<string>;
  id: string;
  lifecycle: PropertyLifecycle;
  owner: string;
  placement: "element" | "text";
  target: SchemaTarget | null;
}>;

type CompiledSchemaPropertyRelations = Readonly<{
  conflictsByPropertyId: ReadonlyMap<string, ReadonlySet<string>>;
  membersByExclusiveGroup: ReadonlyMap<string, ReadonlySet<string>>;
}>;
```

One canonicalizer serves stored marks, direct add/toggle, expanded selections,
slice construction/fitting, codecs, external validation, history replay, and
Yjs import:

```ts
type TextPropertyWrite = Readonly<{
  id: string;
  value: unknown;
}>;

type CanonicalTextPropertyWrite = Readonly<{
  remove: readonly string[];
  set: TextPropertyWrite;
}>;

type YjsExclusivePropertyRegister = Readonly<{
  groupId: string;
  propertyId: string | null;
  version: 1;
}>;
```

Sequential explicit writes use incoming-wins and remove conflicts in the same
`TransactionSpec`. Unordered external values containing multiple members
reject with every conflicting property ID.

The Yjs bridge writes one reserved register per affected text span and
exclusive group in the same Yjs transaction as the public property attributes.
Setting a member writes its property ID; removing the active member writes
`null`. Concurrent group writes therefore contend on one Yjs register key. The
winner is the value visible from the converged Yjs register—Yjs's own item
ordering, not schema, property-key, plugin, or arrival order. Import publishes
only that member, strips the reserved register from Plite JSON, and clears
losing public attributes in the bridge's canonicalization transaction.
History and local `DocumentChange` never carry this transport metadata; their
already-ordered writes keep incoming-wins.

### Deletion

- `EditorMarkToggleOptions.clear` and scalar/array normalization;
- `getClearMarks` and the toggle command's manual removal loop;
- subscript/superscript knowledge of each other;
- toolbar `clear` props and corresponding docs/tests;
- codec, paste, input-rule, direct-write, or Yjs special cases that manually
  enforce the same relation.

### Adoption

- Plite schema declarations, normalization, compiler, identity/fingerprint,
  validation diagnostics, property indexes, canonical construction/fitting,
  add/toggle/stored marks, direct property patches, selection marks, history,
  persistence, and Yjs.
- Plate schema-mark lowering and inference.
- Basic-nodes subscript/superscript and toolbar hooks first; audit other marks
  but add no speculative groups.
- HTML/Markdown/clipboard codecs, fixtures, docs, and examples.

### Proof and performance

- Descriptor and Plate `schema.mark` inference without annotations.
- Symmetry, incoming-wins, idempotence, removal, target-context, stored-mark,
  expanded-selection, split/merge, paste, and codec-order laws.
- External JSON reports all conflicts; reconfiguration rejects an invalid
  current document before publication.
- History undo/redo, persisted history replay, and two-peer Yjs convergence.
- Yjs peers concurrently select different members, remove versus select, and
  reconnect in opposite delivery orders; all converge to the register winner
  with no reserved key in public JSON or `DocumentChange`.
- The donor rebase/compression proof corpus is attached here for
  property-conflict, selection-mapping, skipped-history, and concurrent
  undo/redo schedules; it does not create another architecture packet.
- Constant-time property-to-conflict lookup; a large expanded selection does
  not rescan schema relations per leaf.

### Ownership and dependencies

- `best-api`: accept `schema.property.exclusive` and `exclusive: [...]`.
- `plite-plan`: schema relation, canonicalizer, validation, history/Yjs proof.
- `plate-plan`: schema lowering, mark plugins, toolbar, codecs, docs.
- Independent of ordered content grammar and the other five packets.

### Why this is better than each donor

| Donor       | Judgment                                                                                                                                                                          |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Wordgard    | Preserves mark-set algebra laws without ranked nominal `Mark` instances or render/parse shapes in model core.                                                                     |
| Lexical     | Prevents invalid combinations at compiled schema construction instead of relying on node methods, command listeners, or class-specific transforms.                                |
| ProseMirror | Steals schema-owned mark exclusion while replacing string expressions, rank, class identity, and single-root assumptions with typed structural descriptors and canonical changes. |

---

## A4 — hard-cut query middleware into narrow read policies and complete selection specs

### Why this clears P1

Delete the 43-method query interception matrix. Replace its five production
registrations with exactly three narrow extension contributions and two fields
on the existing structural selection spec:

1. `mergeTarget` decides whether a previous merge target is removed;
2. `selectability` decides dynamic node selectability;
3. `exportSlice` projects externally exported `ContentSlice`;
4. selection-spec `slice` owns custom-selection content;
5. selection-spec `marks` owns custom-selection marks.

Rename selection-spec/read `domRange` to `primaryRange` in the same hard cut.
No `defineSelection` constructor and no generic `nodePolicy` bag are added.

Current evidence:

- Public matrix:
  `packages/plite/src/interfaces/editor.ts:1367-1559`.
- recursive runtime:
  `packages/plite/src/core/query-middleware.ts`.
- five registrations:
  `OverridePlugin.ts:500-529`, `TogglePlugin.tsx:100-109`,
  `excludeDiffFromFragment.ts:30-39`,
  `BaseTablePlugin.ts:2543-2581,3046-3088`.
- existing structural spec:
  `packages/plite/src/interfaces/editor.ts:2184-2200`.

### Current public shape

```ts
import { defineEditorExtension, type Descendant } from "@platejs/plite";

declare function removePreviousForPlate(
  previous: readonly [unknown, readonly number[]],
  current: readonly [unknown, readonly number[]]
): boolean;
declare function isInsideClosedToggle(element: unknown): boolean;
declare function stripDiff(
  fragment: readonly Descendant[]
): readonly Descendant[];
declare function tableFragment(
  fallback: readonly Descendant[]
): readonly Descendant[];
declare function tableMarks(
  fallback: Readonly<Record<string, unknown>> | null
): Readonly<Record<string, unknown>> | null;

export const CurrentReadOverrides = defineEditorExtension({
  name: "current-read-overrides",
  queries: {
    fragment: {
      get({ next }) {
        return tableFragment(stripDiff(next()));
      },
    },
    marks: {
      get({ next }) {
        return tableMarks(next());
      },
    },
    nodes: {
      isSelectable({ element, next }) {
        return isInsideClosedToggle(element) ? false : next();
      },
      shouldMergeNodesRemovePrevNode({ current, previous, next }) {
        return removePreviousForPlate(previous, current) ? true : next();
      },
    },
  },
});
```

This compressed example uses the same public interception contracts as the five
live registrations; the live implementations remain in their four packages.

Current custom selection:

```ts
import type { EditorSelectionSpec, Range } from "@platejs/plite";

type TableCellSelection = Range & {
  cells: readonly Range[];
  kind: "table-cell";
};

declare module "@platejs/plite" {
  interface EditorSelectionKindMap {
    "table-cell": TableCellSelection;
  }
}

declare const codec: EditorSelectionSpec<TableCellSelection>["codec"];
declare function isTableCellSelection(value: TableCellSelection): boolean;

export const CurrentTableSelection = {
  codec,
  domRange: (selection) => ({
    anchor: selection.anchor,
    focus: selection.anchor,
  }),
  kind: "table-cell",
  ranges: (selection) => selection.cells,
  replacementRange: (selection) => selection,
  validate: isTableCellSelection,
} satisfies EditorSelectionSpec<TableCellSelection>;
```

### Proposed public shape

The three narrow contribution types are final:

```ts
import type {
  ContentSlice,
  Editor,
  EditorStateView,
  Node,
  NodeEntry,
  Value,
  ValueOf,
} from "@platejs/plite";

export type EditorMergeTargetDecision = "merge" | "remove";

export type EditorMergeTargetPolicy<TEditor extends Editor = Editor> = (
  context: Readonly<{
    current: NodeEntry;
    editor: TEditor;
    previous: NodeEntry;
    state: EditorStateView<ValueOf<TEditor>>;
  }>
) => EditorMergeTargetDecision | undefined;

export type EditorSelectabilityGuard<TEditor extends Editor = Editor> = (
  context: Readonly<{
    editor: TEditor;
    element: Node;
    state: EditorStateView<ValueOf<TEditor>>;
  }>
) => false | undefined;

export type EditorExportSliceProjection<V extends Value = Value> = (
  context: Readonly<{
    slice: ContentSlice<V>;
    state: EditorStateView<V>;
  }>
) => ContentSlice<V>;
```

One extension may contribute one function for each job:

```ts
import {
  ContentSlice,
  defineEditorExtension,
  ElementApi,
  type Descendant,
  type NodeEntry,
  TextApi,
} from "@platejs/plite";

declare function isInsideClosedToggle(element: unknown): boolean;
declare function isEmptyPlateMergeTarget(
  previous: NodeEntry,
  current: NodeEntry
): boolean;
declare function shouldRemoveEmptyPlateTarget(
  previous: NodeEntry,
  current: NodeEntry
): boolean;
declare function stripDiff(
  fragment: readonly Descendant[]
): readonly Descendant[];

export const PlateMergeTarget = defineEditorExtension({
  name: "plate-merge-target",
  mergeTarget({ current, previous }) {
    const [previousNode, previousPath] = previous;

    if (
      TextApi.isText(previousNode) &&
      previousNode.text === "" &&
      previousPath.at(-1) !== 0
    ) {
      return "remove";
    }
    if (
      ElementApi.isElement(previousNode) &&
      isEmptyPlateMergeTarget(previous, current)
    ) {
      return shouldRemoveEmptyPlateTarget(previous, current)
        ? "remove"
        : "merge";
    }

    return undefined;
  },
});

export const ClosedToggleSelectability = defineEditorExtension({
  name: "closed-toggle-selectability",
  selectability({ element }) {
    return isInsideClosedToggle(element) ? false : undefined;
  },
});

export const ExcludeDiffExport = defineEditorExtension({
  name: "exclude-diff-export",
  exportSlice({ slice }) {
    return ContentSlice.fromJSON({
      ...slice,
      content: stripDiff(slice.content),
      ...(slice.roots
        ? {
            roots: Object.fromEntries(
              Object.entries(slice.roots).map(([root, children]) => [
                root,
                stripDiff(children),
              ])
            ),
          }
        : {}),
    });
  },
});
```

Composition is fixed:

- `mergeTarget`: order-independent; any `'merge'` veto wins, otherwise any
  `'remove'` wins, otherwise the Plite default decides;
- `selectability`: compiled schema must allow selection and every guard must
  return `undefined`; any `false` veto wins;
- `exportSlice`: every projection runs once in dependency/configuration order;
- none receives `next`;
- policies are pure reads and cannot start updates.

The table selection owns both table query results:

```ts
import {
  ContentSlice,
  type EditorMarks,
  type EditorSelectionSpec,
  type EditorStateView,
  type Range,
} from "@platejs/plite";

type TableCellSelection = Range & {
  cells: readonly Range[];
  kind: "table-cell";
};

declare module "@platejs/plite" {
  interface EditorSelectionKindMap {
    "table-cell": TableCellSelection;
  }
}

declare const codec: EditorSelectionSpec<TableCellSelection>["codec"];
declare function isTableCellSelection(value: TableCellSelection): boolean;
declare function getTableCellMarks(
  selection: TableCellSelection,
  state: EditorStateView
): EditorMarks | null;
declare function getTableCellSlice(
  selection: TableCellSelection,
  state: EditorStateView
): ContentSlice;

export const TableCellSelectionSpec = {
  codec,
  kind: "table-cell",
  marks: getTableCellMarks,
  primaryRange: (selection) => ({
    anchor: selection.anchor,
    focus: selection.anchor,
  }),
  ranges: (selection) => selection.cells,
  replacementRange: (selection) => selection,
  slice: getTableCellSlice,
  validate: isTableCellSelection,
} satisfies EditorSelectionSpec<TableCellSelection>;
```

Common reads become:

```ts
import type { Editor } from "@platejs/plite";
import type { DOMEditor } from "@platejs/plite-dom";

export function readSelectionRanges(editor: Editor) {
  return editor.read.selection.primaryRange();
}

export function resolveBrowserRange(editor: DOMEditor) {
  const range = editor.read.selection.primaryRange();

  return range ? editor.api.dom.resolveDOMRange(range) : null;
}

export function readContentLeavingEditor(editor: Editor) {
  return editor.read.slice.export();
}
```

`primaryRange` is a model range. Browser conversion remains visibly owned by
`editor.api.dom`. `editor.read.slice.get()` remains the canonical
selection-aware model slice; only `editor.read.slice.export()` runs export
projections.

### Current internal shape

```ts
type QueryRegistry = Map<string, readonly EditorQueryMiddleware[]>;

const DEFAULT_DEPTH = new WeakMap<Editor, number>();
const QUERY_DEPTH = new WeakMap<Editor, number>();

executeQueryMiddleware(group, method, args, defaultRead);
```

Every read wrapper knows about middleware, including generator lifetime and
recursive `next()` bookkeeping.

### Proposed internal shape

```ts
type CompiledReadPolicies = Readonly<{
  mergeTargets: readonly EditorMergeTargetPolicy[];
  selectability: readonly EditorSelectabilityGuard[];
  selectionSpecs: ReadonlyMap<string, CompiledSelectionSpec>;
  sliceExports: readonly EditorExportSliceProjection[];
}>;

type CompiledSelectionSpec = Readonly<{
  codec: EditorValueCodec<EditorSelection>;
  kind: string;
  map?: SelectionMap;
  marks?: SelectionMarks;
  primaryRange?: SelectionPrimaryRange;
  ranges?: SelectionRanges;
  replacementRange?: SelectionReplacementRange;
  slice?: SelectionSlice;
  validate: SelectionValidator;
}>;
```

Core reads call their direct owner. Only merge transformation consults
`mergeTargets`, reducing every result so a conservative `'merge'` veto cannot
be defeated by source order. Only navigation/selection consults
`selectability`, after compiled schema, and any `false` veto wins. Only
external slice export runs `sliceExports`; only custom selection projection
consults its spec.

### Deletion

- `EditorQueryMiddlewareArgs`, `EditorQueryMiddlewareResult`,
  `EditorQueryMiddlewareContext`, `EditorQueryMiddlewareMap`;
- `EditorExtension.queries`, query registry maps, keys, depth WeakMaps,
  generator wrappers, `query-middleware.ts`, and all 43 interception wrappers;
- generic query-middleware tests and docs;
- model `domRange` from state/read/update wrappers, selection protocol, table,
  React selection projection, tests, and docs.

### Adoption

| Current registration             | Final owner                                                                            |
| -------------------------------- | -------------------------------------------------------------------------------------- |
| Plate empty merge target         | `mergeTarget` contribution in OverridePlugin                                           |
| closed-toggle node selectability | `selectability` contribution in Toggle                                                 |
| diff fragment cleanup            | `exportSlice` contribution in Diff                                                     |
| table selected fragment          | `TableCellSelectionSpec.slice`                                                         |
| table selected marks             | `TableCellSelectionSpec.marks`                                                         |
| model `domRange`                 | `primaryRange` on state/read/spec; DOM call sites explicitly resolve through `api.dom` |

React, table, toggle, diff, OverridePlugin, AI/selection-fragment consumers,
clipboard export, tests, and docs adopt in one hard cut.

### Proof and performance

- Merge order-independence and `'merge'` veto, selectability false-veto,
  export projection order, undefined fallback, and purity laws.
- Full regression parity for Plate empty merge behavior, including plugin
  `rules.merge.removeEmpty` and match overrides.
- Closed-toggle pointer/keyboard navigation.
- Diff copy/export and table rectangle copy across Chromium, Firefox, WebKit,
  and mobile viewport.
- Table multi-cell marks and replacement behavior.
- Custom-selection mapping/codec/primary range and real DOM resolution.
- Zero-policy read benchmark must become a direct call with no registry lookup;
  generator reads carry no middleware wrapper.
- The donor composition/DOM-change proof gauntlet remains attached to the
  retained selection/DOM runtime: model/DOM offset agreement, composition
  update/end ordering, selection-only mutation batches, native
  enter/backspace/type-over, shadow-root ownership, and geometry. Failures
  repair existing owners; they do not create another packet.

### Ownership and dependencies

- `best-api`: accept the three exact policy names/results and the two selection
  fields.
- `plite-plan`: types, compilers, direct reads, selection protocol, full query
  machinery deletion.
- `plate-plan`: migrate all five registrations plus table/React adopters.
- Descriptor/configuration order from `A6`/`A2` defines policy order, but the
  narrow APIs can land first using existing stable source order.

### Why this is better than each donor

| Donor       | Judgment                                                                                                                           |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Wordgard    | Keeps extensible selection behavior without class registration, global positions, or precedence-ordered universal facets.          |
| Lexical     | Keeps table/custom-selection expressiveness without closed selection classes, node methods, and DOM/model ownership in one module. |
| ProseMirror | Replaces `someProp`/plugin callback-bag interception with three named jobs and one structural selection owner.                     |

---

## A5 — clipboard transport belongs to `plite-dom`

### Why this clears P1

Plain `@platejs/plite` exports `ContentSlice` and fitting, but no
`DataTransfer`, clipboard middleware, or `editor.api.clipboard`. Installing
`dom()` contributes the typed clipboard API. `plite-dom` owns handler
aggregation, browser payloads, host codecs, MIME policy, fallback, and errors.

Current evidence:

- Core `DataTransfer` contracts and mandatory API:
  `packages/plite/src/interfaces/editor.ts:1912-1952`.
- Core extension slot:
  `packages/plite/src/interfaces/editor.ts:2097-2133`.
- Core lowering:
  `packages/plite/src/core/editor-extension.ts:841-861`.
- Actual transport:
  `packages/plite-dom/src/plugin/dom-clipboard-runtime.ts`.
- Table imports exact payload helpers from
  `@platejs/plite-dom/internal` in `packages/table/src/lib/BaseTablePlugin.ts`.

### Current public shape

```ts
import { createEditor, defineEditorExtension } from "@platejs/plite";

export const ImageClipboard = defineEditorExtension({
  name: "image-clipboard",
  clipboard: {
    insertData(data, { next, tx }) {
      const url = data.getData("text/uri-list");

      if (!url) return next(data);
      tx.nodes.insert({
        children: [{ text: "" }],
        type: "image",
        url,
      });

      return true;
    },
  },
});

const editor = createEditor({
  extensions: [ImageClipboard],
  initialValue: [{ children: [{ text: "" }], type: "paragraph" }],
});

editor.api.clipboard.insertData(new DataTransfer());
```

The headless core type and runtime name browser transport even without a DOM
host.

### Proposed public shape

Core-only editor:

```ts
import { createEditor } from "@platejs/plite";

const headless = createEditor({
  initialValue: [{ children: [{ text: "" }], type: "paragraph" }],
});

// @ts-expect-error Clipboard exists only when a host contributes it.
headless.api.clipboard;
```

Direct DOM extension author:

```ts
import {
  createEditor,
  defineEditorExtension,
  type EditorUpdateTransaction,
} from "@platejs/plite";
import { clipboardHandler, dom } from "@platejs/plite-dom";

declare function insertImageData(
  data: DataTransfer,
  transaction: EditorUpdateTransaction
): boolean;

export const ImageClipboard = defineEditorExtension({
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
  extensions: [dom(), ImageClipboard] as const,
  initialValue: [{ children: [{ text: "" }], type: "paragraph" }],
});

const transfer = new DataTransfer();

editor.api.clipboard.insertData(transfer);
const exact = editor.api.clipboard.readSlice(transfer);

if (exact.kind === "slice") {
  editor.api.clipboard.writeSlice(transfer, { slice: exact.slice });
}
```

`clipboardHandler()` returns an opaque descriptor-owned DOM output. Handlers
run in dependency/configuration order. `next()` delegates once to the remaining
handlers and then to exact-slice, host-codec, and text fallback; a second call
throws. A handler may replace the `DataTransfer` passed downstream. Claimed but
malformed exact data is consumed as an invalid payload and never silently
downgrades to HTML.

Plate plugin author:

```ts
import { createBasePlugin } from "@platejs/core";
import type { EditorUpdateTransaction } from "@platejs/plite";

declare function insertImageData(
  data: DataTransfer,
  transaction: EditorUpdateTransaction
): boolean;

export const ImagePlugin = createBasePlugin({
  clipboard: {
    insertData(data, { next, transaction }) {
      return insertImageData(data, transaction) || next(data);
    },
  },
  key: "image",
});
```

Plate's compiler lowers this sugar to `clipboardHandler()`; it does not
recreate a Plite-core clipboard slot.

Exact table transport:

```ts
import { ContentSlice } from "@platejs/plite";
import type { DOMEditor } from "@platejs/plite-dom";

export function writeTableClipboard(editor: DOMEditor, transfer: DataTransfer) {
  const table = {
    children: [
      {
        children: [
          {
            children: [{ text: "A1" }],
            type: "td",
          },
        ],
        type: "tr",
      },
    ],
    type: "table",
  };

  editor.api.clipboard.writeSlice(transfer, {
    formats: {
      "text/csv": "A1",
      "text/tab-separated-values": "A1",
    },
    slice: ContentSlice.closed([table]),
  });
}
```

Exact table reads distinguish absence from a claimed malformed envelope:

```ts
import type { DOMEditor } from "@platejs/plite-dom";

export function readTableClipboard(editor: DOMEditor, transfer: DataTransfer) {
  const exact = editor.api.clipboard.readSlice(transfer);

  if (exact.kind === "invalid") return { handled: true } as const;
  if (exact.kind === "absent") return { handled: false } as const;

  return { handled: true, slice: exact.slice } as const;
}
```

The final API is:

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
  next(data?: DataTransfer): boolean;
  transaction: EditorUpdateTransaction<V>;
}>;

export type DOMClipboardHandler<V extends Value = Value> = Readonly<{
  insertData(
    data: DataTransfer,
    context: DOMClipboardInsertContext<V>
  ): boolean;
}>;

export type DOMClipboardApi<V extends Value = Value> = Readonly<{
  insertData(data: DataTransfer): boolean;
  readSlice(
    data: Pick<DataTransfer, "getData" | "types">
  ): ClipboardSliceRead<V>;
  writeSelection(data: Pick<DataTransfer, "getData" | "setData">): void;
  writeSlice(
    data: Pick<DataTransfer, "getData" | "setData">,
    payload: ClipboardSliceWrite<V>
  ): void;
}>;
```

The host-package output substrate shipped by this packet is:

```ts
declare const editorExtensionOutputValue: unique symbol;

export type EditorExtensionOutput<TValue> = Readonly<{
  descriptor: EditorExtensionOutputDescriptor<TValue>;
  [editorExtensionOutputValue]: TValue;
}>;

export type EditorExtensionOutputDescriptor<TValue> = Readonly<{
  id: string;
  of(value: TValue): EditorExtensionOutput<TValue>;
}>;

export declare function defineExtensionOutput<TValue>(
  id: string
): EditorExtensionOutputDescriptor<TValue>;

export type EditorExtension = Readonly<{
  // Existing fields omitted.
  outputs?: readonly EditorExtensionOutput<unknown>[];
}>;

export type EditorExtensionConfigurationContext = Readonly<{
  outputs<TValue>(
    descriptor: EditorExtensionOutputDescriptor<TValue>
  ): readonly TValue[];
}>;
```

`plite-dom` defines the opaque author helper without a string lookup:

```ts
import { defineExtensionOutput } from "@platejs/plite";

import type { DOMClipboardHandler } from "./clipboard-types";

const clipboardHandlers = defineExtensionOutput<DOMClipboardHandler>(
  "plite-dom:clipboard-handler"
);

export const clipboardHandler = clipboardHandlers.of;
```

The descriptor object owns type identity; its string is diagnostics only.
`outputs(descriptor)` is available to extension compilers for genuine
multi-provider aggregation, not dependency API lookup. Ordinary feature
authors only call `clipboardHandler()`.

### Current internal shape

```ts
type EditorExtension = {
  clipboard?: EditorClipboardMiddlewareMap;
};

type EditorCoreApiGroups = {
  clipboard: EditorClipboardApi;
};

type EditorExtensionRegistry = {
  capabilities: Map<string, unknown[]>;
};
```

Core registers `"clipboard.insertData"` and creates a fallback chain around a
`DataTransfer`.

### Proposed internal shape

```ts
type CompiledDOMClipboardRuntime<V extends Value> = Readonly<{
  handlers: readonly DOMClipboardHandler<V>[];
  hostCodecs: readonly CompiledHostCodec<V>[];
  readSlice(
    data: Pick<DataTransfer, "getData" | "types">
  ): ClipboardSliceRead<V>;
  writeSlice(
    data: Pick<DataTransfer, "getData" | "setData">,
    payload: ClipboardSliceWrite<V>
  ): void;
}>;

type CompiledExtensionOutputs = ReadonlyMap<
  EditorExtensionOutputDescriptor<unknown>,
  readonly Readonly<{
    owner: object;
    sourceIndex: number;
    value: unknown;
  }>[]
>;
```

`clipboardHandler()` returns a typed contribution keyed by a private
`plite-dom` descriptor. The generic candidate registry can aggregate typed
descriptor values, but ordinary authors never call
`capabilities<T>(string)`. `dom()` compiles those values with host codecs and
publishes `api.clipboard` only after the whole candidate succeeds. The
discriminated read result is mandatory: it lets table and other adopters reject
a malformed claimed envelope without importing private MIME parsing or
silently accepting weaker HTML.

Exact Plite model-core responsibility ends at:

```ts
type ModelClipboardBoundary = Readonly<{
  fit(slice: ContentSlice): false | TransactionSpec;
  replace(slice: ContentSlice): false | TransactionSpec;
}>;
```

### Deletion

- Core `EditorClipboard*` types, `EditorCoreApiGroups.clipboard`,
  `EditorExtension.clipboard`, and all core `DataTransfer` references;
- core clipboard fallback/capability registration and special lifecycle error;
- table imports of `readDOMFragmentData`, `writeDOMHostFragmentData`, and
  clipboard format internals;
- Plate lowering into a core clipboard extension slot.

### Adoption

- `plite-dom` runtime and exports, DOM extension typing, host codecs, exact
  fragment envelope, Trusted Types, structured error sink.
- `plite-react` input strategy and projected clipboard.
- Plate core plugin DSL and compiler.
- Media/image/file handlers, table CSV/TSV, code block/plain text, Markdown,
  HTML, input rules, diff slice export, custom selections, tests, docs.

### Proof and performance

- Core declaration/output scan contains no `DataTransfer` and core-only editor
  has no clipboard API.
- DOM-installed inference exposes the API without casts.
- Exact slice, open edges, roots, HTML, plain text, CSV, TSV, files, and custom
  selection round trips.
- Malformed private payload, context wrappers, Trusted Types/injection,
  partial DOM, shadow root, and provider failure isolation.
- Cross-editor table copy/paste in Chromium, Firefox, WebKit, mobile viewport.
- Attach the ProseMirror clipboard context/security corpus and the clipboard
  rows from the browser harvest here; no parallel protocol or fitter.
- Handler dispatch and large-slice encode/decode benchmarks stay within current
  budgets and perform fitting once.

### Ownership and dependencies

- `best-api`: accept `clipboardHandler()`, the discriminated `readSlice`,
  `writeSlice`, and Plate sugar exactly as shown.
- `plite-plan`: generic typed contribution substrate if needed, core deletion,
  and DOM publication boundary.
- `plate-plan`: plugin DSL plus media/table/codec adoption.
- Preserve `ContentSlice`, compiled schema, fitter, host codecs, and lifecycle
  error sink. `A6` descriptor identity may back contributions but optional
  dependencies are not required.

### Why this is better than each donor

| Donor       | Judgment                                                                                                                                                              |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Wordgard    | Keeps open-slice/context behavior while moving DOM/HTML transport out of model core and preserving JSON structural slices.                                            |
| Lexical     | Keeps broad clipboard behavior without class-node MIME identity or browser events in the editor substrate.                                                            |
| ProseMirror | Keeps its strongest context-wrapper/security/fitting semantics while avoiding a second clipboard fitter, integer positions, and monolithic imperative view ownership. |

---

## A6 — descriptor-owned required dependencies and conflicts

### Why this clears P2

The canonical extension object returned by `defineEditorExtension` is its own
runtime descriptor. `dependencies` and `conflicts` reference those descriptors.
Required dependencies install transitively and determine topological order.
Hard-cut `peerDependencies`; optional capability is explicit application
composition, not a service locator.

Current evidence:

- strings in `packages/plite/src/interfaces/editor.ts:2117-2132`;
- validation and traversal in
  `packages/plite/src/core/editor-extension.ts:1236-1310`;
- caller-chosen `capabilities<T>(name)` in
  `packages/plite/src/interfaces/editor.ts:1958-1998`;
- Plate already authors descriptor dependencies and lowers them to strings.

### Current public shape

```ts
import { createEditor, defineEditorExtension } from "@platejs/plite";

export const HostExtension = defineEditorExtension({
  api: {
    host: {
      read: () => "host",
    },
  },
  name: "host",
});

export const ConsumerExtension = defineEditorExtension({
  api(_editor, context) {
    const host = context.capabilities<{
      read(): string;
    }>("host")[0];

    return {
      consumer: {
        read: () => host?.read(),
      },
    };
  },
  dependencies: ["host"],
  name: "consumer",
  peerDependencies: ["optional-dom"],
});

const editor = createEditor({
  extensions: [HostExtension, ConsumerExtension] as const,
});

editor.getApi(ConsumerExtension).read();
```

The dependency string, peer string, capability string, and caller generic are
not connected by TypeScript.

### Proposed public shape

```ts
import { createEditor, defineEditorExtension } from "@platejs/plite";

export const HostExtension = defineEditorExtension({
  api: {
    host: {
      read: () => "host",
    },
  },
  name: "host",
});

export const ConsumerExtension = defineEditorExtension({
  api(editor) {
    const host = editor.getApi(HostExtension);

    return {
      consumer: {
        read: () => host.read(),
      },
    };
  },
  dependencies: [HostExtension],
  name: "consumer",
});

const editor = createEditor({
  // HostExtension is installed transitively and appears in the inferred API.
  extensions: [ConsumerExtension] as const,
});

editor.getApi(ConsumerExtension).read();
editor.getApi(HostExtension).read();
```

Descriptor conflicts use the same identity:

```ts
import { defineEditorExtension } from "@platejs/plite";

export const DOMHost = defineEditorExtension({
  name: "dom-host",
});

export const TestDOMHost = defineEditorExtension({
  conflicts: [DOMHost],
  name: "test-dom-host",
});
```

No `defineExtensionKey`, `optionalDependencies`, `context.optional`,
`getPeer`, or public generic output lookup is added.

Required dependency laws:

1. The descriptor recursively enters the candidate exactly once.
2. Explicitly configured roots own one reference; dependency edges own derived
   references.
3. Removing a root removes only transitively installed descriptors whose
   explicit and required reference counts reach zero.
4. Dependencies compile before consumers and clean up after consumers.
5. Same stable name plus different canonical descriptor rejects with both
   owners in the diagnostic.
6. Conflicts are checked symmetrically across the complete candidate.
7. Descriptor identity is process-local configuration truth only; persistence,
   history, Yjs, schema IDs, and document JSON use stable structural IDs.

### Current internal shape

```ts
type RegisteredEditorExtension = {
  conflicts: readonly string[];
  dependencies: readonly string[];
  name: string;
  order: number;
  peerDependencies: readonly string[];
};

type EditorExtensionRegistry = {
  capabilities: Map<string, unknown[]>;
  extensions: Map<string, RegisteredEditorExtension>;
};
```

### Proposed internal shape

```ts
type CanonicalEditorExtension = Readonly<EditorExtension>;

type CompiledEditorExtension = Readonly<{
  conflicts: readonly CanonicalEditorExtension[];
  dependencies: readonly CanonicalEditorExtension[];
  descriptor: CanonicalEditorExtension;
  explicitOwners: number;
  name: string;
  order: number;
  requiredBy: ReadonlySet<CanonicalEditorExtension>;
}>;

type EditorExtensionRegistry = Readonly<{
  byDescriptor: ReadonlyMap<CanonicalEditorExtension, CompiledEditorExtension>;
  byName: ReadonlyMap<string, CompiledEditorExtension>;
  dependencyOrder: readonly CanonicalEditorExtension[];
  revision: number;
}>;
```

API factories resolve against the detached candidate registry. `editor.getApi`
accepts a descriptor and infers its API; it never scans a string capability
bag. Typed multi-provider contributions, when a real aggregate job exists such
as `A5`, use their own typed descriptor and registry—not dependency API lookup.

### Deletion

- string `dependencies`, `peerDependencies`, and `conflicts`;
- `peerDependencies` entirely;
- public caller-generic `capabilities<T>(string)` for dependency API access;
- descriptor-to-name lowering in Plate;
- typo-only runtime tests and duplicated name plumbing;
- any optional peer/service-container proposal.

### Adoption

- Plite extension types, canonicalization, graph expansion, candidate API
  factories, validation, dynamic extend/reconfigure ownership, registry/debug
  view, activation, cleanup, and type inference.
- DOM/React conflict declarations and host extensions.
- Plate `BasePlugin.dependencies`, plugin-source resolution, extension
  lowering, inferred plugin API/read/update groups, kits, tests, docs.
- Aggregate host codec/clipboard output stays owned by `A5`.

### Proof and performance

- Required API inference, wrong-descriptor rejection, recursive inference, and
  Plate dependency inference without explicit callback annotations.
- Random DAG topological order and input-permutation laws.
- Cycle, conflict, duplicate-name/different-descriptor, candidate invisibility,
  rollback, activation failure, reverse cleanup, reconfigure replacement,
  removal, and transitive reference counting.
- Multi-root configuration publication remains one revision.
- Compile/reconfigure benchmarks at 10/100/1,000 descriptors; registry records
  remain bounded after repeated install/remove.

### Ownership and dependencies

- `best-api`: accept descriptor edges, transitive install, ref-count removal,
  and the complete absence of optional peer lookup.
- `plite-plan`: graph, registry, publication, lifecycle, types, deletion.
- `plate-plan`: direct descriptor lowering and downstream adoption.
- May land before, with, or after `A2`; it replaces edge identity without
  changing the accepted ordering law. `A5` may reuse the same candidate
  registry for typed aggregate contributions.

### Why this is better than each donor

| Donor       | Judgment                                                                                                                                                                                  |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Wordgard    | Keeps atomic reconfiguration while replacing identity-deduped precedence bands and implicit facet dependency behavior with explicit typed graph edges.                                    |
| Lexical     | Steals descriptor inference and transitive required installation, but rejects mutable builder phases, reactive config, optional peer service lookup, and class-dependent output identity. |
| ProseMirror | Replaces plugin-array order and process-global plugin keys with typed descriptors, candidate validation, rollback, and explicit conflicts.                                                |

---

## Complete donor dispositions

The per-reference ledgers contain one independent judgment for every atomic
concept: Wordgard 73, Lexical 48, and ProseMirror 64. This family ledger closes
the final target without hiding a donor mechanism behind grouped praise.

| Donor mechanism family                                              | Final verdict                     | Reason                                                                                                                                                        |
| ------------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Immutable change algebra, changed ranges, open fitted slices        | `keep` Plite; mine laws           | `DocumentChange` and `ContentSlice` are JSON-native, root-aware, serialized, and already shared across transactions, history, Yjs, mapping, and invalidation. |
| Ordered content automata and schema-aware fill/wrap                 | evidence-backed `defer`           | Semantically stronger, but retained Plate structures do not yet fund the public AST, compiler, fitter/cache rewrite, and ecosystem adoption.                  |
| Mark-set exclusions                                                 | `rearchitect` as `A3`             | The invariant belongs to schema; Plite needs one structural exclusive relation, not donor strings or nominal marks.                                           |
| Typed extension descriptors and required dependencies               | `steal` as `A6`                   | Lexical's inference is stronger; Plite's detached atomic candidate and structural identity remain stronger.                                                   |
| Optional dependency/service lookup                                  | `reject`                          | Plate composition explicitly selects product capabilities; a service locator makes absence implicit and configuration order harder to inspect.                |
| Compartments and atomic reconfiguration                             | `keep` Plite                      | Plite already compiles, validates, migrates, publishes, rolls back, and cleans detached candidates atomically.                                                |
| Automatic facet dependency tracking                                 | `reject`                          | Explicit dependencies remain deterministic, serializable, inspectable, and agent-readable.                                                                    |
| Reactive extension signals and mutable builder phases               | `reject`                          | They add a second runtime and weaken atomic configuration truth.                                                                                              |
| Mutable plugin option/state bag                                     | `hard-cut` as `A1`                | Immutable compiler inputs and editor-local process/UI state are different concepts.                                                                           |
| General plugin props, read interception, append transactions        | `hard-cut` through `A4` or reject | Broad continuation machinery hides semantic ownership; each demonstrated job gets one narrow owner.                                                           |
| Global priority, rank, or precedence bands                          | `hard-cut` as `A2`                | One scalar cannot truthfully order dependencies, commands, codecs, components, listeners, APIs, and lifecycle.                                                |
| Capability-local parse/input/shortcut priority                      | `keep`                            | Competing rules inside one compiler are the valid home for local precedence.                                                                                  |
| Declarative schema-linked HTML/Markdown codecs                      | `keep` Plite/Plate                | The current host compiler is more typed, JSON-native, multi-root-aware, and atomically published.                                                             |
| Clipboard transport and browser `DataTransfer` in core              | `move` through `A5`               | DOM transport, exact envelopes, host codecs, fallbacks, and browser failures belong to `plite-dom`.                                                           |
| Native DOM reconciliation, composition, mobile phase choice, observer repair | `keep`; mine donor proof; defer device claim | Plite's explicit strategy and bounded scheduler are stronger overall. Wordgard's default mobile Enter/Backspace phase choice is useful pressure, but its blanket keymap bypass is rejected and local routing changes wait for raw-device proof. |
| Imperative tile/ViewDesc renderer                                   | evidence-backed `defer`           | No non-React consumer or benchmark justifies a second renderer and parity burden.                                                                             |
| Decoration, annotation, and widget mapping                          | `keep` Plite                      | Separate public concepts over one private invalidation/lifecycle kernel are cleaner than a public tree or mega-layer.                                         |
| Extensible selections, affinity, goal column, bidi/Unicode movement | `keep`; extend through `A4`       | Tagged structural selections and anchors beat class registries and raw integer positions.                                                                     |
| Model callback named `domRange`                                     | `hard-cut` inside `A4`            | It returns a model range; DOM conversion already has a distinct host owner.                                                                                   |
| History grouping, rebasing, compression, persistence                | `keep`; mine laws                 | Versioned canonical changes/effects beat live steps or descriptor identity.                                                                                   |
| Central-version OT or donor collaboration protocol                  | `reject`                          | Yjs remains transport/CRDT; canonical change laws and donor schedules remain useful proof.                                                                    |
| Table maps, cell selections, grid paste                             | `keep` Plate; adopt `A4`/`A5`     | Product geometry belongs to the table plugin, with substrate selection and transport contracts only.                                                          |
| Class nodes, class marks, live schema/type identity                 | `reject`                          | They weaken JSON portability, structural typing, duplicate-package safety, multi-root documents, persistence, and Yjs.                                        |
| Raw public integer positions and one privileged root                | `reject`                          | Paths, anchors, root keys, and snapshot indexes are the stronger local model.                                                                                 |
| Global step/selection/plugin registries                             | `reject`                          | Versioned structural codecs and editor-local compiled registries are safer.                                                                                   |
| Node-local state/property bags                                      | evidence-backed `defer`           | Typed schema properties, fields, facets, effects, annotations, and projections already cover the valid jobs.                                                  |
| Snapshot cursor or public offset view                               | evidence-backed `defer`           | Reopen only on a measured traversal/input bottleneck that indexes cannot solve.                                                                               |
| Public changed-root iteration/root transaction view                 | evidence-backed `defer`           | One private scoped-update consumer does not fund an ambient public root context.                                                                              |
| Bulk anchor registry rewrite                                        | evidence-backed `defer`           | Shared indexes already exist; require a current anchor-mapping benchmark failure.                                                                             |
| Compiled plugin portals                                             | evidence-backed `defer`           | Require measured construction/lookup cost and a lifecycle-safe cache.                                                                                         |
| One internal descriptor kernel                                      | `move` to `architecture-cleanup`  | It is code-shape work until compile-time, inference, defect, or runtime value is demonstrated.                                                                |
| Product nodes, menus, dialogs, CSS, i18n, devtools                  | `move` or `reject` as substrate   | Plate, registry, or application owners fit these jobs; Plite should not absorb donor product surface.                                                         |
| Dragon/UA folklore                                                  | evidence-backed `defer`           | Require a reproducible browser failure; copy behavior, not folklore.                                                                                          |
| ProseMirror search/track-change display models                      | `move/defer`                      | Plate may lower from `DocumentChange` when a real product consumer exists.                                                                                    |
| ProseMirror website source                                          | exact evidence limit              | Its configured remote was inaccessible; all 20 package repos, package docs, source, and tests remain fully audited.                                           |

## Evidence-backed defers

### Ordered content grammar (former draft row) — defer

ProseMirror's regular child language is semantically stronger than Plite's
set-plus-global-cardinality program. It still does not clear the current
material-value gate:

- the strongest invalid-order example is maintenance-only `list-classic`;
- retained table, code, layout, media, callout, and modern-list schemas mostly
  use homogeneous/repeated child classes;
- trailing/single-block/single-line plugins combine dynamic match, merge,
  newline, and insertion policy that a regular grammar would not delete;
- a new typed AST, automaton compiler, fill/wrap search, prefix cache, fitter
  integration, codec adoption, and every Plate schema migration is more
  machinery than the demonstrated net deletion.

Reopen only when one retained owner supplies all of:

1. a named structure requiring order, alternation, or positional cardinality;
2. a current fit/validation/paste/external-value/collaboration failure;
3. a typed-pattern prototype with a small common call;
4. a net deletion ledger larger than the new machinery;
5. a large-parent measurement proving prefix-state caching is needed.

If reopened, steal ProseMirror's language semantics but keep frozen typed JSON
declarations, multi-root schema identity, `ContentSlice`, and atomic
publication. Never adopt string grammar, classes, rank, or integer positions.

### Public changed roots and transaction root scoping (former draft row) — defer

Node ID and list read changed roots, but only list imports
`withEditorUpdateRootScope`. One scoped-update consumer does not justify
publishing internal `"main"`/`null` conventions or an ambient
`tx.inRoot(root, callback)` push/pop mechanism.

Reopen when:

- a second extension-author scoped-update consumer exists; or
- `best-api` produces a non-ambient root transaction view that composes with
  `TransactionSpec`, nested roots, thrown callbacks, and one publication.

Until then, keep the private helpers and remove product duplication locally
without claiming a new public substrate.

## Attached donor proof, not architecture packets

### Browser composition and DOM-change gauntlet (proof input)

Owner: existing Plite DOM/React input, selection, scheduler, and repair runtime;
Plate only for product-specific table/media behavior.

Required harvest:

- composition update/end ordering;
- model/DOM caret agreement after native text replacement;
- mark-boundary mutation;
- selection-only `MutationObserver` batches;
- native enter/backspace/type-over recognition;
- real iOS Safari swipe input after Enter/Backspace, including
  autocapitalization, autocorrect, and first-Backspace `deleteWordBackward`;
- real Android Chrome virtual-keyboard equivalents, custom app bindings,
  modified/hardware keys, structural split/join, history, caret/model
  agreement, follow-up typing, and undo;
- clipboard during composition;
- shadow-root ownership and geometry;
- Chromium, Firefox, WebKit, and mobile viewport with zero retries, plus raw
  iOS and Android device receipts for virtual-keyboard claims. Mobile viewport
  emulation is insufficient for those claims.

A failure repairs the existing owner and adds a named regression. It does not
add a compatibility flag, second scheduler, or new public packet.

### Generated history/Yjs rebase and compression laws (proof input)

Owner: existing `DocumentChange`, selection mapping, `plite-history`, and Yjs
bridge. `plate-plan` participates only for a Plate-owned product behavior.

Required generation:

- structural/text/property/multi-root/root-create/root-delete changes;
- custom selections, typed effects, schema versions, local/remote/undo/redo,
  and skipped-history events;
- map-only remote changes, dropped content, grouped edits, long no-op mapping
  runs, and concurrent undo/redo;
- deterministic seeds, shrinking, persisted replay, three-peer convergence,
  mapping-depth and retained-memory budgets.

Use real canonical changes and the real Yjs bridge. Do not introduce
ProseMirror steps, Wordgard central OT, or a parallel replay protocol.

## Test and issue cursors

Architecture, test, and issue cursors are independent. Test harvests are
complete at the audited source commits. Refreshed issue rows remain unchecked
until a later `issue-harvester` classification pass; they did not silently
change an architecture verdict.

### Test harvests

| Reference   | Cursor                                                                              | Inventory                                                                          | Result                                                                            |
| ----------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Wordgard    | `01eb2b5eae509509677345fd603acad001827dff`                                          | 27 files, 24 runnable, 644 cases, 33 families; test tree unchanged                  | zero uncertain; source-only mobile key phase is an explicit raw-device proof gate |
| Lexical     | `d52f66e250e031a6c6fd8836d160373b0df557c7`                                          | 271 artifacts, 196 runnable, 137 portable/mixed runnable, 2,095 indexed call sites | zero uncertain; descriptor inference supports `A6`; browser rows remain proof     |
| ProseMirror | composite `sha256:8a8158142c4d7f27635ad76eb698113183f6da1a9b453e81f2d275b8a5a86c84` | 47 test/support files, 1,369 named rows, 23 behavior families                      | zero uncertain; fitter/clipboard/browser/history laws routed to their real owners |

### Issue metadata refresh

| Reference   | Verified at            | Host total | Open / closed | Added unchecked | Metadata re-read | Verified provider omissions |
| ----------- | ---------------------- | ---------: | ------------: | --------------: | ---------------: | --------------------------: |
| Wordgard    | `2026-07-27T14:28:47Z` |         27 |        7 / 20 |               0 |                0 |                           0 |
| Lexical     | `2026-07-25T23:13:33Z` |      2,782 |   310 / 2,472 |              41 |              132 |                           7 |
| ProseMirror | `2026-07-25T23:13:33Z` |      1,420 |   111 / 1,309 |               0 |    11 label-only |                           2 |

The commit-aware registry is
[`docs/editor-audits/index.json`](../../../editor-audits/index.json). Raw issue
metadata remains outside durable docs; the checked-in ledgers retain compact
counts, cursors, omission receipts, and prior classifications.

## Execution handoff

| Slice | Entry                                   | Exit and hard deletion gate                                                                                                    | Owner                                  |
| ----: | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- |
|     0 | User accepts this six-packet audit      | Exact public examples accepted; no names deferred                                                                              | `best-api`                             |
|     1 | `A1` accepted                           | Every mutable option key classified and adopted; mixed option APIs/store deleted                                               | `plate-plan`                           |
|     2 | `A6` accepted                           | Descriptor DAG published atomically; string/peer edges and Plate lowering deleted                                              | `plite-plan` + `plate-plan`            |
|     3 | `A4` accepted                           | All five registrations moved; `primaryRange` adopted; generic query runtime deleted                                            | `plite-plan` + `plate-plan`            |
|     4 | `A2` accepted and query owners explicit | Every global-priority fallback has a local owner; both priority fields deleted; `A6` may be before/with/after                  | `plate-plan` + `plite-plan`            |
|     5 | `A3` accepted                           | One canonical property relation owns every construction/import path; caller `clear` deleted                                    | `plite-plan` + `plate-plan`            |
|     6 | `A5` accepted                           | Core declarations contain no `DataTransfer`; all feature/table internal transport leaks deleted                                | `plite-plan` + `plate-plan`            |
|     7 | packet-focused proof green              | Attached browser and history/Yjs donor proof green; no parallel framework                                                      | owning plans + `editor-test-harvester` |
|     8 | all deletions complete                  | exports, barrels, docs, examples, fixtures, changesets, package proof, strict Plite proof, and applicable browser matrix green | primary layer plans                    |

## Closure

- Donor concepts evaluated: Wordgard 73/73, Lexical 48/48, ProseMirror 64/64.
- Local concepts evaluated: Plite 32/32, Plate 45/45.
- Unmapped source units/declarations: 0.
- Material proposals: 6; every dossier has current/proposed public and internal
  shapes, deletions, adoption, proof, dependencies, and explicit planning
  ownership.
- Unresolved material candidates: 0 after the independent pressure pass.
- Standalone proof packets: zero.
- Merged naming cut: `domRange` → `primaryRange` inside `A4`.
- Evidence-backed defers: ordered grammar and public root scoping.
- Donor mechanisms copied wholesale: none.
- Product implementation performed: none.
- Compatibility aliases, dual signatures, permanent bridges, donor runtime
  copies, and speculative second subsystems proposed: none.

### Final recommendation

Accept `A1`–`A6` as the complete material handoff. Freeze the six public shapes
with `best-api`, then execute the dependency-ordered packets above with their
named `plate-plan` and `plite-plan` owners. Do not start a generic donor
rewrite: Plite already wins most architecture lanes, and copying the donors'
classes, integer positions, global registries, precedence systems, or product
surface would make it worse.
