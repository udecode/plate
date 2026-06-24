# Core runtime adapter plan

Status:
- `packages/core` is the remaining migration choke point.
- Safe primitive import migration is exhausted.
- Runtime factory packet started and kept: `createPlateRuntimeEditor` creates a
  Slate v2 React editor with Plate identity/meta/cache state attached. It does
  not replace legacy default `createPlateEditor` yet.
- `createPlateEditor({ runtime: 'slate-v2' })` opt-in packet is kept: public
  factory routing can return a branded `PlateRuntimeEditor` for the explicit
  v2 route while preserving the legacy default route.
- Plugin metadata packet started and kept: `createPlateRuntimeEditor` can
  install simple Plate plugin records, dependency order, overrides, options
  stores, shortcuts, and render/cache metadata without mutating the Slate v2
  `editor.api` proxy.
- Plugin configuration packet started and kept: `createPlateRuntimeEditor` can
  resolve `configure()`, non-command functional `.extend(...)` metadata,
  configured input-rule arrays, and nested `configurePlugin(...)` with a
  v2-safe context.
- Plugin API capability packet started and kept: `createPlateRuntimeEditor` can
  install plugin-specific APIs through Slate v2 `defineEditorExtension({ api })`
  without owning properties on the `editor.api` proxy.
- Command-surface inventory packet kept: `scan-plate-command-surface.mjs` found
  263 plugin API/transform/editor-mutation rows across 30 owners. `packages/core`
  owns 163 rows, and package-local transform owners still commonly close over
  legacy `editor.tf`, so transform migration needs a tx design packet before
  package edits.
- Transform-to-tx design packet kept: replayable document mutations route to
  Slate v2 tx groups, host/runtime side effects route to API capabilities, and
  behavior interception routes to middleware, normalizers, operations, or setup.
  Old `extendTransforms` stays blocked until a focused tx implementation packet
  proves the new command surface.
- Runtime tx registration packet kept: `createPlateRuntimeEditor` can install
  plugin-owned Slate v2 tx groups and prove document mutation through
  `editor.update((tx) => tx.<pluginKey>.<method>())` without exposing legacy
  `getTransforms(plugin)` commands.
- Plugin tx authoring packet kept: `extendTx(...)` exists on Slate and React
  Plate plugin builders, resolves into Slate v2 extension `tx` groups in the
  new runtime scaffold, and keeps Plate plugin API lookup under
  `getPluginApi(plugin)` instead of overriding Slate v2 `editor.getApi`.
- Basic mark-toggle package packet kept: `packages/basic-nodes` mark plugins
  use `extendTx(...)` and `tx.marks.toggle` instead of legacy
  `extendTransforms` / `editor.tf.toggleMark`.
- Basic block-toggle package packet kept: `packages/basic-nodes` heading and
  blockquote toggle plugins use `extendTx(...)` and Slate v2 node tx methods
  instead of legacy `extendTransforms` / `editor.tf.toggleBlock`; only
  blockquote `overrideEditor` remains in that package's command inventory.
- More `@platejs/slate-legacy` import churn is fake progress unless it changes
  the Plate editor runtime owner. Small type-boundary hardening is acceptable
  only when it removes raw casts without pretending the runtime has migrated.

## Source-backed findings

### Current Plate core runtime

`packages/core/src/lib/editor/withSlate.ts` still starts from a legacy editor:
- imports `Selection` and `Value` from `@platejs/slate`.
- imports only `Editor` and `createEditor` from `@platejs/slate-legacy`.
- lines 216-242 accept `e: Editor`, cast it to `SlateEditor`, then mutate it.
- lines 244-254 install Plate-owned metadata and DOM state directly on the
  mutable legacy editor object.
- lines 256-318 attach `getApi`, `getTransforms`, `getPlugin`, option-store
  helpers, and plugin option mutators directly on that object.
- lines 320+ resolve Plate plugins and initialize through
  `editor.tf.init(...)`.

`packages/core/src/react/editor/withPlate.ts` layers React Plate on that same
shape:
- imports `Value` from `@platejs/slate`.
- imports only `Editor` and `createEditor` from `@platejs/slate-legacy`.
- lines 72-94 call `withSlate(...)` with Plate React plugins.
- lines 141-148 default `createPlateEditor()` to legacy `createEditor()`.
- the current legacy route passes Plate core plugins plus caller plugins through
  a named `WithSlateOptions<V, PlateCorePlugin | P>` bridge instead of a raw
  `as any` options cast.

`packages/core/src/react/slate-react.ts` re-exports the upstream legacy React
adapter:
- lines 2-7 export `Editable` and `Slate` from `slate-react`.
- lines 10-15 export legacy node/context hooks.
- public `withReact`, `useSlateStatic`, and `DefaultPlaceholder` re-exports are
  cut; current upstream comparison code imports `withReact` directly from
  upstream `slate-react`, and Plate's internal React enhancer is named in
  `withPlateReact.ts`.

`packages/core/src/react/hooks/useSlateProps.ts` still prepares legacy
`slate-react` props:
- `initialValue` is taken from `editor.children`.
- callbacks receive legacy value/selection events and pipe them through Plate
  stores.

`packages/core/src/react/components/PlateContent.tsx` renders the legacy
`Editable` through `../slate-react` and assumes `editor.children` exists before
render.

### Current Slate v2 runtime target

`packages/slate/src/create-editor.ts` installs the new runtime on editor
creation:
- lines 72-80 define `createEditor(options)`.
- lines 107-128 define transaction runtime methods:
  `read`, `subscribe`, `subscribeCommit`, `subscribeSource`, and `update`.
- lines 186-208 expose public `api`, `getApi`, `read`, `subscribe`,
  `subscribeCommit`, `update`, and `extend`.
- line 230 installs the internal runtime with `setEditorRuntime(...)`.

`packages/slate/src/interfaces/editor.ts` defines the public v2 editor shape:
- `BaseEditor` owns `api`, `getApi`, `read`, `subscribe`, `subscribeCommit`,
  `update`, and `extend`.
- `EditorRuntime` is the runtime-facing subset plus `editor`.
- `EditorView` adds `focus`, `blur`, `root`, `runtime`, and a root-scoped
  `children` getter.

`packages/slate/src/editor-runtime-view.ts` gives the root view Plate should
target:
- `createEditorRuntime(options)` creates one root runtime around a new v2
  editor.
- `createEditorView(runtime, { root, readOnly })` creates a root-scoped view
  with `children`, `read`, `update`, `subscribe`, and focus state.

`packages/slate-react/src/plugin/with-react.ts` exposes the React bridge as an
extension:
- `react()` installs DOM/clipboard/focus/composition capabilities.
- `createReactEditor()` creates a Slate v2 editor with `react()` and
  `history()` extensions installed.

`packages/slate-react/src/components/slate.tsx` renders either:
- a concrete v2 React editor, or
- a root view from `SlateRuntime`.

## Target architecture

The clean target is a Plate runtime over Slate v2, not a fake compatibility
layer over old Slate.

Recommended shape:

1. `createPlateEditor()` creates or receives a Slate v2 React editor.
   - Default source should become `createReactEditor(...)` or an equivalent
     Plate-owned wrapper around `createEditorRuntime(...)` plus `react()` and
     `history()` extensions.
   - The explicit opt-in route already exists as
     `createPlateEditor({ runtime: 'slate-v2' })`; the remaining decision is
     when that route becomes default.
   - `value` maps to Slate v2 `initialValue`.
   - `selection` maps to Slate v2 `initialSelection`.

2. Plate plugin metadata remains Plate-owned.
   - Keep `editor.meta`, `editor.plugins`, option stores, `getPlugin`,
     `setOption`, `setOptions`, and render caches as Plate augmentations.
   - Do not push Plate plugin product concepts into `@platejs/slate`.

3. Plate command surface becomes an extension/transaction layer, not legacy
   `EditorTransforms`.
   - Public app commands should move toward `editor.tf.*` / `editor.api.*`
     backed by Slate v2 extension capabilities where replayable.
   - Side-effectful host/runtime handles stay under capability APIs, not
     transaction operations.
   - Do not keep `editor.tf` as a fake compatibility alias. If Plate keeps that
     spelling, it must be a deliberate Plate v2 command facade backed by Slate
     v2 tx/capability primitives, not a wrapper around legacy editor mutation.
   - First implementation proof installed one tx group through
     `createPlateRuntimeEditor` and proved `editor.update((tx) => ...)`
     performs the mutation while old `extendTransforms` still throws.
   - Plugin authoring proof added `extendTx(...)` so plugins can fill those tx
     groups without populating legacy transforms.
   - First package proofs migrated mark and block toggles in
     `packages/basic-nodes`.
   - Next implementation proof should pick the next package command family
     from the command-surface inventory. Runtime interception rows such as
     blockquote `overrideEditor` are not tx commands.

4. React bridge moves from upstream `slate-react` to `@platejs/slate-react`.
   - `PlateSlate` should render the new `Slate` provider.
   - `PlateContent` should render the new `Editable`.
   - `useSlateProps` must convert Plate callback/store semantics to
     `SlateChange`, not legacy `initialValue` events.

5. Static/server editor path should either:
   - use `@platejs/slate` `createEditor(...)` with no React extension, or
   - remain a deliberately separate static adapter until the React path is
     green.

6. The `platejs` aggregate legacy export is last.
   - Do not remove `export * from '@platejs/slate-legacy'` until core runtime,
     React bridge, tests, aggregate package, and playground proof are green.

## Compatibility cuts

No public compat aliases or shims:
- no fake `T*` aliases;
- no public re-export of old Slate types from `platejs`;
- no pretending legacy `.children/.selection/.operations` mutation is the
  public v2 model when the runtime source of truth is `read/update`;
- no silent fallback from v2 `NodeApi` to legacy `NodeApi` inside Plate helpers.
- no Plate compatibility override of Slate v2 runtime names such as `api`,
  `getApi`, `state`, or `tx`; use explicit Plate names like `getPluginApi`
  when the surface is plugin metadata rather than Slate runtime capability.

Temporary scaffold allowed:
- `@platejs/slate-legacy` remains private migration scaffold for current Plate
  until the aggregate cut is proven.
- Internal casts may exist only inside a named adapter file and only while that
  packet is under proof; do not spread casts through plugin helpers.

## Packet order

1. **Runtime factory packet**
   - Add a Plate-owned runtime factory around Slate v2 editor creation.
   - Keep existing exported `createPlateEditor` signature only if typecheck and
     tests prove it; otherwise create an internal `createPlateRuntimeEditor`
     first and migrate tests behind it.
   - Proof:
     `pnpm turbo typecheck --filter=./packages/core`
     and focused core editor factory specs.
   - Current decision: kept in
     `packages/core/src/react/editor/createPlateRuntimeEditor.ts` with focused
     tests. Public `createPlateEditor({ runtime: 'slate-v2' })` is available as
     an explicit opt-in, while the default route remains legacy.

2. **Plugin augmentation packet**
   - Move Plate metadata/plugin stores onto the v2 editor/view.
   - Replace `EditorApi` / `EditorTransforms` legacy type imports in
     `SlateEditor.ts` and `PlateEditor.ts` with Plate-owned extension-derived
     API types.
   - Proof:
     core plugin resolution specs plus full core typecheck.
   - Current decision: kept for metadata/cache/options, configuration metadata,
     and plugin-specific API capabilities. Plugins with `extendEditor`,
     editor-wide API extensions, or transforms intentionally throw until the
     transform-to-tx packet migrates those contracts.

3. **Initialization packet**
   - Replace `editor.tf.init` value/selection initialization with Slate v2
     `initialValue`/`initialSelection` or a `read/update` initialization step.
   - Preserve async value and HTML string behavior explicitly or defer each
     with owner.
   - Proof:
     `withSlate`/`withPlate` specs and create-editor tests.

4. **React provider packet**
   - Replace `react/slate-react.ts` re-exports from `slate-react` with
     `@platejs/slate-react`.
   - Rewrite `useSlateProps`, `PlateSlate`, and `PlateContent` around
     `SlateChange`.
   - Proof:
     core React specs, `pnpm turbo typecheck --filter=./apps/www`, and
     `/blocks/playground` browser proof.

5. **Runtime helper packets**
   - Migrate affinity, node-id, navigation feedback, slate-extension
     transforms, chunking, DOM scroll, render-leaf, and decorate helpers only
     after the editor root is v2.
   - Proof:
     focused helper specs, then full core test/build.

6. **Test fixture packet**
   - Replace legacy fixture editor assumptions in core tests.
   - Keep `@platejs/test-utils` Slate-v2 fixture factory; do not duplicate
     another one in core.
   - Proof:
     full `@platejs/core` test suite.

7. **Aggregate cut packet**
   - Remove `@platejs/slate-legacy` from `packages/plate`.
   - Remove aggregate legacy export.
   - Proof:
     `pnpm turbo typecheck --filter=./packages/plate`,
     `pnpm --filter platejs test`, `pnpm --filter platejs build`,
     `pnpm turbo typecheck --filter=./apps/www`, and playground browser proof.

## First safe code packet decision

Do not start a default runtime-route flip in the current broad migration loop.

Reason:
- The next packet changes Plate editor creation, plugin contracts, React
  provider behavior, and app-facing callbacks. That is Plate v2 runtime work,
  not package import cleanup.
- A partial adapter would either be a public shim or a cast-heavy bridge. Both
  violate the hard-cut/no-fake-compat direction unless the packet is opened as
  the explicit Plate runtime adapter owner.

Next safe action:
- Pick one remaining constructor/type/test-harness boundary and either migrate
  it with focused proof or keep it as an explicit scaffold boundary.
- Keep the legacy default `createPlateEditor()` route until core typecheck,
  core tests/build, aggregate `platejs` proof, `apps/www` typecheck, and
  playground proof are green through the v2 route.

## Proof-harness decision

Current state:
- Plate playground proof is green through `@platejs/playwright`.
- New Slate v2 examples expose `@platejs/browser` handles.
- Plate routes do not expose the new Slate-browser handle because they still
  render through the legacy Plate runtime bridge.

Decision:
- Keep `@platejs/playwright` as the Plate route proof adapter during migration.
- Require a runtime/proof-harness unification packet after the React provider
  packet.
- Do not force `@platejs/browser` handle parity before the core runtime exists;
  it would create false negatives.

## Stop conditions

Hard stop before code when:
- the packet would change public `createPlateEditor`, plugin callback, or
  render callback semantics without a source-backed Plate runtime checkpoint;
- a helper needs `NodeApi.*(editor, ...)` while `editor` is still a legacy root;
- app proof needs the new Slate-browser handle before the Plate React provider
  has migrated;
- type fixes require broad `as any` casts outside one named adapter module.

Allowed continuation without user input:
- pure plan/artifact refinement;
- focused factory spike in a named adapter file with immediate revert if proof
  fails;
- stale-symbol audit and grouping;
- test fixture audit;
- docs latest-state audit only after runtime decisions are accepted.
