# Core Remaining Legacy Boundaries

Date: 2026-06-20

Scope: remaining `@platejs/slate-legacy` / old `slate-react` / legacy test
harness boundaries under `packages/core` after loop 176.

## Quarantine Summary

These imports are accepted migration debt for the current Plate beta lane. They
are not safe helper swaps. Each requires the real Plate runtime/editor contract
to move to Slate v2, or a focused owner packet with behavior proof.

| File | Legacy import | Owner | Decision |
|------|---------------|-------|----------|
| `packages/core/src/lib/editor/withSlate.ts` | `Editor`, `createEditor` | current non-React editor constructor | quarantine until `createSlateEditor` is backed by the Slate v2 runtime |
| `packages/core/src/react/editor/withPlate.ts` | `Editor`, `createEditor` | current React editor constructor | quarantine until `createPlateEditor` is backed by the Slate v2 runtime |
| `packages/core/src/static/editor/withStatic.tsx` | `Editor`, `createEditor` | current static editor constructor | quarantine until static editor construction is backed by the Slate v2 runtime |
| `packages/core/src/lib/editor/withSlate.spec.ts` | `createEditor` | current-runtime bridge proof | keep as explicit proof that raw legacy editor construction still receives the temporary `editor.update` bridge |
| `packages/core/src/lib/editor/SlateEditor.ts` | `EditorBase`, `EditorApi`, `EditorTransforms` | current Plate editor type contract | quarantine until editor base/API/transform contracts are v2-owned |
| `packages/core/src/react/editor/PlateEditor.ts` | `DescendantIn`, `EditorApi`, `EditorTransforms`, `Operation` | current React Plate editor type contract | quarantine until operation/editor API contracts are v2-owned |
| `packages/core/src/lib/plugin/BasePlugin.ts` | `EditorApi`, `EditorTransforms` | plugin API/transform extension contract | quarantine until plugin extension contracts no longer target current legacy editor methods |
| `packages/core/src/lib/plugin/SlatePlugin.ts` | `EditorApi`, `EditorTransforms` | Slate plugin override/extend contract | quarantine until `extendApi` / `extendTransforms` use the final v2 Plate command surface |
| `packages/core/src/react/plugin/PlatePlugin.ts` | `EditorApi`, `EditorTransforms` | React plugin override/extend contract | quarantine until React plugin command contracts use the final v2 Plate command surface |
| `packages/core/src/internal/plugin/resolvePlugins.ts` | `assignLegacyApi`, `assignLegacyTransforms`, `syncLegacyMethods` | plugin resolution / current runtime method sync | quarantine until old method mutation is replaced by Slate v2 extension registration |
| `packages/core/src/lib/plugins/HistoryPlugin.ts` | `withHistory` | current history runtime wrapper | typed quarantine; `@platejs/slate-history` intentionally hard-cuts public `withHistory`, so this still needs a real history-extension packet before the legacy wrapper disappears |
| `packages/core/src/react/slate-react.ts` | old `slate-react` `Slate`, `Editable`, and node/context hook re-exports | current Plate React adapter | quarantine until Plate runtime is actually backed by `@platejs/slate-react`; public `withReact`, `useSlateStatic`, and `DefaultPlaceholder` exports are cut |
| `packages/core/src/react/plugins/react/withPlateReact.ts` | old upstream `withReact` | current Plate React enhancer | quarantine until Plate runtime installs the `@platejs/slate-react` React extension |

## Proof State

- Latest migration scanner after loops 299-306: 5391 files, 1 owner,
  2621 visible hits, 0 missing direct current Slate deps.
- Latest core owner row: no actionable package cleanup rows; all remaining
  core legacy rows are overridden as runtime/test-harness quarantine.
- Latest core/app package proof after loop 304:
  - `pnpm turbo typecheck --filter=./packages/core --filter=./packages/plate`
  - `pnpm --filter @platejs/core test -- ./src/react/editor/createPlateRuntimeEditor.spec.ts`
  - `bun test ./apps/www/src/__tests__/package-integration/core-runtime/usePlateEditor-runtime.spec.tsx`
  - `pnpm --filter @platejs/core lint:fix`
  - `pnpm --filter @platejs/core build`
  - `pnpm --filter platejs build`
  - `pnpm --filter www typecheck`
  - `node docs/plans/artifacts/plate-slate-v2-migration/scan-plate-slate-migration.mjs`
  - `node docs/plans/artifacts/plate-slate-v2-migration/scan-plate-command-surface.mjs`
  - `pnpm --filter www exec playwright test --config playwright.slate.config.ts --project=chromium tests/slate-browser/playground.spec.ts`
  - `pnpm test:types` still crashes in TypeScript 6 before diagnostics in
    both before/after control states; this is tooling debt, not a keep/revert
    signal for the type-test fixture packet.

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
