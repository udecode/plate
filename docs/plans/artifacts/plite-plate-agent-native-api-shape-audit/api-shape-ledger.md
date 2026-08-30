# Plite and Plate agent-native API shape ledger

## Verdict

**NEEDS WORK.** The core doctrine is good, but it is not applied consistently.
Plite's imported `schema`, `property`, and `target` namespaces are the model:
pure construction algebra is visible, frozen, importable, and statically
inspectable. A callback should exist only when its result depends on immutable
configuration, an installed plugin reference, a snapshot, a transaction, a DOM
event, or another real runtime input.

Plate still uses callbacks as helper dispensers, exposes duplicate authoring
routes, and lets generated barrels publish internal machinery. Plate React also
maintains a second, weaker subscription model on top of Plite React.

The hard rule is:

1. Static declaration -> plain object.
2. Pure construction family -> imported frozen namespace.
3. Stable identity, inference, or policy -> descriptor.
4. Runtime or immutable-config computation -> callback with one named context.
5. One document mutation -> direct `editor.update.*` call.
6. Atomic multi-step mutation -> `editor.update((tx) => ...)`.
7. Missing React context -> throw or return `null` through an explicitly
   optional hook. A controller may use an inert editor privately to preserve
   hook order, but that fallback is not public document state.
8. Public package API -> curated owner-controlled entrypoint, not an accidental
   generated barrel.

## Scope and method

The audit covered the live authoring exports, types, implementations, docs,
examples, and proof owners for:

- `@platejs/plite`, `@platejs/plite-react`, `@platejs/plite-dom`,
  `@platejs/plite-history`, `@platejs/plite-hyperscript`, and
  `@platejs/plite-layout`;
- `@platejs/core`, `@platejs/core/react`, `platejs`, and `platejs/react`;
- Yjs and browser/layout APIs where they define reusable Plite authoring or
  proof patterns;
- production feature packages and `apps/www/src/registry` as adoption evidence.

The raw callback inventory found 1,045 callback-bearing slots across 317
exported source types. That is an inventory signal, not 1,045 findings: render,
event, parser, transaction, lifecycle, and mapping callbacks are often exactly
right. The ledger below deduplicates the surface into meaningful authoring
concepts and classifies every concept family.

Production usage also matters:

- The bounded production scan found 79 `.configure` calls (62 objects, seven
  identifiers, one conditional, nine callbacks), 27 `.extend` calls, 18
  `.extendApi`, ten `.extendEditorApi`, ten `.extendSelectors`, 51 `.extendTx`,
  nine `.extendTxGroup`, 62 `.extendExtension`, and 77 direct
  `.withComponent` calls.
- Production plugin descriptors contain zero top-level `api`, `tx`, or
  `selectors` declarations. Authors uniformly use the typed `.extend*` routes,
  so removing the raw public constructor fields follows actual ownership rather
  than inventing a new convention.
- Plate schema factories overwhelmingly consume real compiler context
  (`plugins`, `own`, `targetPluginNames`, `config`, or `type`): 52 declarations
  are static objects, 22 are genuine contextual factories, and six are
  identifiers. These factories earn their existence: they derive the configured
  owner type and validate typed references against the candidate installed
  plugin graph.
- Plite command factories inject `handle` and `around`, but the factory binds
  the installed editor type before heterogeneous descriptors are checked. The
  accepted command architecture and generic type contracts prove this is a
  justified callback.
- Plate input-rule factories inject only a `rule` helper namespace whose six
  functions already exist as public constructors. This callback has no runtime
  or plugin-local input and is unjustified. Production uses 23 static arrays and
  zero factory callbacks; the factory appears only in tests and docs.
- Plate `.extendTx` has two callback layers: plugin resolution returns a
  transaction factory. Fifty `.extendTx` and nine `.extendTxGroup` production
  registrations repeat this ceremony.

## Capability map

| User action                                           | Agent route                                                                   | Source owner                                             | Teaching and release surface              | Proof owner                               | Status                                                               |
| ----------------------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------- | ----------------------------------------- | ----------------------------------------- | -------------------------------------------------------------------- |
| Declare a complete document grammar                   | `defineEditorSchema` plus imported `schema` / `property` / `target`           | `packages/plite/src/core/schema-definition.ts`           | Plite schema guide and `@platejs/plite`   | schema definition/compiler/type contracts | pass; defaults drift                                                 |
| Contribute one Plate plugin's grammar                 | `createBasePlugin({ schema })`                                                | `packages/core/src/internal/plugin/compilePlateModel.ts` | plugin/schema guides and feature packages | compile-model/schema contracts            | pass; static-first with justified advanced factory                   |
| Define a Plite extension                              | `defineEditorExtension`                                                       | `packages/plite/src/core/editor-extension.ts`            | extension guide and package root          | extension configuration/generic contracts | pass                                                                 |
| Register semantic command policy                      | `commands: ({ handle, around }) => [...]`                                     | Plite command registry/compiler                          | command guide                             | generic command and dispatch laws         | pass; justified callback                                             |
| Define an input rule                                  | concrete rule array and public rule constructors                              | `packages/core/src/lib/plugins/input-rules`              | input-rule guide and `platejs`            | input-rule unit/browser proof             | gap; fake factory taught                                             |
| Define plugin reads, selectors, and writes            | Plate `.extend*` methods                                                      | `packages/core/src/lib/plugin` and resolver              | plugin-method guide                       | plugin composition/type contracts         | gap; duplicate routes and nested tx callback                         |
| Configure a plugin                                    | `.configure(object or contextFactory)`                                        | `createBasePlugin.ts`                                    | plugin-method guide                       | plugin resolution tests                   | gap; layers overwrite instead of composing                           |
| Reference another plugin                              | plugin descriptor for required peers; plugin key for weak optional targeting  | Plate schema/dependency compiler                         | plugin/schema guides                      | plugin-reference contracts                | pass; the two strengths are distinct                                 |
| Create an editor                                      | `createEditor` / `createPlateEditor` / `usePlateEditor`                       | Plite and Plate editor constructors                      | editor guides                             | constructor/type/browser contracts        | gap; unsafe tuples and overloaded async input                        |
| Read and mutate state                                 | `editor.read.*`, `editor.update.*`, transaction callback                      | Plite public-state/runtime                               | editor guide                              | state/tx contracts                        | pass; docs retain wrappers and duplicate helpers                     |
| Define state fields, facets, effects, and annotations | descriptor factories                                                          | Plite field/facet/effect owners                          | document-state and extension guides       | field/facet/effect contracts              | partial; callable field ambiguity and teaching gaps                  |
| Subscribe in React                                    | strict editor hook plus state selector                                        | Plite React hook owner                                   | React hooks docs; Plate hook docs         | hook/provider contracts                   | gap; Plate duplicates weaker model                                   |
| Resolve active editor outside one tree                | nullable active-editor controller hook over an internal fallback subscription | Plate controller                                         | controller docs                           | controller/store tests                    | partial; public contracts are blurred                                |
| Resolve element and path context                      | strict/optional descriptor-first hooks                                        | Plate element store                                      | component/plugin docs                     | renderer/hook tests                       | fail; casted fake values                                             |
| Bind a toolbar action to a command                    | descriptor-first command hook                                                 | Plite React runtime hooks                                | hooks guide                               | command-hook plus core command proof      | gap; arbitrary closure is named command                              |
| Parse and serialize host formats                      | MIME host codecs for slices plus feature-owned document conversion            | Plite DOM plus Plate HTML/Markdown owners                | HTML/clipboard docs                       | codec and feature conversion contracts    | partial; static rendering is misnamed                                |
| Render a node/component                               | `render.node` or `.withComponent`                                             | Plate React renderer                                     | component guide                           | renderer/browser proof                    | pass; `render.as` type drift                                         |
| Observe editor changes                                | canonical commit observer                                                     | Plite React and Plate provider                           | provider/editor docs                      | commit callback contracts                 | partial; Plate strips and suppresses information                     |
| Configure layout semantics                            | surface-owned layout provider                                                 | Plite layout runtime                                     | layout README and pagination example      | layout unit/React/browser proof           | pass for the one proven consumer; descriptor profile deferred        |
| Configure history and collaboration                   | direct `history(...)` / Yjs descriptor options                                | History/Yjs packages                                     | package docs                              | persistence/collaboration contracts       | pass; minor naming/docs drift                                        |
| Discover the supported package surface                | curated barrels and exact import contracts                                    | package entrypoints                                      | package API docs                          | runtime and declaration import smoke      | fail; Plate barrels leak internals and strict Plite smoke is unwired |
| Write replayable browser proof                        | typed scenario/proof descriptors                                              | browser package                                          | testing docs/scripts                      | replay/reducer/transport tests            | partial; closure/string escape hatches remain                        |

## Exhaustive concept ledger

### Plite core

| Concept                                                                                                         | Current shape                                       | Classification                    | Absolute-best target                                                                                                              |
| --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `schema`, `property`, `target`                                                                                  | imported frozen namespaces                          | keep static                       | Keep as the reference pattern. Do not inject them through callbacks.                                                              |
| Raw element/group/root declarations                                                                             | contextual plain objects                            | keep static                       | Keep plain data; an `element(...)` wrapper would add ceremony.                                                                    |
| `defineEditorSchema`                                                                                            | descriptor factory                                  | keep descriptor; repair defaults  | Omitted identity means derived identity; omitted unknown policy means `reject`; require `id/version` only for persisted lineage.  |
| Extension `schema`                                                                                              | declaration or immutable-config factory             | keep mixed                        | Object by default; factory only when immutable `config` changes grammar.                                                          |
| `defineEditorExtension`                                                                                         | descriptor factory                                  | keep descriptor                   | Keep one immutable extension boundary.                                                                                            |
| Extension identity/config/options/dependencies/conflicts/priority/resources                                     | static fields                                       | keep static                       | Preserve immutable `config` versus mutable per-editor `options`.                                                                  |
| Extension `api`                                                                                                 | static map or `(editor, context)` factory           | keep mixed; repair callback       | Use `api: { ... }` when static and `api: ({ editor, ... }) => ...` when contextual; remove duplicate positional editor.           |
| Extension `state`                                                                                               | runtime namespace factories                         | keep callback                     | Runtime state is genuine input. Preserve concise primary state argument unless type/profiling evidence supports a broader change. |
| Extension `tx`                                                                                                  | runtime transaction factories                       | keep callback                     | Transaction is genuine input. Preserve direct transaction-first shape in Plite.                                                   |
| Extension `commands`                                                                                            | factory injecting `handle` / `around`               | keep callback                     | Keep: the outer extension generic binds installed-editor capabilities. Do not add descriptor-owned registration methods.          |
| Extension corrections                                                                                           | event/query descriptors with `correct(context)`     | keep callback                     | Correctors consume changed entries and a transaction.                                                                             |
| Extension queries/clipboard                                                                                     | middleware maps                                     | keep callback; normalize payloads | One named context object per middleware; no duplicate positional data.                                                            |
| Extension lifecycle/validation/listeners                                                                        | callbacks                                           | keep callback; normalize payloads | One named context object for activation, validation, commit, node, text, and cleanup phases.                                      |
| `defineCommand`, `editorCommands`                                                                               | command descriptors and namespace                   | keep descriptor                   | Keep pure `build`, explicit dispatch, and installed-editor registration factory.                                                  |
| `defineExtensionSlot(...).of(...)`                                                                              | descriptor-owned composition                        | keep descriptor                   | Keep.                                                                                                                             |
| `defineFacet`, `.of`, `.compute`                                                                                | descriptor-owned data/computation                   | keep descriptor                   | Keep; add a public authoring route.                                                                                               |
| `defineStateField`                                                                                              | descriptor with value-or-factory initial value      | replace ambiguous union           | Split `initial` and `createInitial`; do not dispatch on `typeof value`.                                                           |
| `tx.setField`                                                                                                   | value-or-updater                                    | replace with direct methods       | `setField(field, value)` plus `updateField(field, updater)`.                                                                      |
| `defineEffect`, `defineUpdateAnnotation`                                                                        | descriptors with real policy callbacks              | keep descriptor                   | Keep; document custom authoring.                                                                                                  |
| `defineValueCodec`, `valueCodecs`                                                                               | custom descriptor plus common namespace             | keep mixed                        | Keep imported common codecs and explicit custom codec boundary.                                                                   |
| `definePropertyPolicy`                                                                                          | named policy descriptor                             | keep descriptor                   | Keep.                                                                                                                             |
| `property.typed`                                                                                                | alias that emits JSON descriptor                    | hard-cut                          | Make `property.json({ policy })` infer the policy value type.                                                                     |
| `ContentSlice`                                                                                                  | frozen construction namespace                       | keep static                       | Keep.                                                                                                                             |
| `DocumentChange`, `ChangeSet`                                                                                   | immutable change algebra                            | keep descriptor/object            | Keep as canonical change truth.                                                                                                   |
| `ElementApi`, `LocationApi`, `NodeApi`, `PathApi`, `PointApi`, `RangeApi`, `SelectionApi`, `SpanApi`, `TextApi` | pure imported namespaces                            | keep static; freeze consistently  | Freeze every exported namespace object.                                                                                           |
| Root `above` / `after` / `before` / related editor functions                                                    | standalone editor-bound functions                   | hard-cut                          | Keep implementations internal; public callers use `editor.read.*`. Keep only `isEditor` as a standalone guard.                    |
| `editor.read.*`                                                                                                 | direct reads plus snapshot callback                 | keep mixed                        | Direct one read; callback for one coherent snapshot or multi-read computation.                                                    |
| `editor.update.*`                                                                                               | direct updates plus policy and transaction callback | keep mixed                        | Direct one write; callback only for atomic composition.                                                                           |
| `txOnly`                                                                                                        | explicit transaction-only marker                    | keep descriptor                   | Keep.                                                                                                                             |
| Anchors and refs                                                                                                | descriptor/imperative identity APIs                 | keep                              | Paths query snapshots; anchors/refs track live identity.                                                                          |
| Custom selection specs                                                                                          | static descriptors with mapping/codec callbacks     | keep descriptor                   | Keep; add docs and inference proof.                                                                                               |
| `createEditor`, `createEditorRuntime`, `createEditorView`                                                       | option factories                                    | keep; repair input types          | Constrain `extensions` to valid extension/slot inputs while retaining const inference.                                            |
| `setEditorReadOnly(editor, value)`                                                                              | free host/view mutator                              | replace with direct view control  | Preserve capability, place it on the runtime/view controller beside view state.                                                   |
| `setDebugValueScrubber`                                                                                         | process-level diagnostics                           | keep imperative                   | Keep as an explicit diagnostic boundary.                                                                                          |
| Public declaration smoke                                                                                        | isolated stale TypeScript file                      | repair proof                      | Wire emitted-package type smoke into the handoff gate and keep its export list exact.                                             |

Evidence: [schema builders](../../../../packages/plite/src/core/schema-definition.ts),
[extension types](../../../../packages/plite/src/interfaces/editor.ts),
[state-field dispatch](../../../../packages/plite/src/core/state-fields.ts),
[root exports](../../../../packages/plite/src/index.ts), and
[strict type smoke](../../../../packages/plite/test/public-package-types-smoke.ts).

### Plate plugin authoring

| Concept                                                          | Current shape                                                          | Classification                    | Absolute-best target                                                                                                                                                                                                                          |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `createBasePlugin`, `createPlatePlugin`                          | static descriptor constructors                                         | keep descriptor                   | Keep nominal plugin descriptors and const inference.                                                                                                                                                                                          |
| Top-level plugin `schema`                                        | direct declaration or compiler-context factory                         | keep mixed                        | Direct object for self-contained grammar; factory only for immutable config, configured owner type, or installed typed-reference resolution.                                                                                                  |
| `PluginSchemaContext.own/plugins`                                | compile-time typed-reference context                                   | keep callback                     | It derives the configured owner type and fails missing, disabled, or type-mismatched plugin references. Do not replace it with eager `Plugin.type`.                                                                                           |
| `targetPluginNames: string[]`                                     | weak optional installed-plugin allowlist shared by schema and matching | keep                              | Keep it top-level. It resolves configured installed types without importing optional feature packages. Required peers still use descriptors. Compile one internal resolved binding so schema, parser, injection, and matching cannot diverge. |
| `config` versus `options`                                        | immutable compiler input versus mutable per-editor state               | keep                              | Sharpen docs and JSDoc; do not merge the concepts.                                                                                                                                                                                            |
| `dependencies` and child `plugins`                               | descriptor arrays                                                      | keep static                       | Keep descriptor-first references.                                                                                                                                                                                                             |
| `inputRules: ({ rule }) => [...]`                                | helper-injection callback                                              | hard-cut                          | Export frozen `inputRule.mark/blockStart/blockFence/insertText/insertBreak/insertData`; accept concrete arrays only.                                                                                                                          |
| Rule `enabled`, `resolve`, `apply`                               | runtime callbacks                                                      | keep callback                     | These consume editor/input/transaction state.                                                                                                                                                                                                 |
| Public rule-family factories                                     | imported factories/descriptors                                         | keep                              | Keep narrow package-owned factories such as `LinkRules.markdown()`.                                                                                                                                                                           |
| Shortcut map key -> implicit update-then-API lookup              | string/method-name lowering                                            | replace ambiguous precedence      | Infer the only matching route; require optional target `update` or `api` only when both namespaces expose the key. Keep an explicit event handler when keyboard-event access is required. Do not move DOM keys onto Plite commands.           |
| `.configure(object)`                                             | static non-widening patch                                              | keep static                       | Keep and compose it in declaration order.                                                                                                                                                                                                     |
| `.configure(callback)`                                           | contextual non-widening patch stored in one overwrite slot             | keep callback; repair composition | Keep it distinct from widening `.extend`. Store ordered layers; `undefined` preserves and explicit `null` removes.                                                                                                                            |
| `.extend(object)`                                                | widening static merge                                                  | keep static                       | Keep.                                                                                                                                                                                                                                         |
| `.extend(callback)`                                              | widening runtime merge                                                 | keep callback                     | Keep when the result reads plugin/editor/options context.                                                                                                                                                                                     |
| `.configurePlugin(plugin, patch)`                                | descriptor-targeted nested patch                                       | keep; unify types                 | One headless patch contract plus React-only additions. Missing target remains a documented no-op.                                                                                                                                             |
| `.extendPlugin(plugin, patch)`                                   | descriptor-targeted nested extension/add                               | keep; unify types                 | Keep descriptor target; make add-if-missing behavior explicit in name/docs if retained.                                                                                                                                                       |
| Raw constructor `api`                                            | root-shaped internal contribution                                      | hard-cut public route             | One canonical `.extendApi`/`.extendEditorApi` route; add direct-object overloads for context-free APIs.                                                                                                                                       |
| `.extendApi(factory)`                                            | plugin-key API factory                                                 | keep mixed                        | Accept object or genuine context factory; object is the default.                                                                                                                                                                              |
| `.extendEditorApi(factory)`                                      | root editor API factory                                                | keep mixed                        | Accept object or genuine context factory; preserve explicit root ownership.                                                                                                                                                                   |
| Raw constructor `selectors`                                      | duplicate and effectively unwired route                                | hard-cut public route             | `.extendSelectors(object or contextFactory)` is canonical.                                                                                                                                                                                    |
| `.extendSelectors(factory)`                                      | option-store selector factory                                          | keep mixed                        | Direct object for context-free selectors; callback only when live options/plugin context is required.                                                                                                                                         |
| Raw constructor `tx`                                             | duplicate low-level group route                                        | hard-cut public route             | Typed `.extendTx` / `.extendTxGroup` only.                                                                                                                                                                                                    |
| `.extendTx(ctx => tx => group)`                                  | nested resolution/transaction callbacks                                | replace with one callback         | `.extendTx(({ tx, editor, type, update, ... }) => group)`; one transaction-time named context.                                                                                                                                                |
| `.extendTxGroup(key, ctx => tx => group)`                        | named nested factory                                                   | replace with one callback         | Same flattened context, explicit group key.                                                                                                                                                                                                   |
| `.extendExtension(object or factory)`                            | Plite extension installation                                           | keep mixed                        | Object by default; callback only for conditional or contextual construction; sweep static callback wrappers.                                                                                                                                  |
| `.withComponent(Component)`                                      | direct render binding                                                  | keep direct                       | Keep as the common component route.                                                                                                                                                                                                           |
| `render.as`                                                      | intrinsic tag in resolved type, component accepted by input/runtime    | hard-cut component variant        | Intrinsic tag only; components belong in `render.node` / `.withComponent`.                                                                                                                                                                    |
| `.clone()`                                                       | descriptor copy                                                        | keep                              | Keep while real consumers exist; it does not need a callback.                                                                                                                                                                                 |
| `toPlatePlugin(base, reactConfig)`                               | explicit host conversion                                               | keep descriptor                   | Keep headless-to-React boundary.                                                                                                                                                                                                              |
| `parser`, `parsers`, serializer fields                           | overlapping Plate parsing contributions                                | consolidate inside feature owner  | Compile one HTML parser registry for Plate document conversion and host-codec adapters. Do not imply a generic symmetric document codec API.                                                                                                  |
| Renderers, handlers, decorators, rule matchers, parser callbacks | runtime behavior                                                       | keep callback                     | They consume props, events, nodes, editor state, or external data.                                                                                                                                                                            |
| `editor.plugin(Plugin)`                                          | descriptor-first contextual portal                                     | keep direct                       | Make this the canonical API/options/update portal.                                                                                                                                                                                            |
| `editor.getPlugin` / `getBasePlugin` teaching                    | immutable descriptor lookup versus incorrectly documented context      | repair route                      | `getPlugin` means descriptor lookup; contextual methods come from `editor.plugin(Plugin)` or React equivalent.                                                                                                                                |
| Public editor runtime cache/store/registry fields                | raw implementation state                                               | internalize surgically            | Keep the descriptor-first portal and genuine dynamic queries; hide caches/stores/registries. Do not invent a diagnostics API without a consumer.                                                                                              |

Evidence: [plugin methods](../../../../packages/core/src/lib/plugin/BasePlugin.ts),
[plugin inputs](../../../../packages/core/src/lib/plugin/createBasePlugin.ts),
[schema compiler](../../../../packages/core/src/internal/plugin/compilePlateModel.ts),
[runtime resolver](../../../../packages/core/src/internal/plugin/resolvePlugins.ts), and
[input-rule types](../../../../packages/core/src/lib/plugins/input-rules/types.ts).

### React, DOM, history, Yjs, layout, and proof APIs

| Concept                                                             | Current shape                                           | Classification                                     | Absolute-best target                                                                                                                                                                |
| ------------------------------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Plite React `useCreateEditor()`                                           | strict context hook                                     | keep direct                                        | Keep stable editor access.                                                                                                                                                          |
| Plite React `useEditorState(selector, options)`                     | immutable projection plus optional manual deps          | keep callback; remove manual freshness             | The hook keeps the latest selector and recomputes safely; callers do not need `useCallback` for correctness.                                                                        |
| Plite React `useEditorSelector(selector, equality, options)`        | advanced editor selector                                | keep callback; normalize signature                 | Move `equalityFn` into the options object.                                                                                                                                          |
| Other selector hooks                                                | mixed positional equality/options                       | normalize                                          | `useX(selector, { equalityFn, ... })`; explicit-editor variants remain `useX(editor, selector, options)`.                                                                           |
| Plate `useEditorSelector(selector, deps, options)`                  | duplicate mutable-editor model                          | hard-cut                                           | Reuse the Plite React selector stack with Plate editor inference.                                                                                                                   |
| Plate `useEditorState()`                                            | subscribes to version and returns mutable editor        | hard-cut                                           | `useCreateEditor()` for editor identity; `useEditorState(selector)` for immutable projection.                                                                                             |
| Plate `useEditorRef()` and fallback editor                          | public hook can surface an internally fabricated editor | split honest contracts                             | Keep one stable inert fallback privately for hook order. Expose strict `useCreateEditor()` and nullable `useActiveEditor()`; do not advertise the fallback as an arbitrary custom editor. |
| `useElement` / `usePath`                                            | casted `{}` / `undefined` fallbacks                     | replace with strict/optional overloads             | Prefer descriptor inference and runtime scope; retain generic/type-only overloads for composed and generic elements.                                                                |
| `PlateElementProps` generic pairing                                 | manually paired node/config types                       | add descriptor inference, keep generic composition | Prefer `PlateElementProps<typeof QuotePlugin>` when schema inference is sufficient; retain `PlateElementProps<TElement, Config>` for intersections and generic renderers.           |
| `useNodePath(node)`                                                 | memoized snapshot that admits staleness                 | hard-cut misleading promise                        | Arbitrary node objects have no durable live identity. Use provider path/runtime ID/anchor for live state or `editor.read.nodes.path(node)` for a snapshot.                          |
| `usePliteCommandCallback(editor => ...)`                            | arbitrary closure named command                         | split APIs                                         | `usePliteCommand(descriptor, options)` is primary; rename the imperative escape hatch `usePliteEditorCallback` or remove it.                                                        |
| Selector `deps` arrays                                              | custom closure freshness system                         | hard-cut after latest-callback repair              | Selector hooks own closure freshness. Source adapters use a named `revision` only when external mutable state changes without a new value identity.                                 |
| Annotation/widget `{ deps, project }`                               | callback projector wrapper                              | replace with direct values                         | Accept direct arrays plus normal options; caller uses `useMemo` for derived arrays.                                                                                                 |
| Plite/Editable render and event props                               | React/DOM callbacks                                     | keep callback                                      | These consume live props/events/DOM.                                                                                                                                                |
| Plate provider `onChange` family                                    | reduced payload and cancellable fallback semantics      | replace event contract                             | Canonical immutable commit observer plus narrow value/selection conveniences; subscriptions must not depend on `PlateContent` mounting.                                             |
| `platejs/react` entrypoint                                          | React-owned app exports                                 | keep ownership; curate                             | App code imports pure builders from `platejs` and React APIs from `platejs/react`. Do not create a third canonical pure-builder route through React.                                |
| Core/React generated barrels                                        | broad star exports                                      | replace with curated entrypoints                   | Internal stores, effects, contexts, render pipes, test helpers, HTML cleaners, and fallback machinery move to internal/advanced/test paths.                                         |
| Public import/type proof                                            | tiny umbrella test                                      | replace proof                                      | Exact runtime and declaration contracts for `platejs`, `platejs/react`, and `platejs/static`.                                                                                       |
| Editor creation value                                               | nodes/string/callback/Promise/null                      | split APIs                                         | Rename one-shot content to `initialValue`; keep a synchronous contextual initializer, reject strings/Promises/null, and let external loaders or collaboration own async state.      |
| `usePlateEditor` / `usePlateViewEditor` deps and async force-render | custom lifecycle                                        | simplify                                           | Publish synchronously. Controller fallback preserves hook topology while product loading UI owns remote readiness.                                                                  |
| Plite DOM `defineHostCodec` / `hostCodecs`                          | static claims plus bounded callbacks                    | keep mixed                                         | Keep as the MIME host-transport pattern over fitted slices.                                                                                                                         |
| Plate HTML/Markdown conversion versus React static rendering        | feature conversion plus presentation rendering          | keep separate; repair names                        | Keep MIME host codecs as slice transport and feature-owned document conversion. Rename React `serializeHtml` to `renderStaticHtml`; do not add `editor.api.codecs`.                 |
| DOM coverage materializer                                           | three positional arguments                              | normalize callback                                 | One named payload object, matching the React boundary.                                                                                                                              |
| `dom(options)`, `react(options)`, `history(options)`                | direct extension factories                              | keep descriptor                                    | Keep.                                                                                                                                                                               |
| Yjs provider                                                        | direct structural object                                | keep static                                        | Do not replace with provider factory injection.                                                                                                                                     |
| `createYjsExtension(options)`                                       | explicit extension constructor                          | keep                                               | Keep the searchable constructor name; `yjs()` is ambiguous and buys nothing.                                                                                                        |
| Layout node/typography providers                                    | one surface-owned policy callback                       | keep for current evidence                          | Do not attach view layout to editor/schema extensions. If another reusable owner appears, compile an explicitly selected surface profile.                                           |
| `createPliteLayout(editor, getOptions)`                             | getter callback for freshness                           | replace render-time mutable getter                 | `createPliteLayout(editor, options)` plus atomic `layout.reconfigure(options)` after React commit.                                                                                  |
| DOM strategy layout getters                                         | zero-arg getters returning captured arrays              | replace with direct discriminated data             | Put `pageItems`, `visiblePageItems`, and `topLevelItems` under the virtualized strategy.                                                                                            |
| Estimated layout engine factory                                     | cheap explicit instance factory                         | keep                                               | Allocation is irrelevant; a singleton risks accidental cross-editor state.                                                                                                          |
| `PlitePageLayoutBoxProvider`                                        | unused public type                                      | hard-cut                                           | Delete; no callsites exist.                                                                                                                                                         |
| Hyperscript element shorthands                                      | static declaration map                                  | keep static                                        | Keep.                                                                                                                                                                               |
| Hyperscript custom creators                                         | positional `any` callbacks                              | defer repair                                       | Callback is legitimate; eventually type one `{ tag, props, children }` context.                                                                                                     |
| Browser typed scenario steps                                        | serializable descriptors                                | keep static                                        | Keep.                                                                                                                                                                               |
| Browser scenario `kind: 'custom'`                                   | closure inside replayable union                         | split proof lanes                                  | Canonical scenarios accept serializable steps only; retain an explicitly non-replayable imperative runner that cannot satisfy replay/reduction/release gates.                       |
| `harness.withExtension`                                             | callback wrapper with no consumers                      | hard-cut                                           | Delete.                                                                                                                                                                             |
| Browser handle string method evaluator                              | stringly public escape hatch                            | internalize                                        | Keep curated typed harness methods public; do not generate a mirror of the volatile internal handle.                                                                                |
| Mobile proof transport builders                                     | construction layer with no runner consumer              | hard-cut                                           | Keep the small release-proof capability taxonomy; delete unused target/session/script builders instead of adding another descriptor.                                                |
| Mobile machine defaults                                             | hardcoded SDK/device assumptions                        | hard-cut with dead transport layer                 | A future executable runner owns environment discovery and records the resolved device explicitly.                                                                                   |

Evidence: [Plite selectors](../../../../packages/plite-react/src/hooks/use-editor-selector.tsx),
[Plate selectors](../../../../packages/core/src/react/stores/plate/useEditorSelector.ts),
[Plate store hooks](../../../../packages/core/src/react/stores/plate/createPlateStore.ts),
[Plite command hook](../../../../packages/plite-react/src/hooks/use-plite-runtime.tsx),
[host codecs](../../../../packages/plite-dom/src/plugin/host-codec.ts), and
[layout API](../../../../packages/plite-layout/src/index.ts).

## Severity-ranked findings

### P1: public types or routes actively lie

1. **Plate exposes its hook-order fallback as a fully typed custom editor.** A
   stable inert editor is legitimate inside the controller subscription, but
   public consumers need strict active access or explicit `null`; they must not
   mutate a fallback and silently lose work.
2. **`useElement` and `usePath` fabricate values.** Returning `{}` or
   `undefined as any` from non-null public hooks defeats TypeScript and makes an
   agent's locally valid patch fail at runtime.
3. **Plite state fields dispatch on `typeof value === 'function'`.** A
   function-valued field cannot be initialized or assigned unambiguously.
4. **Plate's raw `selectors` constructor route is not the selector publication
   owner.** The runtime publishes `__selectorExtensions`; a public field that
   looks authoritative but is not is worse than no field.
5. **The strict Plite package type smoke is stale and unwired.** It references
   nonexistent `start` and `end` exports while docs claim it as proof.

### P2: high-value architecture and AX repairs

1. Hard-cut input-rule helper injection and publish imported `inputRule.*`.
2. Keep advanced Plate schema factories for configured owner/reference
   resolution; sweep only callbacks that consume none of that context.
3. Keep weak optional `targetPluginNames`, compile one internal resolved target
   binding, and replace only ambiguous shortcut precedence.
4. Compose `.configure(object | callback)` layers; flatten `.extendTx` and `.extendTxGroup`;
   remove raw public `api` / `tx` / `selectors` routes; allow direct object
   overloads on the canonical `.extend*` methods.
5. Delete Plate's duplicate React selector model, keep the controller fallback
   private, and expose strict plus nullable editor hooks.
6. Curate package entrypoints: pure app DSL from `platejs`, React APIs from
   `platejs/react`, owner imports inside packages.
7. Default derived schema identity and `unknown: 'reject'`; constrain editor
   extension tuples.
8. Remove duplicate root editor-bound query exports and place read-only control
   on the view/runtime owner.
9. Make command hooks descriptor-first while retaining Plite's justified
   extension command-registration factory.
10. Make Plate editor creation synchronous and split HTML/async loading into
    explicit owners.
11. Keep host codecs, feature document conversion, and React rendering
    distinct; rename static rendering honestly.
12. Preserve canonical commit payloads through Plate provider callbacks and
    remove mount-dependent subscription behavior.
13. Remove manual selector dependency arrays after latest-callback repair;
    source adapters use explicit external revisions where necessary.
14. Replace render-time layout option getters and fake DOM getters, but keep
    surface-owned layout policy until another reusable consumer exists.

### P3: cleanup and teaching

1. Freeze all pure exported `*Api` namespaces.
2. Fold `property.typed` into inferable `property.json`.
3. Make `render.as` intrinsic-only.
4. Sweep static `.extendExtension(() => ({ ... }))` wrappers.
5. Normalize remaining public callback payloads to one named object where the
   callback is not a hot-path primary algebra function.
6. Repair phantom/missing docs (`element`, `target`, facets, annotations,
   selections, DOM codec property targets, History JSON version).
7. Delete dead layout APIs and the unused mobile transport construction layer;
   keep an explicitly non-replayable browser lane outside canonical proof.

## Rechecked shape ledger and execution ranking

Shape numbers remain stable so review comments keep meaning. `Keep` and
`defer` rows are not implementation packets.

| Shape | Score | Verdict | Packet / reason                                                                                                                            |
| ----: | :---: | ------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
|     0 |  A+   | Accept  | Public API proof baseline: exact runtime/declaration contracts prevent every later hard cut from drifting.                                 |
|     1 |  A+   | Accept  | Imported `inputRule` DSL and factory hard cut: zero production callback consumers and immediate API clarity.                               |
|     2 |  A+   | Accept  | Root editor-query export hard cut: one canonical `editor.read.*` route; keep `isEditor`.                                                   |
|     3 |  A+   | Revise  | Compose ordered non-widening object and callback `.configure` layers. `.extend` remains the widening owner.                                |
|     4 |  A+   | Accept  | Flatten `.extendTx` / `.extendTxGroup`; privately retain stable plugin capture and expose one transaction context.                         |
|     5 |   A   | Accept  | Canonical Plate API/selector/tx authoring routes; remove zero-use raw constructor fields.                                                  |
|     6 |   A   | Accept  | Surgical Plite callback normalization; leave hot state/tx and phase-specific contexts alone.                                               |
|     7 |   A   | Accept  | Explicit state-field creation and updates; function-valued fields become representable.                                                    |
|     8 |   A   | Accept  | Plite schema defaults and extension tuple typing; safe defaults and callsite errors.                                                       |
|     9 |   —   | Keep    | Keep top-level weak optional `targetPluginNames`; typed descriptors are for required peers. No public packet.                               |
|    10 |   A   | Revise  | Infer the sole shortcut route and require optional target `update` or `api` only for collisions.                                           |
|    11 |   A   | Revise  | Keep the fallback private for Rules of Hooks; add honest strict and nullable public access and remove duplicate selector semantics.        |
|    12 |   A   | Revise  | Descriptor-first inference plus generic/type-only overloads; strict/optional context; no fake live arbitrary-node path.                    |
|    13 |   A   | Revise  | Add a descriptor-first dispatcher returning `(input) => boolean`; keep the honestly named editor callback only if adopted.                 |
|    14 |  A-   | Revise  | Remove selector deps without requiring caller memoization; use direct stores and explicit source revisions.                                |
|    15 |   A   | Revise  | Curate exports, but keep pure DSL in `platejs` and React APIs in `platejs/react`.                                                          |
|    16 |   A   | Revise  | Synchronous `initialValue`, contextual sync decode, external async ownership, and no fake editable loading document.                       |
|    17 |  B+   | Revise  | Keep three distinct owners; rename React static rendering. Reject `editor.api.codecs`.                                                     |
|    18 |  A-   | Revise  | Add canonical non-cancellable `onCommit`, exact commit payloads, and provider-owned node/text subscriptions.                               |
|    19 |  A-   | Revise  | Internalize raw plumbing gradually behind `editor.plugin(Descriptor)`; no speculative inspector.                                           |
|    20 |   —   | Defer   | One product callback does not earn a layout descriptor compiler; never bind view layout globally to editor/schema.                         |
|    21 |  B+   | Revise  | Atomic `reconfigure`, direct virtualized strategy data, keep the engine factory, delete the orphan box provider.                           |
|    22 |   B   | Revise  | Freeze pure APIs, infer policy through `property.json`, constrain `render.as`, sweep static extension wrappers; keep `createYjsExtension`. |
|    23 |   B   | Revise  | Split canonical and imperative proof, internalize raw handle calls, delete unused mobile transport builders.                               |
|    24 |   B   | Accept  | Documentation and agent routes closure; update docs per packet and finish exact exports/proof maps.                                        |

## Before/after contract for every ranked packet

These are target public spellings, not compatibility proposals. Implementation
may refine a private type name, but it must preserve the visible distinction
shown by each pair. A packet with several public changes has several pairs.

### Shape 0. Public API proof baseline

**Before** — a stale, hand-picked smoke file can compile against names that are
not part of the real package contract, and umbrella exports are barely checked.

```ts
type Start = typeof import("@platejs/plite").start;
type End = typeof import("@platejs/plite").end;
```

**After** — each public entrypoint owns an exact runtime export list and a
declaration-only consumer contract, both wired into the package gate.

```ts
import * as plite from "@platejs/plite";
import * as plateReact from "platejs/react";
import * as plateStatic from "platejs/static";

expect(Object.keys(plite).sort()).toEqual(PLITE_PUBLIC_EXPORTS);
expect(Object.keys(plateReact).sort()).toEqual(PLATE_REACT_PUBLIC_EXPORTS);
expect(Object.keys(plateStatic).sort()).toEqual(PLATE_STATIC_PUBLIC_EXPORTS);
```

The type fixture imports the same supported names from built declarations; it
does not maintain an unrelated wish list.

### Shape 1. Imported `inputRule` DSL and factory hard cut

**Before** — a callback exists only to dispense pure constructors.

```ts
inputRules: ({ rule }) => [
  rule.mark({ match: "**", type: "bold" }),
  rule.blockStart({ match: "# ", type: "h1" }),
];
```

**After** — import the frozen construction namespace and pass concrete data.

```ts
import { inputRule } from "platejs";

inputRules: [
  inputRule.mark({ match: "**", type: "bold" }),
  inputRule.blockStart({ match: "# ", type: "h1" }),
];
```

Runtime rule fields such as `enabled`, `resolve`, and `apply` remain callbacks.

### Shape 2. Root editor-query export hard cut

**Before** — the same editor-bound read has two public routes.

```ts
import { above, before } from "@platejs/plite";

const entry = above(editor, options);
const point = before(editor, location);
```

**After** — the editor namespace is the only read route.

```ts
const entry = editor.read.nodes.above(options);
const point = editor.read.points.before(location);
```

`isEditor(value)` stays standalone because it is a value guard, not an
editor-bound query.

### Shape 3. Composed non-widening `.configure`

**Before** — only one static and one contextual configuration slot survive;
later calls erase earlier package or application behavior.

```ts
const Configured = Plugin.configure(({ getOption }) => ({
  options: { level: getOption("level") + 1 },
})).configure({ render: { as: "blockquote" } });
```

**After** — object and contextual forms both remain non-widening and compose in
declaration order. `.extend` stays reserved for additions that widen inferred
options, API, or selectors.

```ts
const Configured = Plugin.configure({ options: { level: 2 } }).configure(
  ({ editor, getOptions }) => ({
    options: {
      type: editor.plugin(ParagraphPlugin).type,
    },
    shortcuts: getOptions().enabled ? shortcuts : {},
  })
);
```

`undefined` preserves an earlier field; explicit `null` removes it. Moving the
callback to `.extend` would fix neither composition nor semantics.

### Shape 4. Flatten `.extendTx` / `.extendTxGroup`

**Before** — every author sees plugin resolution and transaction creation as
two nested callbacks.

```ts
Plugin.extendTx(({ editor, type }) => (tx) => ({
  toggle: () => tx.blocks.toggle(type),
}));
```

**After** — one transaction-time context contains the transaction and resolved
plugin context.

```ts
Plugin.extendTx(({ editor, tx, type, updateContext }) => ({
  toggle: () => tx.blocks.toggle(type),
}));
```

The compiler may capture stable plugin data privately; that phase is not a
public callback. `updateContext` avoids colliding with the existing one-shot
plugin `update` helper.

### Shape 5. Canonical Plate API/selector/tx authoring routes

**Before** — raw constructor fields compete with typed extension methods.

```ts
createBasePlugin({
  api: { ping: () => "pong" },
  selectors: { enabled: () => true },
  tx: { toggle: (tx) => tx.marks.toggle("bold") },
});
```

**After** — one typed route per namespace, with a plain object for static
members and a context factory only when context is consumed.

```ts
createBasePlugin()
  .extendApi({ ping: () => "pong" })
  .extendSelectors({ enabled: () => true })
  .extendTx(({ tx, type }) => ({
    toggle: () => tx.marks.toggle(type),
  }));

Plugin.extendEditorApi(({ editor }) => ({
  inspectPlugin: () => editor.plugin(Plugin),
}));
```

### Shape 6. Surgical Plite callback normalization

**Before** — low-frequency lifecycle and middleware factories duplicate the
editor positionally and grow through more positional arguments.

```ts
api: (editor, context) => ({ inspect: () => context.schema.inspect(editor) }),
activate: (editor, context) => () => context.cleanup(editor),
materialize: (editor, root, options) => materialize(editor, root, options),
```

**After** — those callbacks receive one named payload.

```ts
api: ({ editor, schema }) => ({ inspect: () => schema.inspect(editor) }),
activate: ({ editor, onCleanup, signal }) => {
  onCleanup(() => release(editor));
},
materialize: ({ editor, root, options }) => materialize(editor, root, options),
```

Hot primary algebra stays direct:

```ts
state: { count: (state, editor) => state.count(editor) },
tx: { toggle: (tx, editor) => tx.marks.toggle(editor.selection()) },
commands: ({ handle, around }) => [handle(command, handler)],
```

### Shape 7. Explicit state-field creation and updates

**Before** — functions can mean either values or callbacks.

```ts
defineStateField<Listener>({ initial: () => onCommit });
tx.setField(listenerField, () => nextListener);
```

**After** — value and computation are different methods.

```ts
defineStateField<Listener>({ initial: onCommit });
defineStateField<Listener>({ createInitial: () => onCommit });

tx.setField(listenerField, nextListener);
tx.updateField(countField, (count) => count + 1);
```

### Shape 8. Plite schema defaults and extension tuple typing

**Before** — ordinary schemas repeat policy and editor creation accepts invalid
extension-shaped values too far into the type graph.

```ts
defineEditorSchema({
  identity: "derived",
  unknown: "reject",
  roots,
});

createEditor({ extensions: [paragraph, 42] });
```

**After** — safe ordinary policy is the default, while durable lineage remains
explicit and invalid tuple members fail at the callsite.

```ts
defineEditorSchema({ roots });

defineEditorSchema({
  id: "acme:document",
  version: 2,
  roots,
});

createEditor({ extensions: [paragraph, history()] as const });
// createEditor({ extensions: [paragraph, 42] as const }); // type error
```

Omission means derived identity and `unknown: 'reject'`; it never means an
anonymous permissive schema.

### Shape 9. Keep weak optional `targetPluginNames`

**Before (rejected rewrite)** — typed targets hidden in `config` look cleaner,
but force feature-package imports, snapshot eager descriptor types, and turn
optional peers into required dependencies.

```ts
createBasePlugin({
  config: { targets: [ParagraphPlugin, BlockquotePlugin] as const },
});
```

**After (keep)** — required peers use descriptors in the schema factory;
product-selected optional applicability remains a top-level key allowlist.

```ts
createBasePlugin({
  targetPluginNames: [KEYS.p, KEYS.blockquote],
  schema: ({ own, plugins, targetPluginNames }) => ({
    properties: [
      own.elementProperty(property.string(), {
        target: target.types(plugins.elementTypesByName(targetPluginNames)),
      }),
    ],
  }),
});
```

The compiler should resolve that list once into one private binding used by
schema, parsing, injection, and matching. Missing optional plugins are skipped
deliberately; typos can be diagnosed without pretending the peer is required.

### Shape 10. Inferred Plate shortcut targets

**Before** — the shortcut map key silently tries transaction methods and then
plugin API methods.

```ts
shortcuts: {
  toggle: { keys: 'mod+b' },
}
```

**After** — the sole matching route is inferred. `target` stays optional and is
required only when the same key exists in both namespaces.

```ts
shortcuts: {
  toggle: { keys: 'mod+b' }, // only update.toggle exists
  inspect: { keys: 'mod+shift+b', target: 'api' }, // collision
  contextual: {
    keys: 'mod+alt+b',
    handler: ({ editor, event }) => handleContextualShortcut(editor, event),
  },
}
```

Use public `update`, not internal `tx`, as the discriminant. A custom handler
forbids `target`; zero candidates is a compile and runtime error. Keyboard keys
stay Plate-owned.

### Shape 11. Honest hooks over a private controller fallback

**Before** — editor identity, immutable state, and controller fallback are
blurred together.

```ts
const editor = useEditorRef(); // can be a fabricated fallback editor
const versionedEditor = useEditorState(); // mutable editor returned as state
const value = useEditorSelector(selector, deps, options);
```

**After** — the controller still subscribes through one stable inert editor so
hook order never changes, while public hooks state whether absence is legal.

```ts
const editor = useCreateEditor(); // strict: requires the mounted editor provider
const selection = useEditorState((state) => state.selection());
const activeEditor = useActiveEditor({ id }); // PlateEditor | null
```

`useCreateEditor()` throws only when its strict contract is violated.
`useActiveEditor()` returns `null` while a controller has no active editor. The
fallback creator and arbitrary custom-editor cast remain private; they are an
implementation device, not document state.

### Shape 12. Descriptor-inferred element/path hooks

**Before** — callers pair generics manually and non-null hooks fabricate empty
values; node paths are memoized snapshots that can go stale.

```ts
const element = useElement<TQuoteElement>();
const path = usePath();
const nodePath = useNodePath(node);

type Props = PlateElementProps<TQuoteElement, QuoteConfig>;
```

**After** — prefer a runtime descriptor when it improves inference and validates
the nested provider scope, but retain type-only/generic overloads for composed
elements and packages that should not import a runtime value.

```ts
const element = useElement(QuotePlugin);
const genericElement = useElement<TQuoteElement & TResizableProps>();
const maybeElement = useOptionalElement(QuotePlugin);
const path = usePath(QuotePlugin);
const maybePath = useOptionalPath(QuotePlugin);

const snapshotPath = editor.read.nodes.path(node); // intentionally non-live

type Props = PlateElementProps<typeof QuotePlugin>;
type ComposedProps = PlateElementProps<
  TQuoteElement & TResizableProps,
  QuoteConfig
>;
```

An arbitrary node object has no durable identity, so `useNodePath(node)` must
not promise magical liveness. Live consumers use provider path, runtime ID, or
an anchor.

### Shape 13. Descriptor-first React command hook

**Before** — an arbitrary editor closure is named as though it were a semantic
command.

```ts
const toggleBold = usePliteCommandCallback((editor) => {
  editor.update.marks.toggle("bold");
});
```

**After** — the primary hook consumes a command descriptor and returns a typed
dispatcher. Semantic input is supplied when the action happens, not baked into
hook options.

```ts
const toggleMark = usePliteCommand(editorCommands.toggleMark);

toggleMark({ key: "bold", value: true });

const focus = usePliteEditorCallback((editor) => editor.api.dom.focus());
```

Routing/focus options remain separate from command input. Keep
`usePliteEditorCallback` only if adoption finds a real imperative consumer.

### Shape 14. React selector/source freshness

**Before** — hooks implement a second dependency-array system and positional
equality arguments; annotation/widget sources wrap values in projector objects.

```ts
useEditorSelector(selector, equalityFn, { deps: [pluginId] });
usePliteAnnotationStore(editor, { deps: [comments], project: () => comments });
```

**After** — hooks keep the latest selector internally, so inline callbacks are
correct without a second dependency array or mandatory `useCallback`.

```ts
useEditorSelector((state) => state.plugin(pluginId), { equalityFn });
usePliteAnnotationStore(editor, comments, { onError });
```

External mutable sources are different: give them an explicit `revision` when
their callbacks can observe new data without a new source identity. Real effect
lifecycle dependencies stay ordinary React dependencies.

### Shape 15. Curated entrypoints with honest ownership

**Before** — ordinary app authoring needs owner knowledge for pure builders,
while generated barrels leak raw stores and renderer plumbing.

```ts
import { schema, target } from "@platejs/plite";
import { createPlatePlugin } from "platejs/react";
```

**After** — app code uses the umbrella's pure entrypoint and the React
entrypoint. Two imports are better than three canonical homes for the same
values.

```ts
import { inputRule, property, schema, target } from "platejs";
import { createPlatePlugin } from "platejs/react";
```

Feature packages import owning packages such as `@platejs/plite` and
`@platejs/core`. Internal stores, effects, contexts, render pipes, HTML
cleaners, and test helpers move out of public barrels. Do not reexport pure
builders from `platejs/react`.

### Shape 16. Synchronous publication and explicit async ownership

**Before** — one `value` option can mean nodes, HTML, a callback, a promise, or
absence, and React owns extra readiness behavior.

```ts
const editor = createPlateEditor({
  value: async () => fetch("/document").then((r) => r.text()),
  onReady: ({ editor }) => editor.api.dom.focus(),
});
```

**After** — one-shot document content is named `initialValue`. A synchronous
contextual initializer remains because HTML/Markdown conversion may need the
compiled plugin model.

```ts
const editor = createPlateEditor({
  plugins,
  initialValue: ({ editor }) =>
    editor.plugin(HtmlPlugin).api.deserialize({ element: html }),
});
```

```ts
const initialValue = await loadDocument({ signal });
const editor = createPlateEditor({ plugins, initialValue });
```

Remote loading owns cancellation and staleness outside construction. A
`PlateController` can keep hook topology stable while loading without exposing
an editable default document that is later overwritten. Yjs keeps its explicit
`skipInitialization` route. Promise initializers, implicit HTML strings,
constructor `onReady`, `null`, and empty-array-as-default are hard cuts.

### Shape 17. Keep transport, document conversion, and rendering distinct

**Before** — Plate HTML parsing and React HTML serialization are unrelated
entrypoints with asymmetric guarantees.

```ts
const value = editor.api.html.deserialize({ element });
const html = await serializeHtml(editor);
```

**After** — MIME host codecs continue to parse/serialize fitted
`ContentSlice`s for clipboard transport. HTML document conversion stays
feature-owned, Markdown document conversion uses the sole
`editor.api.markdown` root API, and React output is named as rendering.

```ts
const value = editor.plugin(HtmlPlugin).api.deserialize({ element });
const markdown = editor.api.markdown.serialize({ value });

const rendered = await renderStaticHtml(editor);
```

Do **not** add `editor.api.codecs`: multiple ordered MIME handlers can delegate,
while document conversion and React rendering have different inputs and
guarantees. A singular codec namespace would lie about symmetry that does not
exist.

### Shape 18. Canonical Plate commit observers

**Before** — provider callbacks expose reduced mutable-editor/value payloads,
can suppress one another through fallback semantics, and some subscriptions
exist only while `PlateContent` is mounted.

```tsx
<Plate
  onChange={({ editor, value }) => save(value)}
  onSelectionChange={({ selection }) => inspect(selection)}
/>
```

**After** — one non-cancellable immutable observer carries canonical commit
truth; narrow conveniences derive independently and do not intercept it or one
another.

```tsx
<Plate
  onCommit={({ commit, editor, snapshot }) => {
    persist(commit.changes);
    inspect(snapshot.selection, commit.changed);
  }}
  onValueChange={({ commit, value }) => save(value, commit.version)}
/>
```

The payload reuses `EditorCommitContext`; no parallel change DTO. Node/text
subscriptions attach for the provider lifetime, not to whether a content
component happens to be mounted. Ambiguous cancellable `onChange` is removed or
redefined as an observer, never plugin middleware.

### Shape 19. Internalize Plate runtime plumbing

**Before** — callers can reach caches, option stores, registries, fallback
state, and string-key overloads that are implementation details.

```ts
editor.runtime.pluginCache.get("quote");
editor.getOptionsStore("quote").set("level", 2);
editor.getPlugin("quote");
```

**After** — descriptor-first portals own supported behavior. Raw caches and
registries become private only after each genuine public capability has a typed
owner.

```ts
editor.plugin(QuotePlugin).setOption("level", 2);
editor.plugin(QuotePlugin).api.toggle();
```

Keep `getType`, user/collaboration identity, normalization state, and immutable
descriptor lookup until their real dynamic consumers migrate. Internalize
`pluginCache`, `pluginList`, input-rule/shortcut/component registries, and
option-store plumbing. Do not invent `editor.inspect.plugins()` without a
devtool consumer.

### Shape 20. Defer layout descriptor compilation

**Before (rejected rewrite)** — attaching layout to a plugin looks tidy but
makes one view policy global to every surface using the editor.

```ts
QuotePlugin.extendExtension(layout.node({ block: { marginBlock: 16 } }));
```

**After (keep)** — the one proven pagination surface owns its layout provider.
Screen, print, and mobile previews may legitimately disagree for the same
editor and schema.

```ts
createPliteLayout(editor, () => ({
  nodeLayout: ({ node }) => nodeLayoutByType[node.type],
  typography: ({ node }) => typographyByType[node.type],
}));
```

One consumer does not justify a profile compiler. If at least two reusable
owners prove the need, add an explicitly selected surface `layout.profile(...)`
that Plate may help compose; never mutate the editor/schema's global meaning.

### Shape 21. Committed layout reconfiguration and direct strategy data

**Before** — freshness is encoded through zero-argument getters, and a factory
recreates a stateless engine object.

```ts
const runtime = createPliteLayout(editor, () => options);

<Editable
  domStrategy={{ type: "virtualized" }}
  domStrategyLayout={{
    getVirtualizedPageItems: () => pageItems,
    getVirtualizedTopLevelItems: () => topLevelItems,
  }}
/>;

const engine = createEstimatedPageLayoutEngine();
```

**After** — initial options are direct and later replacement is atomic after
React commit. Virtualized layout data belongs inside the discriminated DOM
strategy rather than behind zero-argument getters.

```ts
const runtime = createPliteLayout(editor, options);
runtime.reconfigure(nextOptions);

<Editable
  domStrategy={{
    type: "virtualized",
    layout: { pageItems, topLevelItems, visiblePageItems },
  }}
/>;

const engine = createEstimatedPageLayoutEngine();
```

`reconfigure` replaces the whole option set and refreshes once; it avoids a
render-time mutable ref exposing abandoned concurrent-render options. Keep the
engine factory—its allocation is irrelevant and a singleton creates future
cross-editor risk. Delete the unused `PlitePageLayoutBoxProvider` type.

### Shape 22. Minor descriptor/immutability cleanup

**Before** — several small APIs teach unnecessary aliases, callbacks, mutable
namespaces, or overly broad component targets.

```ts
property.typed(policy);
Plugin.extendExtension(() => extension);
Plugin.configure({ render: { as: AnyComponent } });
createYjsExtension(options);
ElementApi.isElement = replacement;
```

**After** — keep one obvious form and stable pure namespaces.

```ts
property.json({ policy }); // value type inferred from policy
Plugin.extendExtension(extension);
Plugin.configure({ render: { as: "blockquote" } }); // intrinsic only
createYjsExtension(options); // searchable and unambiguous
Object.isFrozen(ElementApi); // true for every exported pure *Api namespace
```

Custom React rendering continues through `.withComponent(Component)`, not
`render.as`. Keep the contextual `.extendExtension` overload; sweep only
callbacks that consume no context. `property.typed(policy)` and
`property.json({ policy })` produce the same JSON descriptor, so one inferable
builder is better. Renaming `createYjsExtension` to `yjs` has huge churn and
zero semantic value.

### Shape 23. Browser/mobile proof DSL cleanup

**Before** — replayable scenarios can hide arbitrary closures and raw method
strings; mobile proof contains product and machine assumptions centrally.

```ts
scenario.step({ kind: "custom", run: async (page) => page.fill("#x", "text") });
harness.withExtension((editor) => install(editor));
handle.call("someMethod", rawArgs);

resolveMobileTarget("plate", {
  androidSdk: "/Users/me/Library/Android/sdk",
  device: "emulator-5554",
});
```

**After** — canonical scenarios contain serializable typed steps. Unsupported
experiments use an explicitly imperative lane whose result cannot satisfy
replay, reduction, or release proof.

```ts
scenario.step(browserStep.fill({ target: "#x", value: "text" }));

await runScenario(scenario);

await runImperativeScenario("native keyboard experiment", async ({ step }) => {
  await step("type", () => page.keyboard.type("X"));
});
```

Delete unused `harness.withExtension` and internalize the raw string handle
evaluator behind curated typed harness methods. The mobile transport/session
construction layer has no runner consumer: delete it and its machine defaults
instead of decorating dead code with `defineBrowserMobileProof`. A future real
device runner owns discovery and records the resolved target.

### Shape 24. Documentation and agent routes closure

**Before** — docs can teach phantom imports, stale wrappers, or APIs that the
package contract does not prove.

```ts
import { element } from "@platejs/plite";

const block = above(editor, options);
```

**After** — examples use the final supported entrypoint and are checked against
the exact export/type contract.

```ts
import { schema, target } from "platejs";
import { createPlatePlugin } from "platejs/react";

const block = editor.read.nodes.above(options);
```

Each implementation packet closes its docs/examples in the same slice. The
final closure packet audits facets, annotations, custom selections, DOM codec
property targets, History JSON versions, agent routes, and the proof map; it
does not postpone every doc repair until the end.

## Rejected rewrite gallery

These are not deferred options. They are tempting simplifications the audit
explicitly rejects.

### Pure schema builders: reject callback injection

**Before (rejected target)**

```ts
schema: ({ schema }) => ({
  element: { content: schema.content.text() },
});
```

**After (keep)**

```ts
import { schema } from 'platejs';

schema: {
  element: { content: schema.content.text() },
}
```

### Commands: reject descriptor-owned registration

**Before (rejected target)**

```ts
commands: [saveCommand.handle(handler), saveCommand.around(wrapper)];
```

**After (keep)**

```ts
commands: ({ handle, around }) => [
  handle(saveCommand, handler),
  around(saveCommand, wrapper),
];
```

The factory is the installed-editor generic binding point, not helper
injection.

### Cross-plugin schema: reject eager descriptor types

**Before (rejected target)**

```ts
schema: {
  element: { content: target.type(ParagraphPlugin.type) },
}
```

**After (keep)**

```ts
schema: ({ plugins }) => ({
  element: { content: target.type(plugins.elementType(ParagraphPlugin)) },
});
```

The compiler context sees configured types and proves the referenced plugin is
present and compatible.

### Contextual configuration: reject widening `.extend`

**Before (rejected target)**

```ts
Plugin.extend(({ editor }) => ({
  options: { type: editor.plugin(ParagraphPlugin).type },
}));
```

**After (keep and compose)**

```ts
Plugin.configure(({ editor }) => ({
  options: { type: editor.plugin(ParagraphPlugin).type },
}));
```

Configuration overrides existing shape; extension widens it. The storage bug
does not justify erasing that distinction.

### Optional plugin targeting: reject descriptors hidden in config

**Before (rejected target)**

```ts
Plugin.configure({
  config: { targets: [ParagraphPlugin, BlockquotePlugin] as const },
});
```

**After (keep)**

```ts
Plugin.configure({
  targetPluginNames: [KEYS.p, KEYS.blockquote],
});
```

Descriptors remain mandatory for required peers. A product-selected weak
allowlist should not force imports or turn absent optional features into schema
failures.

### Shortcuts: reject DOM policy on Plite commands

**Before (rejected target)**

```ts
defineCommand({
  key: "toggleBold",
  shortcut: "mod+b",
});
```

**After (keep)**

```ts
const toggleBold = defineCommand({ key: "toggleBold" });

createPlatePlugin({
  shortcuts: { toggle: { keys: "mod+b" } },
});
```

Plite owns semantic commands; Plate owns keyboard and event policy.

### Conversion: reject `editor.api.codecs`

```ts
// Document conversion is feature-owned.
editor.plugin(HtmlPlugin).api.deserialize({ element });

// Clipboard transport is MIME-keyed and can delegate between handlers.
hostCodecs("clipboard", [htmlClipboardCodec]);

// React output is presentation rendering.
renderStaticHtml(editor);
```

Those three operations are not one symmetric codec family.

### Layout: reject editor-global plugin contributions

```ts
const printLayout = createPliteLayout(editor, () => printOptions);
const screenLayout = createPliteLayout(editor, () => screenOptions);
```

The same editor may back several surfaces. A plugin must not silently choose
one global layout policy.

## Accepted and rejected shapes

Accepted:

- imported frozen builder namespaces for pure declaration algebra;
- plain objects for static declarations;
- descriptors for identity, policy, inference, and replayable actions;
- callbacks for immutable-config derivation, runtime reads, transactions,
  events, parsers, renderers, lifecycle, and mapping;
- direct one-shot reads/writes plus callbacks for coherent snapshots and atomic
  multi-step updates;
- strict hooks and explicitly nullable optional hooks;
- one private inert controller fallback solely to preserve subscription and
  Rules-of-Hooks topology;
- Plate schema factories that resolve configured owner types and typed plugin
  references before Plite sees the final schema.

Rejected:

- `schema: ({ schema }) => ...` or any mega callback context that merely hides
  imports;
- eager `SomePlugin.type` or a second Plate-only schema AST that trades away
  candidate-installation validation merely to remove a justified callback;
- descriptor-owned `command.handle/around` unless installed-editor inference
  can be preserved without casts or caller annotations;
- shortcut keys or DOM policy owned by headless Plite command descriptors;
- helper-only `inputRules` factories;
- `config.targets`, mandatory shortcut targets, and contextual configuration
  routed through widening `.extend`;
- `editor.api.codecs`, editor-global layout contributions, speculative runtime
  inspectors, and a `createYjsExtension` rename;
- raw strings for required plugin references, ambiguous command routing,
  replayable browser actions, or public handle methods; weak optional plugin
  allowlists remain keys by design;
- value-or-callback unions distinguished with `typeof`;
- public fake editors, fake elements, fake paths, or mutable object decoration
  hidden behind hooks; an internal inert store fallback is allowed;
- generated barrels as public API policy;
- compatibility aliases or dual signatures after an accepted hard cut.

## Pressure pass

The tempting blanket rule "every injected builder should become a descriptor
method" is wrong. It fails for Plite commands because `commands` is also the
generic binding point for the installed editor. The accepted command plan and
`generic-command-contract.ts` make that constraint concrete. `inputRules` has
no equivalent constraint and therefore fails the same test.

The tempting blanket rule "all callbacks should receive one object" is also
too broad. Lifecycle and middleware APIs benefit because named payloads remove
duplicate positional data and evolve safely. Plite's primary state/transaction
algebra can remain state/transaction-first because the object itself is the
operation context and sits on a hot path. Plate's nested `.extendTx` still
fails: two callbacks expose two implementation phases to every plugin author.

The tempting static cross-plugin schema syntax also loses. `SomePlugin.type`
captures the descriptor's eager type, not the configured installed type, and
cannot prove that the target is enabled and present in the candidate graph.
Keeping a second Plate-only unresolved schema AST would duplicate the DSL for
roughly 22 factories that already consume genuine compiler context. Keep those
factories; sweep only callback bodies that do not read the context.

Curated reexports must also preserve ownership. Feature packages import owning
packages internally; app code imports pure builders from `platejs` and React
constructors/hooks from `platejs/react`. Reexporting pure builders through the
React entrypoint would create a third canonical route, not better AX.

## Verification

- Read root, common, Plite, and Plate vision doctrine.
- Audited live package barrels, callback-bearing public types, implementations,
  current docs/examples, production callsites, and type/runtime tests.
- Reconciled independent Plite core, Plite satellite, Plate plugin, Plate
  runtime/React, production usage, and adversarial recommendation passes.
- No product/package implementation was performed.
- Browser proof: N/A; this artifact makes no runtime or visual behavior claim.
- Package tests/typecheck: N/A; only planning artifacts changed.

## Needs attention

Implementation should start at rank 0 and proceed by vertical hard-cut packet.
Each packet needs public type/runtime import proof, source-first package tests,
affected docs/examples, and browser proof only when behavior or a runnable UI
surface changes. No packet should add a second public signature as a migration
bridge.
