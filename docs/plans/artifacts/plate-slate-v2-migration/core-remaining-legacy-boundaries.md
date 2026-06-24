# Core Remaining Legacy Boundaries

Date: 2026-06-20

Scope: remaining `@platejs/slate-legacy` / old `slate-react` / legacy test
harness boundaries under `packages/core` after loop 334.

## Quarantine Summary

These imports are accepted migration debt for the current Plate beta lane. They
are not safe helper swaps. Each requires the real Plate runtime/editor contract
to move to Slate v2, or a focused owner packet with behavior proof.

| File | Legacy import | Owner | Decision |
|------|---------------|-------|----------|
| `packages/core/src/internal/currentRuntimeBridge.ts` | `Editor`, `createEditor`, `EditorBase`, `EditorApi`, `EditorTransforms`, `Operation`, `DescendantIn`, `assignLegacyApi`, `assignLegacyTransforms`, `syncLegacyMethods`, `withHistory` | current Plate runtime constructor/type/history/plugin-sync bridge | private quarantine until the Plate runtime/default-route packet replaces the current editor contract |
| `packages/core/package.json` | `@platejs/slate-legacy` dependency | current Plate runtime dependency | quarantine until `currentRuntimeBridge.ts` is deleted |
| `packages/core/src/react/slate-react.ts` | old `slate-react` `Slate`, `Editable`, and node/context hook re-exports | current Plate React adapter | quarantine until Plate runtime is actually backed by `@platejs/slate-react`; public `withReact`, `useSlateStatic`, and `DefaultPlaceholder` exports are cut |
| `packages/core/src/react/plugins/react/withPlateReact.ts` | old upstream `withReact` | current Plate React enhancer | quarantine until Plate runtime installs the `@platejs/slate-react` React extension |

## Proof State

- Latest migration scanner after loop 334: 5396 files, 1 owner,
  2649 visible hits, 0 missing direct current Slate deps. The direct core
  bridge import is classified as private quarantine.
- Latest core owner row: no actionable package cleanup rows; remaining core
  legacy ownership is the private current-runtime bridge plus old `slate-react`
  adapter quarantine.
- Declaration caveat: `packages/core/dist/*.d.ts` still imports
  `@platejs/slate-legacy` because exported `PlateEditor.api` /
  `PlateEditor.tf` / plugin command contracts are still the current Plate
  command facade. That is a Plate v2 API cut, not a source-import cleanup.
- Latest core package proof after loop 334:
  - `pnpm turbo typecheck --filter=./packages/core`
  - `pnpm --filter @platejs/core test`
  - `pnpm --filter @platejs/core build`
  - `node docs/plans/artifacts/plate-slate-v2-migration/scan-plate-slate-migration.mjs`
  - `node docs/plans/artifacts/plate-slate-v2-migration/scan-plate-command-surface.mjs`

## Next Owner

Do not keep shrinking core by swapping helpers blindly. The next safe migration
work is either:

- a deliberate core runtime packet that replaces one quarantined boundary with
  v2 runtime proof, or
- the next non-core package owner from `owner-inventory.tsv`.

## Closed Boundary Addendum

- Loop 299 moved `EditableProps.scrollSelectionIntoView` from legacy `Editor`
  to Plate `SlateEditor` while keeping `DOMRange` on `@platejs/slate-dom`.
- Loop 300 replaced the `slate-test-utils` keyboard harness with a Plate-owned
  helper in `packages/core/src/react/__tests__/createPlateTestEditor.ts` and
  removed the root `slate-test-utils` dependency.
- Loop 301 added Plate-side tx inference proof so
  `createPlateEditor({ plugins: [TxPlugin] }).update((tx) => tx.txPlugin.*)`
  compiles without `tx: any`; broad `AnyPluginConfig.tx` hardening remains
  deferred to a core plugin generic redesign.
- Loop 302 cut public `withReact`, `useSlateStatic`, and `DefaultPlaceholder`
  from the Plate React adapter, moved upstream Slate comparison code to direct
  `slate-react` imports under `apps/www`, and kept `withPlateReact` as a named
  current-runtime bridge.
- Loop 303 kept the current-runtime `HistoryPlugin` legacy `withHistory`
  wrapper but made it a typed bridge using the wrapped function parameter type,
  removing the previous double `as any` cast without claiming current Plate
  history is v2-native.
- Loop 304 made public `usePlateEditor({ runtime: 'slate-v2' })` preserve
  plugin tx inference from `createPlatePlugin(...).extendTx(...)` through
  `platejs/react`, by letting `PlateRuntimeEditor` own its `update` signature
  instead of inheriting the base React editor update type and by avoiding fake
  broad runtime-plugin tx index signatures.
- Loop 305 moved `SlateExtensionPlugin` operation classification to Slate v2
  `OperationApi` and kept the current-runtime `apply` boundary honest through
  typed `NodeOperation` / `TextOperation` structural locals after the v2 guards.
- Loop 306 removed local `as any` bridges from SlateExtension node/text handler
  pipes and metadata-prop checks by using typed plugin contexts from the existing
  `getEditorPlugin` owner.
- Loop 334 moved scattered direct `@platejs/slate-legacy` imports under
  `packages/core` into `packages/core/src/internal/currentRuntimeBridge.ts`,
  kept that bridge private/quarantined, and fixed the Slate v2 runtime
  `inject.nodeProps` element-context gap exposed by the core test suite.
