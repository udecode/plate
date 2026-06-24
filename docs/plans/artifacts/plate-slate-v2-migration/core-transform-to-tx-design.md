# Core transform-to-tx design

Status: design checkpoint kept; runtime tx registration, plugin tx authoring,
and basic-nodes mark/block package packets complete.

## Why this checkpoint exists

The remaining Plate migration surface is command architecture. It is not a
primitive type import cleanup.

Evidence:
- `command-surface-summary.md` found 263 rows across 30 owners.
- `packages/core` owns 163 command-surface rows.
- `packages/basic-nodes` owns 16 package-local transform rows, and those rows
  mostly call legacy `editor.tf.*` from inside `extendTransforms`.
- Slate v2 already has extension `tx` groups and public transform APIs, but
  `tx` groups are available inside `editor.update((tx) => ...)`, not as old
  mutable editor methods.

## Source facts

Slate v2:
- `packages/slate/src/interfaces/editor.ts` defines
  `EditorUpdateTransaction` as core tx plus installed extension tx groups.
- `packages/slate/src/interfaces/editor.ts` defines `EditorExtensionTxGroup`
  as `(transaction, editor) => result`.
- `packages/slate/src/core/editor-extension.ts` registers `extension.tx` and
  setup-output `tx` groups through `registerTxGroup`.
- `packages/slate/src/core/public-state.ts` installs tx groups onto the active
  transaction view.
- `packages/slate/src/interfaces/editor.ts` keeps public one-shot transform
  methods on `Editor`, implemented through the transform registry and runtime
  writes.

Current Plate:
- `packages/core/src/lib/editor/SlateEditor.ts` exposes `tf` and `transforms`
  as `EditorTransforms & InferTransforms<...>`.
- `packages/core/src/lib/editor/withSlate.ts` assigns `editor.getTransforms`
  to `editor.transforms`, then initializes plugins through `editor.tf.init`.
- `packages/core/src/lib/plugin/SlatePlugin.ts` models plugin transforms as
  old editor-callable `extendTransforms` / `extendEditorTransforms` outputs.
- Existing plugins such as `packages/basic-nodes/src/lib/BaseBoldPlugin.ts`
  return commands that close over `editor` and call `editor.tf.toggleMark`.

## Decision

Do not auto-wrap existing `extendTransforms` into Slate v2 `tx` groups.

That would be fake migration because the returned commands already close over
legacy `editor.tf`. It would preserve the old mutation surface under a new
registration mechanism.

Plate v2 command surface should split three lanes:

1. Replayable document mutations
   - Author as Slate v2 `tx` groups.
   - User-facing execution is `editor.update((tx) => tx.<group>.<method>(...))`
     or a deliberate Plate command helper that internally opens one update.
   - No hidden debounce or delayed write.

2. Host/runtime side effects
   - Author as `api` capabilities.
   - Examples: focus, DOM, overlays, async UI, provider handles.
   - These are not `tx` because they do not replay as document operations.

3. Editor behavior interception
   - Author as Slate v2 transform middleware, normalizers, operations, or
     React/runtime setup packets.
   - Old `overrideEditor` remains blocked until the exact owner maps to one of
     those extension slots.

## No-compat rule

No generic compatibility shim:
- no automatic `editor.tf = editor.transforms`;
- no public re-export of legacy `EditorTransforms`;
- no package-local transform rewrite that still calls `editor.tf`;
- no mutating Slate v2 `editor.api` to look like Plate v1.
- no mutating Slate v2 runtime names such as `getApi` for Plate plugin metadata;
  plugin metadata lookup uses explicit Plate names such as `getPluginApi`.

Plate keeps `editor.tf`, `getTransforms(plugin)`, and plugin
`extendTransforms(...)` as the typed beta command facade only when that facade
opens `editor.update((tx) => tx.<pluginKey>.<method>(...))` over an explicit
`extendTx(...)` group. It cannot be a hidden old Slate adapter.

## Completed implementation packets

Started with runtime tx registration, then added the plugin-facing authoring
surface, not a cross-repo transform rewrite.

Completed runtime packet:
1. Added a Plate runtime tx registration path to `createPlateRuntimeEditor` for
   an internal plugin shape that maps directly to Slate v2 extension `tx`.
2. Added focused core test coverage proving:
   - a plugin registers a tx group;
   - `editor.update((tx) => tx.<pluginKey>.<method>())` performs a document
     mutation;
   - raw tx groups execute without restoring legacy editor mutation.

Completed authoring packet:
1. Added `extendTx(...)` to Slate and React Plate plugin builders.
2. Resolved `__txExtensions` inside `createPlateRuntimeEditor` into Slate v2
   extension `tx` groups.
3. Proved `extendTx(...)` composes through `toPlatePlugin`, executes inside
   `editor.update((tx) => ...)`, and can back a typed Plate command facade.
4. Cut the new runtime scaffold's Plate-style `getApi(plugin)` override in
   favor of `getPluginApi(plugin)` so Slate v2 `editor.getApi` stays owned by
   Slate.

Completed first package packet:
1. Migrated `packages/basic-nodes` mark plugins to `extendTx(...)`.
2. Used `tx.marks.toggle` for simple marks.
3. Removed the opposing mark before toggling subscript/superscript, instead of
   passing the old Plate `{ remove }` transform options as a Slate v2 mark
   value.
4. Refreshed command-surface inventory from 263 to 254 rows; remaining
   `packages/basic-nodes` rows are heading/blockquote block transforms and
   blockquote override behavior.

Completed second package packet:
1. Source-audited Slate v2 node tx methods: `tx.nodes.some`, `set`, `wrap`,
   and `unwrap`.
2. Migrated `packages/basic-nodes` heading and blockquote toggles to
   `extendTx(...)`.
3. Left blockquote `overrideEditor` alone because it is runtime behavior
   interception, not a replayable tx command.
4. Refreshed command-surface inventory from 254 to 247 rows; `basic-nodes`
   now has one remaining runtime-interception row.

Completed facade decision:
1. Kept `editor.tf`, `getTransforms(plugin)`, and plugin
   `extendTransforms(...)` as Plate's typed beta command facade.
2. Required every kept facade to call `editor.update((tx) => ...)` over an
   explicit `extendTx(...)` group.
3. Migrated the first simple command families:
   - `packages/basic-nodes` mark and block toggles;
   - `packages/basic-styles` style `set(...)` commands;
   - `packages/code-block` code-block toggle;
   - `packages/list-classic` todo-list item toggle.
4. Taught the command-surface scanner to classify
   `tx-backed-transform-facade` separately from raw transform debt.

Completed current-runtime bridge:
1. Added a temporary `withSlate` update bridge for the current Plate runtime.
2. The bridge creates a transaction object over current mark/node transforms,
   attaches explicit plugin `extendTx(...)` / `tx` groups, and executes the
   callback inside `editor.tf.withoutNormalizing(...)`.
3. Added core coverage proving a tx-backed facade mutates through normal
   `withPlate(createEditor())`.
4. Added a selected runtime smoke proving `BaseTodoListPlugin` changes a
   paragraph to `action_item` through `editor.tf.action_item.toggle()`.
5. Kept this as migration scaffolding only. Delete or replace it when Plate's
   public runtime swaps to Slate v2.

Next implementation packet:
1. Pick the next package command family from `command-surface-summary.md`.
2. Classify each row as replayable tx, host/runtime API, or behavior
   interception before patching.
3. Run focused package proof before moving to the next family.

## Deferred owners

- `extendEditorTransforms`: global transform decisions; do not migrate with
  package-local tx groups.
- `overrideEditor`: runtime behavior interception; map separately to
  middleware, normalizers, operations, or React/runtime setup.
- `packages/plate` aggregate legacy export: last cut after core runtime,
  React provider, command surface, and playground proof are green.

## Keep / revert / quarantine

Keep this design packet, runtime tx registration, plugin authoring surface,
tx-backed facade decision, package command packets, and the scoped
current-runtime bridge.

Quarantine any generic compatibility shim that maps old transforms into Slate
v2 implicitly. A kept `extendTransforms(...)` facade must call an explicit
`extendTx(...)` group through `editor.update(...)`.
