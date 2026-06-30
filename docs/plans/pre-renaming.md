# Pre-Renaming Ledger

Purpose: keep Plate Next review diffs readable. During review mode, preserve the
current `HEAD` names/paths first. Record better names here and apply them only
after the behavior/API diff is reviewed.

## Rule

- Do not mix behavior migration with cosmetic or taste renames.
- Restore Added/Deleted rename pairs to the current `HEAD` path whenever
  possible.
- Keep a rename in the active diff only when the old name is actively false,
  the file has no current owner, or tests/types cannot pass with the old name.

## Postponed Renames

| Current review name | Proposed later name | Owner | Why later | Notes |
|---------------------|---------------------|-------|-----------|-------|
| `packages/core/src/internal/plugin/pipeNormalizeInitialValue.*` | `pipeTransformInitialValue.*` | Core plugin initialization | Behavior changed from normalize-only to transform-first, but review still needs the old file anchor. | `pipeTransformInitialValue.ts` may remain as implementation owner when already tracked; do not rename the test during review. |
| `packages/core/src/lib/editor/withPlite.*` | `extendBaseEditor.*` | Base editor setup | `extend*` is clearer for the final API, but this packet is still reviewing runtime/API drift. | Keep imports pointing at `withPlite` until the rename pass. |
| `packages/core/src/react/editor/withPlate.ts` | `extendPlateEditor.ts` | React Plate editor setup | Better final verb, worse current diff. | Symbol names can still be reviewed separately. |
| `packages/core/src/static/editor/withStatic.*` | `extendStaticEditor.*` | Static editor setup | Same rename family as `withPlate`. | Keep path stable for now. |
| `packages/core/src/react/components/withHOC.*` | `composeHOC.*` | React component composition | Cleaner helper name, pure rename noise during migration review. | Apply after behavior review. |
| `packages/core/src/react/components/EditorMethodsEffect.*` | `RedecorateEffect.*` | Plate content runtime effect | Narrower name is probably better, but it hides the diff today. | Keep old path until review passes. |
| `packages/core/src/react/components/ContentVisibilityChunk.tsx` | `PlateContentEffects.tsx` | Plate content effects | New name is probably more accurate after behavior moved, but the old file is the review anchor. | Review whether this is one component or split later. |
| `SlateExtensionPlugin` / existing extension naming | `SlateExtensionPlugin` | Core extension plugin | The Plite name may be final, but user review needs old Slate/Plite naming churn frozen. | Do not rename extension files/symbols during review mode unless explicitly requested. |
| `SlateReactExtensionPlugin.slow.tsx` | `SlateReactExtensionPlugin.spec.tsx` | React extension plugin proof | Test-speed label cleanup is not behavior cleanup. | Keep old test filename during review. |
| `packages/core/src/react/plugin/getEditorPlugin.ts` | `getBasePlugin.ts` | React plugin context helper | `Base` may fit the later Core model, but `getEditorPlugin` is the reviewable owner name. | Keep old path; decide symbol name later. |

## Intentional Deletions To Review As Deletions

| Deleted path | Reason this is not treated as a rename | Review note |
|--------------|-----------------------------------------|-------------|
| `packages/core/src/react/slate-react.ts` | Old upstream Slate React re-export surface. | Keep deleted unless a current public package still needs it. |
| `packages/core/src/react/plugins/react/withPlateReact.ts` | Old `with*` React installer path competing with extension-based setup. | Keep deleted unless a focused test proves behavior loss. |
| `packages/core/src/react/editor/createPlateRuntimeEditor.spec.ts` | Runtime bridge file was cut; old spec targets the removed route. | Review covered behavior through owner/plugin tests instead. |
| `packages/core/src/lib/utils/overrideEditor.spec.ts` | Old override-editor compat test. | Keep deleted if no current `overrideEditor` API remains. |

## 2026-06-28 Extracted File Recovery

These names were recovered for review readability after the extracted-file pass.
They are not final naming approvals. Apply any later Plite/Plate rename only
after the behavior/API diff is reviewed.

| Active review path | Bucket | Why this path now | Later review note |
|--------------------|--------|-------------------|-------------------|
| `packages/core/src/lib/editor/SlateEditor.ts` | recover-main-owner | Old Core editor owner name is the current review anchor. | Decide later whether this becomes a Plate/Plite/base naming pass. |
| `packages/core/src/lib/plugin/SlatePlugin.ts` | recover-main-owner | Old Core plugin owner name is the current review anchor. | Decide later with the full plugin API naming pass. |
| `packages/core/src/lib/plugin/getEditorPlugin.ts` | recover-main-owner | Old helper owner name keeps diffs comparable. | Do not rename during behavior review. |
| `packages/core/src/lib/plugin/getSlatePlugin.ts` | recover-main-owner | Old helper owner name keeps diffs comparable. | Do not rename during behavior review. |
| `packages/core/src/lib/plugin/getEditorPlugin.spec.ts` | recover-main-owner | Spec follows the old helper owner. | Rename only with helper. |
| `packages/core/src/lib/plugins/affinity/AffinityPlugin.spec.tsx` | recover-main-owner | Affinity already has a main-branch owner folder. | Keep colocated; do not inline into `AffinityPlugin.ts`. |
| `packages/core/src/lib/plugins/affinity/queries/getEdgeNodes.ts` | recover-main-owner | Affinity query owner exists on main. | Keep colocated under `queries/`. |
| `packages/core/src/lib/plugins/affinity/queries/getEdgeNodes.spec.tsx` | recover-main-owner | Spec follows affinity query owner. | Keep colocated under `queries/`. |
| `packages/core/src/lib/plugins/affinity/queries/getMarkBoundaryAffinity.ts` | recover-main-owner | Affinity query owner exists on main. | Keep colocated under `queries/`. |
| `packages/core/src/lib/plugins/affinity/queries/getMarkBoundaryAffinity.spec.ts` | recover-main-owner | Spec follows affinity query owner. | Keep colocated under `queries/`. |
| `packages/core/src/lib/plugins/affinity/queries/isNodeAffinity.ts` | recover-main-owner | Affinity query owner exists on main. | Keep colocated under `queries/`. |
| `packages/core/src/lib/plugins/affinity/queries/index.ts` | recover-main-owner | Barrel follows affinity query owner. | Keep colocated under `queries/`. |
| `packages/core/src/lib/plugins/affinity/transforms/setAffinitySelection.ts` | recover-main-owner | Affinity transform owner exists on main. | Keep colocated under `transforms/`. |
| `packages/core/src/lib/plugins/affinity/transforms/setAffinitySelection.spec.ts` | recover-main-owner | Spec follows affinity transform owner. | Keep colocated under `transforms/`. |
| `packages/core/src/lib/plugins/affinity/transforms/index.ts` | recover-main-owner | Barrel follows affinity transform owner. | Keep colocated under `transforms/`. |
| `packages/core/src/lib/plugins/affinity/types.ts` | recover-main-owner | Affinity type owner exists on main. | Keep colocated under affinity. |
| `packages/core/src/lib/plugins/slate-extension/SlateExtensionPlugin.ts` | recover-main-owner | Old extension owner path is the review anchor. | Rename later only in an accepted naming pass. |
| `packages/core/src/lib/plugins/slate-extension/SlateExtensionPlugin.spec.tsx` | recover-main-owner | Spec follows old extension owner path. | Rename later only with the owner. |
| `packages/core/src/lib/plugins/slate-extension/index.ts` | recover-main-owner | Barrel follows old extension owner path. | Rename later only with the owner. |
| `packages/core/src/react/components/PlateSlate.tsx` | recover-main-owner | Old React composition owner path is the review anchor. | Decide final naming after runtime review. |
| `packages/core/src/react/hooks/useSlateProps.ts` | recover-main-owner | Old hook owner name keeps review comparable. | Rename later only with React owner pass. |
| `packages/core/src/react/hooks/useSlateProps.spec.tsx` | recover-main-owner | Spec follows old hook owner name. | Rename later only with hook. |
| `packages/core/src/react/plugins/SlateReactExtensionPlugin.ts` | recover-main-owner | Old React extension owner path is the review anchor. | Rename later only in an accepted naming pass. |
| `packages/core/src/react/plugins/SlateReactExtensionPlugin.slow.tsx` | recover-main-owner | Existing slow-spec naming is preserved during review. | Decide speed suffix in a test naming pass. |
| `packages/core/src/static/components/slate-nodes.tsx` | recover-main-owner | Old static node owner name keeps review comparable. | Rename later only with static owner pass. |
| `packages/core/type-tests/slate-plugin-contracts.ts` | recover-main-owner | Type-test name follows the review owner. | Rename later only with plugin API naming. |
| `packages/core/tsconfig.spec.json` | justify-new-proof-tooling | New proof config, no old source owner. | Keep if `check:core` remains the Core lane. |
| `packages/core/tsconfig.type-tests.json` | justify-new-proof-tooling | New proof config, no old source owner. | Keep if `check:core` remains the Core lane. |
| `packages/plite/src/query-node.ts` | move-to-plite | Generic node query substrate should not stay Core-local. | Review Plite public API shape later, not Core colocation. |
| `packages/core/src/internal/editor/runtimeTxExtensions.ts` | merge-existing-owner | Split helper added navigation cost without durable ownership. | Merged into `withPlite.ts`; revisit only if a real owner emerges. |
| `packages/core/src/lib/utils/extendEditorApi.spec.ts` | delete-duplicate | Duplicate/orphan extracted spec. | Keep deleted unless an exact missing behavior appears. |
