# Plate plugin configuration and session state

Status: superseded working draft; final A1 is
[`config-state-parent-repair.md`](./config-state-parent-repair.md)  
Priority: **P0 — rearchitect**  
Primary owner: **plate-plan**  
API owner: **best-api**  
Plite owner: **plite-plan only if the existing extension reconfiguration primitive is insufficient**

## Superseded decision

This draft explored public runtime reconfiguration. The final source
classification found no current Plate product job that funds that public API.
Use the parent repair and final six dossiers: immutable `options`, editor-local
`session`, and application/provider ownership for live AI settings.

The underlying options/session diagnosis survives.

Plate currently calls one value `options` while using it for two incompatible
jobs:

1. immutable inputs to schema, codec, API, and runtime compilation;
2. mutable editor-local UI and process state.

That is not only a naming problem. Plate publishes a frozen plugin descriptor,
then creates a second mutable Zustand copy. Schema compilation reads the frozen
descriptor while HTML parsing and runtime helpers may read the mutable copy.
One public `setOption` call can therefore change some projections and leave
others on the old configuration.

The target is:

- **`options`**: immutable configuration for one compiled Plate revision;
- **`session`**: mutable, editor-local, non-document runtime/UI state;
- **transactional reconfiguration**: the only way to change `options` after
  publication;
- **document, history, collaboration, and application data**: remain with
  their real owners, never smuggled into `session`.

Keep the name `options`. Plate's established vocabulary puts plugin parameters
there, and renaming it to `config` buys no correctness. Use `session`, not
`state`: Plite already owns editor/document state and Plate's `PluginConfig`
already uses `state` for typed read groups.

## Live-source evidence

### The public type admits the conflation

- `packages/core/src/lib/plugin/PluginConfig.ts:208-209` describes `options` as
  “Mutable runtime state exposed through the plugin store.”
- `packages/core/src/lib/plugin/PluginConfig.ts:458-492` exposes
  `getOption`, `getOptions`, `setOption`, and `setOptions` to every plugin
  callback.
- `packages/core/src/lib/plugin/PluginConfig.ts:759-775` normalizes plugin
  options as a readonly structural graph, while the context still allows
  mutation.
- `packages/core/src/lib/plugin/PluginConfig.ts:854-861` gives parser callbacks
  a readonly options view.
- `packages/core/src/lib/plugin/PluginConfig.ts:863-886` puts `options`,
  `selectors`, and read-group `state` in the same generic contract.

### Publication creates two truths

- `packages/core/src/internal/plugin/resolvePlugins.ts:405-438` freezes each
  descriptor's `plugin.options`, applies the plugins, and then creates stores.
- `packages/core/src/internal/plugin/resolvePlugins.ts:621-652` allocates a
  Zustand store for every plugin from a second snapshot of those options.
- `packages/core/src/internal/plugin/pluginOptionsStore.ts:10-16` types that
  store directly over `InferOptions`.
- `packages/core/src/internal/plugin/pluginOptionsStore.ts:28-117` freezes
  plain data but deliberately preserves non-plain identities.
- `packages/core/src/lib/plugin/getEditorPlugin.ts:235-299` mutates only the
  store; `getOptions` falls back to descriptor options only before the store
  exists.
- `packages/core/src/internal/plugin/compilePlateModel.ts:275-329` evaluates
  schema factories against `plugin.options`, not the mutable store.
- `packages/core/src/internal/plugin/prepareHtmlRegistry.ts:42-69` instead
  reads the mutable store for parser options.
- `packages/core/src/internal/plugin/prepareHtmlRegistry.ts:135-143` snapshots
  that mutable value per parser call.
- `packages/core/src/internal/plugin/resolvePlugins.ts:409-412` says plugins
  are fixed after model publication even though the public portal still
  exposes arbitrary option writes.

The split is observable: mutate one schema-bearing option and schema, parser,
codec, API, and runtime can disagree about which revision exists.

### Real plugins already reveal the two concepts

- `packages/list-classic/src/lib/BaseListPlugin.ts:66-108`: `validLiChildren`
  changes the compiled schema.
- `packages/core/src/lib/plugins/node-id/NodeIdPlugin.ts:695-724`: `idKey`
  changes a schema property key, while runtime normalization later reads
  `getOptions()`.
- `packages/link/src/react/LinkPlugin.tsx:25-80`: floating-link fields such as
  `isEditing`, `mode`, `mouseDown`, and `url` are UI session state added to the
  base link configuration.
- `packages/dnd/src/DndPlugin.tsx:21-73`: scroller/drop policy and live drag
  state share one options object.
- `packages/ai/src/react/ai-chat/AIChatPlugin.ts:1420-1457`: request
  configuration, tool selection, selection snapshots, and node buffers share
  the same mutable channel.
- `packages/toggle/src/lib/BaseTogglePlugin.ts:9-68`: a mutable `Set` of open
  IDs is stored in options and projected through selectors.
- `packages/core/src/lib/plugins/dom/DOMPlugin.ts:72-114`: auto-scroll
  temporarily overwrites global plugin options and restores them as a stack.
  This is transaction-scoped input, not configuration or session state.
- `apps/www/src/registry/components/editor/settings-dialog.tsx:230-258`:
  actual AI configuration is changed through `setOption`, bypassing model
  recompilation.

### Bounded usage inventory

The production TypeScript scan covers `packages/**` and `apps/www/**`, excluding
spec, test, slow-test, `__tests__`, and type-test files.

- `setOption`/`setOptions`: **169 calls across 42 files**.
- Literal per-key writes expose at least **48 distinct fields**, before
  multi-field `setOptions` patches.
- Most writes are not configuration:
  - UI/interaction: selection IDs, drag targets, floating-link mode, open state;
  - async/process: streaming, completion, errors, abort controllers, upload
    progress, temporary node/selection buffers;
  - runtime resources: refs, chat clients, cursor/discussion projections;
  - actual configuration: `enabled`, `label`, `chatOptions`,
    `completeOptions`.

This is a broad public contract failure, not an isolated helper.

## External-editor verdict

| Editor      | Relevant mechanism                                                                                                                                                                                                                                                                                               | Plate classification   | Verdict                                                                                                                                                                                                  |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Wordgard    | Transaction effects reconfigure a compartment or whole extension graph; configuration resolves static values, fields, and facets into one state revision (`../wordgard/src/state/state.ts:156-195`, `594-679`)                                                                                                   | **inferior**           | Steal atomic configuration publication and the explicit configuration/state distinction. Reject nominal classes, automatic facet dependency tracking, and putting Plate UI state in document state.      |
| Lexical     | Extension configuration is explicitly mutable during registration and may vend values to dependencies (`../lexical/packages/lexical/src/extension-core/types.ts:156-239`); signals provide a separate reactive substrate (`../lexical/packages/lexical-extension/src/signals.ts:8-17`, `watchedSignal.ts:10-35`) | **different tradeoff** | Keep Plite's immutable candidate compilation. Steal only the clarity that reactive runtime values are not extension configuration. Do not copy mutable registration or make signals configuration truth. |
| ProseMirror | `PluginSpec.state` defines transaction-applied persistent fields, separate from plugin spec (`../prosemirror-state/src/plugin.ts:7-45`, `91-115`); plugin fields become ordered immutable `EditorState` fields (`../prosemirror-state/src/state.ts:43-60`, `83-89`, `170-178`)                                   | **different tradeoff** | Keep the conceptual split. Reject transaction/history ownership for ephemeral Plate UI, partially initialized ordered fields, open-ended plugin specs, and serialization-by-default pressure.            |

Plite already has the strongest publication primitive in this lane:
`editor.update.extensions.reconfigure(slot, input, { migrate })` is typed at
`packages/plite/src/interfaces/editor.ts:377-404`. Plate already compiles its
schema, codecs, runtime API, and extension groups into one configuration in
`packages/core/src/lib/editor/withPlite.ts:361-472`. The missing work is Plate
ownership and adoption, not a new generic Plite state system.

## Current public shape

```ts
type PluginBaseContext<C extends AnyPluginConfig> = {
  api: InferOwnApi<C>;
  installed: boolean;
  read: InferOwnState<C>;
  update: InferOwnTx<C>;

  getOption<
    K extends keyof InferOptions<C> | keyof InferSelectors<C> | "state"
  >(
    key: K,
    ...args: unknown[]
  ): unknown;
  getOptions(): Readonly<InferOptions<C>>;
  setOption<K extends keyof InferOptions<C>>(
    key: K,
    value: InferOptions<C>[K]
  ): void;
  setOptions(
    options:
      | Partial<InferOptions<C>>
      | ((draft: Draft<Partial<InferOptions<C>>>) => void)
  ): void;
};

type DndConfig = PluginConfig<
  "dnd",
  {
    // configuration
    enableScroller?: boolean;
    scrollerProps?: Partial<ScrollerProps>;
    onDropFiles?: OnDropFiles;

    // live session state
    _isOver?: boolean;
    draggingId?: string[] | string | null;
    dropTarget?: DropTarget;
    isDragging?: boolean;
    multiplePreviewRef?: React.RefObject<HTMLDivElement | null> | null;
  }
>;

const DndPlugin = createPlatePlugin<DndConfig>({
  key: "dnd",
  options: {
    _isOver: false,
    draggingId: null,
    dropTarget: { id: null, line: "" },
    enableScroller: false,
    isDragging: false,
    multiplePreviewRef: null,
    scrollerProps: {},
  },
  handlers: {
    onDragEnd: ({ editor, plugin }) => {
      editor.plugin(plugin).setOption("isDragging", false);
      editor.plugin(plugin).setOption("dropTarget", {
        id: null,
        line: "",
      });
    },
  },
});

const isDragging = usePluginOption(DndPlugin, "isDragging");
const allOptionsAndState = usePluginOption(DndPlugin, "state");
```

The type cannot express which writes require recompilation, which belong to
history/collaboration, which are editor-local, or which should never be
mutable.

## Proposed public shape

### Plugin authoring

```ts
type DndOptions = Readonly<{
  enableScroller?: boolean;
  scrollerProps?: Partial<ScrollerProps>;
  onDropFiles?: OnDropFiles;
}>;

type DndSession = Readonly<{
  isOver: boolean;
  draggingId: string[] | string | null;
  dropTarget: DropTarget;
  isDragging: boolean;
  multiplePreviewRef: React.RefObject<HTMLDivElement | null> | null;
}>;

export const DndPlugin = createPlatePlugin({
  key: "dnd",

  options: {
    enableScroller: false,
    scrollerProps: {},
  } satisfies DndOptions,

  // Pure per-editor initializer. It may read immutable options, but it cannot
  // publish resources or mutate configuration.
  session: ({ options }) =>
    ({
      draggingId: null,
      dropTarget: { id: null, line: "" },
      isDragging: false,
      isOver: false,
      multiplePreviewRef: null,
    } satisfies DndSession),

  handlers: {
    onDragEnd: ({ plugin }) => {
      plugin.session.set({
        isDragging: false,
        dropTarget: { id: null, line: "" },
      });
    },
  },
});
```

`session.set` has one immutable contract:

```ts
type PluginSessionPortal<S> = Readonly<{
  get(): Readonly<S>;
  set(update: Partial<S> | ((current: Readonly<S>) => Partial<S>)): void;
}>;
```

It shallow-merges the returned patch. There is no Immer `Draft`, key overload,
mutable `Set`, or silent full-state replacement. A plugin needing collection
updates returns a new collection:

```ts
plugin.session.set(({ openIds }) => {
  const next = new Set(openIds);
  next.add(toggleId);
  return { openIds: next };
});
```

### Plugin and React consumers

```ts
const dnd = editor.plugin(DndPlugin);

dnd.options.enableScroller; // readonly configuration revision
dnd.session.get().isDragging; // non-reactive runtime read
dnd.session.set({ isDragging: true });

const isDragging = usePluginSession(DndPlugin, (session) => session.isDragging);

const enableScroller = usePluginOptions(
  DndPlugin,
  (options) => options.enableScroller
);

// Explicit editor selection uses one option, not a second hook family.
const otherDragging = usePluginSession(
  DndPlugin,
  (session) => session.isDragging,
  { editor: otherEditor }
);
```

`usePluginOptions` survives only as a readonly subscription to the published
configuration revision. Its current mixed store/selectors/state behavior is
deleted. `usePluginSession` subscribes only to the declared session store.

### Dynamic configuration

Static application overrides remain terminal plugin configuration:

```ts
const AppAIKit = AIChatPlugin.configure({
  options: {
    chatOptions: appChatOptions,
  },
});
```

Changing configuration on a live editor is explicit and atomic:

```ts
editor.update.plugins.reconfigure(
  AIChatPlugin,
  {
    chatOptions: {
      ...editor.plugin(AIChatPlugin).options.chatOptions,
      body: {
        apiKey,
        model,
      },
    },
  },
  {
    migrate: ({ document, next }) => {
      // Omit this option when the current document already validates.
      // Otherwise return the complete document valid under `next`.
      return document;
    },
  }
);
```

The second argument is one typed options override, merged by the same
descriptor-owned configuration rule as terminal `.configure`. The call builds
one complete candidate Plate configuration and lowers it to Plite's existing
named extension-slot reconfiguration. It never mutates a live compiler input.

### Derived values

Do not recreate the current catch-all `selectors` registry under a new name.

```ts
// Runtime/UI derivation: select directly from session.
const isOpen = usePluginSession(TogglePlugin, ({ openIds }) =>
  openIds.has(toggleId)
);

// Plugin-owned imperative runtime query: ordinary plugin API.
const TogglePlugin = createPlatePlugin({
  // ...
  api: ({ session }) => ({
    isOpen: (id: string) => session.get().openIds.has(id),
  }),
});

// Document derivation: typed `read`, evaluated against Plite state.
const MyPlugin = createPlatePlugin({
  read: ({ state }) => ({
    isActive: () => state.marks.has("myMark"),
  }),
});
```

## Proposed internal shape

```ts
type PlateConfigurationRevision = Readonly<{
  token: object;
  optionsByPlugin: ReadonlyMap<string, Readonly<unknown>>;
  model: CompiledPlateModel;
  codecs: CompiledPlateCodecs;
  runtime: CompiledPlateRuntime;
  extensions: readonly EditorExtensionInput[];
}>;

type PlateSessionDefinition<O, S> = Readonly<{
  initialize(context: Readonly<{ options: Readonly<O> }>): S;
}>;

type PlateSessionRegistry = WeakMap<
  object, // existing Plate runtime owner shared by root views
  Map<string, PluginSessionStore<unknown>>
>;

type PlatePluginPortal<C extends AnyPluginConfig> = Readonly<{
  installed: boolean;
  options: Readonly<InferOptions<C>>;
  session: PluginSessionPortal<InferSession<C>>;
  api: InferOwnApi<C>;
  read: InferOwnRead<C>;
  update: InferOwnTx<C>;
}>;
```

### Invariants

1. Schema, codecs, parser tables, API, runtime handlers, and exposed `options`
   all bind to the same immutable revision token.
2. A candidate revision is compiled and validated off to the side. Failed
   compilation or migration publishes nothing.
3. Publication swaps all configuration projections atomically through one
   Plite extension slot.
4. Only plugins declaring `session` allocate a store.
5. Session stores are keyed by the existing Plate runtime owner: root views of
   one editor share them; separate editors do not.
6. Reconfiguring the same descriptor preserves its session. Removing a plugin
   runs cleanup and drops it. Adding one initializes it once.
7. `session` is absent from schema identity, document changes, history, Yjs,
   serialization, and codec output.
8. Session initializers are pure. DOM listeners, providers, abortable work, and
   other resources are created by setup and released by cleanup.
9. Parser and codec callbacks read the published immutable options map, never a
   mutable store fallback.
10. Transaction-local behavior such as DOM auto-scroll overrides travels as a
    transaction/update argument or private transaction context, not through
    `options` or `session`.
11. Session initializers may choose initial UI values from `options`, but a
    session cannot cache configuration-derived truth that would become stale
    after reconfiguration.

### Publication lifecycle

```ts
const candidate = compilePlateConfiguration({
  current,
  pluginInputs,
  optionsOverrides,
});

const nextDocument = validateOrMigrate({
  candidate,
  currentDocument,
  migrate,
});

const prepared = prepareConfigurationLifecycle(candidate);

editor.update.extensions.reconfigure(
  PLATE_CONFIGURATION_SLOT,
  candidate.extensions,
  { migrate: () => nextDocument }
);

publishPlateRevision(candidate, prepared);
reconcilePluginSessions(current, candidate, prepared);
activatePreparedLifecycle(prepared);
```

The real implementation must integrate publication and lifecycle with the
Plite commit boundary; the pseudocode is not permission to publish Plate state
after a failed Plite reconfiguration. Candidate preparation must be disposable
on failure. Activation failures are caught by the optional-provider error sink
and clean up the failed resource; they do not expose a half-installed session
or roll back an already-committed document.

## Hard deletions

Acceptance requires deleting, not deprecating:

- `PluginBaseContext.getOption`, `getOptions`, `setOption`, and `setOptions`;
- the mutable option methods on the editor plugin portal;
- `PluginOptionsStore` as a mixed configuration/runtime owner;
- store allocation for config-only plugins;
- the mutable option fallback in HTML parser preparation;
- the current behavior and overloads of `usePluginOption`,
  `useEditorPluginOption`, `usePluginOptions`, and
  `useEditorPluginOptions`;
- `InferSelectors`, `__selectorExtensions`, and
  `projectPluginSelectors`, once the bounded selector adoption confirms every
  owner moved to `session`, `api`, or `read`;
- tests that assert options mutation or the synthetic `'state'` option key;
- documentation calling options mutable runtime state;
- the DOM auto-scroll save/mutate/restore pattern;
- application data duplicated into plugin options when an application/provider
  store owns the truth;
- any compatibility alias from option mutation to session mutation.

The `usePluginOptions` name may be reused for the new readonly revision hook,
but none of its current implementation or call contracts survive.

## Adoption ledger

### Core Plate

- `PluginConfig`, `BasePlugin`, `PlatePlugin`, `ExtendConfig`,
  `createBasePlugin`, `createPlatePlugin`, `toPlatePlugin`;
- all inference helpers and public type tests;
- plugin resolution, snapshots, publication, portals, session registry,
  React hooks, and runtime-owner sharing;
- parser/codec contexts and caches;
- selector extensions, read groups, API factories, update factories;
- configuration setup/cleanup and live reconfiguration.

Rename the current `PluginConfig.state` type metadata to `read` during this
break. It is not runtime session state and retaining the name would preserve
the ambiguity.

### Plate packages

- AI and copilot: configuration vs streaming/request/session buffers;
- DnD: scroll/drop policy vs drag state and refs;
- link: link behavior vs floating-editor state;
- media placeholder/upload: upload policy vs progress/errors/files;
- block selection, block menu, cursor overlay, selection area;
- toggle open IDs;
- comments, suggestions, discussions, find/replace;
- navigation feedback and block placeholder;
- config-only consumers in list, table, code block, markdown, media, codecs,
  and Yjs;
- every top-level selector owner, classified individually as `session`,
  `api`, or `read`.

### Applications and docs

- `apps/www` settings uses transactional plugin reconfiguration;
- registry kits declare immutable options and per-editor session separately;
- registry UI hooks use `usePluginSession`;
- the editor performance page benchmarks session writes and configuration
  recompilation as distinct operations;
- examples, API docs, JSDoc, and fixtures teach the ownership rule directly.

### History, Yjs, DOM, and React

- History and Yjs ignore session writes. Schema-bearing reconfiguration requires
  explicit document validation/migration but is not serialized as mutable
  plugin state.
- Provider configuration and lifecycle remain configuration/setup concerns.
  Awareness and local cursor display are provider/application data projected
  into session only when a local view needs it.
- DOM auto-scroll options become call-local transaction data.
- React subscriptions bind to either one session store or one configuration
  revision; a session write cannot invalidate schema or codec subscribers.

## Proof contract

### Type proof

- `options` is deeply readonly at every plugin callback and portal.
- `setOption`/`setOptions` do not exist.
- Session initializer, portal, and hook inference need no callback annotations
  or casts.
- A plugin without `session` exposes no writable session API.
- `read`, session, transaction, and API capabilities do not leak into one
  another.
- Terminal `.configure` inference remains exact.

### Focused runtime proof

- Schema, parser, codecs, API, runtime, and portal expose the same options
  object/revision.
- Session writes do not change the configuration token, schema identity,
  codec tables, history, Yjs output, or document.
- Config-only plugins allocate no stores.
- Root views share a session; separate editors are isolated.
- Successful reconfiguration atomically changes every affected projection.
- Failed compile, validation, migration, or lifecycle preparation leaves the
  prior document, configuration, and session visible.
- Post-publication activation failure is isolated and cleans its failed
  resource without corrupting the published configuration or session.
- Reconfigure preserves same-descriptor session; add initializes once; remove
  cleans up and drops once.
- Node ID and list schema options cannot diverge from their runtime behavior.
- Nested auto-scroll calls preserve their own call-local settings without
  global mutation.

### Generated laws

- Arbitrarily interleave session writes with successful and failing
  reconfiguration; no candidate value becomes observable before publication.
- Session mutation is invariant under history undo/redo and Yjs round trips.
- Session values never affect schema fingerprints or serialized editor state.
- Root-view sharing and cross-editor isolation hold for arbitrary plugin
  installation sets.

### Browser proof

Focused rows before broad gates:

- DnD enter/start/end/drop and file drop;
- floating link open/edit/submit/reset;
- block selection and selection area;
- AI streaming, completion, cancel, and error;
- upload progress/error/cleanup;
- settings-driven AI reconfiguration;
- multiple root views bound to one editor.

Then run the repository's affected package proof, `pnpm check:plite`, and the
required browser matrix at handoff. Browser proof is mandatory because the
adoption changes `packages/**` and `apps/www/**`.

### Benchmarks

- editor creation with 10, 100, and 1,000 config-only plugins versus plugins
  declaring session;
- store count and retained memory;
- one session write with 0, 1, 10, and 1,000 subscribers;
- schema-free and schema-bearing configuration recompile;
- assert no document traversal or schema compilation on a session write.

## Dependencies and execution order

1. **best-api** accepts the exact public vocabulary and call sites:
   immutable `options`, `session`, `usePluginSession`, readonly
   `usePluginOptions`, and `editor.update.plugins.reconfigure`.
2. **plate-plan** owns the full vertical plan: type hard cut, one Plate
   configuration slot, candidate compiler, publication lifecycle, session
   registry, hooks, package/application adoption, deletion, and proof.
3. **plite-plan** is consulted only if Plate cannot express its entire
   configuration as one input to the existing
   `editor.update.extensions.reconfigure` primitive. Do not add generic mutable
   plugin state to Plite.
4. Package owners migrate by category, not one arbitrary file at a time.
5. Delete the mixed store and old APIs in the same accepted break.

This packet should precede schema/codec configuration work where practical,
because those systems need one trustworthy configuration revision. It does not
depend on command ordering, extension priority redesign, or a new generic
reactivity substrate.

## Rejected alternatives

- **Keep mutable options and mark some keys static:** permissive by default,
  still creates two truths, and every compiler consumer must maintain a deny
  list.
- **Rename options to config and add state:** needless Plate-wide vocabulary
  churn plus a collision with Plite state.
- **Put session in Plite editor state:** pollutes history, collaboration,
  serialization, document subscriptions, and multi-root semantics with
  ephemeral Plate UI.
- **Use signals for everything:** replaces one mixed owner with another and
  weakens atomic configuration publication.
- **Copy ProseMirror plugin fields:** transaction-order coupling and
  serialization pressure are wrong for drag refs, upload controllers, and
  floating UI.
- **Keep selectors as a third mutable namespace:** their real jobs are already
  covered by session selectors, plugin API, and typed document reads.
- **Compatibility aliases:** they preserve the false ontology and make future
  audits unable to tell which truth a caller reads.

## Closure audit

- Correct owner identified: Plate owns plugin configuration and UI session;
  Plite owns atomic editor-extension publication.
- Internal detail removed from public API: Zustand and Immer drafts disappear.
- Caller burden reduced: plugin authors declare each value once under its real
  owner; application configuration changes use one typed reconfigure call.
- Concepts separated correctly: compile configuration, local session,
  transaction-local input, document state, and application/provider truth.
- Large-document behavior is safe: session writes are local and cannot trigger
  document traversal or schema compilation.
- Collaboration/history/serialization are explicit: session is excluded.
- Transactional reconfiguration is all-or-nothing.
- Every replaced owner has a deletion gate.
- No compatibility bridge, dual API, or local patch remains.

No implementation is authorized by this artifact.
